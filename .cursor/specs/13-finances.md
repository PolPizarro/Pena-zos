# Peña Zos — Finances Specification

**Version:** 0.1
**Status:** Future / Post-MVP — not part of the initial MVP scope

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 0. MVP Scope Notice

Per 00-product.md (Non-Goals — Expenses and Accounts), financial and account management is explicitly out of scope for the initial MVP. The treasurer will keep using the current external system during the MVP.

This document describes the intended future design so that the MVP architecture and data model do not block adding it later. None of the rules below should be implemented, and none of the permissions below should be granted, until this module is formally brought into scope through a specification change.

---

# 1. Overview

The finances module provides a simple way to track Peña Zos income and expenses related to San Mateo festivities.

The purpose of this module is:

* Record incomes.
* Record expenses.
* View the current balance.
* Have a historical record of financial movements.

The module is not intended to replace professional accounting software.

---

# 2. Financial Movement Concept

The system stores simple financial movements.

A movement can be:

* Income.
* Expense.

Examples:

Income:

```text
Dinner payments

Amount:
500€
```

Expense:

```text
Drink purchase

Amount:
850€
```

---

# 3. Financial Movement Entity

A financial movement represents a money transaction.

Entity:

```text
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

# 4. Movement Types

Possible values:

```text
INCOME

EXPENSE
```

---

# 5. Amount Management

Amounts are stored as positive numbers.

The movement type determines whether the amount is added or subtracted.

Example:

```text
Income:

Type:
INCOME

Amount:
500€
```

```text
Expense:

Type:
EXPENSE

Amount:
200€
```

---

# 6. Financial Categories

The MVP does not require mandatory categories.

The description field is enough to identify the movement.

Examples:

```text
Income:

Dinner payments


Expense:

Food purchase


Expense:

Drink supplier
```

Future versions may introduce categories.

---

# 7. Balance Calculation

The application calculates:

```text
Balance = Total Income - Total Expenses
```

Example:

```text
Income:

2000€

Expenses:

1500€

Balance:

500€
```

---

# 8. Member Experience

Members cannot access financial information.

Financial information is restricted.

---

# 9. Board Experience

Board members can:

* View financial information.
* View the current balance.

The MVP does not allow board members to modify financial movements unless they have the required permission.

---

# 10. Treasurer Experience

The treasurer can:

* Create financial movements.
* Modify financial movements.
* Delete incorrect movements.
* View all financial information.
* View the current balance.

---

# 11. Permissions

## MEMBER

Allowed:

* No access.

---

## BOARD

Allowed:

* View financial summary only if explicitly enabled.

Not allowed:

* Create movements.
* Modify movements.
* Delete movements.

---

## TREASURER

Allowed:

* Full financial management.

---

## ADMIN

ADMIN does not automatically gain financial permissions.

An administrator requires the TREASURER role to manage finances.

---

# 12. Validation Rules

The application must validate:

* Amount must be greater than zero.
* Type is required.
* Description is required.
* Only authorized users can modify financial information.
* Financial movements should not be deleted unnecessarily.

---

# 13. Mobile Experience Requirements

The finance module is mainly used by the treasurer.

The interface should allow quick operations:

Example:

```text
New movement

Type:
Expense

Description:
Drink supplier

Amount:
850€

Save
```

---

# 14. Future Improvements

Possible future features:

* Expense categories.
* Attach invoices.
* Export reports.
* Annual financial summaries.
* Budget planning.
* Member payment tracking.

These are out of scope for the MVP.
