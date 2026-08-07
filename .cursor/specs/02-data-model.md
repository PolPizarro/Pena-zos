# Peña Zos — Data Model Specification

**Version:** 0.2  
**Status:** Draft

**Related Documents:**

- 00-product.md
- 01-users-and-roles.md
- 10-orders.md
- 11-deliveries.md
- 15-firestore-data-model.md

---

# 1. Overview

This document defines the main business entities required by the Peña Zos application.

The purpose of this document is to define:

- Which information exists in the system.
- The relationship between entities.
- The ownership of data.
- The lifecycle of the main entities.

This document defines the business model.

It does not define the technical database implementation.

The Firestore implementation is defined in:

15-firestore-data-model.md

---

# 2. General Data Principles

## 2.1 Season-based data

Most Peña Zos information belongs to a specific San Mateo edition.

The application must isolate information by season.

Example:

```
San Mateo 2026

    |
    ├── Dinners
    ├── Tasks
    ├── Activities
    ├── Events
    ├── Polls
    ├── Products
    ├── Orders
    ├── Inventory
    ├── Deliveries
    └── Finances
```

Historical seasons must remain accessible.

---

## 2.2 Permanent vs Seasonal Data

The system contains two types of data.

---

## Permanent data

Data that exists independently of a San Mateo edition.

Examples:

- Users.
- Members.
- Roles.

---

## Seasonal data

Data that belongs to a specific San Mateo edition.

Examples:

- Dinners.
- Tasks.
- Activities.
- Events.
- Polls.
- Products.
- Orders.
- Deliveries.
- Inventory.
- Finances.

---

# 3. Entity Overview

Main entities:

```
User
 |
Member
 |
Season
 |
 ├── Dinner
 │     |
 │     └── DinnerAttendance
 |
 ├── Task
 │     |
 │     └── TaskAssignment
 |
 ├── Activity
 │     |
 │     └── ActivityRegistration
 |
 ├── Event
 |
 ├── Poll
 │     |
 │     └── Vote
 |
 ├── Product
 |
 ├── Order
 |
 ├── Delivery
 │     |
 │     └── DeliveryItem
 |
 ├── InventoryItem
 |
 └── FinancialMovement
```

---

# 4. User

## Purpose

Represents an authenticated application account.

A User is a technical identity.

---

## Attributes

```
User
{
    id
    firebaseUid
    memberId
    email
    createdAt
    updatedAt
}
```

---

## Rules

- A User represents a Firebase authentication account.
- A User belongs to exactly one Member.
- A Member can exist without a User account.
- A User does not directly contain business information.
- Passwords are never stored in the application database.

---

# 5. Member

## Purpose

Represents a person belonging to Peña Zos.

A Member is the central business entity.

---

## Attributes

```
Member
{
    id
    fullName
    email
    phone
    roles[]
    status
    createdAt
    updatedAt
}
```

---

## Roles

A member can have multiple roles.

Available roles:

```
[
    MEMBER,
    BOARD,
    TREASURER,
    ADMIN
]
```

---

## Status

Possible values:

```
ACTIVE
INACTIVE
PENDING_ACCESS
```

---

## Rules

- Members can exist without a User account.
- Members must preserve historical information.
- Inactive members must not be deleted.
- Roles belong to Members.

---

# 6. Season

## Purpose

Represents one San Mateo edition.

Example:

```
San Mateo 2026
```

---

## Attributes

```
Season
{
    id
    name
    year
    startDate
    endDate
    status
    createdAt
    updatedAt
}
```

---

## Status

Possible values:

```
PLANNING
ACTIVE
FINISHED
ARCHIVED
```

---

## Rules

- Seasonal entities must belong to a Season.
- A Season represents one and only one San Mateo edition.
- Archived seasons must remain available.
- Archived seasons should not be modified.

---

# 7. Dinner

## Purpose

Represents an organized dinner during the festivities.

---

## Attributes

```
Dinner
{
    id
    seasonId
    name
    date
    time
    description
    status
    createdAt
    updatedAt
}
```

---

## Relationship

```
Dinner
 |
 └── DinnerAttendance
```

---

# 8. Dinner Attendance

## Purpose

Represents whether a member attends a dinner.

---

## Attributes

```
DinnerAttendance
{
    id
    dinnerId
    memberId
    attending
    guestCount
    guestPaymentStatus
    createdAt
    updatedAt
}
```

---

## Rules

- A member can only have one attendance record per dinner.
- Guest personal information is not required.
- Guest count is enough for MVP.

---

# 9. Task

## Purpose

Represents an action required to organize the festivities.

---

## Attributes

```
Task
{
    id
    seasonId
    title
    description
    date
    time
    requiredPeople
    status
    type
    createdBy
    createdAt
    updatedAt
}
```

---

## Relationship

```
Task
 |
 └── TaskAssignment
```

---

# 10. Task Assignment

## Purpose

Represents the assignment of a task to a member.

---

## Attributes

