from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Department of Consumer Affairs (DoCA), Government of India - AI-powered Legal Metrology compliance verification system under LMPC Rules 2011.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "service": "PackScan API",
        "agency": "Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Government of India",
        "statute": "Legal Metrology (Packaged Commodities) Rules, 2011",
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "HEALTHY",
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "packscan-backend"}
