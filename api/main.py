import sys
from pathlib import Path
from urllib.parse import parse_qs

# Add project root directory to sys.path for backend imports on Vercel
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.main import app as fastapi_app

class VercelQueryPathMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            query_string = scope.get("query_string", b"").decode("utf-8")
            qs = parse_qs(query_string)
            if "__path" in qs and qs["__path"]:
                clean = qs["__path"][0].split("?")[0]
                scope["path"] = clean if clean.startswith("/") else ("/" + clean)
        await self.app(scope, receive, send)

app = VercelQueryPathMiddleware(fastapi_app)
