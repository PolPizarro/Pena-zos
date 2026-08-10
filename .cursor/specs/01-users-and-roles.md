# Peña Zos — Users and Roles Specification

**Version:** 0.1
**Status:** Draft
**Related Product Spec:** 00-product.md

---

# 1. Overview

This document defines how users, members, authentication, and permissions work in the Peña Zos application.

The system must distinguish between:

* The real person belonging to Peña Zos.
* The account used to access the application.
* The permissions assigned to that person.

A person can exist in the system before having access to the application.

Example:

A new member may be imported from Excel but may not have created an account yet.

---

# 2. Domain Concepts

The application has two main entities:

## User

A `User` represents an authenticated account.

A user:

* Can log into the application.
* Is managed by Firebase Authentication.
* Has access credentials.
* Is linked to a member.

A user is a technical concept.

---

## Member

Members are consumers of assigned information.

They cannot modify organizational data created by the board.

Examples:
- Tasks
- Dinners
- Activities
- Events
- Polls

---

# 3. Relationship Between User and Member

The relationship is:

```text
Firebase User
      |
      |
      v
  Member
```

A Firebase user must be linked to exactly one member.

A member may exist without a linked Firebase user.

Example:

```text
Member:
  name: Juan Pérez
  roles:
    - MEMBER
    - BOARD

User:
  email: juan@example.com
  linkedMember: Juan Pérez
```

---

# 4. Authentication

The application requires authentication.

Only registered members should be able to access the application.

The authentication provider is Firebase Authentication.

The initial authentication method should be:

* Email and password.

Future authentication methods may include:

* Google login.
* Other providers.

These are out of scope for the MVP.

---

# 5. Member Import

Administrators can import members from an Excel file.

The import process creates or updates members.

The import file contains, per row:

* Nombre (first name).
* Apellidos (surname).
* Email address.
* DNI (national ID).
* Roles.

`Nombre` and `Apellidos` are combined into the Member's single `fullName` field on import (see 02-data-model.md). The Excel keeps them as two columns only because that is how the source spreadsheet is filled in.

`DNI` is required and unique. It is the key used to match a row to an existing Member on re-import — not the email — since the DNI does not change while the email might.

The import process must:

* Avoid duplicate members (match by DNI).
* Update existing members when possible.
* Preserve historical references.
* Not delete members automatically.

---

# 6. User Account Creation

The MVP does not allow self-registration.

The expected flow:

1. Administrator imports the member.
2. The system creates a Firebase Authentication account with a temporary password and links it to the member.
3. The member receives access instructions and the temporary password.
4. The member logs in and is required to change the password before accessing the application.

This flow is defined in detail in 16-authentication.md.

A person without an imported member record should not automatically become a Peña Zos member.

---

# 7. Roles

A member can have multiple roles.

Available roles:

```text
MEMBER
BOARD
TREASURER
ADMIN
```

Roles are additive.

Example:

```text
Member:
  roles:
    - MEMBER
    - BOARD
    - ADMIN
```

The absence of a role means the user does not have that permission set.

---

## 7.1 Role Assignment

Role assignment is per-role, not centralized:

* A member holding a given role may grant or revoke **that same role** for other members (e.g., a BOARD member can add or remove the BOARD role from someone else, but cannot touch TREASURER or ADMIN unless they also hold those roles).
* `ADMIN` additionally keeps the ability to grant or revoke **any** role, on top of the rule above.
* Granting/revoking a role only changes the `roles` field. It does not grant access to change a member's other information (name, email, DNI, `status`) — that remains ADMIN-only (§11).
* The initial roles for a season come from the Excel import (§5), performed by an ADMIN.

---

# 8. MEMBER Role

The MEMBER role represents a normal Peña Zos member.

Permissions:

## Calendar

Allowed:

* View public calendar information.
* View own assigned tasks.

---

## Dinners

Allowed:

* View available dinners.
* Confirm attendance.
* Specify number of guests.
* View own payment status for guests.

Not allowed:

* Create dinners.
* Modify dinners.
* View global attendance information.

---

## Activities

Allowed:

* View activities.
* Register for activities.

Not allowed:

* Create activities.
* Modify activities.

---

## Events

Allowed:

* View San Mateo events.

---

## Tasks

Allowed:

* View assigned tasks.
* Mark own tasks as completed if enabled.

Not allowed:

* Create tasks.
* Assign tasks.
* Modify other members' tasks.

