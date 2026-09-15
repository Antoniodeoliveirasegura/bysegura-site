"""Local preview server for bysegura.com.

Like `python3 -m http.server`, but sends Cache-Control: no-store so the
browser never pairs fresh HTML with a stale site.css / site.js while you
edit. Usage: python3 scripts/serve.py [port]   (default 4173)
"""
import functools
import http.server
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=str(ROOT))
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"serving {ROOT} at http://localhost:{PORT}")
    httpd.serve_forever()
