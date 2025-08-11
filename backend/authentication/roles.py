"""
Define roles and their permissions for RBAC.

We use Django Groups as roles. This module provides a simple mapping that can be
used both on the backend (permission checks) and returned via the profile API
for the frontend to gate UI.
"""

# Permission namespace proposals:
# - admin:*
# - incidents:read, incidents:manage
# - traffic:read
# - reports:read, reports:generate, reports:export
# - control:read, control:write

ROLE_PERMISSIONS = {
    'admin': [
        'admin:*',
        'incidents:read', 'incidents:manage',
        'traffic:read',
        'reports:read', 'reports:generate', 'reports:export',
        'control:read', 'control:write',
    ],
    'traffic_analyst': [
        'traffic:read',
        'reports:read', 'reports:generate',
    ],
    'traffic_controller': [
        'traffic:read',
        'incidents:read', 'incidents:manage',
        'control:read', 'control:write',
        'reports:read',
    ],
    'incident_manager': [
        'incidents:read', 'incidents:manage',
        'reports:read',
    ],
    'viewer': [
        'traffic:read', 'reports:read', 'incidents:read',
    ],
}
