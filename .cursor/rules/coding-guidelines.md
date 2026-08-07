# Peña Zos — Coding Guidelines

**Version:** 0.1  
**Status:** Active

---

# 1. Overview

This document defines the coding standards for the Peña Zos application.

These rules must be followed when creating, modifying or reviewing code.

The objective is to maintain a project that is:

- Simple.
- Maintainable.
- Consistent.
- Easy to understand.

---

# 2. General Principles

The application should prioritize:

- Simplicity over complexity.
- Readability over clever solutions.
- Clear separation of responsibilities.
- Reusable solutions.
- Minimal dependencies.

Avoid:

- Over-engineering.
- Unnecessary abstractions.
- Duplicate logic.
- Complex solutions for simple problems.

---

# 3. Technology Constraints

The project uses:

Frontend:

- React.
- TypeScript.
- Vite.

Backend services:

- Firebase Authentication.
- Cloud Firestore.
- Firebase Hosting.

Do not introduce:

- Custom backend APIs.
- Additional servers.
- Unnecessary frameworks.

Any new dependency must have a clear justification.

---

# 4. TypeScript Guidelines

TypeScript must be used strictly.

Rules:

- Avoid using `any`.
- Define explicit types.
- Use interfaces for data models.
- Keep shared types centralized.
- Prefer type safety over shortcuts.

---

# 5. React Component Guidelines

React components must follow these principles:

- One responsibility per component.
- Keep components small.
- Extract reusable components.
- Avoid mixing business logic and UI logic.

Components should focus on:

- Rendering data.
- Handling user interaction.
- Managing visual state.

Business logic should be placed elsewhere.

---

# 6. Feature Organization

The project must be organized by business features.

Example structure:

features/

- auth/
- users/
- seasons/
- tasks/
- dinners/
- polls/
- products/
- orders/
- deliveries/
- inventory/
- finances/

Each feature should contain:

- Components.
- Hooks.
- Services.
- Types.

Avoid organizing only by technical category.

---

# 7. Business Logic Separation

Business logic must not live inside React components.

Components should not:

- Execute Firestore queries directly.
- Contain complex business rules.
- Manage application-wide logic.

Preferred flow:

Component → Service → Firebase

---

# 8. Firebase Guidelines

Firebase access must be centralized.

Do not call Firebase directly from components.

Use service layers responsible for:

- Reading data.
- Creating data.
- Updating data.
- Deleting data when allowed.

Components are responsible for:

- Displaying information.
- Handling user actions.

---

# 9. Firestore Guidelines

Firestore structure must follow:

1-specs/15-firestore-data-model.md

Do not create:

- New collections.
- New fields.
- New relationships.

without updating specifications first.

Avoid:

- Excessive duplication.
- Deep nesting.
- Complex queries.

---

# 10. Authentication Guidelines

Authentication must use:

- Firebase Authentication.
- Firestore user profiles.

Rules:

- Never store passwords.
- Never manually manage authentication tokens.
- Never bypass Firebase security.

Frontend checks are only for user experience.

Real security is enforced by:

- Firebase Authentication.
- Firestore Security Rules.

---

# 11. Authorization Guidelines

Roles must always come from:

users/{userId}

Supported roles:

- MEMBER.
- BOARD.
- TREASURER.
- ADMIN.

Never trust:

- Local storage permissions.
- Client-modified roles.
- Frontend checks alone.

---

# 12. Naming Conventions

## Components

Use PascalCase.

Examples:

- TaskList.tsx
- DinnerCard.tsx
- UserProfile.tsx

## Services and utilities

Use camelCase.

Examples:

- taskService.ts
- dateUtils.ts

## Functions

Functions must describe actions.

Good examples:

- createOrder()
- updateTaskStatus()
- deleteProduct()

Avoid generic names:

- process()
- execute()
- handle()

unless the purpose is obvious.

---

# 13. State Management

Avoid unnecessary global state.

Preferred order:

1. Component state.
2. React hooks.
3. Context API.
4. External state libraries only if required.

Do not add state management libraries without justification.

---

# 14. Error Handling

All asynchronous operations must handle errors.

Requirements:

- Show meaningful messages.
- Do not silently ignore failures.
- Provide feedback to users.

---

# 15. Loading States

All asynchronous operations must provide loading feedback.

Examples:

- Loading users.
- Saving orders.
- Updating tasks.
- Loading dashboards.

The user must always know when the application is processing.

---

# 16. Form Guidelines

Forms must:

- Validate required fields.
- Show clear validation messages.
- Prevent invalid submissions.

Validation should happen before writing to Firestore.

---

# 17. Security Guidelines

Never expose sensitive information.

Do not:

- Store passwords.
- Store secrets in source code.
- Disable security rules.
- Trust client-side validation.

All permissions must also exist in Firebase Security Rules.

---

# 18. Code Comments

Comments should explain:

- Why something exists.
- Complex business decisions.
- Non-obvious behaviour.

Avoid comments explaining obvious code.

---

# 19. Testing Guidelines

Testing priority:

1. Firebase Security Rules.
2. Authentication flows.
3. Critical business logic.
4. User workflows.

Important functionality should include tests when practical.

---

# 20. Cursor Development Rules

When generating or modifying code:

Always:

1. Read the related specification files.
2. Follow the existing architecture.
3. Reuse existing components and services.
4. Avoid unnecessary dependencies.
5. Keep changes focused.
6. Explain important architectural decisions.

Never:

- Create features without specifications.
- Modify Firestore structure without updating specs.
- Create duplicate implementations.
- Introduce backend services.
- Ignore security rules.

---

# 21. Final Principle

Peña Zos is a community application.

The priority is:

- Reliability.
- Simplicity.
- Easy maintenance.

Prefer:

- Simple solutions.
- Clear code.
- Small changes.

Avoid:

- Enterprise-level complexity.
- Premature optimization.
- Unnecessary technology.