from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import Base, engine, get_db
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

from app.auth import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    hash_password,
    verify_password,
)

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
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except (JWTError, ValueError):
        raise credentials_exception

    user = db.get(models.User, user_id)

    if not user:
        raise credentials_exception

    return user

@app.post(
    "/auth/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(models.User).where(
            models.User.email == user.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(
            user.password
        ),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post(
    "/auth/login",
    response_model=schemas.Token,
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(models.User).where(
            models.User.email == form_data.username
        )
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@app.get(
    "/auth/me",
    response_model=schemas.UserResponse,
)
def get_me(
    current_user: models.User = Depends(
        get_current_user
    ),
):
    return current_user

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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    new_asset = models.Asset(
        **asset.model_dump(),
        user_id=current_user.id,
    )

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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    assets = db.scalars(
        select(models.Asset)
        .where(
            models.Asset.user_id
            == current_user.id
        )
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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    asset = db.scalar(
        select(models.Asset).where(
            models.Asset.id == asset_id,
            models.Asset.user_id
            == current_user.id,
        )
    )

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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    asset = db.scalar(
        select(models.Asset).where(
            models.Asset.id == asset_id,
            models.Asset.user_id
            == current_user.id,
        )
    )

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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    asset = db.scalar(
        select(models.Asset).where(
            models.Asset.id == asset_id,
            models.Asset.user_id
            == current_user.id,
        )
    )

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
    current_user: models.User = Depends(get_current_user),
):
    asset = db.scalar(
        select(models.Asset).where(
            models.Asset.id == risk.asset_id,
            models.Asset.user_id == current_user.id,
        )
    )

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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    risks = db.scalars(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id
            == models.Asset.id,
        )
        .where(
            models.Asset.user_id
            == current_user.id
        )
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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    risk = db.scalar(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Risk.id == risk_id,
            models.Asset.user_id == current_user.id,
        )
    )

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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    risk = db.scalar(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Risk.id == risk_id,
            models.Asset.user_id == current_user.id,
        )
    )

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    update_data = risk_update.model_dump(
        exclude_unset=True
    )

    if "asset_id" in update_data:
        asset = db.scalar(
            select(models.Asset).where(
                models.Asset.id == update_data["asset_id"],
                models.Asset.user_id == current_user.id,
            )
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
    current_user: models.User = Depends(
        get_current_user
    ),
):
    risk = db.scalar(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Risk.id == risk_id,
            models.Asset.user_id == current_user.id,
        )
    )

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    db.delete(risk)
    db.commit()

    return None



@app.post(
    "/controls",
    response_model=schemas.ControlResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_control(
    control: schemas.ControlCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_control = models.Control(
        **control.model_dump(),
        user_id=current_user.id,
    )

    db.add(new_control)
    db.commit()
    db.refresh(new_control)

    return new_control


@app.get(
    "/controls",
    response_model=list[schemas.ControlResponse],
)
def get_controls(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    controls = db.scalars(
        select(models.Control)
        .where(
            models.Control.user_id == current_user.id
        )
        .order_by(models.Control.id)
    ).all()

    return controls

@app.get(
    "/controls/{control_id}",
    response_model=schemas.ControlResponse,
)
def get_control(
    control_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    control = db.scalar(
        select(models.Control).where(
            models.Control.id == control_id,
            models.Control.user_id == current_user.id,
        )
    )

    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control not found",
        )

    return control

@app.put(
    "/controls/{control_id}",
    response_model=schemas.ControlResponse,
)
def update_control(
    control_id: int,
    control_update: schemas.ControlUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    control = db.scalar(
        select(models.Control).where(
            models.Control.id == control_id,
            models.Control.user_id == current_user.id,
        )
    )

    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control not found",
        )

    update_data = control_update.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(control, field, value)

    db.commit()
    db.refresh(control)

    return control

@app.delete(
    "/controls/{control_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_control(
    control_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    control = db.scalar(
        select(models.Control).where(
            models.Control.id == control_id,
            models.Control.user_id == current_user.id,
        )
    )

    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control not found",
        )

    mappings = db.scalars(
        select(models.RiskControl).where(
            models.RiskControl.control_id == control_id
        )
    ).all()

    for mapping in mappings:
        db.delete(mapping)

    db.delete(control)
    db.commit()

    return None

@app.post(
    "/risks/{risk_id}/controls",
    status_code=status.HTTP_201_CREATED,
)
def map_control_to_risk(
    risk_id: int,
    mapping: schemas.RiskControlCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    risk = db.scalar(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Risk.id == risk_id,
            models.Asset.user_id == current_user.id,
        )
    )

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    control = db.scalar(
        select(models.Control).where(
            models.Control.id == mapping.control_id,
            models.Control.user_id == current_user.id,
        )
    )

    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control not found",
        )

    existing_mapping = db.scalar(
        select(models.RiskControl).where(
            models.RiskControl.risk_id == risk_id,
            models.RiskControl.control_id == mapping.control_id,
        )
    )

    if existing_mapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Control already mapped to this risk",
        )

    new_mapping = models.RiskControl(
        risk_id=risk_id,
        control_id=mapping.control_id,
    )

    db.add(new_mapping)
    db.commit()

    return {
        "message": "Control mapped to risk successfully"
    }

@app.get(
    "/risks/{risk_id}/controls",
    response_model=list[schemas.ControlResponse],
)
def get_risk_controls(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    risk = db.scalar(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Risk.id == risk_id,
            models.Asset.user_id == current_user.id,
        )
    )

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    controls = db.scalars(
        select(models.Control)
        .join(
            models.RiskControl,
            models.RiskControl.control_id == models.Control.id,
        )
        .where(
            models.RiskControl.risk_id == risk_id,
            models.Control.user_id == current_user.id,
        )
        .order_by(models.Control.id)
    ).all()

    return controls


@app.delete(
    "/risks/{risk_id}/controls/{control_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_control_from_risk(
    risk_id: int,
    control_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    risk = db.scalar(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Risk.id == risk_id,
            models.Asset.user_id == current_user.id,
        )
    )

    if not risk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk not found",
        )

    control = db.scalar(
        select(models.Control).where(
            models.Control.id == control_id,
            models.Control.user_id == current_user.id,
        )
    )

    if not control:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control not found",
        )

    mapping = db.scalar(
        select(models.RiskControl).where(
            models.RiskControl.risk_id == risk_id,
            models.RiskControl.control_id == control_id,
        )
    )

    if not mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Control is not mapped to this risk",
        )

    db.delete(mapping)
    db.commit()

    return None

