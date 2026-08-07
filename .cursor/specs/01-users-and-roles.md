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

The import file may contain:

* Full name.
* Email address.
* Roles.
* Active status.
* Additional member information.

The import process must:

* Avoid duplicate members.
* Update existing members when possible.
* Preserve historical references.
* Not delete members automatically.

---

# 6. User Account Creation

The MVP should support controlled account creation.

The expected flow:

1. Administrator imports members.
2. Member receives access instructions.
3. Member creates an account.
4. Administrator or the system links the account with the member.
5. The member can access the application.

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

Not allowed:

* Manage roles.
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

The TREASURER role is reserved for future financial functionality.

Initially:

* No additional permissions are required.

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
* Manage roles.
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
