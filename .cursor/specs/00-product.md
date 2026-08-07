# Peña Zos — Product Specification

**Version:** 0.1
**Status:** Draft
**Last updated:** 2026-08-07

---

## 1. Product Overview

Peña Zos is a responsive web application designed to help the members and board of Peña Zos plan, organize, manage, and track the San Mateo festivities in Monzón.

The application will centralize activities that are currently managed through meetings, WhatsApp, spreadsheets, and other informal methods.

The application will support the complete lifecycle of the festivities:

1. Preparation in the weeks before the festivities.
2. Organization during the weekend before the festivities.
3. Management during the San Mateo week.
4. Post-festivities review and preparation for the annual balance.

The application must be reusable every year, while keeping the data of each San Mateo edition separate.

Example:

```text
San Mateo 2026
San Mateo 2027
San Mateo 2028
```

---

# 2. Goals

## 2.1 Primary Goals

The application must:

* Centralize information related to the festivities.
* Reduce dependency on WhatsApp, spreadsheets, and manually maintained documents.
* Make it easy for members to know what they have to do and when.
* Help the board organize dinners, activities, events, and tasks.
* Track attendance for dinners and activities.
* Manage dinner guests accompanying members.
* Manage T-shirt and sweatshirt orders.
* Manage Peña Zos inventory.
* Manage pre-festival deliveries.
* Allow the board to create and manage polls and votes.
* Maintain a historical record of each San Mateo edition.
* Work correctly on both mobile devices and desktop computers.

## 2.2 Secondary Goals

The application should:

* Be easy to use for members with limited technical knowledge.
* Require minimal maintenance.
* Be maintainable by technically skilled members of Peña Zos.
* Have an operational cost of €0 whenever possible.
* Allow future functionality to be added without requiring a complete rewrite.

---

# 3. Non-Goals

The following features are explicitly out of scope for the initial MVP:

* Native Android application.
* Native iOS application.
* Google Play Store publication.
* Apple App Store publication.
* Push notifications.
* Photo gallery.
* Internal chat.
* Internal social network.
* Full accounting system.

### Expenses and Accounts

Expense and account management are out of scope for the initial MVP.

The treasurer will continue using the current system to manage Peña Zos finances.

The architecture should allow this functionality to be added in a future version without requiring a major redesign.

---

# 4. Users and Roles

A user can have multiple roles simultaneously.

The initial roles are:

* `MEMBER`
* `BOARD`
* `TREASURER`
* `ADMIN`

Permissions are cumulative.

For example, a user may have:

```text
MEMBER
BOARD
ADMIN
```

while another user may only have:

```text
MEMBER
BOARD
```

---

## 4.1 MEMBER

This is the basic role for a Peña Zos member.

A member can:

* View the calendar.
* View their assigned tasks.
* View activities.
* Sign up for activities.
* View San Mateo events.
* Participate in polls and votes.
* Respond to dinner attendance surveys.
* Specify the number of guests attending a dinner.
* Submit T-shirt and sweatshirt orders.
* View relevant information about the festivities.
* View the status of their own deliveries.

A member cannot:

* Create or modify dinners.
* Create or modify tasks.
* Assign tasks.
* Manage inventory.
* Manage members.
* Manage activities.
* Manage global orders.
* Manage global deliveries.
* Access administrative functionality.

---

## 4.2 BOARD

The `BOARD` role provides access to the management functionality required to organize the festivities.

A board member can:

* Perform everything available to a `MEMBER`.
* Create and modify dinners.
* Manage dinner attendance.
* Manage dinner guests.
* Create and manage activities.
* Create and manage events.
* Create and manage tasks.
* Assign tasks to members.
* Manage inventory.
* Manage orders.
* Manage deliveries.
* Create and manage polls.
* View global information related to the current San Mateo edition.

A board member cannot:

* Access expense and account management.
* Perform functionality restricted to the treasurer.

---

## 4.3 TREASURER

The `TREASURER` role will provide access to financial functionality when it is implemented.

Since financial management is outside the initial MVP, this role will not provide significant additional functionality initially.

The architecture should allow the following functionality to be added later:

* Expenses.
* Income.
* Payments.
* Financial balance.
* Financial summaries.
* Financial information related to dinners and orders.

---

## 4.4 ADMIN

The `ADMIN` role provides access to application administration and configuration.

Access to this role will be restricted to selected technically skilled members of the board.

An administrator can:

* Manage users.
* Manage roles.
* Activate and deactivate users.
* Import members from Excel.
* Configure application-level functional settings.
* Perform administrative maintenance tasks.
* Access diagnostic or maintenance functionality introduced in future versions.

Having the `ADMIN` role does not automatically grant access to financial information.

An administrator may also have `BOARD` and/or `TREASURER` roles.

---

# 5. Members

