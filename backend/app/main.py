from fastapi import FastAPI

app = FastAPI(
    title="RiskLens GRC API",
    description="Backend API for the RiskLens GRC cybersecurity risk management platform.",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to RiskLens GRC",
        "status": "running"
    }