from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from authentication.permissions import RolePermission
from authentication.roles import ROLE_PERMISSIONS
from incidents.models import AuditLog

class AdminRoleViewSet(viewsets.ViewSet):
    permission_classes = [RolePermission]
    REQUIRED_PERMISSIONS = {
        'assign': ['admin:*'],
        'list_roles': ['admin:*'],
    }

    @action(detail=False, methods=['get'])
    def list_roles(self, request):
        roles = list(ROLE_PERMISSIONS.keys())
        return Response({'roles': roles}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def assign(self, request):
        user_id = request.data.get('user_id')
        username = request.data.get('username')
        roles = request.data.get('roles', [])

        if not roles or not isinstance(roles, list):
            return Response({'error': 'roles must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate roles
        invalid = [r for r in roles if r not in ROLE_PERMISSIONS]
        if invalid:
            return Response({'error': f'Invalid roles: {invalid}'}, status=status.HTTP_400_BAD_REQUEST)

        # Locate user
        try:
            if user_id:
                user = User.objects.get(id=user_id)
            elif username:
                user = User.objects.get(username=username)
            else:
                return Response({'error': 'Provide user_id or username'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Track previous roles for audit
        prev_roles = list(user.groups.values_list('name', flat=True))

        # Assign groups
        # Clear all then add provided roles
        user.groups.clear()
        for r in roles:
            group, _ = Group.objects.get_or_create(name=r)
            user.groups.add(group)

        # Ensure save and audit
        user.save()
        try:
            AuditLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                action='role_change',
                details={'target_user_id': user.id, 'from': prev_roles, 'to': roles}
            )
        except Exception:
            pass

        return Response({'success': True, 'user_id': user.id, 'roles': roles}, status=status.HTTP_200_OK)
