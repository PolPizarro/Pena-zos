# Peña Zos — Calendar Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 04-dinners.md
* 05-tasks.md
* 06-activities.md
* 07-events.md

---

# 1. Overview

The calendar module provides a centralized view of all relevant Peña Zos and San Mateo dates.

The purpose of the calendar is to allow members to quickly understand:

* What is happening today.
* What activities are upcoming.
* What tasks are assigned.
* What events are scheduled.

The calendar is an aggregation view.

It does not own the information displayed.

---

# 2. Calendar Sources

Calendar entries are generated from existing application entities.

The calendar may display:

* Dinners.
* Activities.
* Events.
* Tasks.

---

# 3. Calendar Entry Types

Initial supported types:

```text id="l0m9aq"
DINNER
ACTIVITY
EVENT
TASK
```

---

# 4. Calendar Entry Model

Calendar entries are generated dynamically.

The application does not create independent calendar records.

Example:

```text id="d9qj5u"
Dinner entity:

Friday Peña Dinner

appears in calendar as:

Friday 20:30
Peña Dinner
```

---

# 5. Calendar Views

The application must support different calendar views.

Initial views:

```text id="g2u3yc"
MONTH
WEEK
DAY
AGENDA
```

---

# 6. Month View

The month view provides a general overview.

Example:

```text id="8d3z4n"
September 2026

21
Dinner

22
Task:
Serve mojitos

23
Concert
```

---

# 7. Week View

The week view focuses on the San Mateo festivities period.

Example:

```text id="8w8n5t"
Monday

18:00
Prepare dinner


Tuesday

20:00
Peña activity


Wednesday

22:30
San Mateo event
```

---

# 8. Day View

The day view shows all relevant information for a specific day.

Example:

```text id="x0f4kp"
Saturday 21 September

20:00
Dinner

23:00
Concert

Assigned tasks:

- Serve food
- Collect tables
```

---

# 9. Agenda View

The agenda view displays upcoming items chronologically.

Example:

```text id="b7h3qr"
Upcoming:

Tomorrow

Peña dinner
20:30


Friday

Serve mojitos
23:00
```

---

# 10. Member Experience

Members can:

* View the calendar.
* Filter calendar information.
* Open item details.
* View their assigned tasks.

Members cannot:

* Create calendar entries.
* Modify calendar entries.
* Delete calendar entries.

---

# 11. Board Experience

Board members can:

* View all calendar information.
* Manage the entities that generate calendar entries.

Examples:

To change a dinner date:

The board modifies the dinner.

The calendar updates automatically.

---

# 12. Task Visibility

Tasks require special visibility rules.

Members should only see:

* Their own assigned tasks.
* Public tasks if configured.

Board members can see:

* All tasks.
* All assignments.

---

# 13. Calendar Filters

The application should support filtering.

Initial filters:

```text id="8mlfne"
All

Dinners

Activities

Events

My Tasks
```

---

# 14. Mobile Experience Requirements

The calendar must be optimized for mobile devices.

The main use cases are:

* Quickly checking today's schedule.
* Checking personal tasks.
* Knowing where and when something happens.

The first screen should prioritize:

* Today.
* Upcoming items.
* Personal tasks.

---

# 15. Permissions

## MEMBER

Allowed:

* View calendar.
* View public events.
* View activities.
* View own tasks.
* View dinners.

---

## BOARD

Allowed:

* View complete calendar.
* Manage calendar source entities.

---

## TREASURER

No specific calendar permissions.

---

## ADMIN

ADMIN does not automatically gain calendar management permissions.

An administrator requires the corresponding role to manage calendar information.

---

# 16. Validation Rules

The application must validate:

* Calendar entries must come from valid entities.
* Deleted entities must not appear in the calendar.
* Private tasks must not be visible to unauthorized users.
* Calendar dates must be consistent with the source entity.

---

# 17. Future Improvements

Possible future features:

* External calendar synchronization.
* Google Calendar export.
* Calendar reminders.
* Push notifications.
* WhatsApp integration.
* Public Peña Zos calendar.

These are out of scope for the MVP.
