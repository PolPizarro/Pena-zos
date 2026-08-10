# Peña Zos — Firestore Data Model Specification

**Version:** 0.2  
**Status:** Draft

**Related Documents:**

- 00-product.md
- 01-users-and-roles.md
- 02-data-model.md
- 10-orders.md
- 11-deliveries.md
- 12-calendar.md
- 13-finances.md
- 14-seasons.md
- 18-application-architecture.md

---

# 1. Overview

The application uses Firebase Firestore as the main database.

This document defines the technical data model used by Firestore.

The domain model is defined in:

02-data-model.md

The Firestore model adapts the domain model to provide:

- Simple queries.
- Low Firebase cost.
- Easy Firebase Security Rules.
- Maintainable development.
- Historical data preservation.

The Firestore model does not need to exactly match the domain model.

---

# 2. Database Structure

The application uses two types of data:

## Permanent data

Data that exists independently of a San Mateo edition.

Root collections:

- users
- members

---

## Seasonal data

Data related to a specific San Mateo edition.

Root collection:

- seasons

Structure:

seasons/{seasonId}

contains:

- dinners
- tasks
- activities
- events
- polls
- products
- orders
- deliveries
- inventory

`finances` is a future (Post-MVP) subcollection — see §21 and 13-finances.md.

---

# 3. Users Collection

## Purpose

Stores authentication-related information.

A User represents a Firebase Authentication account.

Path:

users/{userId}

Example:

users/abc123

---

## Structure

User:

{
firebaseUid
memberId
email
mustChangePassword
createdAt
updatedAt
}

---

## Rules

- A User represents a technical account.
- A User belongs to one Member.
- A Member can exist without a User account.
- Passwords are never stored in Firestore.

---

# 4. Members Collection

## Purpose

Stores Peña Zos members.

A Member represents the real person.

Path:

members/{memberId}

---

## Structure

Member:

{
fullName
email
phone
dni
roles[]
status
createdAt
updatedAt
}

`dni` is required and unique; it is the import matching key (01-users-and-roles.md §5).

---

## Roles

Available roles:

- MEMBER
- BOARD
- TREASURER
- ADMIN

Example:

roles:

[
MEMBER,
BOARD
]

---

## Status

Possible values:

- ACTIVE
- INACTIVE
- PENDING_ACCESS

---

## Rules

- Members must not be physically deleted.
- Historical information must remain valid.
- Roles belong to Members, not Users.
- A member holding a given role may write `roles` to grant/revoke that same role on another member's document; `ADMIN` may write `roles` for any role. No other field may be changed this way. See 01-users-and-roles.md §7.1 and 17-security-rules.md §6a.

---

# 5. Seasons Collection

## Purpose

Stores each San Mateo edition.

Path:

seasons/{seasonId}

Example:

seasons/san_mateo_2026

---

## Structure

Season:

{
name
year
startDate
endDate
status
createdAt
updatedAt
}

---

## Status

Possible values:

- PLANNING
- ACTIVE
- FINISHED
- ARCHIVED

---

# 6. Seasonal Structure

All seasonal information belongs below a Season.

Structure:

seasons/{seasonId}

- dinners
- tasks
- activities
- events
- polls
- products
- orders
- deliveries
- inventory

(`finances` is Future / Post-MVP — see §21.)

This ensures historical separation between San Mateo editions.

---

# 7. Dinners Collection

Path:

seasons/{seasonId}/dinners/{dinnerId}

---

Dinner:

{
name
date
time
location
description
status
createdAt
updatedAt
}

---

# 8. Dinner Attendance

A dinner attendance is stored separately.

Path:

seasons/{seasonId}/dinners/{dinnerId}/attendees/{attendeeId}

---

DinnerAttendee:

{
memberId
attending
guestCount
guestCost
guestPaymentStatus
createdAt
updatedAt
}

---

Rules:

- A member can only have one attendance record per dinner.
- Guest information is not stored in MVP.
- Guest count is enough.

---

# 9. Tasks Collection

Path:

seasons/{seasonId}/tasks/{taskId}

---

Task:

{
title
description
date
time
requiredPeople
status
type
assignedMemberIds[]
createdBy
createdAt
updatedAt
}

`assignedMemberIds` mirrors the assignments subcollection below so Security Rules can restrict member reads without an extra lookup (02-data-model.md §9).

---

# 10. Task Assignments

Tasks can be assigned to multiple members. The document id is the member id (one assignment per member per task, matching 05-tasks.md §16).

Path:

seasons/{seasonId}/tasks/{taskId}/assignments/{memberId}

---

TaskAssignment:

{
memberId
status
createdAt
updatedAt
}

`status` is `ASSIGNED` or `COMPLETED` (02-data-model.md §10).

---

Rules:

