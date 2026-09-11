from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class SeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    MAJOR = "MAJOR"
    MINOR = "MINOR"


class UserRoleEnum(str, Enum):
    CENTRAL_OFFICER = "CENTRAL_OFFICER"
    STATE_OFFICER = "STATE_OFFICER"
    ADMIN = "ADMIN"
    VIEWER = "VIEWER"


# Auth Schemas
class LoginRequest(BaseModel):
    username: str  # email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRoleEnum
    email: str
    state: Optional[str] = "ALL_INDIA"


# Extracted Field Schemas
class ExtractedFieldBase(BaseModel):
    field_name: str
    value: str
    bbox: Optional[List[float]] = None
    confidence: float = 0.95
    font_mm: Optional[float] = None


class ExtractedFieldResponse(ExtractedFieldBase):
    id: uuid.UUID
    inspection_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


# Violation Schemas
class ViolationResponse(BaseModel):
    id: Optional[uuid.UUID] = None
    rule_clause: str
    field: str
    severity: SeverityEnum
    message: str
    expected: str
    actual: str
    model_config = ConfigDict(from_attributes=True)


# Inspection Schemas
class ScanUploadResponse(BaseModel):
    inspection_id: uuid.UUID
    status: str
    message: str
    estimated_wait_sec: float = 2.0
    # Full inspection payload returned immediately for instant UI display
    inspection: Optional['InspectionDetailResponse'] = None
    # --- Debug / Diagnostic fields (visible in network tab) ---
    ocr_tokens: Optional[List[Dict[str, Any]]] = None
    classified_fields: Optional[Dict[str, Any]] = None
    pipeline_debug: Optional[Dict[str, Any]] = None


class InspectionDetailResponse(BaseModel):
    id: uuid.UUID
    product_id: Optional[uuid.UUID] = None
    product_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    image_url: str
    status: str
    compliance_status: str
    scanned_at: datetime
    officer_email: Optional[str] = None
    state: Optional[str] = None
    extracted_fields: List[ExtractedFieldResponse] = []
    violations: List[ViolationResponse] = []
    total_violations: int = 0
    critical_count: int = 0
    major_count: int = 0
    minor_count: int = 0
    model_config = ConfigDict(from_attributes=True)


# Product Schemas
class ProductListItem(BaseModel):
    id: uuid.UUID
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    inspections_count: int = 0
    last_status: str = "COMPLIANT"
    last_scanned: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class PaginatedProductsResponse(BaseModel):
    items: List[ProductListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# Dashboard Stats Schemas
class DashboardStatsResponse(BaseModel):
    total_inspections: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    violations_by_severity: Dict[str, int]
    violations_by_clause: Dict[str, int]
    state_breakdown: List[Dict[str, Any]]
    recent_trend: List[Dict[str, Any]]


ScanUploadResponse.model_rebuild()
