#!/usr/bin/env python3
"""Servidor local que emula el cleanUrls de Vercel para probar CalculaMX."""
import http.server, os, sys

ROOT = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8777

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def translate_path(self, path):
        p = super().translate_path(path.split('?', 1)[0])
        if os.path.isdir(p):
            idx = os.path.join(p, 'index.html')
            return idx if os.path.exists(idx) else p
        if not os.path.exists(p):
            if os.path.exists(p + '.html'):
                return p + '.html'
        return p

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.HTTPServer(('127.0.0.1', PORT), H).serve_forever()
