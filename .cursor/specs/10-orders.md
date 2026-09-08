# Peña Zos — Orders Specification

**Version:** 0.4  
**Status:** Draft

**Related Documents:**

- 00-product.md
- 01-users-and-roles.md
- 02-data-model.md
- 11-deliveries.md
- 14-seasons.md
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

The module contains three main entities:

```
Product

    |
    |
    v

Order

    |
    |
    v

OrderItem
```

A Product represents an item available for members, with a price.

An Order represents a single purchase made by a member — one member,
one checkout, one payment status, one total cost.

An OrderItem represents one product line within an Order (a product,
a size, and a quantity). An Order can contain multiple OrderItems.

Example:

```
Order (Pol Pizarro)

    OrderItem: Camiseta, talla L, x1
    OrderItem: Camiseta, talla XL, x1
    OrderItem: Sudadera, talla L, x1

Total cost: sum of all OrderItems
```

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
    price
    requiresSize
    active
    createdAt
    updatedAt
}
```

`price` is a positive number, in euros (e.g. `15` or `17.5`), matching the plain-number money convention already used for `guestCost` (04-dinners.md) and `FinancialMovement.amount` (13-finances.md).

---

## Rules

- Products belong to a season.
- Products can be activated or deactivated.
- Inactive products cannot receive new orders.
- `price` must be greater than or equal to zero.
- Historical orders must preserve their original product reference and the price at the time of order (see §4a `unitPrice`).

---

# 4. Order

## Purpose

Represents one purchase made by a member: a single checkout that can
contain one or more products.

An Order represents the intention to receive one or more items.

The delivery process is handled separately.

---

## Attributes

```
Order
{
    id
    seasonId
    memberId
    source
    totalCost
    paymentStatus
    cancelled
    createdAt
    updatedAt
}
```

`totalCost` is the sum of `lineTotal` across the order's `OrderItem`s, denormalized onto the Order so lists (member and board) don't need to read every item (mirrors the `assignedMemberIds` denormalization pattern, 02-data-model.md §9). It is recalculated whenever items are added, changed, or removed while the order is `PENDING`.

`source` is `MEMBER` (created by the member themselves through the app) or `IMPORT` (created by the board through the bulk Excel import, §15). It exists so re-running an import can safely find "the order this import already created for this member" without ever touching an order the member built themselves.

`cancelled` (boolean, default `false`) is a soft delete: a cancelled order is preserved for historical/accounting purposes but hidden from normal order lists (02-data-model.md §23). A member may cancel their own order while `paymentStatus` is `PENDING`; the board may cancel any order regardless of payment status.

---

# 4a. Order Item

## Purpose

Represents one product line within an Order: a product, a size, and
a quantity.

---

## Attributes

```
OrderItem
{
    id
    orderId
    memberId
    productId
    size
    quantity
    unitPrice
    lineTotal
    createdAt
    updatedAt
}
```

`memberId` is a denormalized copy of the parent Order's `memberId`, so Firestore Security Rules can check ownership without an extra read (same pattern as `Task.assignedMemberIds`, 02-data-model.md §9).

`unitPrice` is a copy of the Product's `price` at the time the item was added. This preserves what the member was actually charged even if the product's price changes later (historical preservation, 02-data-model.md §25).

`lineTotal` is `unitPrice × quantity`.

---

## Rules

- An OrderItem belongs to exactly one Order.
- Quantity must be greater than zero.
- A member can add, change, or remove items while the parent Order's `paymentStatus` is `PENDING`.
- Once an Order is `PAID` or `NOT_REQUIRED`, its items are frozen (board can still adjust them for corrections).

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
OrderItem

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

A member places one order with:

```
1 x Sweatshirt
1 x T-shirt
```

(two OrderItems within the same Order)

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

Each DeliveryItem may reference the originating OrderItem via `relatedOrderItemId` (11-deliveries.md §5), since an Order can bundle several products and delivery is tracked per product line, not per order.

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

# 9a. Ordering Period

## Purpose

Lets the board close ordering — stop members from placing or adding to
orders — once the ordering window is over (e.g. when the season moves
into the delivery-preparation phase), without changing anything else
about the active season.

This is a `Season` field (`ordersOpen`, boolean), independent from
`Season.status` (14-seasons.md §3): a season stays `ACTIVE` the whole
time, but ordering can be opened or closed within it, since dinners,
tasks, deliveries etc. keep working regardless of whether ordering
itself is open.

---

## Behavior

While `ordersOpen` is `true`:

- Members can create orders and add items, as normal (§8).

While `ordersOpen` is `false`:

- Members can no longer create new orders or add items to an existing one.
- Members can still view their own past orders and payment status.
- Board/admin are unaffected: they can still manage existing orders
  (payment status, cancel, corrections) and run the bulk import (§15)
  regardless of this flag — closing ordering only stops *member*
  self-service ordering.

---

## Permissions

Only BOARD and ADMIN can toggle `ordersOpen`, matching order
administration permissions (§9).

---

# 10. Treasurer Permissions (Future / Post-MVP)

In the MVP, the TREASURER role has no additional order permissions beyond MEMBER, per 01-users-and-roles.md §10 and 00-product.md §4.3. Order payment status is managed by the Board in the MVP (§9).

Once Finances is brought into scope (13-finances.md), Treasurers are intended to:

- View order payment information.
- Validate payments.
- Update payment status.

---

# 11. Order Rules

The system must ensure:

- An order belongs to one season.
- An order belongs to one member.
- An order contains one or more OrderItems, each referencing one product.
- Quantity must be greater than zero on each item.
- `totalCost` always equals the sum of its items' `lineTotal`.
- Historical orders must remain available.

---

# 12. Queries

The system must support:

## Member queries

- Get current member orders (with their items).
- Get order status.
- Get unpaid orders.

---

## Board queries

- Get all season orders (with their items).
- Search orders by member name.
- Filter orders by product (across items).
- Filter orders by payment status.
- Filter orders by delivery status — hide already-delivered orders by
  default, with an option to show all statuses (11-deliveries.md §3).
- Calculate product quantities (across all order items).

---

## Treasurer queries (Future / Post-MVP)

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

# 15. Bulk Import

The board can import orders from an Excel file, for the active Season.

Each row represents one product line, not one order. Rows sharing the
same `Email` belong to the same member's order.

The import file contains, per row:

- Email (matches an existing Member's email).
- Producto (matches an active Product's name, within the active Season).
- Talla (required only if the matched product has `requiresSize = true`).
- Cantidad.

Example:

```
Email               Producto    Talla   Cantidad
pol@example.com      Camiseta    L       1
pol@example.com      Camiseta    XL      1
pol@example.com      Sudadera    L       1
juan@example.com     Camiseta    M       2
```

produces two Orders: one for Pol (3 OrderItems, per §2) and one for Juan (1 OrderItem).

---

## Row Validation

The import process must reject a row when:

- Email does not match any Member.
- Producto does not match an active Product in the active Season.
- The matched product `requiresSize` is `true` and Talla is empty.
- Cantidad is missing, not a number, or not greater than zero.

A rejected row does not block the other rows for the same Email — the
member's Order is still created/updated from their remaining valid rows.

---

## Order Creation / Matching

For each distinct Email with at least one valid row:

- Look for an existing Order for that Member, in the active Season,
  with `source = IMPORT` and `paymentStatus = PENDING`.
- If found: replace its OrderItems with the ones from this import run
  and recalculate `totalCost`. This is what makes re-importing a
  corrected file safe — it never creates a duplicate.
- If not found (no prior `IMPORT` order, or the prior one is already
  `PAID`/`NOT_REQUIRED`): create a new Order (`source = IMPORT`,
  `paymentStatus = PENDING`) with the OrderItems from this run.

An Order created by the member themselves (`source = MEMBER`) is never
matched or modified by the import — only `IMPORT`-sourced orders are
eligible for the replace-on-reimport behavior above.

---

## Permissions

Only BOARD and ADMIN can import orders, matching order administration
permissions (§9). This requires the board to be able to create/update
an Order and its OrderItems on behalf of another member, per
17-security-rules.md §13.

---

# 16. Future Improvements

Possible future additions:

- Refund management.
- Multiple product variants.
- Stock reservation.
- Supplier management.

These are outside MVP scope.