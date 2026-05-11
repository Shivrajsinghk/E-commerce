---
name: testing
description: 'Set up and run end-to-end tests for the e-commerce application. Use for testing user flows like registration, login, shopping cart, and checkout.'
argument-hint: 'Specify the test scenario, e.g., "user registration" or "checkout flow"'
---

# End-to-End Testing for E-Commerce

## When to Use

- Testing complete user journeys from frontend to backend
- Verifying integration between React frontend and Django API
- Debugging issues that span multiple components

## Procedure

1. **Install Dependencies**
   - For backend: Ensure Django test framework is available
   - For frontend: Install Playwright or similar e2e tool
   - Run [setup script](./scripts/setup-tests.py)

2. **Configure Test Environment**
   - Set up test database
   - Configure API endpoints and frontend URLs

3. **Write Test Scenarios**
   - Use fixtures for test data
   - Cover key flows: user registration, login, product browsing, cart management, checkout

4. **Run Tests**
   - Execute tests with appropriate commands
   - Review results and screenshots

## Resources

- [Test setup script](./scripts/setup-tests.py)
- [Example test file](./assets/example-test.js)
- [Test fixtures](./assets/fixtures.json)