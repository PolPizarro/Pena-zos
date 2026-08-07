# Peña Zos — Inventory Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 1. Overview

The inventory module allows Peña Zos to keep track of the items available before the San Mateo festivities.

The main purpose is to know:

* What items remain from previous editions.
* What can be reused.
* What quantities are available.
* What resources are already prepared.

The inventory system is not a complete warehouse management system.

The MVP focuses on simplicity and practical usage.

---

# 2. Inventory Lifecycle

Inventory information belongs to a specific Season.

Example:

```text id="9r5d2n"
San Mateo 2026

Review previous inventory

Update available quantities

Prepare festivities
```

---

# 3. Inventory Entity

An inventory item represents a physical resource owned by Peña Zos.

Examples:

* Glasses.
* Decoration material.
* Drink containers.
* Kitchen supplies.
* Remaining products.

---

# 4. Inventory Item Information

An inventory item must contain:

```text id="3h8f0v"
InventoryItem
{
    id
    seasonId
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
```

---

# 5. Inventory Categories

The system should support categories.

Initial categories:

```text id="2x7m9k"
DRINKS
FOOD
DECORATION
EQUIPMENT
SUPPLIES
OTHER
```

The board may add new categories in future versions.

---

# 6. Quantity Management

Inventory quantities must support different units.

Examples:

```text id="m5w1cq"
Beer:
Quantity:
20

Unit:
Boxes


Plastic cups:
Quantity:
500

Unit:
Units


Oil:
Quantity:
10

Unit:
Liters
```

---

# 7. Units

Initial supported units:

```text id="k2b8pq"
UNITS
BOXES
BOTTLES
LITERS
KILOGRAMS
PACKS
OTHER
```

The MVP does not require unit conversion.

Example:

The system does not need to automatically convert:

```text
2 boxes = 48 bottles
```

---

# 8. Inventory Status

Possible values:

```text id="q6f9wm"
AVAILABLE
LOW_STOCK
OUT_OF_STOCK
DISCARDED
```

---

## AVAILABLE

The item can be reused.

---

## LOW_STOCK

The item exists but quantity may not be enough.

---

## OUT_OF_STOCK

No available quantity.

---

## DISCARDED

The item is no longer usable.

---

# 9. Inventory Review

Before each San Mateo edition, the board reviews existing inventory.

The objective is:

* Identify remaining items.
* Update quantities.
* Decide what can be reused.

Example:

```text id="5v1k8q"
Previous year:

Plastic cups

Quantity:
800

Decision:
Reuse
```

---

# 10. Inventory Management

Board members can:

* Create inventory items.
* Modify inventory information.
* Update quantities.
* Change status.
* Add notes.

---

# 11. Member Access

Members cannot manage inventory.

The MVP does not require members to view inventory information.

Future versions may expose selected information.

---

# 12. Permissions

## MEMBER

Allowed:

* No inventory access.

---

## BOARD

Allowed:

* Full inventory management.
* View all inventory items.
* Update quantities.
* Add notes.

---

## ADMIN

ADMIN does not automatically gain inventory management permissions.

An administrator requires the BOARD role to manage inventory.

---

# 13. Validation Rules

The application must validate:

* Inventory items must belong to a season.
* Quantity cannot be negative.
* Unit is required.
* Name is required.
* Only authorized users can modify inventory.
* Historical information should not be deleted unnecessarily.

---

# 14. Mobile Experience Requirements

The inventory module is mainly used by the board.

The interface should allow quick updates from mobile devices.

Examples:

During preparation:

```text id="x8m3vz"
Plastic cups

Current quantity:
500 units

Update:
+200 units
```

---

# 15. Future Improvements

Possible future features:

* Inventory movements.
* Purchase tracking.
* Supplier management.
* Automatic stock alerts.
* Inventory photos.
* Inventory history.
* Link inventory with expenses.

These are out of scope for the MVP.
