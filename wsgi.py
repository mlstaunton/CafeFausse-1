from pathlib import Path
import importlib.util
import sys

BACKEND_DIR = Path(__file__).resolve().parent / "backend"
if str(BACKEND_DIR) not in sys.path:
  sys.path.insert(0, str(BACKEND_DIR))

backend_app_path = BACKEND_DIR / "app.py"
spec = importlib.util.spec_from_file_location("backend_app", backend_app_path)
backend_app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend_app)

app = backend_app.create_app({"DEBUG": False})
