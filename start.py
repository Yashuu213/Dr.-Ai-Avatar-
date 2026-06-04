import subprocess
import time
import os
import signal
import sys

def run_project():
    # Start Backend
    print("Starting Flask Backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "app.py"], 
        cwd="backend",
        shell=True 
    )

    # Start Frontend
    print("Starting Vite Frontend...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"], 
        cwd="frontend",
        shell=True
    )

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    run_project()
