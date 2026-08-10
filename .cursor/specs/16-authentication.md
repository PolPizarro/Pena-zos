# Peña Zos — Authentication Specification

**Version:** 0.1  
**Status:** Draft

**Related Documents:**
- 00-product.md
- 01-users-and-roles.md
- 02-data-model.md
- 15-firestore-data-model.md

---

# 1. Overview

The application uses Firebase Authentication to manage user access.

Authentication is separated from application data.

Firebase Authentication manages:

- User credentials.
- Login process.
- Password recovery.
- User sessions.

Firestore manages:

- User profile.
- Roles.
- Permissions.
- Member information.

---

# 2. Authentication Method

The MVP uses:

- Email and password authentication.

No external authentication providers are required.

Supported login:

- Email.
- Password.

---

# 3. User Creation Process

Users are not allowed to register themselves.

All users are created by application administrators through the initial import process.

The initial source of users is the Peña Zos Excel file.

The creation process creates or updates, in this order:

1. The `Member` document (business identity and roles), as defined in 02-data-model.md and 15-firestore-data-model.md.
2. A Firebase Authentication account.
3. The `User` document, linked to the Member through `memberId`.

The `User` document never duplicates information already stored on the `Member` document.

---

## 3.1 Account Creation Without Losing the Admin Session

The Firebase Authentication client SDK signs the browser into any account it creates. If the administrator's browser created the new member's account directly, it would replace the administrator's own session.

To avoid this without introducing a backend, account creation uses a second, temporary Firebase App instance (same project, same config) purely to call the account-creation SDK method and immediately sign out of it. The administrator's session in the primary app instance is never touched. All Firestore writes (the `Member` and `User` documents) are performed through the primary app instance, authenticated as the administrator, so 17-security-rules.md's `ADMIN`-only rules apply normally.

This keeps the architecture "Firebase only, no custom backend" per 18-application-architecture.md.

---

# 4. Initial Excel Import

The Excel file contains, per row:

- Nombre (first name).
- Apellidos (surname).
- Email.
- DNI (national ID).
- Roles.

`Nombre` and `Apellidos` are combined into `fullName` on import. `DNI` is required, unique, and is the key used to match rows on re-import (not the email) — see 01-users-and-roles.md §5.

Example:

Nombre:
Juan

Apellidos:
Pérez

Email:
juan@example.com

DNI:
12345678A

Roles:
- MEMBER
- BOARD

This information is stored on the `Member` document, not on the `User` document. `status` defaults to `PENDING_ACCESS` until the account is created (§5).

---

# 5. Firebase Authentication User

Firebase Authentication stores only authentication information.

Stored information:

- Firebase UID.
- Email.
- Password credentials managed by Firebase.

The password is never stored in Firestore.

The Firebase UID is the unique identifier used to link authentication with application data.

---

# 6. Firestore User Document

After creating the Firebase Authentication user, the application creates the user document.

Path:

users/{uid}

Stored information:

- Firebase UID.
- Linked member identifier (`memberId`).
- Email.
- Password change status (`mustChangePassword`).
- Creation date.
- Update date.

The `User` document is a technical record only. It does not store name, phone, roles, or active status.

That information belongs to the linked `Member` document (see 02-data-model.md and 15-firestore-data-model.md) and must be read through `memberId`.

Example:

User (users/abc123):

```
firebaseUid: abc123
memberId: member_456
email: juan@example.com
mustChangePassword: true
```

Linked Member (members/member_456):

```
fullName: Juan Pérez
roles: [MEMBER, BOARD]
status: ACTIVE
```

---

# 7. Initial Password

When users are imported:

- A temporary password is generated.
- The user receives access information by email.
- The user receives a WhatsApp notification informing that the application is available.

The temporary password must not be stored in Firestore.

---

# 8. First Login

After the first successful login, the application checks if the user must change the password.

The field:

mustChangePassword

is used for this purpose.

If:

mustChangePassword = true

The user must change the password before accessing the application.

Flow:

Login

↓

Validate credentials

↓

Load user profile

↓

Check password change requirement

↓

Force password change

↓

Access application

---

# 9. Password Change

Users can change their password from the application.

Requirements:

- New password.
- Password confirmation.

After successful password change:

mustChangePassword = false

The user can continue using the application normally.

---

# 10. Password Recovery

Users can recover access using Firebase password recovery.

Process:

User enters email

↓

Firebase sends recovery email

↓

User changes password

↓

User accesses application

---

# 11. Login Process

Application login flow:

1. User opens the application.
2. User enters email and password.
3. Firebase Authentication validates credentials.
4. Application receives Firebase UID.
5. Application loads the Firestore `User` document (`users/{uid}`).
6. Application loads the linked `Member` document (`members/{memberId}`) and reads its roles and status.
7. Application applies permissions.
8. User accesses available features.

---

# 12. Member Status

Access depends on the linked Member's `status` field, as defined in 02-data-model.md.

Possible values:

- ACTIVE.
- INACTIVE.
- PENDING_ACCESS.

Members with status other than `ACTIVE` cannot access the application.

---

# 13. Role Loading

After authentication, the application loads the roles stored on the linked `Member` document.

A member can have multiple roles.

Example:

Member:

Juan Pérez

Roles:

- MEMBER.
- BOARD.

Roles determine which sections and actions are available.

---

# 14. Authentication Permissions

Authentication only validates the identity of the user.

Authorization is managed through roles.

Available roles:

- MEMBER.
- BOARD.
- TREASURER.
- ADMIN.

---

# 15. Security Rules Principles

Firestore security rules must validate:

- The user is authenticated.
- The user profile exists.
- The user has the required role.

Examples:

MEMBER:

- Can access allowed member information.
- Can access personal information.

BOARD:

- Can manage operational information.

TREASURER:

- Can manage financial information.

ADMIN:

- Can manage technical configuration.

---

# 16. Logout

Users can logout from the application.

Logout:

- Ends Firebase Authentication session.
- Returns the user to the login screen.

---

# 17. Session Management

The application uses Firebase Authentication session management.

The MVP does not require:

- Custom sessions.
- Manual JWT management.
- Custom token storage.

---

# 18. User Import Security

Only users with ADMIN role can execute user imports.

The import process must validate:

- Email uniqueness.
- Required fields.
- Valid roles.
- Correct user data.

---

# 19. Validation Rules

The application must validate:

- Email is required.
- Email must be unique.
- Users must have at least one role.
- Inactive users cannot login.
- Users without a Firestore profile cannot access protected areas.

---

# 20. Future Improvements

Possible future improvements:

- Two-factor authentication.
- Automatic user synchronization.
- QR based access.
- Advanced account management.

These are out of scope for the MVP.