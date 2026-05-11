---
description: "Use when: working on React frontend code, components, Redux state, routing, or styling"
applyTo: "Frontend/**"
---

# React Frontend Guidelines

## Component Patterns

- Use functional components with hooks (useState, useEffect)
- Import and use components from the components folder

## State Management

- Use Redux Toolkit slices for global state (auth, cart, profile)
- Dispatch actions with `useDispatch`, select with `useSelector`

## API Calls

- Use `authFetch` from `utils/auth.js` for authenticated requests
- Axios handles token refresh automatically

## Routing

- Wrap protected routes with `<PrivateRouter>` component
- Use React Router for navigation

## Styling

- Apply Tailwind CSS classes, including gradient backgrounds (e.g., `from-indigo-500 to-blue-500`)
- Use responsive design utilities

## Environment

- Access API base URL via `import.meta.env.VITE_DJANGO_BASE_URL`

Reference: [Frontend/src/features/store.js](Frontend/src/features/store.js) for Redux setup.