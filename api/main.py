import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app

@app.middleware("http")
async def log_and_rewrite_middleware(request, call_next):
    # Print headers & path for Vercel logging / debugging
    path = request.url.path
    matched = request.headers.get("x-matched-path", "")
    forwarded = request.headers.get("x-forwarded-uri", "")
    
    # If request path is /api/main.py or similar, use the matched or forwarded path
    target = forwarded or matched or path
    if target and target != "/api/main.py":
        clean = target.split("?")[0]
        request.scope["path"] = clean
        
    return await call_next(request)
