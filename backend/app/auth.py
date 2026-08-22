import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from jose import jwt
from pwdlib import PasswordHash


# ---------------------------------------------------------
# ENVIRONMENT CONFIGURATION
# ---------------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE)


SECRET_KEY = os.getenv("JWT_SECRET")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET is not configured"
    )

if len(SECRET_KEY) < 32:
    raise RuntimeError(
        "JWT_SECRET must be at least 32 characters long"
    )


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ---------------------------------------------------------
# PASSWORD HASHING
# ---------------------------------------------------------

password_hash = PasswordHash.recommended()


def hash_password(
    password: str,
) -> str:
    return password_hash.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


# ---------------------------------------------------------
# JWT TOKEN CREATION
# ---------------------------------------------------------

def create_access_token(
    data: dict,
) -> str:
    payload = data.copy()

    now = datetime.now(
        timezone.utc
    )

    expire = now + timedelta(
        minutes=(
            ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload.update(
        {
            "iat": now,
            "exp": expire,
        }
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )