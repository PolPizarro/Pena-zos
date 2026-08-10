# Peña Zos — Tasks Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 1. Overview

Tasks represent the responsibilities assigned by the Peña Zos board to members during San Mateo festivities.

The objective of the task system is to:

- Allow the board to plan responsibilities in advance.
- Assign responsibilities to members.
- Allow members to know what they are responsible for.
- Provide the board with a centralized view of task organization.
- Avoid relying on WhatsApp messages and informal communication.

Tasks are assigned by the board. Members are only consumers of the information.

---

# 2. Task Lifecycle

A task follows this lifecycle:

```text id="3y7p4m"
Created
   |
   v
Assigned
   |
   v
Completed
```

Tasks may also be cancelled.

---

# 3. Task Entity

A task belongs to a specific Season.

A task represents a responsibility that must be performed.

Example:

```text id="q2qf9m"
San Mateo 2026

Saturday 21:00

Task:
Serve mojitos

Assigned:
Juan
Pedro
Maria
```

---

# 4. Task Information

A task must contain:

```text id="x1qv0r"
Task
{
    id
    seasonId
    title
    description
    type
    date
    startTime
    endTime
    requiredPeople
    status
    createdBy
    createdAt
    updatedAt
}
```

---

# 5. Task Types

The system should support predefined task categories.

Initial values:

```text id="8lqv8m"
FOOD_SERVICE
FOOD_COLLECTION
MOJITO_SERVICE
SUPPLY_PICKUP
SUPPLIER_CONTACT
PREPARATION
OTHER
```

The board should be able to create additional task types in future versions.

---

# 6. Task Status

Possible statuses:

```text id="g3s8bk"
PENDING
ASSIGNED
COMPLETED
CANCELLED
```

---

## PENDING

The task exists but nobody has been assigned.

---

## ASSIGNED

One or more members have been assigned. Work may already be underway; the MVP does not track a separate in-progress state.

---

## COMPLETED

The task has been completed.

---

## CANCELLED

The task will not be performed.

---

# 7. Task Assignment

A task may require multiple people.

The assignment relationship is:

```text id="b8z0px"
Task
 |
 └── TaskAssignment
        |
        └── Member
```

---

# 8. Task Assignment Entity

A task assignment contains:

```text id="r1g1hz"
TaskAssignment
{
    taskId
    memberId
    assignedAt
    completedAt
    status
}
```

---

# 9. Assignment Rules

A member can be assigned to multiple tasks.

A task can have multiple assigned members.

Example:

```text id="r9b3z0"
Task:
Serve food

Required people:
3

Assigned:
- Juan
- Pedro
- Maria
```

---

# 10. Required People

The board should be able to define how many people are needed.

Example:

```text id="v0o8pf"
Task:
Collect dinner

Required people:
4
```

The application should indicate whether enough people have been assigned.

Example:

```text id="z4a9w8"
Assigned:
2 / 4
```

---

# 11. Member Task View

Members need a simple view focused on their responsibilities.

The member view should show:

* Task name.
* Date.
* Time.
* Location if available.
* Description.
* Other assigned members.
* Current status.

Example:

```text id="c1j7qf"
Friday 22:30

Serve mojitos

People:
Juan
Maria
Pedro

Status:
Assigned
```

---

# 12. Board Task Management

Board members can:

* Create tasks.
* Modify tasks.
* Delete tasks if necessary.
* Assign members.
* Remove assignments.
* Change status.
* View all tasks.

The board should have a global overview.

Example:

```text id="k9z4r1"
Friday

18:00
Serve dinner
3/3 assigned

23:00
Serve mojitos
1/4 assigned
```

---

# 13. Task Calendar Integration

Tasks must be available in the application calendar.

Calendar entries should display:

* Task name.
* Date.
* Time.
* Assignment status.

Members should only see:

* Their own assigned tasks.

Board members can see all tasks.

---

# 14. Task Completion Flow

Task completion is managed by the board.

Members cannot modify task status.

The board may update the task status when the responsibility has been completed.

Example:

Task:
Serve food

Assigned:
Juan

After the activity:

Board marks:
COMPLETED
```

---

# 15. Permissions

# MEMBER

Allowed:

- View assigned tasks.
- View task details.

Not allowed:

- Create tasks.
- Modify tasks.
- Change task status.
- Assign members.
- Remove themselves from tasks.
- Modify other members' tasks.

---

# BOARD

Allowed:

- Create tasks.
- Modify tasks.
- Cancel tasks.
- Assign members.
- Remove assignments.
- Change task status.
- View all tasks.

---

## ADMIN

ADMIN does not automatically gain task management permissions.

An administrator requires the BOARD role to manage tasks.

---

# 16. Validation Rules

The system must validate:

* A task must belong to a season.
* A task must have a title.
* A task cannot have negative required people.
* A member cannot be assigned twice to the same task.
* Cancelled tasks cannot be assigned.
* Completed tasks should preserve completion history.

---

# 17. Mobile Experience Requirements

The task module is expected to be one of the most used during San Mateo.

The mobile experience should prioritize:

* Quick access to personal tasks.
* Large touch targets.
* Minimal navigation.
* Clear status indicators.
* Fast loading.

A member should be able to answer:

"What tasks has the board assigned to me?"

within a few seconds.

---

# 18. Future Improvements

Possible future features:

* Task reminders.
* Task shift templates.
* Recurring tasks.
* Volunteer sign-up without assignment.
* Task priority.
* Task comments.
* Task attachments.
* Task history statistics.

These are out of scope for the MVP.
