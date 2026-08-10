# Peña Zos — Development Plan Specification

**Version:** 0.1  
**Status:** Draft

**Related Documents:**
- 00-product.md
- 01-users-and-roles.md
- 15-firestore-data-model.md
- 16-authentication.md
- 17-security-rules.md
- 18-application-architecture.md
- 19-ui-navigation.md

---

# 1. Overview

This document defines the recommended implementation order for the Peña Zos application.

The objective is to build the MVP incrementally, validating the most important functionality first.

The development approach follows Spec Driven Development:

- Specifications are created before implementation.
- Each feature is developed based on the corresponding specification.
- Changes must update specifications before code changes.

---

# 2. MVP Development Principles

The MVP should prioritize:

- Working application over visual perfection.
- Simple solutions over complex architecture.
- Core Peña Zos processes over secondary features.
- Free Firebase infrastructure.
- Easy maintenance by future Peña Zos administrators.

---

# 3. Development Phases

The MVP implementation is divided into the following phases:

1. Project setup.
2. Authentication.
3. User management.
4. Season management.
5. Core member functionality.
6. Festivity management.
7. Orders and deliveries.
8. Inventory.
9. Final testing and deployment.

Finances (see Phase 12 below) is Future / Post-MVP and is not part of this phase list.

---

# 4. Phase 1 — Project Setup

Objective:

Create the base application structure.

Tasks:

- Create Firebase project.
- Configure Firebase Authentication.
- Configure Firestore.
- Configure Firebase Hosting.
- Create React + TypeScript project.
- Configure environment variables.
- Configure development environment.

Expected result:

A basic application that can connect to Firebase.

---

# 5. Phase 2 — Authentication

Objective:

Allow users to access the application securely.

Tasks:

- Implement login.
- Implement logout.
- Implement password recovery.
- Implement first login password change.
- Connect Firebase Authentication with Firestore users.
- Implement authentication state management.

Expected result:

Users can login and access the application.

---

# 6. Phase 3 — User Management

Objective:

Manage Peña Zos members.

Tasks:

- Create user model.
- Create user import process.
- Import users from Excel.
- Assign roles.
- Enable and disable users.
- Create administrator user.

Expected result:

Administrators can manage application users.

---

# 7. Phase 4 — Season Management

Objective:

Manage San Mateo editions.

Tasks:

- Create seasons.
- View current season.
- Activate season.
- Close season.
- Restrict closed seasons.

Expected result:

The application can separate different San Mateo editions.

---

# 8. Phase 5 — Core Member Functionality

Objective:

Provide useful functionality to Peña Zos members.

Tasks:

- Create home screen.
- Create navigation.
- Create calendar.
- Show events.
- Show activities.
- Show user profile.

Expected result:

Members can use the application for daily information.

---

# 9. Phase 6 — Tasks Management

Objective:

Manage Peña Zos responsibilities.

Tasks:

- Create tasks.
- Assign tasks to members.
- View assigned tasks.
- Track completion.

Expected result:

Board members can organize work and members can see their responsibilities.

---

# 10. Phase 7 — Dinners Management

Objective:

Manage Peña Zos dinners.

Tasks:

- Create dinners.
- Publish dinners.
- Allow members to confirm attendance.
- Register guest count.
- Register payments.

Expected result:

The board can manage dinner attendance.

---

# 11. Phase 8 — Polls Management

Objective:

Allow decision making through the application.

Tasks:

- Create polls.
- Add options.
- Allow members to vote.
- Show results.

Expected result:

The board can collect member opinions.

---

# 12. Phase 9 — Products and Orders

Objective:

Manage Peña Zos products.

Tasks:

- Create products.
- Configure sizes.
- Publish available products.
- Allow members to place orders.
- Review orders.

Examples:

- T-shirts.
- Sweatshirts.
- Fans.
- Other future products.

Expected result:

The board can collect product requests.

---

# 13. Phase 10 — Deliveries

Objective:

Manage the delivery weekend before San Mateo.

Tasks:

- Generate delivery information.
- Associate products and vouchers.
- Mark deliveries completed.
- Track pending deliveries.

Expected result:

The board can organize member deliveries.

---

# 14. Phase 11 — Inventory

Objective:

Track reusable materials.

Tasks:

- Create inventory items.
- Add quantities.
- Update remaining stock.
- Review previous season leftovers.

Expected result:

The board can manage available resources.

---

# 15. Phase 12 — Finances (Future / Post-MVP)

This phase is not part of the MVP, per 00-product.md (Non-Goals) and 13-finances.md. It is kept here as the intended next phase after the MVP ships.

Objective:

Provide financial management.

Tasks:

- Create income movements.
- Create expense movements.
- View balance.
- Restrict access to Treasurer and Admin.

Expected result:

Treasurer can optionally manage finances.

---

# 16. Testing Phase

Before production release:

Tests:

- Authentication tests.
- Role permission tests.
- Mobile usability tests.
- Firestore security rule tests.
- Data validation tests.

Required scenarios:

Member:

- Login.
- View information.
- Vote.
- Confirm dinner attendance.
- View tasks.

Board:

- Create tasks.
- Manage dinners.
- Manage orders.
- Manage deliveries.

Treasurer:

- Access finances.

Admin:

- Import users.
- Manage roles.

---

# 17. Deployment Phase

Production deployment:

Tasks:

- Configure production Firebase project.
- Deploy frontend.
- Configure security rules.
- Import users.
- Verify authentication.
- Perform final tests.

---

# 18. Recommended Development Order

The recommended implementation order is:

1. Firebase setup.
2. Authentication.
3. User import.
4. Roles and permissions.
5. Seasons.
6. Navigation.
7. Calendar.
8. Tasks.
9. Dinners.
10. Polls.
11. Products and orders.
12. Deliveries.
13. Inventory.
14. Final improvements.

Finances is Future / Post-MVP and follows after item 14, once formally brought into scope.

---

# 19. Out of Scope for MVP

The following features are intentionally excluded:

- Mobile native applications.
- Push notifications.
- Chat.
- Photo galleries.
- Automatic reminders.
- Advanced statistics.
- Complex accounting.
- External integrations.

---

# 20. Future Evolution

Possible future versions:

Version 2:

- Notifications.
- Improved dashboards.
- More automation.

Version 3:

- Native mobile application.
- Advanced analytics.
- External integrations.

The MVP should remain simple and easy to maintain.