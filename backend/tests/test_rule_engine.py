import pytest
import os
import sys

# Add the backend root to sys.path to allow importing from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.rules.engine import LMPCRuleEngine, SAMPLE_TEST_CASES, Severity

@pytest.fixture
def engine():
    return LMPCRuleEngine()

def test_case_1_compliant(engine):
    case = SAMPLE_TEST_CASES["case_1_compliant"]
    result = engine.evaluate(
        extracted_fields=case["fields"],
        font_metrics=case.get("font_metrics"),
        panel_info=case.get("panel_info")
    )
    assert result.compliant is True
    assert result.total_violations == case["expected_violations_count"]

def test_case_2_missing_mrp(engine):
    case = SAMPLE_TEST_CASES["case_2_missing_mrp"]
    result = engine.evaluate(
        extracted_fields=case["fields"],
        font_metrics=case.get("font_metrics"),
        panel_info=case.get("panel_info")
    )
    assert result.compliant is False
    assert result.total_violations > 0
    
    violation = next(v for v in result.violations if case["expected_rule"] in v.rule_clause)
    assert violation.severity == case["expected_severity"]
    assert violation.field == "mrp"

def test_case_3_font_undersized(engine):
    case = SAMPLE_TEST_CASES["case_3_font_undersized"]
    result = engine.evaluate(
        extracted_fields=case["fields"],
        font_metrics=case.get("font_metrics"),
        panel_info=case.get("panel_info")
    )
    assert result.compliant is False
    assert result.total_violations > 0
    
    violation = next(v for v in result.violations if case["expected_rule"] in v.rule_clause)
    assert violation.severity == case["expected_severity"]
    assert violation.field == "font_size"

def test_case_4_net_qty_unit_format(engine):
    case = SAMPLE_TEST_CASES["case_4_net_qty_unit_format"]
    result = engine.evaluate(
        extracted_fields=case["fields"],
        font_metrics=case.get("font_metrics"),
        panel_info=case.get("panel_info")
    )
    assert result.compliant is False
    assert result.total_violations > 0
    
    violation = next(v for v in result.violations if case["expected_rule"] in v.rule_clause)
    assert violation.severity == case["expected_severity"]
    assert violation.field == "net_quantity"

def test_case_5_import_without_country_of_origin(engine):
    case = SAMPLE_TEST_CASES["case_5_import_without_country_of_origin"]
    result = engine.evaluate(
        extracted_fields=case["fields"],
        font_metrics=case.get("font_metrics"),
        panel_info=case.get("panel_info")
    )
    assert result.compliant is False
    assert result.total_violations > 0
    
    violation = next(v for v in result.violations if case["expected_rule"] in v.rule_clause)
    assert violation.severity == case["expected_severity"]
    assert violation.field == "country_of_origin"

def test_case_6_mrp_without_tax_clause(engine):
    case = SAMPLE_TEST_CASES["case_6_mrp_without_tax_clause"]
    result = engine.evaluate(
        extracted_fields=case["fields"],
        font_metrics=case.get("font_metrics"),
        panel_info=case.get("panel_info")
    )
    assert result.compliant is False
    assert result.total_violations > 0
    
    violation = next(v for v in result.violations if case["expected_rule"] in v.rule_clause)
    assert violation.severity == case["expected_severity"]
    assert violation.field == "mrp"
