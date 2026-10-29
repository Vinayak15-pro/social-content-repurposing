import sys
from pathlib import Path

# Automatically ensure the backend directory is in sys.path so 'app' is resolvable
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
