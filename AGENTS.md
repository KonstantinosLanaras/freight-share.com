# Authentication
- Keep protected routes loading until database-assigned roles are resolved, and ignore stale account requests; workspace selection must not race session restoration.
- Admin views use the complete database-assigned role list, not the active workspace role, so multi-role admins retain access.