from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import Base, engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="RiskLens GRC API",
    description=(
        "Backend API for the RiskLens GRC "
        "cybersecurity risk management platform."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

def calculate_risk(
    likelihood: int,
    impact: int,
):
    score = likelihood * impact

    if score <= 5:
        severity = "Low"
    elif score <= 10:
        severity = "Medium"
    elif score <= 15:
        severity = "High"
    else:
        severity = "Critical"

    return score, severity

@app.get("/")
def root():
    return {
        "message": "Welcome to RiskLens GRC",
        "status": "running",
    }


@app.post(
    "/assets",
    response_model=schemas.AssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(get_db),
):
    new_asset = models.Asset(**asset.model_dump())

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    return new_asset


@app.get(
    "/assets",
    response_model=list[schemas.AssetResponse],
)
def get_assets(
    db: Session = Depends(get_db),
):
    assets = db.scalars(
        select(models.Asset)
        .order_by(models.Asset.id)
    ).all()

    return assets


@app.get(
    "/assets/{asset_id}",
    response_model=schemas.AssetResponse,
)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = db.get(models.Asset, asset_id)

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    return asset


@app.put(
    "/assets/{asset_id}",
    response_model=schemas.AssetResponse,
)
def update_asset(
    asset_id: int,
    asset_update: schemas.AssetUpdate,
    db: Session = Depends(get_db),
):
    asset = db.get(models.Asset, asset_id)

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    update_data = asset_update.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)

    return asset


@app.delete(
    "/assets/{asset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = db.get(models.Asset, asset_id)

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    db.delete(asset)
    db.commit()

    return None

@app.post(
    "/risks",
    response_model=schemas.RiskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_risk(
    risk: schemas.RiskCreate,
    db: Session = Depends(get_db),
):
    asset = db.get(models.Asset, risk.asset_id)

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    score, severity = calculate_risk(
        risk.likelihood,
        risk.impact,
    )

    new_risk = models.Risk(
        **risk.model_dump(),
        risk_score=score,
        severity=severity,
    )

    db.add(new_risk)
    db.commit()
    db.refresh(new_risk)

    return new_risk

@app.get(
    "/risks",
    response_model=list[schemas.RiskResponse],
)
def get_risks(
    db: Session = Depends(get_db),
):
    risks = db.scalars(
        select(models.Risk)
        .order_by(models.Risk.id)
    ).all()

    return risks

@app.get(
    "/risks/{risk_id}",
    response_model=schemas.RiskResponse,
)
def get_risk(
    risk_id: int,
    db: Session = Depends(get_db),
):
    risk = db.get(models.Risk, risk_id)

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    return risk

@app.put(
    "/risks/{risk_id}",
    response_model=schemas.RiskResponse,
)
def update_risk(
    risk_id: int,
    risk_update: schemas.RiskUpdate,
    db: Session = Depends(get_db),
):
    risk = db.get(models.Risk, risk_id)

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    update_data = risk_update.model_dump(
        exclude_unset=True
    )

    if "asset_id" in update_data:
        asset = db.get(
            models.Asset,
            update_data["asset_id"]
        )

        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )

    for field, value in update_data.items():
        setattr(risk, field, value)

    if (
        "likelihood" in update_data
        or "impact" in update_data
    ):
        score, severity = calculate_risk(
            risk.likelihood,
            risk.impact,
        )

        risk.risk_score = score
        risk.severity = severity

    db.commit()
    db.refresh(risk)

    return risk

@app.delete(
    "/risks/{risk_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_risk(
    risk_id: int,
    db: Session = Depends(get_db),
):
    risk = db.get(models.Risk, risk_id)

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    db.delete(risk)
    db.commit()

    return None