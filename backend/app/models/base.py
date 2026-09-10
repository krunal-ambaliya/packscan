from datetime import datetime
import uuid
from typing import List, Optional
from sqlalchemy import String, DateTime, ForeignKey, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="STATE_OFFICER")
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    products: Mapped[List["Product"]] = relationship("Product", back_populates="creator")
    inspections: Mapped[List["Inspection"]] = relationship("Inspection", back_populates="officer")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    brand: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Packaged Food")
    barcode: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    creator: Mapped[Optional["User"]] = relationship("User", back_populates="products")
    inspections: Mapped[List["Inspection"]] = relationship("Inspection", back_populates="product", cascade="all, delete-orphan")


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    image_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", index=True)  # PENDING, PROCESSING, COMPLETED, FAILED
    compliance_status: Mapped[str] = mapped_column(String(50), default="NON_COMPLIANT")  # COMPLIANT, NON_COMPLIANT
    scanned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    officer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), default="Delhi")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    product: Mapped[Optional["Product"]] = relationship("Product", back_populates="inspections")
    officer: Mapped[Optional["User"]] = relationship("User", back_populates="inspections")
    extracted_fields: Mapped[List["ExtractedField"]] = relationship("ExtractedField", back_populates="inspection", cascade="all, delete-orphan")
    violations: Mapped[List["Violation"]] = relationship("Violation", back_populates="inspection", cascade="all, delete-orphan")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("inspections.id"), nullable=False, index=True)
    field_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    bbox: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # [x, y, w, h]
    confidence: Mapped[float] = mapped_column(Float, default=0.90)
    font_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    inspection: Mapped["Inspection"] = relationship("Inspection", back_populates="extracted_fields")


class Violation(Base):
    __tablename__ = "violations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("inspections.id"), nullable=False, index=True)
    rule_clause: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    field: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # CRITICAL, MAJOR, MINOR
    message: Mapped[str] = mapped_column(Text, nullable=False)
    expected: Mapped[str] = mapped_column(Text, nullable=False)
    actual: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    inspection: Mapped["Inspection"] = relationship("Inspection", back_populates="violations")