- Board manages assignments.
- Members can view their assigned tasks.
- Assignment history should be preserved.

---

# 11. Activities Collection

Path:

seasons/{seasonId}/activities/{activityId}

---

Activity:

{
name
description
date
time
location
capacity
status
createdAt
updatedAt
}

---

# 12. Activity Registrations

Path:

seasons/{seasonId}/activities/{activityId}/registrations/{registrationId}

---

ActivityRegistration:

{
memberId
status
createdAt
updatedAt
}

---

# 13. Events Collection

Path:

seasons/{seasonId}/events/{eventId}

---

Event:

{
name
description
date
time
location
createdAt
updatedAt
}

---

# 14. Polls Collection

Path:

seasons/{seasonId}/polls/{pollId}

---

Poll:

{
title
description
type
options[]
startDate
endDate
status
createdBy
createdAt
updatedAt
}

`type` is `SINGLE_CHOICE` or `MULTIPLE_CHOICE`, as defined in 08-polls.md.

`status` is `DRAFT`, `PUBLISHED`, `CLOSED`, or `CANCELLED`, as defined in 08-polls.md §2a.

---

# 15. Votes

Path:

seasons/{seasonId}/polls/{pollId}/votes/{voteId}

---

Vote:

{
memberId
selectedOptions[]
createdAt
updatedAt
}

---

Rules:

- One vote document per member and poll.
- A member can update their vote while the poll is open.
- Results respect permissions.

---

# 16. Products Collection

## Purpose

Stores products available for members.

Examples:

- San Mateo T-shirt.
- Peña Zos T-shirt.
- Sweatshirt.
- Fan.

Path:

seasons/{seasonId}/products/{productId}

---

Product:

{
name
description
requiresSize
active
createdAt
updatedAt
}

---

# 17. Orders Collection

Path:

seasons/{seasonId}/orders/{orderId}

---

Order:

{
memberId
productId
quantity
size
paymentStatus
createdAt
updatedAt
}

---

Payment Status:

- PENDING
- PAID
- NOT_REQUIRED

---

Rules:

- Orders belong to one season.
- Members can create their own orders.
- Board manages all orders.

---

# 18. Deliveries Collection

A Delivery represents a package delivered to a member.

Path:

seasons/{seasonId}/deliveries/{deliveryId}

---

Delivery:

{
memberId
status
deliveredAt
deliveredBy
createdAt
updatedAt
}

---

Delivery Status:

- PENDING
- PARTIAL
- COMPLETED

---

# 19. Delivery Items

A delivery can contain multiple items.

Path:

seasons/{seasonId}/deliveries/{deliveryId}/items/{itemId}

---

DeliveryItem:

{
name
type
quantity
delivered
relatedOrderId
createdAt
updatedAt
}

---

Item Types:

- DRINKS_VOUCHER
- DINNER_VOUCHER
- PEÑA_PATCH
- SEMPA_VOUCHER
- ORDER_PRODUCT
- OTHER

---

# 20. Inventory Collection

Path:

seasons/{seasonId}/inventory/{inventoryId}

---

InventoryItem:

{
name
description
category
quantity
unit
status
notes
createdAt
updatedAt
}

---

Examples:

Beer:

20 boxes

Glasses:

500 units

Napkins:

2000 units

---

# 21. Finances Collection (Future / Post-MVP)

This collection is not created in the MVP. It is documented here so the schema can be added later without a redesign, per 13-finances.md.

Financial movements belong to a season.

Path:

seasons/{seasonId}/finances/{financeId}

---

FinancialMovement:

{
type
description
amount
date
createdBy
createdAt
updatedAt
}

---

Types:

- INCOME
- EXPENSE

---

# 22. Authentication Relationship

Firebase Authentication manages credentials.

Firestore stores application information.

Relationship:

Firebase Authentication User

↓

users/{userId}

↓

members/{memberId}

---

# 23. Security Considerations

The model must allow Firebase Security Rules to enforce:

Members:

- Access personal information.
- Manage personal actions.

Board:

- Manage operational information.

Treasurer:

- Manage finances.

Admin:

- Manage configuration.

---

# 24. Required Queries

The model must support:

- Get current season.
- Get member profile.
- Get member tasks.
- Get member orders.
- Get member deliveries.
- Get calendar information.
- Get pending deliveries.

(Calculate financial balance is Future / Post-MVP — see §21.)

---

# 25. Cost Considerations

The MVP should minimize:

- Large collection reads.
- Excessive real-time listeners.
- Unnecessary duplicated data.

Preferred approach:

- Query only required information.
- Use real-time updates only where valuable.
- Keep documents simple.

---

# 26. Future Improvements

Possible future additions:

- Cloud Functions.
- Notifications.
- File Storage.
- Advanced statistics.
- External calendar synchronization.

These are outside MVP scope.