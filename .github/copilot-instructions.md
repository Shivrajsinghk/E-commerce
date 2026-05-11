# Project Guidelines

## Code Style

- **Backend (Django)**: Use function-based views with `@api_view` decorators and `@permission_classes([IsAuthenticated])` for protected endpoints. Follow DRF serializer patterns. Remove debug `print()` statements before production.

- **Frontend (React)**: Functional components with hooks. Use Redux Toolkit for state management. Tailwind CSS for styling with gradient backgrounds.

Reference: [Backend/store/views.py](Backend/store/views.py) for view patterns, [Frontend/src/features/store.js](Frontend/src/features/store.js) for Redux setup.

## Architecture

Full-stack e-commerce application with Django REST API backend and React + Redux frontend.

- **Backend**: Single `store` app handling products, categories, cart, orders, and user profiles. JWT authentication with auto-refresh via Axios interceptors.

- **Frontend**: Component-based architecture with pages for product listing/details, auth, cart, checkout, and profile. State managed via Redux slices (auth, cart, profile).

Key boundaries: API endpoints under `/api/`, frontend routes protected by `PrivateRouter`.

## Build and Test

### Backend
- Install: `pip install -r requirements.txt` (if exists, otherwise install Django + DRF manually)
- Run: `python manage.py runserver`
- Migrate: `python manage.py migrate`
- Seed: `python manage.py shell` then `from store.seed import seed; seed(10)`

### Frontend
- Install: `npm install`
- Run: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

No test suite implemented yet.

## Conventions

- **Authentication**: Use `authFetch` from `utils/auth.js` for authenticated API calls. Tokens stored in localStorage with auto-refresh on 401.

- **Environment**: Use `VITE_DJANGO_BASE_URL` for API base URL in frontend.

- **Error Handling**: Backend views should catch `DoesNotExist` exceptions and return appropriate status codes. Frontend handles auth failures by redirecting to login.

- **Database**: SQLite for development; migrations track schema changes. Use Faker for seeding test data.

Potential pitfalls: `CORS_ALLOW_ALL_ORIGINS = True` in settings (restrict for production), hardcoded `SECRET_KEY`, no pagination on product list, views may crash if related objects don't exist.

See [Frontend/README.md](Frontend/README.md) for frontend setup.