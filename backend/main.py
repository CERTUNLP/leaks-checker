from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import re
from collections import defaultdict

RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")
ENV = os.getenv("ENVIRONMENT", "production")  # production by default
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_site(site):
    # Remove http://, https://, and everything after the first slash
    if not site:
        return ""
    site = re.sub(r"^https?://", "", site)
    site = site.split("/")[0]
    return site


@app.get("/api/leaks")
async def get_leaks(
    request: Request,
    query: str = Query(..., description="Email or username to search for"),
    recaptcha: str = Query(None),
):
    async with httpx.AsyncClient() as client:
        # Validate reCAPTCHA only in production
        if ENV == "production":
            if not recaptcha:
                return JSONResponse(
                    status_code=400, content={"error": "Captcha required"}
                )
            r = await client.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={"secret": RECAPTCHA_SECRET, "response": recaptcha},
            )
            if not r.json().get("success"):
                return JSONResponse(
                    status_code=400, content={"error": "Captcha not valid"}
                )

        # Use API_EXTERNAL_URL for production, API_LOCAL_URL for development
        base_url = os.getenv("API_EXTERNAL_URL")
        if not base_url:
            raise HTTPException(
                status_code=500,
                detail="API_EXTERNAL_URL not configured in environment variables",
            )
        try:
            response = await client.get(
                base_url,
                params={"usuario": query, "usuario_exacto": "true"},
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
        except Exception:
            raise HTTPException(
                status_code=502, detail="Error on fetching data from leaks API"
            )

    leaks = data.get("data", [])
    grouped = defaultdict(set)  # (username, password) -> set(sites)
    for leak in leaks:
        username = leak.get("usuario", "Unknown")
        password = leak.get("contraseña", "")
        masked = password
        site = normalize_site(leak.get("sitio", ""))
        grouped[(username, masked)].add(site)
    result = [
        {"username": username, "password_masked": masked, "site_count": len(sites)}
        for (username, masked), sites in grouped.items()
    ]
    return result
