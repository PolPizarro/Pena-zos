# Peña Zos — Dinners Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md
* 03-authentication.md

---

# 1. Overview

Dinners are one of the main organizational elements of Peña Zos during San Mateo festivities.

The application must allow the board to define and manage dinners, and allow members to confirm attendance and provide guest information.

The main objectives are:

* Know how many Peña Zos members attend each dinner.
* Know how many guests will attend.
* Calculate the number of meals required.
* Track guest payments.
* Reduce manual coordination through WhatsApp and spreadsheets.

---

# 2. Dinner Lifecycle

A dinner follows this lifecycle:

```text
Created
  |
  v
Open for registration
  |
  v
Registration closed
  |
  v
Dinner completed
```

---

# 3. Dinner Entity

A dinner belongs to a specific Season.

A dinner represents a concrete meal/event.

Example:

```text
San Mateo 2026

- Friday dinner
- Saturday dinner
- Sunday dinner
```

---

# 4. Dinner Information

A dinner must contain:

```text
Dinner
{
    id
    seasonId
    name
    description
    date
    time
    location
    registrationDeadline
    status
    createdAt
    updatedAt
}
```

---

# 5. Dinner Status

Possible values:

```text
DRAFT
OPEN
CLOSED
COMPLETED
CANCELLED
```

---

## DRAFT

The dinner is being prepared.

Only board members can view and modify it.

Members cannot register.

---

## OPEN

Members can see the dinner and confirm attendance.

Members can update their attendance until the registration deadline.

---

## CLOSED

Registration is no longer possible.

The board can view final attendance information.

---

## COMPLETED

The dinner has taken place.

The information remains available for historical purposes.

---

## CANCELLED

The dinner will not take place.

Historical information must be preserved.

---

# 6. Dinner Registration

Members can register for a dinner.

A member registration contains:

```text
DinnerAttendance
{
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

# 7. Attendance Rules

A member can have only one attendance record per dinner.

The member can:

* Confirm attendance.
* Cancel attendance while registration is open.
* Update guest count while registration is open.

The member cannot:

* Modify another member's attendance.
* Modify payment status.

---

# 8. Guests

The MVP does not require storing guest personal information.

Only the number of guests is required.

Example:

```text
Member:
Juan Pérez

Attendance:
Yes

Guests:
2
```

The system must support:

* Zero guests.
* One or more guests.

---

# 9. Guest Payments

Guests may have an associated cost.

The application must allow tracking the payment status.

Payment statuses:

```text
PENDING
PAID
NOT_REQUIRED
```

---

# 10. Payment Management

Payment management belongs to the board.

The board can:

* View unpaid guest payments.
* Mark payments as received.
* Review payment summaries.

The MVP does not include:

* Online payments.
* Payment gateways.
* Automatic financial accounting.

Payments are manually registered.

---

# 11. Board View

Board members need a global dinner overview.

The board should be able to see:

* Total members attending.
* Total guests.
* Total meals required.
* Pending payments.

Example:

```text
Saturday Dinner

Members:
85

Guests:
23

Total meals:
108

Pending guest payments:
5
```

---

# 12. Member View

A member should be able to see:

* Dinner information.
* Their attendance status.
* Their guest count.
* Their payment status for guests.

Example:

```text
Saturday Dinner

Attendance:
Yes

Guests:
2

Guest payment:
Pending
```

---

# 13. Permissions

## MEMBER

Allowed:

* View open dinners.
* Register attendance.
* Update own registration.
* View own information.

Not allowed:

* View global attendance.
* View other members' registrations.
* Modify dinners.

---

## BOARD

Allowed:

* Create dinners.
* Modify dinners.
* Open and close registrations.
* View all attendance.
* Manage guest payments.
* View summaries.

---

## ADMIN

Allowed:

* Perform board actions if also assigned BOARD.
* Perform technical administration.

ADMIN alone does not automatically gain dinner management permissions.

---

# 14. Notifications

The MVP does not include automatic notifications.

Communication about dinner registration will continue through external channels:

* WhatsApp.
* Email.

Future versions may add reminders.

---

# 15. Validation Rules

The application must validate:

* A member cannot register twice for the same dinner.
* Guest count cannot be negative.
* Closed dinners cannot accept registrations.
* Only authorized users can modify payment status.
* A cancelled dinner cannot receive registrations.

---

# 16. Future Improvements

Possible future features:

* Menu selection.
* Dietary restrictions.
* Individual guest names.
* QR attendance check.
* Automatic reminders.
* Payment integration.
* Dinner history statistics.

These are out of scope for the MVP.