The application must maintain a record of Peña Zos members.

Peña Zos currently maintains member information in an Excel spreadsheet.

The application must allow administrators to import members from this spreadsheet.

The imported information may include:

* Member identification data.
* Roles.
* Information required to provide application access.

The import process must support updating existing members without creating duplicates.

After import, the application database becomes the source of truth for member information.

The Excel file is an import/update mechanism, not the application's primary data store.

---

# 6. Seasons

The festivities must be organized by editions, referred to as `Seasons`.

Each season represents a specific San Mateo celebration.

Example:

```text
San Mateo 2026
San Mateo 2027
San Mateo 2028
```

Each season contains its own:

* Dinners.
* Activities.
* Events.
* Tasks.
* Polls.
* Orders.
* Inventory.
* Deliveries.
* Participation data.

Historical season data must be preserved.

Data belonging to one season must not accidentally modify data belonging to another season.

---

# 7. Dinners

Dinners are a dedicated entity in the application.

A dinner must contain, at minimum:

* Name.
* Date.
* Time.
* Relevant information.
* Status.

Members can indicate whether they will attend.

Dinners are free for members.

Members can bring guests.

For each dinner, the application must record:

* Whether the member is attending.
* Number of guests.
* Cost associated with the guests.
* Payment status for the guests.

The MVP does not require storing personal information about individual guests.

Example:

```text
Member: Juan

Attending: Yes
Guests: 2
Guest cost: €20
Payment: Pending
```

The board must be able to view a global summary of dinner attendance and guest counts.

---

# 8. Activities

Activities represent events or activities organized by Peña Zos.

Members can view activities and sign up when required.

An activity may contain:

* Name.
* Description.
* Date.
* Time.
* Location.
* Capacity, if applicable.
* Status.
* Additional information.

The board can create, modify, and manage activities.

---

# 9. Events

Events represent San Mateo events that should be available to Peña Zos members.

Members can view these events from the calendar or the corresponding section.

An event may contain:

* Name.
* Description.
* Date.
* Time.
* Location.
* Additional information.

The board can create and modify events.

---

# 10. Tasks

The application will manage the tasks required to organize the festivities.

Tasks can be assigned to:

* Members.
* Board members.

Examples include:

* Serving food.
* Collecting food.
* Serving mojitos.
* Reserving dinners.
* Picking up dinners.
* Contacting drink suppliers.
* Other organizational tasks.

A task may contain:

* Title.
* Description.
* Date.
* Time.
* Duration, if applicable.
* Number of required people.
* Assigned people.
* Status.
* Task type.

Minimum task statuses:

```text
PENDING
IN_PROGRESS
COMPLETED
CANCELLED
```

Members can view their own tasks.

The board can create, modify, assign, and complete tasks.

---

# 11. Inventory

The application will manage Peña Zos inventory.

Inventory management will initially focus on identifying products remaining from previous editions and determining what can be reused.

An inventory item must contain at least:

* Name.
* Description, if applicable.
* Quantity.
* Unit.
* Status.
* Additional information.

Example units include:

* Units.
* Liters.
* Boxes.
* Kilograms.

The system must allow inventory entries and removals to be recorded when necessary.

The board can view and modify inventory.

Inventory must be associated with a specific season.

---

# 12. Orders

The application will collect clothing orders from members.

Initial product types:

* Current year's San Mateo T-shirt.
* Peña Zos standard T-shirt.
* Sweatshirt.

For each order, the application must record:

* Member.
* Product.
* Size.
* Quantity.
* Payment status.

The application is primarily responsible for:

1. Collecting orders.
2. Providing the totals required to place the physical order.
3. Recording payments.
4. Recording delivery.

The physical purchase of the clothing is performed outside the application.

The clothing will be delivered during the weekend before the festivities.

---

# 13. Pre-Festival Deliveries

During the weekend before the festivities, several items are distributed to members.

The application must track these deliveries.

Initial delivery items:

* Drinks voucher.
* Dinner voucher.
* Peña patch.
* Interpeñas / SEMPA voucher.
* T-shirts.
* Sweatshirts.

The application must allow the board to record which items each member has received.

Example:

```text
Juan

Drinks voucher       ✅
Dinner voucher       ✅
Peña patch           ✅
SEMPA voucher        ❌
T-shirt              ✅
Sweatshirt           ❌
```

The board can register deliveries.

Members can view the status of their own deliveries.

---

# 14. Polls and Voting

The application will provide a generic polling and voting system.

Polls can be used for any question or decision related to Peña Zos.

Polls are not limited to a specific type of question.

A poll may contain:

* Title.
* Description.
* Options.
* Start date.
* End date.
* Status.
* Eligible participants.

Users can vote when they are authorized to participate.

The board can create and manage polls.

Results must be accessible according to the user's permissions.

