# Peña Zos — Security Rules Specification

**Version:** 0.1  
**Status:** Draft

**Related Documents:**
- 01-users-and-roles.md
- 15-firestore-data-model.md
- 16-authentication.md

---

# 1. Overview

The application uses Firebase Security Rules to control access to Firestore data.

Security is based on:

- Authentication status.
- User roles.
- Resource ownership.
- Season permissions.

The objective is to ensure that each user can only access and modify the information allowed by their role.

---

# 2. Security Principles

The application follows these principles:

- All protected data requires authentication.
- Every authenticated user must have a Firestore user profile.
- Permissions are managed through roles.
- Users can have multiple roles.
- Roles are additive: access is the union of the permissions granted by every role assigned to the user, not just the single most permissive one.
- Sensitive information must have restricted access.

---

# 3. Authentication Requirement

Unauthenticated users cannot access application data.

Required:

- Valid Firebase Authentication session.
- Existing user document in Firestore.

Users without a valid profile cannot access protected resources.

---

# 4. User Roles

Available roles:

- MEMBER.
- BOARD.
- TREASURER.
- ADMIN.

A user can have multiple roles.

Example:

User:

Juan Pérez

Roles:

- MEMBER.
- BOARD.
- ADMIN.

---

# 5. Role Hierarchy

The application does not replace roles.

A user can combine roles.

Examples:

BOARD + TREASURER:

- Can manage operational information.
- Can access finances.

BOARD + ADMIN:

- Can manage operational information.
- Can manage technical configuration.

---

# 6. Users Collection Rules

Path:

users/{userId}

---

## MEMBER

Allowed:

- Read own user profile.

Not allowed:

- Modify own roles.
- Modify own permissions.
- Modify other users.

---

## BOARD

Allowed:

- Read member information required for operations.

Not allowed:

- Modify user roles.

---

## TREASURER

Allowed:

- Read member information required for payments.

---

## ADMIN

Allowed:

- Create users.
- Update users.
- Import users.
- Manage roles.

---

# 7. Seasons Rules

Path:

seasons/{seasonId}

---

## MEMBER

Allowed:

- Read active season information.
- Read public season information.

Not allowed:

- Create seasons.
- Modify seasons.
- Finish and archive seasons.

---

## BOARD

Allowed:

- Create seasons.
- Modify seasons.
- Activate seasons.
- Finish and archive seasons.

---

## TREASURER

Allowed:

- Read seasons.

---

## ADMIN

Allowed:

- Full access.

---

# 8. Dinners Rules

Path:

seasons/{seasonId}/dinners

---

## MEMBER

Allowed:

- Read dinners.
- Register attendance.
- Update own attendance information.

Not allowed:

- Create dinners.
- Modify dinner information.
- Delete dinners.

---

## BOARD

Allowed:

- Create dinners.
- Modify dinners.
- Manage attendance information.

---

## ADMIN

Allowed:

- Full access.

---

# 9. Tasks Rules

Path:

seasons/{seasonId}/tasks

---

## MEMBER

Allowed:

- Read assigned tasks.

Not allowed:

- Create tasks.
- Assign tasks.
- Modify tasks.

---

## BOARD

Allowed:

- Create tasks.
- Assign tasks.
- Modify tasks.
- Mark tasks as completed if required.

---

## ADMIN

Allowed:

- Full access.

---

# 10. Activities and Events Rules

Path:

seasons/{seasonId}/activities

seasons/{seasonId}/events

---

## MEMBER

Allowed:

- Read activities.
- Read events.

---

## BOARD

Allowed:

- Create activities.
- Modify activities.
- Create events.
- Modify events.

---

## ADMIN

Allowed:

- Full access.

---

# 11. Polls Rules

Path:

seasons/{seasonId}/polls

---

## MEMBER

Allowed:

- Read active polls.
- Submit own responses.

Not allowed:

- Modify other responses.
- Create polls.

---

## BOARD

Allowed:

- Create polls.
- Modify polls.
- Close polls.
- Read responses.

---

## ADMIN

Allowed:

- Full access.

---

# 12. Products Rules

Path:

seasons/{seasonId}/products

---

## MEMBER

Allowed:

- Read available products.

---

## BOARD

Allowed:

- Create products.
- Modify products.
- Enable or disable products.

---

## ADMIN

Allowed:

- Full access.

---

# 13. Orders Rules

Path:

seasons/{seasonId}/orders

---

## MEMBER

Allowed:

- Create own orders.
- Read own orders.
- Modify own orders while `paymentStatus` is `PENDING`.

Not allowed:

- Read other members orders.
- Modify own orders once `paymentStatus` is `PAID` or `NOT_REQUIRED`.

---

## BOARD

Allowed:

- Read all orders.
- Manage order status.

---

## TREASURER

Allowed:

- Read payment information.

---

## ADMIN

Allowed:

- Full access.

---

# 14. Deliveries Rules

Path:

seasons/{seasonId}/deliveries

---

## MEMBER

Allowed:

- Read own delivery information.

---

## BOARD

Allowed:

- Create deliveries.
- Manage delivery status.
- Confirm deliveries.

---

## ADMIN

Allowed:

- Full access.

---

# 15. Inventory Rules

Path:

seasons/{seasonId}/inventory

---

## MEMBER

Not allowed. Members have no access to inventory, per 09-inventory.md.

---

## BOARD

Allowed:

- Create inventory items.
- Modify inventory.
- Update quantities.

---

## ADMIN

Allowed:

- Full access.

---

# 16. Finances Rules (Future / Post-MVP)

The `finances` subcollection does not exist in the MVP. No rules should be deployed for it until 13-finances.md is formally brought into scope.

The rules below are the intended future design, kept here for reference:

Path:

seasons/{seasonId}/finances

---

## MEMBER

Not allowed.

---

## BOARD

Not allowed by default.

---

## TREASURER

Allowed:

- Read financial information.
- Create financial movements.
- Modify financial movements.

---

## ADMIN

Allowed:

- Full access.

---

# 17. Import Rules

User import is restricted.

Only ADMIN users can:

- Upload member information.
- Create authentication users.
- Update roles.

---

# 18. Data Validation Rules

Security rules must validate:

- Required fields exist.
- Users cannot impersonate other users.
- Ownership fields match authenticated user.
- Roles cannot be modified by unauthorized users.
- Financial data cannot be modified by regular users.

---

# 19. Future Improvements

Possible future improvements:

- Cloud Functions for privileged operations.
- Audit logs.
- Advanced permission system.
- Automatic security rule generation.

These are out of scope for the MVP.