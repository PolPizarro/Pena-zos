# Peña Zos — Cursor Project Rules

**Version:** 0.1  
**Status:** Draft

---

# 1. Project Purpose

This project is the Peña Zos web application.

The application is used to manage San Mateo festivities and Peña Zos internal organization.

The main objectives are:

- Keep the application simple.
- Avoid unnecessary complexity.
- Prioritize maintainability.
- Use free infrastructure.
- Build a responsive web application.

---

# 2. Specification First Development

Always follow Spec Driven Development.

Before implementing any functionality:

1. Check the related specification files.
2. Understand the expected behavior.
3. Implement only what is defined.
4. Update specifications before introducing major changes.

The specs folder is the source of truth.

Do not create functionality that is not defined in specifications unless explicitly requested.

---

# 3. Technology Constraints

The project must use:

Frontend:

- React.
- TypeScript.
- Vite.

Backend:

- Firebase services only.

Database:

- Firebase Firestore.

Authentication:

- Firebase Authentication.

Hosting:

- Firebase Hosting.

Do not introduce:

- Traditional backend servers.
- SQL databases.
- External paid services.
- Unnecessary dependencies.

---

# 4. Architecture Rules

Follow the architecture defined in:

- architecture.md

The application must keep a clear separation between:

- UI components.
- Business logic.
- Firebase access.
- Shared utilities.

Firestore access must not be directly implemented inside UI components.

Use service classes or service functions.

Example:

Correct:

Component

↓

Service

↓

Firebase

Incorrect:

Component

↓

Firebase query

---

# 5. Code Quality Rules

All code must:

- Be written in TypeScript.
- Use clear naming.
- Avoid duplicated logic.
- Prefer simple solutions.
- Be easy for future Peña Zos administrators to understand.

Avoid:

- Premature optimization.
- Complex patterns without need.
- Over-engineering.

---

# 6. Firebase Rules

Firebase is the only backend.

Use:

- Firebase Authentication.
- Firestore.
- Firebase Hosting.

Do not create:

- Express servers.
- REST APIs.
- Custom authentication systems.

---

# 7. Firestore Rules

The Firestore model must follow:

- 15-firestore-data-model.md

Do not create new collections without updating the specification first.

Avoid unnecessary duplication.

Prefer:

- Simple documents.
- Simple queries.
- Clear relationships.

---

# 8. Authentication Rules

Authentication must follow:

- 16-authentication.md

Requirements:

- Use Firebase Authentication.
- Use email and password login.
- Support mandatory password change after first login.
- Store user roles in Firestore.

Never store passwords in Firestore.

---

# 9. Authorization Rules

Permissions must follow:

- 01-users-and-roles.md
- 17-security-rules.md

Never rely only on frontend restrictions.

The application must always respect Firebase Security Rules.

Frontend permissions are only for user experience.

---

# 10. User Roles

Available roles:

- MEMBER.
- BOARD.
- TREASURER.
- ADMIN.

Users can have multiple roles.

Do not create new roles without updating specifications.

---

# 11. UI Rules

The application must follow:

- 19-ui-navigation.md

Requirements:

- Mobile first.
- Responsive design.
- Simple navigation.
- Clear interfaces.

The main usage scenario is mobile phones during festivities.

---

# 12. Dependency Rules

Before adding a new dependency:

Evaluate:

- Is it necessary?
- Can it be implemented simply?
- Does it increase maintenance?

Avoid adding libraries for small problems.

---

# 13. Error Handling Rules

All user-facing errors must be understandable.

Avoid technical messages.

Bad:

"Firebase permission-denied exception."

Good:

"You do not have permission to access this section."

---

# 14. Security Rules

Never bypass security restrictions.

Never:

- Disable Firestore rules for convenience.
- Store sensitive information in public documents.
- Trust frontend validation.

---

# 15. Testing Rules

When implementing a feature:

Consider:

- Authentication scenarios.
- Permission scenarios.
- Empty states.
- Error cases.

Important user scenarios:

MEMBER:

- Login.
- View own information.
- Complete allowed actions.

BOARD:

- Manage festivities.

TREASURER:

- Manage finances.

ADMIN:

- Manage application configuration.

---

# 16. Change Management

When a requested change affects:

- Data model.
- Roles.
- Permissions.
- Architecture.

Update the corresponding specification before implementing the change.

---

# 17. Development Style

Prefer incremental development.

Implement:

1. Small feature.
2. Test.
3. Validate.
4. Continue.

Avoid generating large amounts of code without validation.

---

# 18. AI Assistant Behavior

When unsure:

- Ask before making architectural decisions.
- Prefer the simplest solution.
- Follow existing specifications.
- Do not invent requirements.

The objective is not to create the most complex application.

The objective is to create a reliable and maintainable application for Peña Zos.