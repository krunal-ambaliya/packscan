# PackScan 🔍
### AI-Powered Legal Metrology Compliance Verification System
**Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India**  
*Built for the Smart India Hackathon (SIH)*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/Compliance-LMPC%20Rules%202011-blue.svg)](#supported-lmpc-statutory-checks)

---

## 📌 Executive Summary

**PackScan** is an automated statutory compliance verification platform engineered for Legal Metrology officers and e-commerce enforcement authorities across India. 

By combining computer vision, multi-angle OCR, optical font metrology (calibrated against EAN-13 barcode modules), and a **100% deterministic rule engine**, PackScan audits packaged commodities against the **Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)** and the **Legal Metrology Act, 2009**.

PackScan eliminates subjective visual inspection bottlenecks, prevents officer discretion errors, and auto-generates legally binding **Form VI statutory inspection and compounding notices** under Section 15.

---

## 📂 Repository Structure

```text
packscan/
├── backend/                  # FastAPI Application & AI Service
│   ├── app/
│   │   ├── api/              # REST Endpoints (/scan, /reports, /products, /auth, /dashboard)
│   │   ├── core/             # Configuration, JWT Security & Role-Based Access Control
│   │   ├── models/           # SQLAlchemy 2.0 Async Models
│   │   ├── rules/            # Deterministic LMPC Rule Engine (engine.py)
│   │   ├── schemas/          # Pydantic v2 Request & Response Schemas
│   │   ├── services/         # PDF / DOCX Statutory Notice Generator (ReportLab & docx)
│   │   └── main.py           # Application Entrypoint, Middleware & Routes
│   ├── ml/                   # ML Pipeline (YOLOv8 PDP, PaddleOCR, Regex/NER) & Celery Worker
│   ├── tests/                # Pytest Test Suite for LMPC Deterministic Rules
│   ├── .env.example          # Backend Environment Template
│   ├── Dockerfile            # Production Python 3.11 Container Spec
│   └── requirements.txt      # Python Dependencies
├── src/                      # React 19 + Vite Web Application
│   ├── components/           # UI Components (ScanUpload, InspectionResult, BBox Canvas, Dashboard)
│   ├── types.ts              # TypeScript Contracts & Domain Models
│   ├── App.tsx               # Main Dashboard Interface
│   └── index.css             # Tailwind CSS Design System
├── mobile/                   # Flutter Field-Officer Application (Edge Inspection)
│   ├── lib/                  # Dart UI & API Integration
│   └── pubspec.yaml          # Flutter Dependencies
├── rules/
│   └── lmpc_rules.json       # Configurable Statutory Rules & Clause Definitions
├── docker-compose.yml        # Multi-Container Orchestration (Backend, ML, DB, Redis, Frontend)
├── Dockerfile.frontend       # Multi-Stage Node 20 & NGINX Container Spec
├── nginx.conf                # Reverse Proxy & Routing Configuration
├── ARCHITECTURE.md           # Mermaid Architecture & Dataflow Diagrams
├── HACKATHON_PITCH.md        # Problem Statement, Solution & Pitch Deck
└── README.md                 # Complete System & Installation Guide
```

---

## ⚙️ System Requirements & Prerequisites

Ensure the following tools are installed on your workstation or host server:

| Tool | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Docker & Docker Compose** | v24.0+ / Compose v2.20+ | Latest Desktop / Engine | Complete one-command containerized deployment |
| **Python** | 3.10+ | 3.11+ | Backend service, ML pipeline, and rule tests |
| **Node.js & npm** | Node 18.x / npm 9.x | Node 20.x+ / npm 10.x | React dashboard build and development |
| **Git** | 2.30+ | Latest | Source control management |
| **Flutter SDK** *(Optional)* | 3.0.0+ | 3.22+ | Mobile inspector app (if developing edge scanner) |

---

## 🚀 Installation & Setup

You can run PackScan using either **Docker Compose** (recommended for quick evaluation) or **Manual Local Setup** (recommended for active development).

---

### Option 1: Quickstart via Docker Compose (Recommended)

Docker Compose automatically builds and connects the **FastAPI Backend**, **Celery ML Worker**, **PostgreSQL Database**, **Redis Queue**, and **React Frontend with NGINX Reverse Proxy**.

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/packscan.git
cd packscan
```

#### 2. Configure Environment Files
Copy the environment template files:
```bash
# Root environment (used by frontend / web)
cp .env.example .env

# Backend environment (used by FastAPI, Celery, Postgres, Redis)
cp backend/.env.example backend/.env
```

> [!TIP]
> **Using Supabase PostgreSQL with Docker:**  
> If you have a Supabase project, simply set `DATABASE_URL` in `backend/.env` with your Supabase async connection string (`postgresql+asyncpg://...`). Docker Compose will automatically use your Supabase cloud database instead of the local PostgreSQL container!

