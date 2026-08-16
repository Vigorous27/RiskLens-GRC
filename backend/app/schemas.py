from pydantic import BaseModel, ConfigDict, EmailStr, Field

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
    user_id: int
    
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

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128
    )


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(
        from_attributes=True
    )


class Token(BaseModel):
    access_token: str
    token_type: str

class ControlResponse(BaseModel):
    id: int
    framework: str
    control_code: str
    title: str
    description: str

    model_config = ConfigDict(
        from_attributes=True
    )


class RiskControlCreate(BaseModel):
    control_id: int

class SeverityDistribution(BaseModel):
    Low: int
    Medium: int
    High: int
    Critical: int


class DashboardSummary(BaseModel):
    total_assets: int
    total_risks: int
    open_risks: int
    critical_risks: int
    severity_distribution: SeverityDistribution

class ControlBase(BaseModel):
    name: str
    description: str
    control_type: str
    implementation_status: str = "Not Implemented"

    nist_csf: str | None = None
    iso_27001: str | None = None
    cis_control: str | None = None


class ControlCreate(ControlBase):
    pass


class ControlUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    control_type: str | None = None
    implementation_status: str | None = None

    nist_csf: str | None = None
    iso_27001: str | None = None
    cis_control: str | None = None


class ControlResponse(ControlBase):
    id: int
    user_id: int

    model_config = ConfigDict(
        from_attributes=True
    )


class RiskControlCreate(BaseModel):
    control_id: int 

class ControlCoverage(BaseModel):
    total_controls: int
    implemented_controls: int
    coverage_percentage: float

class HeatMapPoint(BaseModel):
    likelihood: int
    impact: int
    count: int


class PriorityRisk(BaseModel):
    id: int
    title: str
    asset_id: int
    likelihood: int
    impact: int
    risk_score: int
    severity: str
    status: str