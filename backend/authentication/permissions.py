from rest_framework.permissions import BasePermission, SAFE_METHODS

class RolePermission(BasePermission):
    """
    Permission class that checks if the current user has the required permissions
    specified on the view via a REQUIRED_PERMISSIONS mapping per action.

    Behavior:
    - If REQUIRED_PERMISSIONS is not defined for the action, require authentication only
    - If defined, user must be authenticated and possess at least one of the required perms
      via their role mapping (see authentication.roles.ROLE_PERMISSIONS)
    - Admin short-circuit: if user is in 'admin' group, allow
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        # Require authenticated for all protected endpoints
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # If view defines required permissions per action, enforce them
        required = []
        if hasattr(view, 'REQUIRED_PERMISSIONS') and isinstance(view.REQUIRED_PERMISSIONS, dict):
            action = getattr(view, 'action', None)
            required = view.REQUIRED_PERMISSIONS.get(action, [])

        # Admin override
        if user.groups.filter(name='admin').exists():
            return True

        # If nothing required, authenticated is enough
        if not required:
            return True

        # Check user's effective permissions from roles
        try:
            from .roles import ROLE_PERMISSIONS
        except Exception:
            ROLE_PERMISSIONS = {}

        roles = set(user.groups.values_list('name', flat=True))
        user_perms = set()
        for r in roles:
            user_perms.update(ROLE_PERMISSIONS.get(r, []))

        # Support wildcard matching like 'incidents:*'
        for needed in required:
            if needed in user_perms:
                return True
            # wildcard category
            if ':' in needed:
                prefix = needed.split(':', 1)[0] + ':'
                # If user has category wildcard
                if any(p.startswith(prefix) and p.endswith('*') for p in user_perms):
                    return True
        return False
