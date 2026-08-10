# Peña Zos — Application Architecture Specification

**Version:** 0.1  
**Status:** Draft

**Related Documents:**
- 00-product.md
- 15-firestore-data-model.md
- 16-authentication.md
- 17-security-rules.md

---

# 1. Overview

The application is a web application built for Peña Zos to manage San Mateo festivities.

The architecture must prioritize:

- Free hosting.
- Low maintenance.
- Simple development.
- Responsive design.
- Easy future evolution.

The application will be deployed using Firebase services.

---

# 2. Technology Stack

The MVP uses the following technologies:

## Frontend

Technology:

- React.
- TypeScript.
- Vite.
- Responsive UI framework.

Purpose:

- Build the web application.
- Provide mobile-friendly access.
- Avoid app store distribution.

---

## Backend

The MVP does not require a traditional backend.

Business logic is handled through:

- Firebase Authentication.
- Firebase Firestore.
- Firebase Security Rules.

Future backend logic can be implemented using Firebase Cloud Functions if required.

---

## Database

Technology:

- Firebase Firestore.

Responsibilities:

- Store application data.
- Store season information.
- Store users.
- Store operational information.

---

## Authentication

Technology:

- Firebase Authentication.

Responsibilities:

- Login.
- Password management.
- Session management.

---

## Hosting

Technology:

- Firebase Hosting.

Responsibilities:

- Host the web application.
- Provide HTTPS.
- Serve the responsive application.

---

# 3. High Level Architecture

The application follows this architecture:

User Browser

↓

React Web Application

↓

Firebase SDK

↓

Firebase Services

- Authentication.
- Firestore.
- Hosting.

---

# 4. Application Structure

The frontend should be organized by functionality.

Suggested structure:

src/

    auth/

    users/

    seasons/

    dinners/

    tasks/

    activities/

    events/

    polls/

    orders/

    deliveries/

    inventory/

    finances/

    shared/

    components/

    services/

    utils/

---

# 5. Authentication Flow

Application startup:

1. User opens the web application.
2. Firebase checks authentication session.
3. If user is not authenticated:
   - Show login page.
4. If user is authenticated:
   - Load user profile.
   - Load roles.
   - Redirect to application.

## 5.1 Admin-Driven Account Creation

When an administrator imports members and Firebase Authentication accounts must be created for them (16-authentication.md §3.1), the app uses a second, temporary Firebase App instance (`firebase/secondaryAuth.ts`) solely to call the account-creation SDK method and sign out of it immediately. This avoids replacing the administrator's own session and avoids introducing a Cloud Functions backend for the MVP.

---

# 6. Authorization Flow

Authorization is based on Firestore user roles.

Flow:

Authenticated user

↓

Load user document

↓

Read roles

↓

Enable available features

↓

Apply Firestore security rules

---

# 7. Data Access Layer

The application should not access Firestore directly from every component.

A service layer should be used.

Example:

services/

    userService

    seasonService

    dinnerService

    taskService

    orderService

    deliveryService

    financeService

Responsibilities:

- Encapsulate Firestore queries.
- Avoid duplicated logic.
- Simplify future changes.

---

# 8. State Management

The MVP should avoid complex state management.

Recommended approach:

Use:

- React hooks.
- Context where required.

Global state examples:

- Logged user.
- Current season.
- User permissions.

---

# 9. Responsive Design

The application must work on:

- Mobile phones.
- Tablets.
- Desktop browsers.

Primary usage scenario:

Mobile phone during preparation and festivities.

---

# 10. Navigation Structure

The application navigation depends on roles.

Common sections:

- Home.
- Calendar.
- Tasks.
- Dinners.
- Activities.
- Events.
- Polls.
- Orders.
- Deliveries.

Restricted sections:

- Inventory.
- Finances.
- User management.

---

# 11. Environment Configuration

The application must support environment variables.

Required configuration:

Firebase:

- API key.
- Auth domain.
- Project ID.
- Storage bucket.
- Messaging sender ID.
- App ID.

Different environments should be supported:

- Development.
- Production.

---

# 12. Deployment Process

Deployment target:

Firebase Hosting.

Process:

Development

↓

Build React application

↓

Generate production files

↓

Deploy to Firebase Hosting

---

# 13. Development Requirements

Developers need:

- Node.js.
- npm.
- Firebase CLI.
- Firebase project access.

---

# 14. Security Considerations

Security must not rely only on frontend restrictions.

The application must always enforce permissions through:

- Firebase Authentication.
- Firestore Security Rules.

Frontend permissions are only for user experience.

---

# 15. Logging and Error Handling

The application should handle:

- Authentication errors.
- Firestore errors.
- Network errors.
- Permission errors.

User-facing errors must be understandable.

Example:

"Your session has expired. Please login again."

---

# 16. Performance Considerations

The application should minimize:

- Unnecessary Firestore reads.
- Large collections loaded at once.
- Continuous listeners.

Preferred approach:

- Load only required information.
- Use pagination if collections grow.
- Use real-time updates only when necessary.

---

# 17. Offline Support

The MVP does not require advanced offline functionality.

Possible future improvement:

- Firestore offline persistence.

---

# 18. Future Improvements

Possible future improvements:

- Firebase Cloud Functions.
- Push notifications.
- Email automation.
- Statistics dashboard.
- Native mobile application.

These are out of scope for the MVP.