@app.get(
    "/dashboard/summary",
    response_model=schemas.DashboardSummary,
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        get_current_user
    ),
):
    total_assets = db.scalar(
        select(func.count(models.Asset.id))
        .where(
            models.Asset.user_id == current_user.id
        )
    ) or 0

    total_risks = db.scalar(
        select(func.count(models.Risk.id))
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Asset.user_id == current_user.id
        )
    ) or 0

    open_risks = db.scalar(
        select(func.count(models.Risk.id))
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Asset.user_id == current_user.id,
            models.Risk.status == "Open",
        )
    ) or 0

    critical_risks = db.scalar(
        select(func.count(models.Risk.id))
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Asset.user_id == current_user.id,
            models.Risk.severity == "Critical",
        )
    ) or 0

    severity_distribution = {
        "Low": 0,
        "Medium": 0,
        "High": 0,
        "Critical": 0,
    }

    severity_rows = db.execute(
        select(
            models.Risk.severity,
            func.count(models.Risk.id),
        )
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Asset.user_id == current_user.id
        )
        .group_by(models.Risk.severity)
    ).all()

    for severity, count in severity_rows:
        if severity in severity_distribution:
            severity_distribution[severity] = count

    return {
        "total_assets": total_assets,
        "total_risks": total_risks,
        "open_risks": open_risks,
        "critical_risks": critical_risks,
        "severity_distribution": severity_distribution,
    }

@app.get(
    "/dashboard/control-coverage",
    response_model=schemas.ControlCoverage,
)
def get_control_coverage(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total_controls = db.scalar(
        select(func.count(models.Control.id))
        .where(
            models.Control.user_id == current_user.id
        )
    ) or 0

    implemented_controls = db.scalar(
        select(func.count(models.Control.id))
        .where(
            models.Control.user_id == current_user.id,
            models.Control.implementation_status == "Implemented",
        )
    ) or 0

    if total_controls == 0:
        coverage_percentage = 0.0
    else:
        coverage_percentage = round(
            (implemented_controls / total_controls) * 100,
            2
        )

    return {
        "total_controls": total_controls,
        "implemented_controls": implemented_controls,
        "coverage_percentage": coverage_percentage,
    }


@app.get(
    "/dashboard/heatmap",
    response_model=list[schemas.HeatMapPoint],
)
def get_risk_heatmap(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.execute(
        select(
            models.Risk.likelihood,
            models.Risk.impact,
            func.count(models.Risk.id),
        )
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Asset.user_id == current_user.id
        )
        .group_by(
            models.Risk.likelihood,
            models.Risk.impact,
        )
        .order_by(
            models.Risk.likelihood,
            models.Risk.impact,
        )
    ).all()

    return [
        {
            "likelihood": likelihood,
            "impact": impact,
            "count": count,
        }
        for likelihood, impact, count in rows
    ]


@app.get(
    "/dashboard/priority-risks",
    response_model=list[schemas.PriorityRisk],
)
def get_priority_risks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    risks = db.scalars(
        select(models.Risk)
        .join(
            models.Asset,
            models.Risk.asset_id == models.Asset.id,
        )
        .where(
            models.Asset.user_id == current_user.id
        )
        .order_by(
            models.Risk.risk_score.desc(),
            models.Risk.id.desc(),
        )
        .limit(5)
    ).all()

    return risks