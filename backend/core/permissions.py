from rest_framework import permissions
from apps.users.models import RoleChoices


class IsAdminUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios con rol de Administrador.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == RoleChoices.ADMIN


class IsExternalUserReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura para usuarios Externos.
    Los usuarios con rol Administrador tienen permisos completos.
    """

    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado
        if not request.user.is_authenticated:
            return False

        # Permisos completos para administradores
        if request.user.role == RoleChoices.ADMIN:
            return True

        # Solo métodos de lectura (GET, HEAD, OPTIONS) para usuarios externos
        return request.method in permissions.SAFE_METHODS


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite operaciones de lectura a todos los usuarios autenticados,
    pero solo los administradores pueden realizar operaciones de escritura.
    """

    def has_permission(self, request, view):
        print(request.user.role)
        # Verificar si el usuario está autenticado
        if not request.user.is_authenticated:
            return False

        # Permitir operaciones de lectura a todos los usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return True

        # Permitir operaciones de escritura solo a administradores
        return request.user.role == RoleChoices.ADMIN


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access to the object only if it is the owner or an admin.
    """

    def has_object_permission(self, request, view, obj):
        # Admin permissions always
        if request.user.role == RoleChoices.ADMIN:
            return True

        # Check if the object has a user field and if it matches the current user
        if hasattr(obj, "user"):
            return obj.user == request.user

        return False
