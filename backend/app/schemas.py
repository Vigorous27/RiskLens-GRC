from pydantic import BaseModel, ConfigDict, Field

class AssetBase(BaseModel):
    name: str
    asset_type: str
    owner: str | None = None
    criticality: str
    internet_facing: bool = False
    data_sensitivity: str
    existing_controls: str | None = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: str | None = None
    asset_type: str | None = None
    owner: str | None = None
    criticality: str | None = None
    internet_facing: bool | None = None
    data_sensitivity: str | None = None
    existing_controls: str | None = None


class AssetResponse(AssetBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class RiskCreate(BaseModel):
    title: str
    asset_id: int
    threat: str
    vulnerability: str

    likelihood: int = Field(
        ge=1,
        le=5
    )

    impact: int = Field(
        ge=1,
        le=5
    )

    status: str = "Open"
    mitigation_plan: str | None = None


class RiskUpdate(BaseModel):
    title: str | None = None
    asset_id: int | None = None
    threat: str | None = None
    vulnerability: str | None = None

    likelihood: int | None = Field(
        default=None,
        ge=1,
        le=5
    )

    impact: int | None = Field(
        default=None,
        ge=1,
        le=5
    )

    status: str | None = None
    mitigation_plan: str | None = None


class RiskResponse(BaseModel):
    id: int
    title: str
    asset_id: int
    threat: str
    vulnerability: str
    likelihood: int
    impact: int
    risk_score: int
    severity: str
    status: str
    mitigation_plan: str | None

    model_config = ConfigDict(
        from_attributes=True
    )