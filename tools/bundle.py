"""Bundle the site into one HTML file (CSS and JS inlined) for previews such as a claude.ai artifact.

Usage: python3 tools/bundle.py OUT.html [--artifact]
--artifact drops the <html>/<head>/<body> wrapper, which the artifact host adds itself.
Images stay as separate files under img/ and must be published next to the output.
"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1])
artifact = "--artifact" in sys.argv

html = (root / "index.html").read_text()
css = (root / "styles.css").read_text()
js = ""
for name in ["sound.js", "cards.js", "main.js"]:
    src = (root / name).read_text()
    src = re.sub(r"^import .*?;\n", "", src, flags=re.M)
    src = re.sub(r"^export ", "", src, flags=re.M)
    js += f"// ---- {name}\n{src}\n"

html = html.replace('<link rel="stylesheet" href="styles.css" />', f"<style>\n{css}\n</style>")
html = html.replace('<script type="module" src="main.js"></script>', f'<script type="module">\n{js}\n</script>')

if artifact:
    html = re.sub(r"<!doctype html>\s*<html lang=\"en\">\s*<head>\s*", "", html)
    html = html.replace('<meta charset="utf-8" />\n', "")
    html = html.replace('  <meta name="viewport" content="width=device-width, initial-scale=1" />\n', "")
    html = html.replace('</head>\n<body class="stage-intro">', "").replace("</body>\n</html>", "")
    html = html.replace('<script type="module">\n', '<script type="module">\ndocument.body.classList.add("stage-intro");\n', 1)
    html = html.replace(":root {\n", ":root {\n  color-scheme: light;\n", 1)
    html = html.lstrip()

out.write_text(html)
print(f"wrote {out}")
