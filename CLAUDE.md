# Peña Zos — Claude Code Instructions

**Version:** 0.1  
**Status:** Active

---

# 1. Project Overview

This repository contains the Peña Zos application.

The application is a web platform to manage San Mateo festivities and Peña Zos internal organization.

The main objectives are:

- Keep the application simple.
- Prioritize maintainability.
- Use free infrastructure whenever possible.
- Build a mobile-first experience.
- Avoid unnecessary complexity.

---

# 2. Specification Driven Development

This project follows Specification Driven Development.

The specifications are the source of truth.

Before implementing any functionality:

1. Read the related specification files.
2. Understand the expected behavior.
3. Confirm the implementation matches the specification.
4. Do not invent requirements.

Specifications are located in:

```
.cursor/specs/
```

Important specifications:

```
00-product.md
01-users-and-roles.md
02-data-model.md
04-dinners.md
05-tasks.md
06-activities.md
07-events.md
08-polls.md
09-inventory.md
10-orders.md
11-deliveries.md
12-calendar.md
13-finances.md        (Future / Post-MVP)
14-seasons.md
15-firestore-data-model.md
16-authentication.md
17-security-rules.md
18-application-architecture.md
19-ui-navigation.md
20-development-plan.md
```

Read `00-product.md`, `02-data-model.md`, `15-firestore-data-model.md`, `16-authentication.md` and `17-security-rules.md` first — they are the canonical cross-cutting specs. Then read the specific feature spec(s) relevant to the task before implementing.

---

# 3. Specification Changes

If implementation requires changes to:

- Data model.
- Firestore structure.
- Authentication.
- Authorization.
- User roles.
- Application architecture.
- Main workflows.

Update the corresponding specification before implementing the code.

Never silently modify the domain model through code.

The correct order is:

```
Specification change

        ↓

Implementation

        ↓

Validation
```

---

# 4. Technology Stack

The application must use:

## Frontend

- React.
- TypeScript.
- Vite.

## Backend

Firebase services only.

## Database

Firebase Firestore.

## Authentication

Firebase Authentication.

## Hosting

Firebase Hosting.

Do not introduce:

- Traditional backend servers.
- Express APIs.
- SQL databases.
- External paid services.
- Unnecessary dependencies.

---

# 5. Architecture Rules

The application architecture is defined in:

```
.cursor/specs/18-application-architecture.md
```

Follow the separation:

```
UI Components

        ↓

Services

        ↓

Firebase
```

UI components must not directly access Firebase.

Incorrect:

```
Component
    |
    ↓
Firestore query
```

Correct:

```
Component
    |
    ↓
Service
    |
    ↓
Firebase
```

---

# 6. Data Model Rules

The business model is defined in:

```
.cursor/specs/02-data-model.md
```

The Firestore implementation is defined in:

```
.cursor/specs/15-firestore-data-model.md
```

Important principles:

- User and Member are different concepts.
- User represents authentication identity.
- Member represents Peña Zos business entity.
- Seasonal information belongs under Season.
- Historical information must be preserved.

Do not create new entities without updating specifications.

---

# 7. Firebase Rules

Firebase is the only backend.

Use:

- Firebase Authentication.
- Firestore.
- Firebase Hosting.

Do not create:

- Custom authentication.
- Backend APIs.
- Server-side authorization bypasses.

---

# 8. Authentication Rules

Authentication is defined in:

```
.cursor/specs/16-authentication.md
```

Rules:

- Use Firebase Authentication.
- Never store passwords in Firestore.
- User identity comes from Firebase UID.
- Business permissions come from Member roles.

Relationship:

```
Firebase Auth User

        ↓

users/{userId}

        ↓

members/{memberId}
```

---

# 9. Authorization Rules

Security is defined in:

```
.cursor/specs/17-security-rules.md
```

Never rely only on frontend restrictions.

Frontend permissions are only for user experience.

Firestore Security Rules are the final protection layer.

Available roles:

```
MEMBER
BOARD
TREASURER
ADMIN
```

Do not create new roles without updating specifications.

---

# 10. Firestore Rules

Firestore design follows:

```
.cursor/specs/15-firestore-data-model.md
```

Main collections:

```
users

members

seasons
    |
    +-- dinners
    +-- tasks
    +-- activities
    +-- events
    +-- polls
    +-- products
    +-- orders
    +-- deliveries
    +-- inventory
    +-- finances  (Future / Post-MVP, see 13-finances.md)
```

Avoid:

- unnecessary duplication.
- unnecessary collections.
- complex queries without justification.

---

# 11. Coding Guidelines

Follow:

```
.cursor/rules/coding-guidelines.md
```

General principles:

- Write clear TypeScript.
- Prefer simple solutions.
- Avoid duplicated logic.
- Avoid premature optimization.
- Avoid unnecessary abstractions.
- Keep code understandable for future Peña Zos administrators.

---

# 12. Dependency Rules

Before adding a dependency ask:

- Is it necessary?
- Does it simplify the project?
- Can the functionality be implemented simply?

Avoid adding libraries for small problems.

---

# 13. Error Handling

User-facing errors must be understandable.

Avoid technical messages.

Bad:

```
Firebase permission-denied exception
```

Good:

```
You do not have permission to access this section.
```

---

# 14. Implementation Workflow

When implementing a feature:

1. Read the related specifications.
2. Understand the data model.
3. Check existing architecture.
4. Implement the smallest solution.
5. Validate behavior.
6. Continue incrementally.

Avoid generating large amounts of code without validation.

---

# 15. When Requirements Are Unclear

If something is ambiguous:

Do not guess.

Instead:

- Ask for clarification.
- Present possible approaches.
- Recommend the simplest solution.

Do not introduce architectural decisions without confirmation.

---

# 16. Git Workflow

Before important changes:

Check current state:

```
git status
```

Keep commits focused.

Prefer messages like:

```
feat: add dinner attendance management

fix: correct firestore query

docs: update data model
```

---

# 17. Final Principle

The objective is not to create the most complex application.

The objective is to create a reliable, maintainable and easy-to-use application for Peña Zos.

Always prioritize:

1. Correct requirements.
2. Simple architecture.
3. Security.
4. Maintainability.
5. User experience.