"""
Celery asynchronous task worker for PackScan ML processing.
Handles heavy image deskew, OCR extraction, and rule evaluation off the main API loop.
"""

from celery import Celery
import os
import logging
from backend.app.core.config import settings
from backend.ml.pipeline import MLPipeline
from backend.app.rules.engine import LMPCRuleEngine

logger = logging.getLogger("packscan.worker")

celery_app = Celery(
    "packscan_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
)

pipeline = MLPipeline()
engine = LMPCRuleEngine()


@celery_app.task(bind=True, name="tasks.process_scan_job")
def process_scan_job(self, inspection_id: str, image_path_or_bytes: str):
    """
    Executes ML pipeline and LMPC statutory rule evaluation asynchronously.
    Updates Redis/PostgreSQL status upon completion.
    """
    logger.info(f"Received scan task {self.request.id} for inspection {inspection_id}")
    self.update_state(state="PROCESSING", meta={"stage": "ML_PIPELINE"})

    # Step 1: Execute ML Pipeline
    ml_results = pipeline.process_package_scan(image_path_or_bytes)

    self.update_state(state="PROCESSING", meta={"stage": "RULE_EVALUATION"})

    # Step 2: Extract fields and evaluate rules
    classified = ml_results.get("classified_fields", {})
    extracted_dict = {k: v.get("value") for k, v in classified.items()}
    font_metrics = ml_results.get("font_metrics", {})
    panel_info = ml_results.get("panel", {})

    rule_results = engine.evaluate(extracted_dict, font_metrics=font_metrics, panel_info=panel_info)

    logger.info(f"Task {self.request.id} finished. Violations: {rule_results.total_violations}")

    return {
        "inspection_id": inspection_id,
        "status": "COMPLETED",
        "compliance_status": "COMPLIANT" if rule_results.compliant else "NON_COMPLIANT",
        "total_violations": rule_results.total_violations,
        "violations": [v.dict() for v in rule_results.violations],
        "extracted_fields": classified,
        "font_metrics": font_metrics,
    }
