# EAS Troubleshooting & Permissions

This document helps when you face permission errors or outdated EAS CLI issues.

## Common errors

- `Entity not authorized: AppEntity[<projectId>]` — occurs when the logged in Expo account doesn't have access to the EAS project.
- `eas-cli@x.y.z is now available` — you can upgrade, but it's optional; sometimes older EAS CLI lacks newer commands.

## Quick checks

1. Who are you logged in as?
```bash
eas whoami
```

2. If you're not the correct account, logout and login with the account that owns the project:
```bash
eas logout
eas login
```

3. If the project is owned by an organization, ensure your user has access in the Expo dashboard (Project Settings > Members).

4. If you can't get access, create a new EAS project with the current account:
```bash
eas init
# follow prompts to create a new project
```

## Upgrading EAS CLI (if you have permission)

```bash
npm install -g eas-cli
# or
yarn global add eas-cli
```

## If you see 'Entity not authorized' for a project you own
- Confirm the organization's owner has not restricted access.
- Re-invite your user to the Expo organization or ask the owner to run `expo whoami` and `expo organizations:list` to confirm.

## Additional resources
- https://docs.expo.dev/build/eas-cli/
- Expo Dashboard: https://expo.dev/dashboard
