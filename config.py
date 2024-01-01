import os
from pathlib import Path

# FILES_PATH = os.path.join(os.path.dirname(__file__), 'files')
FILES_PATH = os.path.join(Path.home(), 'Image Analysis Tool')
MODULES_PATH = os.path.join(os.path.dirname(__file__), 'modules')

if not os.path.exists(FILES_PATH):
	os.mkdir(FILES_PATH)
