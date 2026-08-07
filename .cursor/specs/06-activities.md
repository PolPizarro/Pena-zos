# Peña Zos — Activities Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 1. Overview

Activities represent optional or organized activities promoted by Peña Zos during the San Mateo festivities.

The purpose of the activity system is to:

* Centralize information about planned activities.
* Allow members to know what activities are available.
* Allow members to register when participation is required.
* Allow the board to know expected participation.

Examples of activities:

* Group activities.
* Peña events.
* Organized outings.
* Special activities during the festivities.

---

# 2. Activity Lifecycle

An activity follows this lifecycle:

```text id="e4k9w3"
Created
   |
   v
Published
   |
   v
Registration open
   |
   v
Registration closed
   |
   v
Completed
```

Activities may also be cancelled.

---

# 3. Activity Entity

An activity belongs to a specific Season.

Example:

```text id="q9l2dk"
San Mateo 2026

Activity:
Interpeñas dinner
```

---

# 4. Activity Information

An activity must contain:

```text id="s8o3dj"
Activity
{
    id
    seasonId
    name
    description
    date
    startTime
    endTime
    location
    registrationRequired
    capacity
    status
    createdBy
    createdAt
    updatedAt
}
```

---

# 5. Activity Status

Possible values:

```text id="8a1mcb"
DRAFT
PUBLISHED
REGISTRATION_OPEN
REGISTRATION_CLOSED
COMPLETED
CANCELLED
```

---

## DRAFT

The activity is being prepared.

Only board members can view and modify it.

---

## PUBLISHED

The activity information is visible to members.

Registration may not be required.

---

## REGISTRATION_OPEN

Members can register.

---

## REGISTRATION_CLOSED

Registration is no longer possible.

The board can review participation.

---

## COMPLETED

The activity has taken place.

The information is preserved historically.

---

## CANCELLED

The activity will not take place.

Historical information must remain available.

---

# 6. Registration Requirement

Not all activities require registration.

The board can define whether an activity requires members to register.

Examples:

## Without registration

```text id="3c5r7n"
Event:
Fireworks viewing

Registration:
Not required
```

---

## With registration

```text id="f7k2mz"
Activity:
Group dinner

Registration:
Required
```

---

# 7. Activity Registration

When registration is required, members can register.

The registration entity:

```text id="8s8m7e"
ActivityRegistration
{
    activityId
    memberId
    status
    createdAt
    updatedAt
}
```

---

# 8. Registration Status

Possible values:

```text id="w6v3ku"
REGISTERED
CANCELLED
ATTENDED
```

---

# 9. Member Participation Rules

Members can:

* View published activities.
* Register for activities requiring registration.
* Cancel their own registration while registration is open.
* View their own registrations.

Members cannot:

* Create activities.
* Modify activities.
* Register other members.
* View private board information.

---

# 10. Board Management

Board members can:

* Create activities.
* Modify activities.
* Publish activities.
* Open and close registrations.
* Cancel activities.
* View participation.
* Manage activity information.

---

# 11. Capacity Management

Some activities may have a maximum capacity.

Example:

```text id="x0y5mf"
Activity:

Boat trip

Capacity:
40 people
```

The system must:

* Prevent registrations above capacity.
* Show remaining places if applicable.

Example:

```text id="4d8p2f"
Registered:
35 / 40
```

If no capacity is defined, registrations are unlimited.

---

# 12. Calendar Integration

Activities must appear in the application calendar.

Calendar information:

* Activity name.
* Date.
* Time.
* Location.

The calendar must respect permissions.

Members see published activities.

Board members see all activities.

---

# 13. Permissions

## MEMBER

Allowed:

* View published activities.
* Register for activities.
* Cancel own registrations.
* View own registrations.

Not allowed:

* Create activities.
* Modify activities.
* View draft activities.
* Manage registrations from other members.

---

## BOARD

Allowed:

* Full activity management.
* View all registrations.
* Manage activity status.
* View participation summaries.

---

## ADMIN

ADMIN does not automatically gain activity management permissions.

An administrator requires the BOARD role to manage activities.

---

# 14. Validation Rules

The application must validate:

* An activity must belong to a season.
* A member cannot register twice for the same activity.
* Cancelled activities cannot accept registrations.
* Closed registrations cannot receive new registrations.
* Capacity cannot be exceeded.
* Only authorized users can modify activities.

---

# 15. Mobile Experience Requirements

Activities must be easy to use from mobile devices.

Members should quickly understand:

* What activities exist.
* When they happen.
* Where they happen.
* Whether they are registered.

The registration process should require minimal interaction.

---

# 16. Future Improvements

Possible future features:

* Activity reminders.
* Activity attendance scanning.
* Activity comments.
* Activity photos.
* Activity history statistics.
* Automatic recommendations.

These are out of scope for the MVP.
