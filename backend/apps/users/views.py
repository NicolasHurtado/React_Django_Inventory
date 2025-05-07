"""
Views for users
"""
from rest_framework import viewsets
from apps.users.models import User
from apps.users.serializers import UserSerializer
from core.permissions import IsAdminUser, IsOwnerOrAdmin


class UserViewSet(viewsets.ModelViewSet):
    """
    Viewset for users.
    - Only admins can create new users and view the complete list.
    - Users can only view and edit their own profile.
    - Admins can edit any profile.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Define permissions based on the action:
        - list, create: Only admins (IsAdminUser)
        - retrieve, update, partial_update, destroy: Owner or admin (IsOwnerOrAdmin)
        """
        if self.action in ["list", "create"]:
            print("list or create")
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]
