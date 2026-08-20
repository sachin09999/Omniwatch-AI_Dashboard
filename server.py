#!/usr/bin/env python3
"""
OmniVision AI Dashboard Server & Proxy
Serves static frontend assets and transparently proxies /ai/* requests to the surveillance backend
at http://10.10.12.50:8009 with CORS support and robust error handling.
"""

import os
import sys
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 8090
TARGET_BACKEND = "http://10.10.12.50:8009"
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class OmniProxyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        # Proxy all /ai/ requests to target backend
        if self.path.startswith('/ai/'):
            target_url = f"{TARGET_BACKEND}{self.path}"
            try:
                req = urllib.request.Request(
                    target_url,
                    headers={
                        'User-Agent': 'OmniVision-Dashboard/1.0',
                        'Accept': '*/*'
                    }
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    status_code = response.getcode()
                    content_type = response.headers.get('Content-Type', 'application/json')
                    data = response.read()

                    self.send_response(status_code)
                    self.send_header('Content-Type', content_type)
                    self.send_header('Content-Length', str(len(data)))
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(data)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                err_msg = f'{{"status": "error", "message": "Failed to connect to backend {TARGET_BACKEND}: {str(e)}"}}'
                self.wfile.write(err_msg.encode('utf-8'))
            return

        # Serve static files normally
        super().do_GET()

def run_server(port=PORT):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, OmniProxyHandler)
    print(f"🚀 OmniVision Dashboard server running at http://localhost:{port}")
    print(f"📡 Forwarding /ai/* requests to {TARGET_BACKEND}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
