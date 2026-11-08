"""
Run the Build Your Player site on your own computer (preview before GitHub).

How to use:
  1. Install Python 3 (python.org) if you don't have it.
  2. Put this file in the player-builder folder (next to index.html).
  3. Double-click it, or run:  python run_local.py
  4. Your browser opens the site. Close this window (or press Ctrl+C) to stop.

Running it in Jupyter / a notebook instead?
  Set FOLDER below to your player-builder folder (or start Jupyter in that folder),
  run the cell, and the site keeps running in the background.
  Run  stop()  in another cell to stop it.

Edit data.js, save, and refresh the browser page to see your changes.
"""
import functools
import http.server
import os
import socket
import threading
import webbrowser

# Folder containing index.html. Leave as None to detect it automatically,
# or write the path, e.g. FOLDER = r"C:\Users\Manuel\Downloads\player-builder"
FOLDER = None

try:
    _HERE = os.path.dirname(os.path.abspath(__file__))  # normal Python script
    IN_NOTEBOOK = False
except NameError:
    _HERE = os.getcwd()  # Jupyter / notebook: no __file__
    IN_NOTEBOOK = True

FOLDER = FOLDER or _HERE
_server = None


def free_port(start=8000):
    for port in range(start, start + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise RuntimeError("No free port found")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # Always send the latest version of data.js etc. after you edit them
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass  # keep the window quiet


def stop():
    global _server
    if _server:
        _server.shutdown()
        _server.server_close()
        _server = None
        print("Stopped.")


def main():
    global _server
    if not os.path.exists(os.path.join(FOLDER, "index.html")):
        print(f"index.html not found in: {FOLDER}")
        print("Put run_local.py inside the player-builder folder, or set FOLDER at the top of the file.")
        if not IN_NOTEBOOK:
            input("Press Enter to close...")
        return
    stop()  # in a notebook, re-running the cell restarts cleanly
    port = free_port()
    handler = functools.partial(NoCacheHandler, directory=FOLDER)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    _server = server
    url = f"http://127.0.0.1:{port}/"
    print(f"Site running at {url}  (serving folder: {FOLDER})")
    webbrowser.open(url)
    if IN_NOTEBOOK:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        print("Running in the background. Run  stop()  to stop it.")
        return
    print("Close this window or press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        _server = None
        print("Stopped.")


if __name__ == "__main__":
    main()