```
TaskAssignment
{
    id
    taskId
    memberId
    status
    createdAt
    updatedAt
}
```

---

## Rules

- A task can have multiple members assigned.
- Assignment status is independent from task status.

---

# 11. Activity

## Purpose

Represents an activity organized by Peña Zos.

---

## Attributes

```
Activity
{
    id
    seasonId
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
```

---

## Relationship

```
Activity
 |
 └── ActivityRegistration
```

---

# 12. Activity Registration

```
ActivityRegistration
{
    id
    activityId
    memberId
    status
    createdAt
    updatedAt
}
```

---

# 13. Event

## Purpose

Represents relevant San Mateo events.

---

## Attributes

```
Event
{
    id
    seasonId
    name
    description
    date
    time
    location
    createdAt
    updatedAt
}
```

---

# 14. Poll

## Purpose

Represents a voting process.

---

## Attributes

```
Poll
{
    id
    seasonId
    title
    description
    options[]
    startDate
    endDate
    status
    createdBy
    createdAt
    updatedAt
}
```

---

## Relationship

```
Poll
 |
 └── Vote
```

---

# 15. Vote

```
Vote
{
    id
    pollId
    memberId
    selectedOption
    createdAt
}
```

---

## Rules

- A member can vote once per poll.
- Poll results must respect permissions.

---

# 16. Product

## Purpose

Represents an item available for members.

Examples:

- San Mateo T-shirt.
- Peña Zos T-shirt.
- Sweatshirt.
- Fan.

---

## Attributes

```
Product
{
    id
    seasonId
    name
    description
    requiresSize
    active
    createdAt
    updatedAt
}
```

---

## Rules

- Products belong to a season.
- Products can change between editions.

---

# 17. Order

## Purpose

Represents a product order made by a member.

---

## Attributes

```
Order
{
    id
    seasonId
    memberId
    productId
    size
    quantity
    paymentStatus
    createdAt
    updatedAt
}
```

---

## Payment Status

Possible values:

```
PENDING
PAID
NOT_REQUIRED
```

---

## Rules

- An order belongs to one season.
- An order references one product.
- Members can create their own orders.
- Board manages order administration.

---

# 18. Inventory Item

## Purpose

Represents an item owned by Peña Zos.

---

## Attributes

```
InventoryItem
{
    id
    seasonId
    name
    description
    quantity
    unit
    status
    createdAt
    updatedAt
}
```

---

## Examples

```
Beer
20 boxes

Glasses
500 units

Napkins
2000 units
```

---

# 19. Delivery

## Purpose

Represents a package delivered to a member before festivities.

---

## Attributes

```
Delivery
{
    id
    seasonId
    memberId
    status
    deliveredAt
    deliveredBy
    createdAt
    updatedAt
}
```

---

## Relationship

```
Delivery
 |
 └── DeliveryItem
```

---

# 20. Delivery Item

## Purpose

Represents an item included in a delivery.

---

## Attributes

```
DeliveryItem
{
    id
    deliveryId
    type
    quantity
    delivered
    relatedOrderId
    createdAt
}
```

---

## Item Types

Examples:

```
DRINKS_VOUCHER
DINNER_VOUCHER
PEÑA_PATCH
SEMPA_VOUCHER
ORDER_PRODUCT
OTHER
```

---

# 21. Financial Movement

## Purpose

Represents a financial operation.

---

## Attributes

```
FinancialMovement
{
    id
    seasonId
    type
    description
    amount
    date
    createdBy
    createdAt
    updatedAt
}
```

---

## Types

```
INCOME
EXPENSE
```

---

# 22. Entity Ownership

| Entity | Owner |
|---|---|
| User | System |
| Member | Administration |
| Season | Board |
| Dinner | Board |
| Dinner Attendance | Member / Board |
| Task | Board |
| Task Assignment | Board |
| Activity | Board |
| Event | Board |
| Poll | Board |
| Product | Board |
| Order | Member / Board |
| Inventory Item | Board |
| Delivery | Board |
| Financial Movement | Treasurer |

---

# 23. Deletion Strategy

The application should avoid physical deletion whenever possible.

Preferred approach:

- Use status fields.
- Preserve historical information.
- Keep references valid.

Examples:

Instead of deleting:

```
Member
```

use:

```
status = INACTIVE
```

Instead of deleting:

```
Season
```

use:

```
status = ARCHIVED
```

---

# 24. Future Entities

The model should allow future additions:

- Supplier.
- Purchase.
- Meeting.
- Document.
- Statistics.
- Advanced financial reports.

These are outside the MVP.

---

# 25. Design Principles

The data model must follow these principles:

## Historical preservation

Past San Mateo editions must remain available.

## Clear ownership

Every piece of information must have a responsible role.

## Simple domain model

Avoid unnecessary complexity.

## Security first

The model must allow Firebase Security Rules to enforce permissions.

## Future extensibility

The model should support future features without requiring a complete redesign.