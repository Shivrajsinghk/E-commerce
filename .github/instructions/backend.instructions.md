---
description: "Use when: working on Django backend code, API views, models, serializers, or database operations"
applyTo: "Backend/**"
---

# Django Backend Guidelines

## View Patterns

- Use function-based views with `@api_view(['GET', 'POST'])` decorators
- Apply `@permission_classes([IsAuthenticated])` for protected endpoints
- Handle exceptions: `try: ... except Model.DoesNotExist: return Response({'error': 'Not found'}, status=404)`

## Serializer Usage

- Include `context={'request': request}` for image URL generation
- Validate input data before saving

## Database Operations

- Use migrations for schema changes
- Seed data with Faker in shell scripts

## Security Notes

- Avoid hardcoded secrets; use environment variables for production
- Restrict CORS origins before deployment

Reference: [Backend/store/views.py](Backend/store/views.py) for examples.