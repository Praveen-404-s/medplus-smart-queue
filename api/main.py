import sys
from pathlib import Path

# Add project root directory to sys.path for backend imports on Vercel
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app

@app.middleware("http")
async def vercel_query_path_middleware(request, call_next):
    override_path = request.query_params.get("__path")
    if override_path:
        clean_path = override_path.split("?")[0]
        request.scope["path"] = clean_path if clean_path.startswith("/") else ("/" + clean_path)
    return await call_next(request)