The system should allow future versions to support different voting mechanisms without requiring a complete redesign.

---

# 15. Calendar

The application will provide a centralized calendar.

The calendar may display:

* Dinners.
* Activities.
* Events.
* Tasks.
* Other relevant events.

Users must be able to use the calendar comfortably on mobile devices.

Displayed information must respect the user's permissions.

For example:

* A member can see their own tasks.
* A board member can see all relevant tasks.

---

# 16. Festival Lifecycle

The application must support the normal Peña Zos festival lifecycle.

## Preparation

During the month before the festivities:

* The board holds planning meetings.
* Dinners are planned.
* Activities are created.
* Tasks are created.
* Responsibilities are assigned.
* Dinner attendance is collected.
* Clothing orders are collected.
* Inventory is reviewed.
* The festivities are organized.

## Weekend Before the Festivities

The following are managed:

* Voucher delivery.
* Patch delivery.
* Interpeñas / SEMPA voucher delivery.
* T-shirt delivery.
* Sweatshirt delivery.

## San Mateo Week

The following are managed:

* Dinners.
* Activities.
* Events.
* Tasks.
* Member participation.
* Relevant organizational information.

## After the Festivities

The board meets to review the festivities.

An assembly is subsequently held.

The application must preserve the information required to review what happened during the season.

---

# 17. Responsive Web Application

The application will be exclusively a responsive web application.

It must work correctly on:

* Smartphones.
* Tablets.
* Desktop computers.

The primary usage scenario during the festivities is expected to be smartphones.

Native Android and iOS applications are out of scope for the MVP.

The application may be implemented as a Progressive Web App (PWA) so that users can install it on their mobile devices without using an app store.

---

# 18. Cost Constraints

The target operational cost is **€0 per month**.

The application should use services with free tiers sufficient for the expected Peña Zos usage.

No paid service or feature should be introduced without explicit approval.

The application must be designed to operate within the Firebase free-tier limits while the number of users and operations remains reasonable.

---

# 19. Security

The application must enforce role-based access control.

Authorization must be enforced at the data/backend level and not only by hiding UI elements.

An unauthorized user must not be able to access protected data by manipulating requests from the browser.

Financial data, when implemented, must have dedicated access controls.

Administrative functionality must only be accessible to users with the `ADMIN` role.

---

# 20. Data Ownership

The data belongs to Peña Zos.

The application must preserve historical data for different San Mateo seasons.

The architecture should avoid unnecessary vendor lock-in that would make it difficult to migrate the data to another system in the future.

---

# 21. MVP Definition

The MVP is considered complete when it allows Peña Zos to:

1. Import members from Excel.
2. Manage users and multiple roles.
3. Create and manage a San Mateo season.
4. Create and manage dinners.
5. Collect dinner attendance.
6. Record the number of guests.
7. Record guest payments.
8. Create and manage activities.
9. Create and manage events.
10. Create and assign tasks.
11. Allow members to view their own tasks.
12. Manage inventory.
13. Collect T-shirt and sweatshirt orders.
14. Record order payments.
15. Manage pre-festival deliveries.
16. Manage drinks vouchers, dinner vouchers, the Peña patch, and Interpeñas / SEMPA vouchers.
17. Create and manage polls and votes.
18. Display relevant information through a centralized calendar.
19. Work correctly on mobile and desktop.
20. Keep data separated by San Mateo season.

---

# 22. Future Features

The following features may be added in future versions:

* Full expense and income management.
* Account management.
* Automatic financial balance.
* Treasurer-specific functionality.
* Historical statistics across seasons.
* Notifications.
* External service integrations.
* Advanced inventory management.
* Administrative process automation.
* Additional voting mechanisms.
* Additional activity and event types.

Future features must not unnecessarily complicate the MVP.

The architecture should avoid blocking their future implementation.

---

# 23. Product Principles

The following principles guide the development of Peña Zos.

### Simplicity First

The application should solve Peña Zos's real needs without unnecessary complexity.

### Mobile First

The mobile experience has priority because smartphones will be the primary devices used during the festivities.

### No Overengineering

Technologies, services, abstractions, and patterns should only be introduced when they provide a clear benefit.

### Security by Default

Authorization and data protection must be considered from the beginning.

### Specification First

A feature must be defined in its specification before it is implemented.

### Reusable Every Year

The application must support new San Mateo seasons without requiring a separate installation.

### Free by Design

When multiple technically valid alternatives exist, prefer the option that helps maintain an operational cost of €0.

### Maintainability

The codebase must remain simple enough for technically skilled members of Peña Zos to maintain and evolve.

### Explicit Scope

Cursor must not introduce new product functionality that is not defined in the specifications.

If a requirement is ambiguous, the implementation should not invent business rules. The ambiguity should be documented and resolved before implementation.
