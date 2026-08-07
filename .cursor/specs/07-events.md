# Peña Zos — Events Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 1. Overview

Events represent relevant dates and activities related to San Mateo festivities that should be visible to Peña Zos members.

Events are mainly informative.

The objective of the event system is to:

* Provide a centralized San Mateo calendar.
* Allow members to know important dates.
* Avoid relying only on external communication channels.
* Have a historical record of each San Mateo edition.

Examples:

* San Mateo opening ceremony.
* Concerts.
* Parades.
* Official city events.
* Peña Zos relevant dates.

---

# 2. Difference Between Activities and Events

The application distinguishes between Activities and Events.

## Events

Events are informative calendar entries.

Examples:

```text
San Mateo opening speech

Concert in main square

Local parade
```

Members do not register.

---

## Activities

Activities are organized by Peña Zos and may require participation.

Examples:

```text
Peña dinner

Group activity

Organized outing
```

Members may register.

---

# 3. Event Lifecycle

An event follows this lifecycle:

```text
Created
   |
   v
Published
   |
   v
Completed
```

Events may also be cancelled.

---

# 4. Event Entity

An event belongs to a specific Season.

Example:

```text
San Mateo 2026

Event:
Saturday parade
```

---

# 5. Event Information

An event must contain:

```text
Event
{
    id
    seasonId
    name
    description
    date
    startTime
    endTime
    location
    status
    createdBy
    createdAt
    updatedAt
}
```

---

# 6. Event Status

Possible values:

```text
DRAFT
PUBLISHED
COMPLETED
CANCELLED
```

---

## DRAFT

The event is being prepared.

Only board members can view and modify it.

---

## PUBLISHED

The event is visible to members.

---

## COMPLETED

The event has already happened.

Historical information is preserved.

---

## CANCELLED

The event will not happen.

Historical information is preserved.

---

# 7. Member Experience

Members can:

* View published events.
* View event details.
* View events in the calendar.

Members cannot:

* Create events.
* Modify events.
* Cancel events.

---

# 8. Board Management

Board members can:

* Create events.
* Modify events.
* Publish events.
* Cancel events.
* Mark events as completed.

---

# 9. Calendar Integration

Events must appear in the application calendar.

Calendar information:

* Event name.
* Date.
* Time.
* Location.
* Description.

Example:

```text
Saturday 21 September

Concert

22:00

Main square
```

---

# 10. Permissions

## MEMBER

Allowed:

* View published events.
* View event details.

Not allowed:

* Create events.
* Modify events.
* View draft events.

---

## BOARD

Allowed:

* Full event management.
* View draft events.
* Publish events.
* Modify event information.

---

## ADMIN

ADMIN does not automatically gain event management permissions.

An administrator requires the BOARD role to manage events.

---

# 11. Validation Rules

The application must validate:

* An event must belong to a season.
* An event must have a name.
* Published events must contain enough information to be useful.
* Cancelled events cannot be displayed as active.
* Only authorized users can modify events.

---

# 12. Mobile Experience Requirements

The event section should allow members to quickly answer:

* What happens today?
* When does it start?
* Where does it happen?

The information must be optimized for mobile use.

---

# 13. Future Improvements

Possible future features:

* Import official San Mateo program.
* External calendar synchronization.
* Add event reminders.
* Add maps and navigation.
* Add event categories.

These are out of scope for the MVP.