---

## Orders

Allowed:

* Create own clothing orders.
* View own orders.
* View own delivery status.

Not allowed:

* View global orders.
* Modify other members' orders.

---

## Deliveries

Allowed:

* View own deliveries.

---

## Polls

Allowed:

* View available polls.
* Vote.

---

# 9. BOARD Role

The BOARD role represents members responsible for organizing the festivities.

A BOARD user inherits MEMBER permissions.

Additional permissions:

---

## Members

Allowed:

* View members.
* Search members.
* Grant or revoke the `BOARD` role for other members (§7.1).

Not allowed:

* Grant or revoke `TREASURER` or `ADMIN` (unless also holding that role).
* Modify a member's other information (name, email, DNI, status).
* Create administrators.

---

## Dinners

Allowed:

* Create dinners.
* Modify dinners.
* Delete dinners if allowed.
* View attendance.
* View guest counts.
* Manage dinner information.

---

## Activities

Allowed:

* Create activities.
* Modify activities.
* Manage registrations.

---

## Events

Allowed:

* Create events.
* Modify events.

---

## Tasks

Allowed:

* Create tasks.
* Modify tasks.
* Assign tasks.
* View all tasks.
* Change task status.

---

## Inventory

Allowed:

* Create inventory items.
* Modify inventory.
* Update quantities.

---

## Orders

Allowed:

* View all orders.
* Manage order status.
* Manage payment status.
* Manage delivery status.

---

## Deliveries

Allowed:

* Manage delivery items.
* Mark deliveries as completed.

---

## Polls

Allowed:

* Create polls.
* Modify polls.
* Close polls.
* View results.

---

# 10. TREASURER Role

The TREASURER role is reserved for future financial functionality (Future / Post-MVP, see 13-finances.md).

Initially, the only additional permission is:

* Grant or revoke the `TREASURER` role for other members (§7.1).

Future permissions may include:

* View expenses.
* Create expenses.
* Register payments.
* View financial summaries.
* Manage balances.

Financial functionality must have independent security rules.

---

# 11. ADMIN Role

The ADMIN role manages application-level administration.

An ADMIN user inherits no business permissions automatically.

Recommended usage:

```text
ADMIN + BOARD
```

for technical members of the board.

ADMIN permissions:

---

## User Management

Allowed:

* Create and deactivate access.
* Link users and members.
* Grant or revoke any role for any member (§7.1), independently of which roles the ADMIN holds.
* Modify a member's other information (name, email, DNI, status).
* Import members.

---

## Application Configuration

Allowed:

* Manage application settings.
* Perform maintenance operations.

---

## Security

Allowed:

* Manage administrator access.

Only existing administrators should be able to assign the ADMIN role.

---

# 12. Permission Model

Permissions must be enforced at three levels:

## Frontend

Purpose:

* Improve user experience.
* Hide unavailable actions.

Frontend restrictions are not considered security.

---

## Firestore Security Rules

Purpose:

* Enforce real access control.
* Prevent unauthorized data access.

All protected operations must be validated here.

---

## Business Logic

Purpose:

* Validate complex operations.

Examples:

* A member cannot register twice for the same dinner.
* A user cannot modify another member's order.
* A board member cannot access financial data.

---

# 13. Account States

Members may have different states.

Initial states:

```text
ACTIVE
INACTIVE
PENDING_ACCESS
```

## ACTIVE

The member belongs to Peña Zos and can participate.

---

## INACTIVE

The member no longer participates.

Historical information must remain available.

Inactive members should not appear in active member lists.

---

## PENDING_ACCESS

The member exists but does not have an application account yet.

---

# 14. Member Data

The minimum member information:

```text
Member
{
    id
    fullName
    email
    dni
    roles[]
    status
    createdAt
    updatedAt
}
```

Future fields may include:

* Phone number.
* Address.
* Additional contact information.

These are not required for the MVP.

---

# 15. Security Requirements

The system must guarantee:

* Users can only access information allowed by their roles.
* Members cannot modify other members' private information.
* ADMIN access is restricted.
* Role changes are protected.
* Historical data remains accessible according to permissions.
* Removing access does not delete historical information.

---

# 16. Future Considerations

Possible future improvements:

* Invitation links.
* Google authentication.
* Custom Firebase claims.
* Audit logs.
* Role permission editor.
* Temporary roles.
* Fine-grained permissions.

These are out of scope for the MVP.
