from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

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