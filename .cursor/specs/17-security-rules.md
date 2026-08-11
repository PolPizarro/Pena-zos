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

This collection stores the technical account only (`firebaseUid`, `memberId`, `email`, `mustChangePassword`). It never stores roles, name, phone, or status — see 02-data-model.md and 16-authentication.md.

Path:

users/{userId}

---

## MEMBER

Allowed:

- Read own user document (`userId == request.auth.uid`).
- Set own `mustChangePassword` from `true` to `false` (and only that field), as part of the first-login password change flow (16-authentication.md §9).

Not allowed:

- Read other users' documents.
- Modify any other field of own document.
- Modify other users' documents.

---

## BOARD

No access beyond the MEMBER rule above. Board members do not need to read other users' technical account documents; operational information about people comes from the `members` collection (§6a).

---

## TREASURER

No access beyond the MEMBER rule above.

---

## ADMIN

Allowed:

- Create users.
- Update users (including `mustChangePassword`).
- Import users.

---

# 6a. Members Collection Rules

This collection stores the business identity: `fullName`, `email`, `phone`, `dni`, `roles[]`, `status`. See 02-data-model.md and 15-firestore-data-model.md.

Path:

members/{memberId}

Role assignment follows 01-users-and-roles.md §7.1: a member holding role X may grant or revoke role X for other members, by writing only the `roles` field (`updatedAt` may also be written alongside it — it carries no access implications). `ADMIN` may write `roles` for any role. No role holder other than `ADMIN` may change any other field (`fullName`, `email`, `dni`, `status`).

---

## MEMBER

Allowed:

- Read own member document (resolved via `users/{request.auth.uid}.memberId == memberId`).

Not allowed:

- Read other members' documents.
- Modify own or other members' documents.

---

## BOARD

Allowed:

- Read all member documents (needed for operations: task assignment, dinner rosters, order management).
- Grant or revoke the `BOARD` role on another member's document (`roles` field only).

Not allowed:

- Grant or revoke `TREASURER` or `ADMIN`.
- Modify `status` or any field other than `roles`.
- Create or delete members.

---

## TREASURER

Allowed:

- Read all member documents (needed for payment-related work).
- Grant or revoke the `TREASURER` role on another member's document (`roles` field only).

Not allowed:

- Grant or revoke `BOARD` or `ADMIN`.
- Modify `status` or any field other than `roles`.

---

## ADMIN

Allowed:

- Full access, including creating members, importing members, and granting/revoking any role regardless of which roles the ADMIN holds.

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

- Read dinners, except those with `status == 'DRAFT'` (04-dinners.md §5 — only the board can see drafts; historical/closed dinners stay visible per 04-dinners.md §5 COMPLETED and the general historical-preservation principle).
- Create/update their own `DinnerAttendee` (`attendees/{memberId}`), only while the dinner's `status == 'OPEN'`, and only the `attending` and `guestCount` fields (not `guestCost` or `guestPaymentStatus` — payment is board-managed, 04-dinners.md §10).

Not allowed:

- Read draft dinners.
- Modify another member's attendance.
- Modify `guestCost` or `guestPaymentStatus`, even on their own record.
- Create, modify, or delete dinners.

---

## BOARD

Allowed:

- Create dinners.
- Modify dinners.
- Manage attendance information, including `guestCost` and `guestPaymentStatus`.

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

- Read a task only if their memberId is in that task's `assignedMemberIds` (12-calendar.md §12 — members must not see tasks they are not assigned to).
- Read their own `TaskAssignment` (`assignments/{memberId}`).

Not allowed:

- Read tasks they are not assigned to.
- Create tasks.
- Assign tasks.
- Modify tasks or their own assignment (task completion is board-managed, 05-tasks.md §14).

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

- Read activities and events, except those with `status == 'DRAFT'` (06-activities.md §13, 07-events.md §10 — members cannot view drafts).
- Create/update own `ActivityRegistration` (`registrations/{memberId}`), only while the activity's `status == 'REGISTRATION_OPEN'`.

Not allowed:

- Read draft activities or events.
- Modify another member's registration.

---

## BOARD

Allowed:

- Create activities.
- Modify activities (including all registrations).
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

- Read polls, except those with `status == 'DRAFT'` (08-polls.md §9).
- Create/update their own vote (`votes/{memberId}`), only while `status == 'PUBLISHED'`.

Not allowed:

- Read draft polls.
- Read other members' votes.
- Modify other members' votes.
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