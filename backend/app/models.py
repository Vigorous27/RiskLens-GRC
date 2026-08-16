from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )


class Asset(Base):
    __tablename__ = "assets"


    user_id: Mapped[int] = mapped_column(
    ForeignKey("users.id"),
    nullable=False
)

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    asset_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    owner: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    criticality: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    internet_facing: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    data_sensitivity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    existing_controls: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

class Risk(Base):
    __tablename__ = "risks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id"),
        nullable=False
    )

    threat: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    vulnerability: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    likelihood: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    impact: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    risk_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="Open"
    )

    mitigation_plan: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

class Control(Base):
    __tablename__ = "controls"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    control_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    implementation_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Not Implemented"
    )

    nist_csf: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    iso_27001: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    cis_control: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

class RiskControl(Base):
    __tablename__ = "risk_controls"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    risk_id: Mapped[int] = mapped_column(
        ForeignKey("risks.id"),
        nullable=False
    )

    control_id: Mapped[int] = mapped_column(
        ForeignKey("controls.id"),
        nullable=False
    )
