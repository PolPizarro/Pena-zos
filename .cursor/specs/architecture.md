# Peña Zos — Application Architecture

**Version:** 0.1  
**Status:** Draft

---

# 1. Overview

This document defines the technical architecture of the Peña Zos application.

The objective is to create a simple, maintainable and scalable web application to manage Peña Zos internal organization and San Mateo festivities.

The architecture prioritizes:

- Simplicity.
- Low maintenance.
- Free infrastructure.
- Clear separation of responsibilities.
- Easy future modifications.

---

# 2. Architecture Approach

The application follows a serverless frontend architecture.

The application consists of:

- Frontend web application.
- Firebase Authentication.
- Cloud Firestore database.
- Firebase Hosting.

There is no custom backend server.

Architecture:

Frontend Application

↓

Firebase SDK

↓

Firebase Services

- Authentication.
- Firestore.
- Hosting.

---

# 3. Technology Stack

## Frontend

The frontend uses:

- React.
- TypeScript.
- Vite.

Responsibilities:

- User interface.
- User interaction.
- Client-side navigation.
- Form validation.
- Calling application services.

---

## Backend Services

Firebase provides all backend capabilities.

Services used:

### Firebase Authentication

Responsible for:

- User login.
- Password management.
- Session management.
- Authentication state.

---

### Cloud Firestore

Responsible for:

- Application data.
- User profiles.
- Seasons.
- Tasks.
- Dinners.
- Orders.
- Products.
- Finances.

The data model is defined in:

01-specs/15-firestore-data-model.md

---

### Firebase Hosting

Responsible for:

- Hosting the web application.
- Serving production builds.

---

# 4. High Level Architecture

The application follows this flow:

User

↓

React Components

↓

Feature Services

↓

Firebase SDK

↓

Firebase Services

---

Responsibilities:

## Components

Responsible for:

- Rendering information.
- Receiving user actions.
- Displaying loading states.
- Displaying errors.

Components must not contain:

- Firestore queries.
- Complex business rules.
- Permission logic.

---

## Services

Responsible for:

- Communicating with Firebase.
- Implementing feature operations.
- Transforming data when required.

Examples:

- taskService.
- orderService.
- userService.

---

## Firebase Layer

Responsible for:

- Firebase initialization.
- Authentication connection.
- Firestore connection.

---

# 5. Frontend Structure

The frontend should follow feature-based organization.

Recommended structure:

frontend/

src/

app/

- Application initialization.
- Routing.
- Global providers.

components/

- Shared UI components.

features/

- auth/
- users/
- seasons/
- calendar/
- tasks/
- dinners/
- polls/
- products/
- orders/
- deliveries/
- inventory/
- finances/
- administration/

firebase/

- Firebase configuration.
- Authentication setup.
- Firestore setup.

hooks/

- Shared React hooks.

services/

- Shared services.

types/

- Shared TypeScript models.

utils/

- Common utilities.

---

# 6. Feature Architecture

Each business feature should be isolated.

Example:

tasks/

Contains:

- Task components.
- Task hooks.
- Task services.
- Task types.

A feature should not directly depend on another feature unless clearly required.

---

# 7. Authentication Architecture

Authentication flow:

User enters credentials.

↓

Firebase Authentication validates credentials.

↓

Application receives authenticated user.

↓

Application loads user profile from Firestore.

↓

Application determines roles.

↓

Application grants access according to permissions.

---

# 8. First Login Flow

Imported users have:

mustChangePassword = true

After successful authentication:

The application checks this value.

If true:

- User is redirected to password change screen.
- User cannot access the application until password is updated.

After successful password change:

mustChangePassword becomes false.

---

# 9. Authorization Architecture

The application uses role-based access control.

Available roles:

- MEMBER.
- BOARD.
- TREASURER.
- ADMIN.

Users can have multiple roles.

Example:

A user may have:

MEMBER + BOARD

or:

MEMBER + TREASURER + ADMIN

---

Authorization is implemented in two layers:

## Frontend Layer

Purpose:

- Hide unavailable options.
- Improve user experience.

---

## Firebase Security Rules

Purpose:

- Real security enforcement.
- Prevent unauthorized database access.

Frontend restrictions alone are not considered security.

---

# 10. Firestore Architecture

Firestore is the main application database.

The structure must follow:

01-specs/15-firestore-data-model.md

General principles:

- Simple documents.
- Clear relationships.
- Avoid unnecessary duplication.
- Avoid complex queries.

---

# 11. Data Access Rules

Firestore access must not happen directly from UI components.

Incorrect:

Component

↓

Firestore query

---

Correct:

Component

↓

Service

↓

Firebase SDK

↓

Firestore

---

# 12. Routing Architecture

The application uses client-side routing.

Main routes:

- /login
- /change-password
- /dashboard
- /calendar
- /tasks
- /dinners
- /polls
- /products
- /orders
- /deliveries
- /inventory
- /finances
- /administration

Protected routes require authentication.

---

# 13. UI Architecture

The application must be mobile-first.

Main usage scenario:

Members using mobile phones during festivities.

Requirements:

- Responsive design.
- Simple navigation.
- Large touch targets.
- Clear information.

The UI navigation rules are defined in:

01-specs/18-ui-navigation.md

---

# 14. Security Architecture

Security is based on:

- Firebase Authentication.
- Firestore Security Rules.
- Role validation.

Never:

- Store passwords.
- Trust client permissions.
- Expose sensitive information.

---

# 15. Environment Architecture

The project should support:

Development:

- Local development.
- Firebase emulator usage.
- Test data.

Production:

- Real Peña Zos data.
- Real users.

Environment variables must be used for Firebase configuration.

---

# 16. Deployment Architecture

Deployment uses:

Firebase Hosting

Deployment flow:

Developer

↓

Frontend build

↓

Firebase Hosting

↓

Users access application

---

# 17. External Services

The initial version should avoid external services.

Allowed:

- Firebase services.

Not required:

- Custom APIs.
- Payment platforms.
- External databases.
- Third-party authentication.

---

# 18. Future Evolution

The architecture should allow future additions:

Possible future features:

- Notifications.
- More advanced reporting.
- Additional Peña management features.
- Mobile application.

These should only be added when required.

---

# 19. Architectural Principles

All development decisions should follow:

1. Keep it simple.
2. Prefer maintainability over complexity.
3. Follow specifications.
4. Avoid unnecessary technology.
5. Protect user data.
6. Make future changes easy.

---

# 20. Final Objective

The goal is not to build an enterprise platform.

The goal is to build a reliable and easy-to-use application that helps Peña Zos organize its activities with minimal maintenance.