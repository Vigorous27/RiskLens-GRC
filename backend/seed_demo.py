from sqlalchemy import select

from app.database import SessionLocal
from app.models import (
    Asset,
    Control,
    Risk,
    User,
)


DEMO_EMAIL = "lalith@example.com"


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


def seed_demo():
    db = SessionLocal()

    try:
        user = db.scalar(
            select(User).where(
                User.email == DEMO_EMAIL
            )
        )

        if not user:
            print(
                f"User {DEMO_EMAIL} was not found."
            )

            print(
                "Create/login with your RiskLens "
                "account first."
            )

            return

        print(
            f"Seeding demo data for {user.email}..."
        )

        # -------------------------------------------------
        # ASSETS
        # -------------------------------------------------

        assets_data = [
            {
                "name": "Customer Database",
                "asset_type": "Database",
                "owner": "IT Manager",
                "criticality": "Critical",
                "internet_facing": False,
                "data_sensitivity": "Restricted",
                "existing_controls": (
                    "Database authentication, "
                    "role-based access, daily backups"
                ),
            },
            {
                "name": "E-Commerce Website",
                "asset_type": "Web Application",
                "owner": "Digital Operations",
                "criticality": "High",
                "internet_facing": True,
                "data_sensitivity": "Confidential",
                "existing_controls": (
                    "TLS, web application firewall, "
                    "cloud monitoring"
                ),
            },
            {
                "name": "Microsoft 365 Email",
                "asset_type": "Cloud Service",
                "owner": "IT Manager",
                "criticality": "High",
                "internet_facing": True,
                "data_sensitivity": "Confidential",
                "existing_controls": (
                    "Spam filtering and MFA "
                    "for administrators"
                ),
            },
            {
                "name": "Employee Laptops",
                "asset_type": "Endpoint",
                "owner": "IT Support",
                "criticality": "Medium",
                "internet_facing": False,
                "data_sensitivity": "Internal",
                "existing_controls": (
                    "Endpoint protection and "
                    "automatic operating-system updates"
                ),
            },
            {
                "name": "Payment Records",
                "asset_type": "Business Data",
                "owner": "Finance Manager",
                "criticality": "Critical",
                "internet_facing": False,
                "data_sensitivity": "Restricted",
                "existing_controls": (
                    "Restricted finance access "
                    "and monthly backups"
                ),
            },
            {
                "name": "Cloud Backup Storage",
                "asset_type": "Cloud Storage",
                "owner": "IT Manager",
                "criticality": "High",
                "internet_facing": False,
                "data_sensitivity": "Restricted",
                "existing_controls": (
                    "Encrypted storage and "
                    "separate administrator account"
                ),
            },
        ]

        asset_objects = {}

        for data in assets_data:
            existing = db.scalar(
                select(Asset).where(
                    Asset.user_id == user.id,
                    Asset.name == data["name"],
                )
            )

            if existing:
                asset_objects[
                    data["name"]
                ] = existing

                continue

            asset = Asset(
                user_id=user.id,
                **data,
            )

            db.add(asset)
            db.flush()

            asset_objects[
                data["name"]
            ] = asset

        # -------------------------------------------------
        # CONTROLS
        # -------------------------------------------------

        controls_data = [
            {
                "name": "Multi-Factor Authentication",
                "description": (
                    "Require MFA for privileged "
                    "and sensitive user accounts."
                ),
                "control_type": "Preventive",
                "implementation_status": "Implemented",
                "nist_csf": "PR.AA",
                "iso_27001": (
                    "Access control / authentication"
                ),
                "cis_control": "Control 6",
            },
            {
                "name": "Verified Data Backups",
                "description": (
                    "Perform scheduled backups and "
                    "regularly test data restoration."
                ),
                "control_type": "Corrective",
                "implementation_status": "Implemented",
                "nist_csf": "PR.DS",
                "iso_27001": "Information backup",
                "cis_control": "Control 11",
            },
            {
                "name": "Endpoint Protection",
                "description": (
                    "Protect endpoints against "
                    "malware and suspicious activity."
                ),
                "control_type": "Preventive",
                "implementation_status": "Implemented",
                "nist_csf": "PR.PS",
                "iso_27001": (
                    "Protection against malware"
                ),
                "cis_control": "Control 10",
            },
            {
                "name": "Vulnerability Management",
                "description": (
                    "Identify, prioritize, and "
                    "remediate known vulnerabilities."
                ),
                "control_type": "Preventive",
                "implementation_status": "In Progress",
                "nist_csf": "ID.RA",
                "iso_27001": (
                    "Management of technical "
                    "vulnerabilities"
                ),
                "cis_control": "Control 7",
            },
            {
                "name": "Security Logging and Monitoring",
                "description": (
                    "Collect and review security "
                    "events from critical systems."
                ),
                "control_type": "Detective",
                "implementation_status": "In Progress",
                "nist_csf": "DE.CM",
                "iso_27001": "Logging",
                "cis_control": "Control 8",
            },
            {
                "name": "Access Review Process",
                "description": (
                    "Periodically review user access "
                    "and remove unnecessary privileges."
                ),
                "control_type": "Administrative",
                "implementation_status": "Planned",
                "nist_csf": "PR.AA",
                "iso_27001": "Access rights",
                "cis_control": "Control 6",
            },
            {
                "name": "Security Awareness Training",
                "description": (
                    "Provide recurring cybersecurity "
                    "awareness and phishing training."
                ),
                "control_type": "Administrative",
                "implementation_status": "Implemented",
                "nist_csf": "PR.AT",
                "iso_27001": (
                    "Information security awareness"
                ),
                "cis_control": "Control 14",
            },
            {
                "name": "Incident Response Procedure",
                "description": (
                    "Maintain documented procedures "
                    "for identifying and responding "
                    "to security incidents."
                ),
                "control_type": "Corrective",
                "implementation_status": "Planned",
                "nist_csf": "RS.MA",
                "iso_27001": (
                    "Information security incident "
                    "management"
                ),
                "cis_control": "Control 17",
            },
        ]

        for data in controls_data:
            existing = db.scalar(
                select(Control).where(
                    Control.user_id == user.id,
                    Control.name == data["name"],
                )
            )

            if existing:
                continue

            db.add(
                Control(
                    user_id=user.id,
                    **data,
                )
            )

        # -------------------------------------------------
        # RISKS
        # -------------------------------------------------

        risks_data = [
            {
                "title": (
                    "Customer Database "
                    "Account Compromise"
                ),
                "asset": "Customer Database",
                "threat": "Credential theft",
                "vulnerability": (
                    "Privileged database accounts "
                    "may be compromised through "
                    "stolen credentials."
                ),
                "likelihood": 4,
                "impact": 5,
                "status": "Open",
                "mitigation_plan": (
                    "Enforce MFA, review privileged "
                    "accounts, and monitor "
                    "authentication events."
                ),
            },
            {
                "title": (
                    "E-Commerce Website Exploitation"
                ),
                "asset": "E-Commerce Website",
                "threat": "External attacker",
                "vulnerability": (
                    "Internet-facing application "
                    "vulnerabilities could allow "
                    "unauthorized access."
                ),
                "likelihood": 4,
                "impact": 4,
                "status": "In Progress",
                "mitigation_plan": (
                    "Perform vulnerability scans, "
                    "apply security patches, and "
                    "review WAF alerts."
                ),
            },
            {
                "title": (
                    "Business Email Account Takeover"
                ),
                "asset": "Microsoft 365 Email",
                "threat": "Phishing",
                "vulnerability": (
                    "Users may disclose credentials "
                    "through social engineering."
                ),
                "likelihood": 4,
                "impact": 4,
                "status": "Open",
                "mitigation_plan": (
                    "Expand MFA enforcement and "
                    "deliver recurring phishing "
                    "awareness training."
                ),
            },
            {
                "title": "Payment Record Data Loss",
                "asset": "Payment Records",
                "threat": "Data loss",
                "vulnerability": (
                    "Backup restoration procedures "
                    "are not tested frequently."
                ),
                "likelihood": 3,
                "impact": 5,
                "status": "Open",
                "mitigation_plan": (
                    "Increase backup frequency and "
                    "test restoration quarterly."
                ),
            },
            {
                "title": (
                    "Malware Infection on "
                    "Employee Laptop"
                ),
                "asset": "Employee Laptops",
                "threat": "Malware",
                "vulnerability": (
                    "Users may download malicious "
                    "attachments or software."
                ),
                "likelihood": 3,
                "impact": 3,
                "status": "In Progress",
                "mitigation_plan": (
                    "Maintain endpoint protection, "
                    "restrict local administration, "
                    "and train users."
                ),
            },
            {
                "title": (
                    "Unauthorized Cloud Backup Access"
                ),
                "asset": "Cloud Backup Storage",
                "threat": "Unauthorized access",
                "vulnerability": (
                    "Compromise of cloud "
                    "administrative credentials."
                ),
                "likelihood": 2,
                "impact": 5,
                "status": "Open",
                "mitigation_plan": (
                    "Use dedicated administrator "
                    "accounts, MFA, and access reviews."
                ),
            },
            {
                "title": (
                    "Excessive User Privileges"
                ),
                "asset": "Customer Database",
                "threat": "Insider misuse",
                "vulnerability": (
                    "Legacy accounts may retain "
                    "permissions that are no longer "
                    "required."
                ),
                "likelihood": 3,
                "impact": 4,
                "status": "Open",
                "mitigation_plan": (
                    "Perform quarterly access reviews "
                    "and implement least privilege."
                ),
            },
            {
                "title": (
                    "Delayed Critical Security Patches"
                ),
                "asset": "E-Commerce Website",
                "threat": (
                    "Known vulnerability exploitation"
                ),
                "vulnerability": (
                    "Critical application patches "
                    "may not be deployed quickly."
                ),
                "likelihood": 3,
                "impact": 4,
                "status": "In Progress",
                "mitigation_plan": (
                    "Define patching SLAs and "
                    "prioritize internet-facing "
                    "critical vulnerabilities."
                ),
            },
            {
                "title": (
                    "Insufficient Security Monitoring"
                ),
                "asset": "Microsoft 365 Email",
                "threat": (
                    "Undetected malicious activity"
                ),
                "vulnerability": (
                    "Security events are not "
                    "consistently reviewed."
                ),
                "likelihood": 3,
                "impact": 3,
                "status": "Open",
                "mitigation_plan": (
                    "Centralize logs and establish "
                    "regular alert review procedures."
                ),
            },
            {
                "title": (
                    "Lost Employee Laptop "
                    "Exposes Internal Data"
                ),
                "asset": "Employee Laptops",
                "threat": "Device loss or theft",
                "vulnerability": (
                    "Portable devices may contain "
                    "locally stored business data."
                ),
                "likelihood": 2,
                "impact": 3,
                "status": "Accepted",
                "mitigation_plan": (
                    "Enforce disk encryption and "
                    "remote device management."
                ),
            },
        ]

        for data in risks_data:
            existing = db.scalar(
                select(Risk).where(
                    Risk.title
                    == data["title"],
                    Risk.asset_id
                    == asset_objects[
                        data["asset"]
                    ].id,
                )
            )

            if existing:
                continue

            score, severity = calculate_risk(
                data["likelihood"],
                data["impact"],
            )

            db.add(
                Risk(
                    title=data["title"],
                    asset_id=asset_objects[
                        data["asset"]
                    ].id,
                    threat=data["threat"],
                    vulnerability=(
                        data["vulnerability"]
                    ),
                    likelihood=(
                        data["likelihood"]
                    ),
                    impact=data["impact"],
                    risk_score=score,
                    severity=severity,
                    status=data["status"],
                    mitigation_plan=(
                        data["mitigation_plan"]
                    ),
                )
            )

        db.commit()

        print("Demo data seeded successfully.")

    except Exception as error:
        db.rollback()

        print(
            f"Demo seed failed: {error}"
        )

        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()