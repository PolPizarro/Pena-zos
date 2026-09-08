# Peña Zos — Deliveries Specification

**Version:** 0.2  
**Status:** Draft

**Related Documents:**

- 00-product.md
- 01-users-and-roles.md
- 02-data-model.md
- 10-orders.md
- 15-firestore-data-model.md

---

# 1. Overview

This document defines the delivery management functionality.

The purpose of this module is to manage the distribution of Peña Zos items to members before or during San Mateo festivities.

Examples:

- Ordered clothes.
- Drinks vouchers.
- Dinner vouchers.
- Peña patches.
- Other materials.

The delivery module manages the physical handover of items.

Orders are managed separately by:

10-orders.md

---

# 2. Business Concepts

The module contains two entities:

```
Delivery

    |
    |
    v

DeliveryItem
```

A Delivery represents the delivery package assigned to a member.

A DeliveryItem represents an individual item inside that delivery.

---

# 3. Delivery

## Purpose

Represents the delivery process for one member during one season.

A member can have one delivery package containing multiple items.

The Orders board screen reuses this `status` as "has this member's order
been delivered" to filter the order list (10-orders.md §12,
19-ui-navigation.md §16a) — a package can technically hold non-order
items too (vouchers, patches), but in practice it's driven by the
member's order, so this is a reasonable proxy rather than a per-order
delivery concept of its own.

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

# 4. Delivery Status

Possible values:

```
PENDING

PARTIAL

COMPLETED
```

---

## Meaning

### PENDING

The delivery has been created but no items have been delivered.

---

### PARTIAL

Some items have been delivered but some remain pending.

---

### COMPLETED

All items have been delivered.

---

# 5. Delivery Item

## Purpose

Represents an individual item included in a delivery.

---

## Attributes

```
DeliveryItem
{
    id
    deliveryId
    name
    type
    quantity
    delivered
    relatedOrderItemId
    createdAt
    updatedAt
}
```

`relatedOrderItemId` references a specific `OrderItem` (10-orders.md §4a), since one Order can bundle several products and delivery is tracked per product line.

---

# 6. Delivery Item Types

Possible values:

```
DRINKS_VOUCHER

DINNER_VOUCHER

PEÑA_PATCH

SEMPA_VOUCHER

ORDER_PRODUCT

OTHER
```

---

## Meaning

### DRINKS_VOUCHER

Drink related voucher or entitlement.

---

### DINNER_VOUCHER

Dinner access or voucher.

---

### PEÑA_PATCH

Peña Zos patch.

---

### SEMPA_VOUCHER

Sempat-related voucher.

---

### ORDER_PRODUCT

Product coming from a member order.

Example:

- T-shirt.
- Sweatshirt.

The originating order line can be referenced using:

```
relatedOrderItemId
```

---

### OTHER

Any item not covered by the previous types.

---

# 7. Relationship With Orders

Orders and deliveries are separate concepts.

Example:

A member creates:

```
Order

OrderItem:
Product: Peña Zos Sweatshirt
Quantity: 1
```

Later:

```
Delivery

Item:

Sweatshirt

type:
ORDER_PRODUCT

relatedOrderItemId:
12345
```

The delivery module does not modify the order.

It only records the physical handover.

---

# 8. Delivery Lifecycle

Example:

```
Board prepares deliveries

        |
        v

Delivery created

        |
        v

Items added

        |
        v

Member receives items

        |
        v

Delivery completed
```

---

# 9. Member Permissions

Members can:

- View their own delivery.
- See pending items.
- Confirm received information if enabled.

Members cannot:

- Modify delivery contents.
- Mark deliveries as completed.
- Access other members' deliveries.

---

# 10. Board Permissions

Board members can:

- Create deliveries.
- Add delivery items.
- Update delivery status.
- Mark items as delivered.
- View all deliveries.

---

# 11. Delivery Rules

The system must ensure:

- A delivery belongs to one season.
- A delivery belongs to one member.
- Delivery items belong to one delivery.
- Quantity must be greater than zero.
- Historical deliveries must remain available.

---

# 12. Delivery Completion Rules

The Delivery status should be calculated from its items.

Example:

```
Delivery

Items:

T-shirt
delivered = true

Sweatshirt
delivered = false
```

Result:

```
status = PARTIAL
```

---

When:

```
All items:

delivered = true
```

Result:

```
status = COMPLETED
```

---

# 13. Queries

The system must support:

## Member queries

- Get current delivery.
- Get pending items.
- Check received items.

---

## Board queries

- Get pending deliveries.
- Get partially completed deliveries.
- Search deliveries by member.
- Review delivery progress.

---

# 14. Deletion Strategy

Deliveries should never be physically deleted.

Preferred approach:

- Preserve historical information.
- Keep delivered items available for future reference.
- Avoid breaking historical records.

---

# 15. Future Improvements

Possible future additions:

- QR based delivery confirmation.
- Digital signatures.
- Delivery points.
- Automatic order-to-delivery generation.
- Delivery notifications.

These are outside MVP scope.