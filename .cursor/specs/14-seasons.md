# Peña Zos — Seasons Specification

**Version:** 0.1  
**Status:** Draft

**Related Documents:**
- 00-product.md
- 01-users-and-roles.md
- 02-data-model.md
- 10-orders.md
- 13-finances.md

---

# 1. Overview

The season module represents a specific San Mateo festivities edition managed by Peña Zos.

A season groups all information related to one edition of the festivities.

Examples:

    San Mateo 2026

    San Mateo 2027

The purpose of seasons is:

- Separate information between different years.
- Keep historical information.
- Allow future editions to be created without deleting previous data.
- Avoid mixing information between different San Mateo editions.

---

# 2. Season Lifecycle

A season follows this lifecycle:

    Created
       |
       v
    Planning
       |
       v
    Active
       |
       v
    Finished
       |
       v
    Archived

---

# 3. Season States

Possible values (must match 02-data-model.md and 15-firestore-data-model.md):

    PLANNING

    ACTIVE

    FINISHED

    ARCHIVED

---

## PLANNING

The board is preparing the festivities.

During this state:

- Tasks can be created.
- Products can be configured.
- Orders can be opened.
- Dinners can be prepared.
- Activities can be created.
- Events can be created.
- Polls can be created.
- Inventory can be reviewed.

---

## ACTIVE

The San Mateo festivities are happening.

During this state:

- Members use the application for:
  - Calendar.
  - Tasks.
  - Activities.
  - Events.
  - Deliveries.
  - Orders.

---

## FINISHED

The festivities have just finished.

During this state:

- Historical information remains available.
- Operational changes should not be allowed.
- The board reviews the season before archiving it.

---

## ARCHIVED

The season has been fully closed out by the board.

During this state:

- Historical information remains available and read-only.
- No further changes are expected.

---

# 4. Season Entity

Entity:

    Season
    {
        id
        name
        year
        startDate
        endDate
        status
        ordersOpen
        createdAt
        updatedAt
    }

`ordersOpen` (boolean) controls member ordering independently of `status` — a season stays ACTIVE the whole time (calendar, tasks, deliveries keep working), but the board can close ordering on its own once the ordering window is over, e.g. when moving into delivery preparation. See 10-orders.md §9a.

---

# 5. Season Naming

The default naming format is:

    San Mateo YYYY

Example:

    San Mateo 2026

The board may modify the display name if required.

---

# 6. Season Dates

A season contains the relevant dates for the edition.

Examples:

    Preparation period:

    August - September


    Festivities period:

    Third week of September

The exact dates are configurable.

---

# 7. Active Season

Only one season should normally be active at the same time.

Example:

    Current season:

    San Mateo 2026
    ACTIVE


    Previous season:

    San Mateo 2025
    ARCHIVED

---

# 8. Season Relationships

The following entities belong to a season:

- Dinners.
- Tasks.
- Activities.
- Events.
- Polls.
- Inventory.
- Products.
- Orders.
- Deliveries.

Financial movements are Future / Post-MVP (see 13-finances.md) and are not created under a season in the MVP.

Example:

    San Mateo 2026

        |
        +-- Dinners
        |
        +-- Tasks
        |
        +-- Activities
        |
        +-- Events
        |
        +-- Polls
        |
        +-- Inventory
        |
        +-- Products
        |
        +-- Orders
        |
        +-- Deliveries

(Finances is Future / Post-MVP.)

---

# 9. Member Relationship

Members are not created per season.

A member exists independently from a season.

Example:

    Member:

    Juan Pérez


    Participations:

    San Mateo 2025
    San Mateo 2026
    San Mateo 2027

The same member can participate in multiple seasons.

---

# 10. Season Access

Members should normally access:

- The current active season.
- Historical seasons if enabled.

Historical seasons are read-only.

---

# 11. Member Experience

Members can:

- View active season information.
- Access current activities.
- Access current tasks.
- Access current orders.
- Access current deliveries.
- View calendar information.

Members cannot:

- Create seasons.
- Modify seasons.
- Activate seasons.
- Finish and archive seasons.

---

# 12. Board Management

Board members can:

- Create seasons.
- Configure season dates.
- Activate seasons.
- Finish and archive seasons.
- Access historical information.

---

# 13. Season Closing

When a season is finished and archived:

The application preserves:

- Tasks.
- Events.
- Activities.
- Polls.
- Orders.
- Deliveries.
- Inventory information.

(Financial movements will also be preserved once Finances is in scope — see 13-finances.md.)

Finished and archived seasons are read-only.

---

# 14. Permissions

## MEMBER

Allowed:

- View active season information.
- View historical information if enabled.

---

## BOARD

Allowed:

- Create seasons.
- Modify seasons.
- Activate seasons.
- Mark seasons as finished and archive them.
- View historical seasons.

---

## TREASURER

No additional MVP permissions beyond MEMBER. Access to financial information from seasons is Future / Post-MVP — see 13-finances.md.

---

## ADMIN

Allowed:

- Technical administration.
- Season management if assigned the required role.

---

# 15. Validation Rules

The application must validate:

- Season year is required.
- Season name is required.
- Only one season can be ACTIVE.
- Finished and archived seasons cannot be modified.
- Historical information must not be deleted.

---

# 16. Mobile Experience Requirements

Season selection should be simple.

Most members should only interact with:

    Current season:

    San Mateo 2026

Advanced season management is only required for board members.

---

# 17. Future Improvements

Possible future features:

- Season templates.
- Copy previous season configuration.
- Automatic creation of yearly structure.
- Season statistics.
- Historical comparisons.

These are out of scope for the MVP.