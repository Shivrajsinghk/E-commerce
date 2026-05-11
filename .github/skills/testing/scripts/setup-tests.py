#!/usr/bin/env python3
"""
Setup script for end-to-end testing in the e-commerce project.
Installs necessary dependencies and configures the test environment.
"""

import subprocess
import sys
import os

def run_command(command, cwd=None):
    """Run a shell command and return success."""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=True, capture_output=True, text=True)
        print(f"✓ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed: {command}")
        print(e.stderr)
        return False

def main():
    print("Setting up end-to-end testing for e-commerce project...")

    # Check if we're in the project root
    if not os.path.exists('Backend/manage.py'):
        print("Error: Run this script from the project root directory.")
        sys.exit(1)

    # Install Playwright for frontend e2e tests
    print("\n1. Installing Playwright for frontend testing...")
    if not run_command("cd Frontend && npm install --save-dev playwright"):
        sys.exit(1)

    # Install Playwright browsers
    print("\n2. Installing Playwright browsers...")
    if not run_command("cd Frontend && npx playwright install"):
        sys.exit(1)

    # Create test directory if it doesn't exist
    test_dir = "tests"
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)
        print(f"✓ Created {test_dir} directory")

    print("\n3. Setting up Django test configuration...")
    # Django tests are built-in, but we can create a test settings file
    test_settings = """# Test settings for Django
from backend.settings import *

# Use in-memory SQLite for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable debug for tests
DEBUG = False

# Use test-specific secret key
SECRET_KEY = 'test-secret-key'
"""
    with open('Backend/backend/test_settings.py', 'w') as f:
        f.write(test_settings)
    print("✓ Created Backend/backend/test_settings.py")

    print("\nSetup complete! You can now run tests.")
    print("Example: python manage.py test --settings=backend.test_settings")
    print("For Playwright: cd Frontend && npx playwright test")

if __name__ == "__main__":
    main()