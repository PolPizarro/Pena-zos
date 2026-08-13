# Peña Zos — UI Navigation Specification

**Version:** 0.1  
**Status:** Draft

**Related Documents:**
- 00-product.md
- 01-users-and-roles.md
- 14-seasons.md
- 18-application-architecture.md

---

# 1. Overview

The application provides a responsive web interface for Peña Zos members.

The user interface must adapt depending on the roles assigned to each user.

The main objective is:

- Provide simple access for regular members.
- Provide management tools for board members.
- Provide restricted access to financial and technical areas.

---

# 2. General Navigation

The application uses a main navigation menu.

The visible options depend on user permissions.

Common navigation:

- Home.
- Calendar.
- Tasks.
- Dinners.
- Activities.
- Events.
- Polls.
- Orders.
- Deliveries.

Restricted navigation:

- Inventory.
- Finances.
- Users.
- Administration.

---

# 3. Login Screen

The login screen allows users to access the application.

Fields:

- Email.
- Password.

Actions:

- Login.
- Recover password.

After successful login:

- Load user profile.
- Load roles.
- Redirect to home.

---

# 4. First Login Password Change

If the user must change the password:

The application must show a mandatory password change screen.

The user cannot access the rest of the application until the password is changed.

---

# 5. Home Screen

The home screen is the main entry point.

The content depends on the user role.

Information shown:

- Current San Mateo season.
- Upcoming events.
- Pending tasks.
- Pending actions.

---

# 6. Member Navigation

Users with MEMBER role can access:

- Home.
- Calendar.
- Tasks.
- Dinners.
- Activities.
- Events.
- Polls.
- Orders.
- Deliveries.

Members cannot access:

- Finances.
- User management.
- Application administration.

---

# 7. Board Navigation

Users with BOARD role can access everything available to members plus:

- Dinner management.
- Task management.
- Activity management.
- Event management.
- Poll management.
- Product management.
- Order management.
- Delivery management.
- Inventory management.

---

# 8. Treasurer Navigation

In the MVP, the TREASURER role does not grant any navigation beyond the MEMBER role, per 01-users-and-roles.md §10.

Users with TREASURER role can access:

- Home.
- Calendar.

The Finances screen and any order-payment management for Treasurers are Future / Post-MVP, per 13-finances.md. They are documented in §19 below for future reference only.

Treasurers cannot access technical administration unless they have another role.

---

# 9. Administrator Navigation

Users with ADMIN role can access:

- User management.
- Role management.
- Application configuration.
- Technical administration.

Administrators can also access other sections if they have additional roles.

---

# 10. Calendar Screen

The calendar displays all relevant dates.

Information shown:

- Dinners.
- Activities.
- Events.
- Important dates.

Members:

- View calendar.

Board:

- Create and modify calendar entries.

---

# 11. Tasks Screen

The tasks screen manages Peña Zos responsibilities.

Member view:

- List assigned tasks.
- View task details.
- Mark completion if allowed.

Board view:

- Create tasks.
- Assign members.
- Modify tasks.
- Track completion.

---

# 12. Dinners Screen

The dinners section manages Peña Zos dinners.

Member view:

- View available dinners.
- Confirm attendance.
- Add number of guests.
- View payment status.

Board view:

- Create dinners.
- Modify dinners.
- View attendance.
- Manage guest information.

---

# 13. Activities Screen

The activities section shows Peña Zos activities.

Member view:

- View activities.
- Participate when required.

Board view:

- Create activities.
- Modify activities.

---

# 14. Events Screen

The events section shows San Mateo events.

Member view:

- View events.

Board view:

- Create events.
- Modify events.

---

# 15. Polls Screen

The polls section manages voting.

Member view:

- View active polls.
- Vote once.
- View own responses.

Board view:

- Create polls.
- Define options.
- Review results.
- Close polls.

---

# 16. Orders Screen

The orders section manages product requests.

Member view:

- View available products.
- Create orders.
- View own orders.

Board view:

- Manage products.
- Review all orders.
- Prepare deliveries.

---

# 17. Deliveries Screen

The deliveries section manages the delivery package before San Mateo.

Member view:

- View assigned delivery.
- View received items.

Board view:

- Prepare deliveries.
- Confirm delivery.
- Update delivery status.

---

# 18. Inventory Screen

The inventory section manages reusable materials.

Access:

- BOARD.
- ADMIN.

Features:

- View inventory.
- Add items.
- Update quantities.
- Add notes.

---

# 19. Finances Screen (Future / Post-MVP)

This screen is not built in the MVP. See 13-finances.md.

The finances section is restricted.

Access:

- TREASURER.
- ADMIN.

Features:

- View income.
- View expenses.
- Add financial movements.
- Review balance.

---

# 20. User Management Screen

The user management section is restricted.

Access:

- ADMIN.

Features:

- View users.
- Import users.
- Modify roles.
- Enable or disable users.

---

# 20a. Visual Identity

The application uses Peña Zos's own colors: red and blue.

Navigation on narrow screens collapses behind a toggled menu button, since the number of sections does not fit a single row (§2).

---

# 21. Responsive Requirements

The application must be optimized for mobile usage.

Mobile requirements:

- Simple navigation.
- Large touch targets.
- Avoid complex tables.
- Prioritize current season information.

Desktop improvements:

- More detailed tables.
- Better management views.
- More simultaneous information.

---

# 22. Error and Empty States

The application must show clear messages.

Examples:

No tasks:

"No assigned tasks."

No orders:

"You have no active orders."

No permissions:

"You do not have access to this section."

---

# 23. Future Improvements

Possible future improvements:

- Push notifications.
- Progressive Web App installation.
- Advanced dashboards.
- Custom themes.
- Native mobile application.

These are out of scope for the MVP.