from pathlib import Path
from sys import exit
try:
    import fitz
except ImportError as e:
    print('MISSING_LIB', e)
    exit(1)
path = Path('screenshots/FYP_Report_Template.pdf')
print('EXISTS', path.exists(), path)
if not path.exists():
    exit(2)
doc = fitz.open(path)
for i, page in enumerate(doc, start=1):
    print('--- PAGE', i, '---')
    print(page.get_text())
    if i >= 5:
        break
