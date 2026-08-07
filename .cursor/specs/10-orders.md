# Peña Zos — Orders Specification

**Version:** 0.2  
**Status:** Draft

**Related Documents:**

- 00-product.md
- 01-users-and-roles.md
- 02-data-model.md
- 11-deliveries.md
- 15-firestore-data-model.md

---

# 1. Overview

This document defines the order management functionality.

The purpose of this module is to allow Peña Zos members to request products during a San Mateo season.

Examples:

- San Mateo T-shirt.
- Peña Zos T-shirt.
- Sweatshirt.
- Fan.
- Other merchandising.

The module manages:

- Available products.
- Member orders.
- Payment status.

Physical delivery is managed separately by:

11-deliveries.md

---

# 2. Business Concepts

The module contains two main entities:

```
Product

    |
    |
    v

Order
```

A Product represents an item available for members.

An Order represents a member request for a product.

---

# 3. Product

## Purpose

Represents a product available during a season.

Products can change between San Mateo editions.

Examples:

```
San Mateo T-shirt

Peña Zos T-shirt

Sweatshirt

Fan
```

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
- Products can be activated or deactivated.
- Inactive products cannot receive new orders.
- Historical orders must preserve their original product reference.

---

# 4. Order

## Purpose

Represents a request made by a member for a product.

An Order represents the intention to receive an item.

The delivery process is handled separately.

---

## Attributes

```
Order
{
    id
    seasonId
    memberId
    productId
    quantity
    size
    paymentStatus
    createdAt
    updatedAt
}
```

---

# 5. Payment Status

Possible values:

```
PENDING

PAID

NOT_REQUIRED
```

---

## Meaning

### PENDING

Payment is expected but has not been confirmed.

---

### PAID

Payment has been received.

---

### NOT_REQUIRED

The product does not require payment.

---

# 6. Order Lifecycle

Example:

```
Member creates order

        |
        v

Order created

        |
        v

Payment completed

        |
        v

Product prepared

        |
        v

Delivery managed separately
```

---

# 7. Delivery Relationship

Orders do not store delivery status.

Delivery tracking belongs to the delivery module.

Relationship:

```
Order

    |
    |
    v

DeliveryItem

    |
    |
    v

Delivery
```

Example:

A member orders:

```
1 x Sweatshirt
1 x T-shirt
```

Later:

```
Delivery

Member:
Juan

Items:

Sweatshirt
DELIVERED

T-shirt
PENDING
```

---

# 8. Member Permissions

Members can:

- View available products.
- Create their own orders.
- View their own orders.
- View their payment status.

Members cannot:

- Modify other members' orders.
- Manage products.
- Change payment status.

---

# 9. Board Permissions

Board members can:

- Create products.
- Modify products.
- Activate or deactivate products.
- View all orders.
- Manage order administration.

Board members cannot:

- Modify payment information unless authorized.

---

# 10. Treasurer Permissions

Treasurers can:

- View order payment information.
- Validate payments.
- Update payment status.

---

# 11. Order Rules

The system must ensure:

- An order belongs to one season.
- An order belongs to one member.
- An order references one product.
- Quantity must be greater than zero.
- Historical orders must remain available.

---

# 12. Queries

The system must support:

## Member queries

- Get current member orders.
- Get order status.
- Get unpaid orders.

---

## Board queries

- Get all season orders.
- Filter orders by product.
- Filter orders by payment status.
- Calculate product quantities.

---

## Treasurer queries

- Get pending payments.
- Calculate collected payments.

---

# 13. Product Availability

Products are seasonal.

Example:

San Mateo 2026:

```
T-shirt
Sweatshirt
```

San Mateo 2027:

```
T-shirt
Fan
```

Historical orders must keep the relationship with the original product.

---

# 14. Deletion Strategy

Orders should never be physically deleted.

Preferred approach:

- Preserve historical information.
- Disable products instead of deleting them.
- Keep references valid.

---

# 15. Future Improvements

Possible future additions:

- Order cancellation.
- Refund management.
- Multiple product variants.
- Stock reservation.
- Supplier management.

These are outside MVP scope.