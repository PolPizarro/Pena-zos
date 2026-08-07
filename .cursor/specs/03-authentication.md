# Peña Zos — Authentication Specification

**Version:** 0.1
**Status:** Draft
**Related Documents:**

* 00-product.md
* 01-users-and-roles.md
* 02-data-model.md

---

# 1. Overview

This document defines how users authenticate into the Peña Zos application.

The authentication system must provide:

* Secure access to the application.
* A simple onboarding process for Peña Zos members.
* A way to connect imported members with application accounts.
* Mandatory password change after first access.

---

# 2. Authentication Provider

The application will use Firebase Authentication.

The initial authentication method is:

* Email and password.

Other authentication providers are out of scope for the MVP.

Future possibilities:

* Google authentication.
* Other identity providers.

---

# 3. User Lifecycle

A user account follows this lifecycle:

```text
Member imported
        |
        v
Account created
        |
        v
First login required
        |
        v
Password change required
        |
        v
Active user
```

---

# 4. Member Import and Account Creation

Members are initially imported from an Excel file.

The import process creates or updates `Member` records.

Imported information may include:

* Full name.
* Email address.
* Roles.
* Member status.

The Excel file does not contain passwords.

Passwords must never be stored in the Excel file.

---

# 5. Initial Account Creation

When creating a user account:

The system must:

* Create a Firebase Authentication account.
* Link the Firebase user with the corresponding Member.
* Mark the account as requiring an initial password change.

The initial password should be a temporary password.

Example:

```text
Member:
    Name: Juan Pérez
    Email: juan@example.com

Firebase User:
    Email: juan@example.com
    Password: temporary generated password

Member Status:
    ACTIVE

Authentication Status:
    PASSWORD_CHANGE_REQUIRED
```

---

# 6. First Login Flow

When a user logs in for the first time:

The application must check whether the user has completed the initial password change.

If password change is required:

The user must be redirected to the password change screen.

The user must not access the main application until the password has been changed.

Flow:

```text
Login
  |
  v
Valid credentials?
  |
  v
Password change required?
  |
  +---- Yes ----> Change password
  |
  v
Access application
```

---

# 7. Password Change Requirements

The new password must:

* Be different from the temporary password.
* Meet the minimum Firebase password requirements.
* Be confirmed by entering it twice.

After successful password change:

The system must:

* Remove the password change requirement.
* Allow normal application access.

---

# 8. Account Linking

A Firebase User must be linked to exactly one Member.

Relationship:

```text
Firebase User
      |
      |
      v
  Member
```

The system must prevent:

* One Firebase user linked to multiple members.
* One member linked to multiple Firebase users.

---

# 9. Login Requirements

A user must provide:

* Email address.
* Password.

After successful authentication:

The application retrieves the linked Member information.

The user's permissions are determined from the Member roles.

Example:

```text
Firebase Authentication
        |
        v
Firebase User
        |
        v
Member
        |
        v
Roles
        |
        v
Permissions
```

---

# 10. Password Recovery

The MVP must support password recovery.

Users must be able to request a password reset through their email address.

Firebase Authentication password recovery mechanisms should be used.

---

# 11. Disabled Users

When a member becomes inactive:

The application must allow administrators to disable access.

Disabling a user must:

* Prevent future logins.
* Preserve historical information.
* Not delete the Member record.

Example:

```text
Member:
    status = INACTIVE

User:
    access = DISABLED
```

---

# 12. Administrator Responsibilities

Administrators can:

* Create user accounts.
* Link users with members.
* Disable user access.
* Reset access when required.
* Manage user roles.

Administrators cannot access user passwords.

---

# 13. Security Requirements

The authentication system must guarantee:

* Passwords are never stored in application databases.
* Passwords are never stored in Excel files.
* Users can only access their own accounts.
* Role-based permissions are enforced separately from authentication.
* Disabled users cannot access the application.
* Sensitive authentication operations are restricted.

---

# 14. Future Improvements

Possible future enhancements:

* Invitation-based account creation.
* Magic links.
* Google authentication.
* Two-factor authentication.
* Audit logs.
* Login activity tracking.

These are out of scope for the MVP.
