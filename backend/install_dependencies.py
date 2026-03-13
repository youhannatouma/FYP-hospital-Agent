import sys
import subprocess
import os
import shutil
import stat
from pathlib import Path

VENV_DIR = Path(__file__).parent / "venv"
BACKEND_DIR = Path(__file__).parent
REQUIRED_VERSION = (3, 11, 9)
PYTHON_VERSION = "3.11"


def relaunch_with_correct_python():
    """If not running under the correct Python, relaunch with py -3.11."""
    if sys.version_info[:2] != (3, 11):
        print(f"Current Python is {sys.version.split()[0]}, relaunching with Python {PYTHON_VERSION}...")
        result = subprocess.run(
            ["py", f"-{PYTHON_VERSION}", __file__] + sys.argv[1:],
        )
        sys.exit(result.returncode)


def run(cmd, shell=True, check=True, cwd=None):
    print(f"\n>>> {cmd}")
    subprocess.run(cmd, shell=shell, check=check, cwd=cwd)


def check_python_version():
    python_path = Path(sys.executable).resolve()
    if VENV_DIR.resolve() in python_path.parents:
        print(
            "Error: You are running this script using the venv Python that will be deleted.\n"
            "Please run it with your system Python instead:\n"
            f"  py -{PYTHON_VERSION} install_dependencies.py"
        )
        sys.exit(1)

    if sys.version_info < REQUIRED_VERSION:
        print(
            f"Error: Python {'.'.join(map(str, REQUIRED_VERSION))}+ is required. "
            f"You are using {sys.version.split()[0]}"
        )
        sys.exit(1)

    print(f"Python version OK: {sys.version.split()[0]}")


def force_remove_readonly(func, path, excinfo):
    """Handle read-only files on Windows by chmod-ing before removal."""
    os.chmod(path, stat.S_IWRITE)
    func(path)


def recreate_venv():
    if VENV_DIR.exists():
        print(f"\nRemoving old venv at {VENV_DIR}...")
        shutil.rmtree(VENV_DIR, onerror=force_remove_readonly)

    print(f"Creating new venv with Python {PYTHON_VERSION}...")
    result = subprocess.run(
        f"py -{PYTHON_VERSION} -m venv venv",
        shell=True,
        cwd=BACKEND_DIR
    )
    if result.returncode != 0:
        print(f"\nError: Python {PYTHON_VERSION} not found.")
        print("Download it from https://python.org/downloads")
        sys.exit(1)


def install_dependencies():
    requirements_file = BACKEND_DIR / "requirements.txt"

    if not requirements_file.exists():
        print(f"Error: {requirements_file} not found.")
        sys.exit(1)

    pip = str(VENV_DIR / "Scripts" / "pip")
    print(f"\nInstalling dependencies from requirements.txt...")

    try:
        subprocess.check_call([pip, "install", "-r", str(requirements_file)])
        print("Dependencies installed successfully!")
    except subprocess.CalledProcessError:
        print("Failed to install dependencies.")
        sys.exit(1)


def start_server():
    print("\nStarting uvicorn...\n")
    uvicorn = str(VENV_DIR / "Scripts" / "uvicorn")
    run(f'"{uvicorn}" app.main:app --reload', check=False, cwd=BACKEND_DIR)


def main():
    relaunch_with_correct_python()
    check_python_version()
    recreate_venv()
    install_dependencies()
    start_server()


if __name__ == "__main__":
    main()