#### 3. Build and Launch Containers
```bash
docker compose up --build
```
*(To run in background detached mode, add `-d`: `docker compose up --build -d`)*

#### 4. Run Database Migrations & Seed Data
Once the containers are running, you must initialize the database schema and populate the realistic demo data:
```bash
make migrate && make seed
```

#### 5. Access the Running Services

| Service | Address | Description |
| :--- | :--- | :--- |
| **Web Dashboard** | [http://localhost:3000](http://localhost:3000) | React 19 UI with bounding box overlays & audit metrics |
| **FastAPI Backend** | [http://localhost:8000](http://localhost:8000) | REST API server & healthcheck endpoint |
| **Interactive API Docs (Swagger)** | [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs) | Interactive OpenAPI test console |
| **Alternative API Docs (ReDoc)** | [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc) | Clean statutory endpoint documentation |
| **PostgreSQL 15** | `localhost:5432` | Relational audit store (`user: postgres`, `pass: postgres`, `db: packscan_db`) |
| **Redis 7** | `localhost:6379` | Celery task queue & caching broker |

#### 5. Verify Installation
```bash
# Verify backend health
curl http://localhost:8000/health
# Expected: {"status":"ok","service":"packscan-backend"}
```

#### 6. Stop Containers
```bash
docker compose down
# To also delete volumes and databases:
docker compose down -v
```

---

### Option 2: Manual Local Setup (Step-by-Step for Developers)

If you prefer running services directly on your host machine for development, follow the steps below.

---

#### Step 1: Environment Variables Setup

Create your local `.env` files:

```bash
# In the project root
cp .env.example .env

# In the backend directory
cp backend/.env.example backend/.env
```

##### ⚡ Configuring Supabase PostgreSQL

PackScan is natively architected to support **Supabase PostgreSQL** with asynchronous connection pooling and automatic SSL negotiation:

1. **Obtain your Connection URI from Supabase**:
   - Go to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
   - Select your project → Navigate to **Project Settings (gear icon)** → **Database**.
   - Under the **Connection string** section, select **URI**.

2. **Select the Connection Mode**:
   - **Mode A: Connection Pooler (Recommended / Port 6543)**  
     Best for cloud deployments, serverless setups, and avoiding IPv4 exhaustion. Uses Supabase's transaction pooler:
     ```ini
     DATABASE_URL=postgresql+asyncpg://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?ssl=require
     ```
   - **Mode B: Direct Database Connection (Port 5432)**  
     Direct connection to the database instance:
     ```ini
     DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?ssl=require
     ```

   > [!IMPORTANT]
   > - **AsyncPG Driver**: Make sure the URI begins with `postgresql+asyncpg://` (replace Supabase's default `postgresql://`).
   > - **Password Characters**: If your database password contains special characters (`@`, `:`, `#`, `%`), URL-encode them (e.g. `@` becomes `%40`).
   > - **Statement Caching**: PackScan's database adapter automatically disables statement caching when connecting through port `6543` / `pooler.supabase.com` to guarantee 100% compatibility with Supabase PgBouncer/Supavisor.

3. **Initialize Database Tables on Supabase**:
   Once your `DATABASE_URL` is set in `backend/.env`, run the automatic table initialization script to provision all statutory tables (`users`, `products`, `inspections`, `extracted_fields`, `violations`):
   ```bash
   python -m backend.app.core.database
   ```
   *(You will see: `✅ PackScan database tables successfully initialized on Supabase PostgreSQL.`)*

4. **Review `backend/.env`**:
```ini
# Supabase PostgreSQL connection
DATABASE_URL=postgresql+asyncpg://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?ssl=require

# Celery & Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Security
SECRET_KEY=doca_packscan_super_secret_jwt_key_sih_2024_secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/tmp/packscan_uploads
```

---

#### Step 2: System Dependencies for ML & OCR

PackScan's computer vision and barcode metrology engine rely on native libraries (`libzbar` for barcode scanning, `libgl1` for OpenCV):

- **Ubuntu / Debian / WSL2:**
  ```bash
  sudo apt-get update
  sudo apt-get install -y build-essential libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev libzbar0
  ```
- **macOS (via Homebrew):**
  ```bash
  brew install zbar
  ```
- **Windows:**
  - OpenCV headless is pre-bundled with binary wheels in `requirements.txt`.
  - For `pyzbar`, ensure Microsoft Visual C++ 2015-2022 Redistributable is installed. If barcode DLL errors occur, install `vcredist_x64.exe`.

---

#### Step 3: Backend Setup (Python & FastAPI)

1. **Create and Activate a Virtual Environment:**
   - **Linux / macOS:**
     ```bash
     python3 -m venv backend/venv
     source backend/venv/bin/activate
     ```
   - **Windows (PowerShell):**
     ```powershell
     python -m venv backend\venv
     .\backend\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     python -m venv backend\venv
     .\backend\venv\Scripts\activate.bat
     ```

2. **Install Python Packages:**
   ```bash
   pip install --upgrade pip
   pip install -r backend/requirements.txt
   ```

3. **(Optional) Download spaCy NER Model:**
   ```bash
   python -m spacy download en_core_web_sm
   ```

4. **Start Redis (and optional Local Database):**
   - **When using Supabase PostgreSQL**: You do **NOT** need a local PostgreSQL container! Supabase manages the database in the cloud. You only need Redis for Celery async background tasks:
     ```bash
     docker run -d --name packscan-redis -p 6379:6379 redis:7-alpine
     ```
   - **When using Local PostgreSQL**:
     ```bash
     docker run -d --name packscan-pg -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=packscan_db postgres:15-alpine
     docker run -d --name packscan-redis -p 6379:6379 redis:7-alpine
     ```
   *(Note: PackScan also includes an in-memory mock storage fallback for instantaneous zero-cold-start demonstration).*

5. **Run the FastAPI Server:**
   From the **root** of the repository:
   ```bash
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   > **Note:** Always launch `uvicorn` from the workspace root so that internal module paths (`backend.app...`) resolve properly.

6. **Start the Celery ML Worker (In a separate terminal):**
   ```bash
   celery -A backend.ml.celery_worker.celery_app worker --loglevel=info
   ```

---

#### Step 4: Frontend Setup (React 19 + Vite)

Open a new terminal tab in the repository root:

1. **Install Node.js Dependencies:**
   ```bash
   npm install
   ```
   *(Or using Bun: `bun install`)*

2. **Start the Vite Development Server:**
   ```bash
   npm run dev
   ```
   The dashboard is accessible at: **[http://localhost:3000](http://localhost:3000)** (or `http://localhost:5173` if port 3000 is occupied).

3. **Check Code Health & Build for Production:**
   ```bash
   # Type check TypeScript
   npm run lint

   # Generate optimized production bundle in dist/
   npm run build

   # Preview the production build locally
   npm run preview
   ```

---

#### Step 5: Mobile App Setup (Flutter - Optional Field Client)

For on-ground field inspectors capturing package labels directly via handheld devices:

1. Ensure Flutter is installed: `flutter doctor`
2. Navigate to the mobile package:
   ```bash
   cd mobile
   flutter pub get
   ```
3. Run the app on a connected physical device or emulator:
   ```bash
   flutter run
   ```

---

## 🔐 Default Demo Accounts & Role-Based Access Control (RBAC)

The backend provides built-in demo credentials for all statutory roles defined by the Department of Consumer Affairs:

| Role | Username / Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **CENTRAL_OFFICER** | `central@doca.gov.in` | `doca123` | National jurisdiction, policy heatmaps, pan-India violation audits |
| **STATE_OFFICER** | `state.officer@doca.gov.in` | `doca123` | State jurisdiction (Delhi/Maharashtra), issuance of Form VI notices & compounding |
| **ADMIN** | `admin@doca.gov.in` | `doca123` | Rulebook configurator (`lmpc_rules.json`), user onboarding, system telemetry |
| **VIEWER** | `viewer@doca.gov.in` | `doca123` | Public transparency portal, consumer grievance verification |

---

## ⚖️ Supported LMPC Statutory Checks

PackScan provides 100% deterministic rule enforcement mapped to statutory clauses:

| Statutory Provision | Mandated Disclosure | Automated Verification Check | Severity |
| :--- | :--- | :--- | :--- |
| **Rule 6(1)(a)** | Manufacturer / Packer Identity & Address | Complete postal address, PIN code, and enterprise name | **CRITICAL** |
| **Rule 6(1)(b)** | Generic Commodity Name | Generic or common identity prominently declared | **MAJOR** |
| **Rule 6(1)(c) & Rule 22** | Net Quantity & Units | Standard SI units (`g`, `kg`, `ml`, `l`, `pc`) without prohibited pluralization (`kgs`, `gms`) | **CRITICAL / MINOR** |
| **Rule 6(1)(d)** | Manufacturing / Packing Date | Compliant date format (`MM/YYYY` or `DD/MM/YYYY`) | **MAJOR** |
| **Rule 6(1)(e)** | Maximum Retail Price (MRP) | Numeric retail price declaration | **CRITICAL** |
| **Rule 18** | Tax Inclusion Declaration | Mandatory statutory clause: `(incl. of all taxes)` | **MAJOR** |
| **Rule 6(1)(f)** | Consumer Redressal Cell | Contact address, telephone/toll-free number, and grievance email | **MAJOR** |
| **Rule 8 (Table 1)** | Minimum Font Height (mm) | Physical letter height in millimeters scaled against barcode module width | **MAJOR** |
| **Rule 6** | Statutory Language | Mandatory Hindi (Devanagari script) or English declaration | **MAJOR** |
| **Rule 5 & Rule 7** | Principal Display Panel (PDP) | Presence and percentage area on the primary consumer-facing surface | **MAJOR** |
| **Rule 27** | Country of Origin | Mandatory Country of Origin declaration for imported goods | **CRITICAL** |

---

## 📡 REST API Reference

The FastAPI service exposes modular endpoints structured under `/api/v1`:

### Authentication
- `POST /api/v1/auth/login`: Authenticate and receive a signed JWT access token.

### Inspection & Scanning
- `POST /api/v1/scan/upload`: Upload package label images for multi-stage OCR, font metrology, and compliance verification.
- `GET /api/v1/scan/inspections`: Retrieve historical audit records with filtering by status and state.
- `GET /api/v1/scan/inspections/{id}`: Detailed inspection breakdown including extracted bounding boxes, confidence, and violated clauses.

### Statutory Reports & Summons
- `GET /api/v1/reports/{id}/pdf`: Generate official **Section 15 / Form VI Summons & Compounding Notice** in PDF format.
- `GET /api/v1/reports/{id}/docx`: Export editable statutory violation report in Microsoft Word format.

### Dashboard & Analytics
- `GET /api/v1/dashboard/stats`: Retrieve compliance rates, top violation categories, and national/state enforcement statistics.
- `GET /api/v1/products`: List analyzed product SKUs with aggregate compliance records.

---

## 🧪 Testing & Quality Assurance

### 1. Run Backend Rule Engine Tests
The deterministic rule suite validates all edge cases, illegal net quantity formats, missing MRP, and font sizing:

```bash
# From the repository root
pytest backend/tests/test_rules.py -v
```

Or using the virtual environment directly:
```bash
# Linux/macOS
./backend/venv/bin/pytest backend/tests/test_rules.py -v

# Windows (PowerShell)
& .\backend\venv\Scripts\pytest.exe backend/tests/test_rules.py -v
```

### 2. Frontend Type Checking & Production Build
```bash
# TypeScript compiler check
npm run lint

# Production bundle test
npm run build
```

---

## 🔧 Troubleshooting & FAQ

### 1. `ModuleNotFoundError: No module named 'backend'`
- **Cause**: Python is being executed from within the `backend/` directory rather than the workspace root.
- **Solution**: Either execute `uvicorn` and `pytest` from the **repository root**, or export `PYTHONPATH`:
  ```bash
  # Linux/macOS
  export PYTHONPATH="${PYTHONPATH}:$(pwd)"

  # Windows (PowerShell)
  $env:PYTHONPATH = (Get-Location).Path
  ```

### 2. `pyzbar` / `libzbar` Shared Library Not Found
- **Linux**: Run `sudo apt-get install -y libzbar0`.
- **macOS**: Run `brew install zbar`.
- **Windows**: Install the [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).

### 3. Port Already in Use (`3000` or `8000`)
- If port `3000` is in use, Vite will automatically offer or fallback to port `3001` / `5173`.
- If port `8000` is occupied, start uvicorn with a custom port:
  ```bash
  uvicorn backend.app.main:app --reload --port 8080
  ```

### 4. Supabase PostgreSQL Connection Issues
- **`Tenant or user not found` / `password authentication failed`**:
  - Verify your password in `backend/.env`. If your password contains characters like `@`, `#`, `$`, or `%`, you must URL-encode them (e.g., `@` becomes `%40`, `#` becomes `%23`).
  - When using the connection pooler, ensure the username includes the project ref: `postgres.[YOUR-PROJECT-REF]`.
- **`prepared statement "..." does not exist`**:
  - This typically happens in transaction-mode connection poolers (port `6543`). PackScan's `database.py` engine automatically sets `statement_cache_size=0` when it detects `6543` or `pooler.supabase.com`.
- **SSL Handshake Failed**:
  - Supabase enforces SSL. Ensure `?ssl=require` is present at the end of your URI or rely on PackScan's automatic SSL context negotiation.
- **Connection Timeout on Port 5432**:
  - In certain corporate networks or IPv4-only networks, direct connection to port `5432` may be blocked. Switch to the **Supabase Connection Pooler (Port 6543)** which supports IPv4 and NAT traversal.

---

## 🏛️ Smart India Hackathon & Government Attribution

Developed in accordance with the regulatory specifications of the **Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India**.

- **Statute Reference**: [The Legal Metrology (Packaged Commodities) Rules, 2011](https://consumeraffairs.nic.in)
- **Act Reference**: [The Legal Metrology Act, 2009 (No. 1 of 2010)](https://consumeraffairs.nic.in)
