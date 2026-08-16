from app.database import SessionLocal
from app.models import Control


controls = [
    {
        "framework": "NIST CSF 2.0",
        "control_code": "PR.AA",
        "title": "Identity Management and Access Control",
        "description": "Manage identities, authentication, and access permissions."
    },
    {
        "framework": "NIST CSF 2.0",
        "control_code": "PR.DS",
        "title": "Data Security",
        "description": "Protect data based on its confidentiality, integrity, and availability requirements."
    },
    {
        "framework": "ISO 27001",
        "control_code": "A.5.15",
        "title": "Access Control",
        "description": "Control access to information and associated assets."
    },
    {
        "framework": "ISO 27001",
        "control_code": "A.8.13",
        "title": "Information Backup",
        "description": "Maintain backups of information, software, and systems."
    },
    {
        "framework": "CIS Controls",
        "control_code": "5",
        "title": "Account Management",
        "description": "Manage system and application accounts."
    },
    {
        "framework": "CIS Controls",
        "control_code": "6",
        "title": "Access Control Management",
        "description": "Manage access rights and authentication."
    },
]


def seed_controls():
    db = SessionLocal()

    try:
        if db.query(Control).count() > 0:
            print("Controls already seeded.")
            return

        for item in controls:
            db.add(Control(**item))

        db.commit()
        print("Controls seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_controls()