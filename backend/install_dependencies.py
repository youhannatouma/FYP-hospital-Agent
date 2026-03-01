import sys
import subprocess
import os

def main():
    # Ensure we are running with the correct Python version
    if sys.version_info < (3, 11, 9):
        print(f" Error: Python 3.11.9+ is required. You are using {sys.version.split()[0]}")
        sys.exit(1)

    requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    
    if not os.path.exists(requirements_file):
        print(f"Error: {requirements_file} not found.")
        sys.exit(1)

    print(f"Installing dependencies from requirements.txt using {sys.executable}...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
        print("Dependencies installed successfully!")
    except subprocess.CalledProcessError:
        print("Failed to install dependencies.")
        sys.exit(1)

if __name__ == "__main__":
    main()