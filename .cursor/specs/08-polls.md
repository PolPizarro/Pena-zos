# Peña Zos — Polls Specification

**Version:** 0.1
**Status:** Draft

**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 1. Overview

Polls provide a generic voting system for Peña Zos members.

The objective of the polling system is to:

* Allow the board to collect opinions from members.
* Centralize decisions related to Peña Zos.
* Replace informal voting through WhatsApp.
* Keep a historical record of decisions.

Polls are not limited to a specific use case.

Examples:

* Choosing a T-shirt design.
* Selecting an activity date.
* Asking who will participate in an event.
* Collecting member preferences.

---

# 2. Poll Lifecycle

A poll follows this lifecycle:

```text id="m83k0n"
Created
   |
   v
Published
   |
   v
Voting open
   |
   v
Voting closed
```

A poll may also be cancelled.

---

# 2a. Poll Status

Possible values:

```text id="p0l1st"
DRAFT
PUBLISHED
CLOSED
CANCELLED
```

`DRAFT` corresponds to "Created" above. Voting is open exactly while `status = PUBLISHED` and the current date is within `startDate`/`endDate`. The board can also close voting early by setting `status = CLOSED` (see §10).

---

# 3. Poll Entity

A poll belongs to a specific Season.

Example:

```text id="e5j1yp"
San Mateo 2026

Poll:
Choose this year's T-shirt design
```

---

# 4. Poll Information

A poll must contain:

```text id="q8a0lz"
Poll
{
    id
    seasonId
    title
    description
    type
    options[]
    startDate
    endDate
    status
    createdBy
    createdAt
    updatedAt
}
```

---

# 5. Poll Types

The MVP supports a generic poll model.

Initial types:

```text id="cz8s6w"
SINGLE_CHOICE
MULTIPLE_CHOICE
```

---

## SINGLE_CHOICE

A member can select only one option.

Example:

```text id="c9md7h"
Which design do you prefer?

A
B
C
```

---

## MULTIPLE_CHOICE

A member can select multiple options.

Example:

```text id="q0p8sh"
Which activities would you join?

□ Activity A
□ Activity B
□ Activity C
```

---

# 6. Poll Options

A poll contains multiple options.

Example:

```text id="s7hk2m"
Poll:

Choose dinner day

Options:

Friday
Saturday
Sunday
```

An option must contain:

```text id="z1v6jf"
PollOption
{
    id
    pollId
    text
    order
}
```

---

# 7. Voting

A vote represents one member's response.

Entity:

```text id="1z8m3f"
Vote
{
    id
    pollId
    memberId
    selectedOptions[]
    createdAt
    updatedAt
}
```

---

# 8. Voting Rules

The system must guarantee:

* A member can only have one active vote per poll.
* Members cannot vote after the poll is closed.
* Members cannot modify votes after the poll is closed.
* Members cannot vote on unpublished polls.

---

# 9. Member Experience

Members can:

* View available polls.
* Read poll information.
* Vote.
* Change their vote while voting is open.
* View their own vote.

Members cannot:

* Create polls.
* Modify polls.
* View private draft polls.
* Modify other members' votes.

---

# 10. Board Management

Board members can:

* Create polls.
* Modify polls.
* Publish polls.
* Open and close voting.
* Cancel polls.
* View results.

---

# 11. Poll Results

Results must be available to authorized users.

Board members can always view results.

Member access to results depends on poll configuration.

Future versions may allow:

* Anonymous results.
* Results visible after voting.
* Results visible only after closing.

For the MVP:

Default behavior:

```text id="9w4q6b"
Members:
Can vote.

Board:
Can view results.

Members:
Cannot view results unless explicitly enabled.
```

---

# 12. Poll Configuration

Future-ready configuration:

```text id="5s4jhf"
Poll
{
    showResultsBeforeClosing
    anonymousVoting
    allowVoteChanges
}
```

The MVP should implement:

* Allow vote changes while open.
* Non-anonymous voting.
* Board access to results.

---

# 13. Permissions

## MEMBER

Allowed:

* View published polls.
* Vote.
* Modify own vote while open.
* View own vote.

Not allowed:

* Create polls.
* Modify polls.
* View draft polls.
* View other members' votes.

---

## BOARD

Allowed:

* Full poll management.
* View all votes.
* View results.
* Close polls.

---

## ADMIN

ADMIN does not automatically gain poll management permissions.

An administrator requires the BOARD role to manage polls.

---

# 14. Validation Rules

The application must validate:

* A poll must belong to a season.
* A poll must have at least two options.
* A single-choice poll cannot have multiple selections.
* A closed poll cannot receive votes.
* A member cannot vote multiple times.
* Only authorized users can manage polls.

---

# 15. Mobile Experience Requirements

Voting must be optimized for smartphones.

The member should be able to:

* Open a poll.
* Understand the question.
* Select an option.
* Submit the vote.

The process should require minimal steps.

---

# 16. Future Improvements

Possible future features:

* Anonymous voting.
* Voting statistics.
* Poll templates.
* Automatic reminders.
* Weighted votes.
* Member categories.
* Decision history.

These are out of scope for the MVP.
