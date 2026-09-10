import sys
from pathlib import Path

# Add project root directory to sys.path for backend imports on Vercel
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app

# Vercel ASGI Middleware to translate x-forwarded-uri to FastAPI route paths
@app.middleware("http")
async def vercel_path_rewrite_middleware(request, call_next):
    forwarded_uri = request.headers.get("x-forwarded-uri")
    if forwarded_uri:
        clean_path = forwarded_uri.split("?")[0]
        request.scope["path"] = clean_path
    response = await call_next(request)
    return response
