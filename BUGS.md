# Bug / UX Report

## Environment
- **Date**: 2026-04-15
- **App**: AutonomyAI Studio
- **URL**: `https://studio.autonomyai.io/`
- **Browser/OS**: Chrome 142 (Cursor/Electron) on macOS 10.15.7

## Issues

### 1) Password reset request fails with 500 error
- **Severity**: Major
- **Steps to Reproduce**:
  1. Open `https://studio.autonomyai.io/forgot-password`.
  2. Enter `andrei.dobrov1998@gmail.com` in the email/username field.
  3. Submit the form.
- **Expected vs Actual**:
  - **Expected**: A success confirmation is shown (e.g., “If an account exists, we sent you an email”) and the reset email is sent.
  - **Actual**: Inline error message “Something went wrong” is shown (React component: `FormBottom`). Network request fails with **HTTP 500**.
- **Evidence**:
  - **UI text**: `Something went wrong`
  - **API**: `POST https://api.prod.autonomyai.io/auth/v1/oauth/user/cognito/password/forgot` → **500**
- **Screenshot**: `bugScreenshots/forgot-password-500.png` (Forgot Password page showing “Something went wrong” + Network 500)

### 2) Closed PR state not reflected in Chat/Task (allows undeliverable prompts)
- **Severity**: Major
- **Steps to Reproduce**:
  1. Start a new AutonomyAI task/session.
  2. Run a normal flow such as **Plan → Build**, which creates/uses a PR/branch.
  3. Close the PR.
  4. Return to the same Chat/Prompt/AutonomyAI Task and submit new requests (e.g., “send to developers” / create more changes).
- **Expected vs Actual**:
  - **Expected**: The chat/task should detect the PR is closed and either (a) prevent sending new prompts/changes to that closed PR, or (b) automatically create a new branch/PR (or clearly prompt the user to do so) before allowing “send to developers”.
  - **Actual**: Chat/task does not reflect that the PR is already closed, continues accepting prompts as if changes can be delivered, and the resulting changes have **no valid path** to land on the original branch/PR when “send to developers” is used.
    - **Example affected chat**: Project `2be2e0b3-f01d-4cae-8fff-19a534fade7c`, Task `90c21ca1-2b5a-4b18-bbce-d5f9aa20c0ca` (from `https://studio.autonomyai.io/projects/2be2e0b3-f01d-4cae-8fff-19a534fade7c/tasks/90c21ca1-2b5a-4b18-bbce-d5f9aa20c0ca?view=browser`)
- **Screenshot**: N/A (not provided)

### 3) Admin can change own role to Member and deactivate self (account lockout risk)
- **Severity**: Critical
- **Steps to Reproduce**:
  1. Log in as an **Admin** user.
  2. Open `https://studio.autonomyai.io/users`.
  3. In the Users table, locate your own user row.
  4. Change your role from **Admin → Member** using the Role dropdown.
  5. (Optional) In the same row, use the Action controls to **Deactivate** your own account.
- **Expected vs Actual**:
  - **Expected**: The system should prevent admins from removing their own admin privileges and/or deactivating themselves (or require additional safeguards such as another admin approval / “must always have at least one active admin” rule).
  - **Actual**: An admin can change their own role to a non-admin role and can deactivate their own account from the Users page.
- **Screenshot**:
  - `bugScreenshots/users-self-role-change.png` (shows self role change control available)
  - `bugScreenshots/users-actions-hover-deactivate.png` (shows deactivate/self-action controls available)

### 4) Action buttons in Users table are only visible on row hover
- **Severity**: Minor
- **Steps to Reproduce**:
  1. Open `https://studio.autonomyai.io/users`.
  2. Look at the **Action** column for any user row without hovering the row.
  3. Hover a user row and observe the Action column.
- **Expected vs Actual**:
  - **Expected**: Action controls should be consistently discoverable (visible by default, or with a clear affordance like a kebab menu icon).
  - **Actual**: Action buttons appear only on hover, making them easy to miss and harder to use (especially for keyboard-only users).
- **Screenshot**: `bugScreenshots/users-actions-hover-deactivate.png` (buttons only visible on hover)

### 5) Inviting a user without selecting a role triggers API error + misleading message
- **Severity**: Major
- **Steps to Reproduce**:
  1. Log in as an org admin.
  2. Open `https://studio.autonomyai.io/users`.
  3. Click **Invite User**.
  4. Enter an email + name.
  5. Do **not** select a role (leave both **Admin**/**Member** unselected).
  6. Submit the invite.
- **Expected vs Actual**:
  - **Expected**: The form should validate “Role is required” and prevent submission (or show a clear inline validation error).
  - **Actual**: The form still triggers the invite API call, and the UI shows an unrelated/misleading error message: “A user with email … is already a member of this organization. Please check your input and try again.” In observed cases, the network request can return **500 Internal Server Error** (and has also been seen returning **409 Conflict**).
- **Screenshot**:
  - `bugScreenshots/invite-missing-role-generic-error.png` (UI shows generic technical error)
  - `bugScreenshots/invite-missing-role-network-500.png` (Network tab shows `POST https://api.prod.autonomyai.io/auth/v1/users/` → 500)

### 6) Re-inviting a user after canceling their invite returns 409 Conflict
- **Severity**: Major
- **Steps to Reproduce**:
  1. Log in as an org admin.
  2. Open `https://studio.autonomyai.io/users`.
  3. Invite a new user (Pending invite is created).
  4. Cancel/revoke that pending invite.
  5. Attempt to invite the same email again (example: `dreamer5598+1@gmail.com`).
- **Expected vs Actual**:
  - **Expected**: The user should be re-invited successfully (a new pending invite is created) or a clear validation message explains why re-inviting is blocked.
  - **Actual**: Request fails with **409 Conflict** when posting to the Users endpoint.
- **Screenshot**: `bugScreenshots/invite-missing-role-network-409.png` (Network tab shows `POST https://api.prod.autonomyai.io/auth/v1/users/` → 409)

## Observations (from exploratory testing)

- The site is not consistently responsive on smaller/tablet viewports; the smallest usable layout I found was iPad landscape.
- On the login page, submitting the login form with no data does not show any error/validation message.
- On the login page, when deleting text from the email field, it’s not possible to delete the last 2 characters.
- On the login page, the email validation error copy is not user-friendly (e.g., “Please include an '@' in the email address. 'om' is missing an '@'.”).
- On the login page, the form accepts invalid email-like strings (e.g., `om@c`) and shows no validation error.
- In **Integrations → Add a new project**, the flow always opens a new tab to request permissions, even when permissions have already been granted.
- On `https://studio.autonomyai.io/users` (Manage Users), the left-side navigation menu is missing.
- Even if a user cannot belong to multiple organizations at the same time, the organization dropdown is still rendered, which is confusing.
- In **Project Settings → Coding standards**, the Save button state does not reflect whether there are unsaved edits (it doesn’t reliably enable/disable based on changes).
- Showing only the **Draft** state is not very user-friendly; consider exposing additional states (e.g., “Building”, “In progress”, etc.) so users understand what’s happening.
- There’s no clear way to stop/cancel an in-progress prompt/chat once it has started.

