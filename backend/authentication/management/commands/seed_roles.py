from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, User
from authentication.roles import ROLE_PERMISSIONS

DEFAULT_USERS = {
    # username: (password, [roles])
    'admin': ('admin123', ['admin']),
}

class Command(BaseCommand):
    help = 'Seed default roles (Django Groups) for RBAC and optionally create demo users.'

    def add_arguments(self, parser):
        parser.add_argument('--with-demo-users', action='store_true', help='Create demo users and assign roles')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding roles (groups)...'))

        for role in ROLE_PERMISSIONS.keys():
            group, created = Group.objects.get_or_create(name=role)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role}'))
            else:
                self.stdout.write(f'Role exists: {role}')

        if options['with_demo_users']:
            self.stdout.write(self.style.NOTICE('Creating demo users...'))
            for username, (password, roles) in DEFAULT_USERS.items():
                user, created = User.objects.get_or_create(username=username, defaults={'email': f'{username}@example.com'})
                if created:
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'Created user: {username} / {password}'))
                else:
                    self.stdout.write(f'User exists: {username}')
                # Assign roles
                for role in roles:
                    try:
                        group = Group.objects.get(name=role)
                        user.groups.add(group)
                    except Group.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f'Role not found: {role}'))
            self.stdout.write(self.style.SUCCESS('Demo users updated'))

        self.stdout.write(self.style.SUCCESS('Roles seeding complete'))
