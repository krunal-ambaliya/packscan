# PackScan System Architecture
**Department of Consumer Affairs (DoCA), Government of India**

---

## High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Clients & Edge Devices"]
        WEB["React 19 Web Dashboard\n(State/Central Officers)"]
        MOB["Flutter Field Mobile App\n(On-site Market Inspectors)"]
        API_CLIENT["E-Commerce Scrapers\n(Amazon, Flipkart, Blinkit SKUs)"]
    end

    subgraph Ingress["Ingress & Security"]
        NGINX["NGINX Gateway / Reverse Proxy\n(Port 3000 / 8000)"]
        JWT_AUTH["JWT Auth & RBAC Validator\n(Central, State, Admin, Viewer)"]
    end

    subgraph APIServices["API Core (FastAPI)"]
        APP["FastAPI Application Server"]
        SCAN_ROUTER["/api/v1/scan Router"]
        PROD_ROUTER["/api/v1/products Router"]
        REPORT_ROUTER["/api/v1/reports Router"]
        STATS_ROUTER["/api/v1/dashboard Router"]
    end

    subgraph AsyncQueue["Distributed Task Queue"]
        REDIS["Redis 7 Broker & State Backend"]
        CELERY["Celery Distributed Workers\n(Parallel Async Jobs)"]
    end

    subgraph MLPipeline["ML & Computer Vision Pipeline"]
        PREP["Stage 1: Preprocessing\n(Deskew, Denoise, DPI Calc)"]
        YOLO["Stage 2: PDP Detection\n(YOLOv8 Principal Display Panel)"]
        OCR["Stage 3: OCR Engine\n(PaddleOCR / Text Extraction)"]
        NER["Stage 4: Field Classification\n(Regex + spaCy NER)"]
        FONT["Stage 5: Font Metrology\n(EAN-13 0.33mm Module Calibration)"]
        LANG["Stage 6: Language ID\n(FastText Hindi/Devanagari vs English)"]
    end

    subgraph RuleExecution["Deterministic Rule Engine"]
        LMPC_JSON["lmpc_rules.json\n(Statutory Rulebook)"]
        ENGINE["LMPC Deterministic Engine\n(100% Auditable Legal Proof)"]
    end

    subgraph Persistence["Storage & Artifacts"]
        PG["PostgreSQL 15 (SQLAlchemy 2.0)\n(Inspections, Products, Violations)"]
        S3["Object Storage / S3\n(High-res Package Images)"]
        REPORTS["PDF / DOCX Generator\n(ReportLab Form VI Notices)"]
    end

    %% Client flows
    WEB -->|HTTPS / REST| NGINX
    MOB -->|HTTPS / REST| NGINX
    API_CLIENT -->|Batch API| NGINX

    NGINX --> JWT_AUTH
    JWT_AUTH --> APP
    APP --> SCAN_ROUTER
    APP --> PROD_ROUTER
    APP --> REPORT_ROUTER
    APP --> STATS_ROUTER

    %% Processing flow
    SCAN_ROUTER -->|Enqueue Job| REDIS
    REDIS --> CELERY
    CELERY --> PREP
    PREP --> YOLO
    YOLO --> OCR
    OCR --> NER
    NER --> FONT
    FONT --> LANG

    %% Rule evaluation
    LANG --> ENGINE
    LMPC_JSON -.-> ENGINE

    %% Persistence
    ENGINE -->|Store Record| PG
    PREP -->|Save Original Image| S3
    REPORT_ROUTER --> REPORTS
    PG --> REPORTS
```

---

## Core Pipeline Stages

1. **Edge Acquisition**: Field inspectors capture package images via Flutter mobile app or upload via the web dashboard. Images are normalized to 300 DPI equivalent.
2. **Principal Display Panel (PDP) Detection**: YOLOv8 models isolate the principal facing surface of the package (Rules 5 and 7).
3. **Multi-Scale OCR**: PaddleOCR detects textual bounding boxes across angles and orientations.
4. **Hybrid Statutory Field Classification**:
   - First-pass deterministic regex pattern matchers parse structured values (MRP, Dates, Net Quantities).
   - Second-pass spaCy Named Entity Recognition models classify ambiguous manufacturer addresses and consumer grievance clauses.
5. **Optical Font Metrology**: Converts pixel bounding box heights into physical millimeters using barcode module width (0.33mm) calibration.
6. **Deterministic Rule Engine**: Completely isolated, audit-ready rule engine evaluates extracted data against `lmpc_rules.json`. Zero hallucinations; legally defensible in court.
7. **Statutory Form VI Notice Generation**: Auto-generates summons, inspection reports, and compounding notices under Section 15 of the Legal Metrology Act, 2009.
