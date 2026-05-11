#!/bin/bash
# Pre-commit quality checks for e-commerce project
# Runs after tool use to ensure code quality

echo "Running pre-commit checks..."

# Check if we're in project root
if [ ! -f "Backend/manage.py" ]; then
    echo "Error: Run from project root"
    exit 1
fi

# Frontend linting
echo "Checking frontend code..."
cd Frontend
if command -v npm &> /dev/null; then
    npm run lint 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "Frontend linting failed"
        exit 2
    fi
else
    echo "npm not found, skipping frontend checks"
fi
cd ..

# Backend checks
echo "Checking backend code..."
cd Backend
if command -v python &> /dev/null; then
    # Run Django check
    python manage.py check --settings=backend.settings 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "Django checks failed"
        exit 2
    fi
else
    echo "Python not found, skipping backend checks"
fi
cd ..

echo "All checks passed!"
exit 0