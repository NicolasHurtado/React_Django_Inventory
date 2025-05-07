import pytest
from rest_framework import status
from django.urls import reverse
from apps.users.models import User, RoleChoices
from rest_framework.response import Response
from rest_framework.test import APIClient
from typing import Dict, Any


@pytest.mark.django_db
class TestAuthenticationAPI:
    @pytest.fixture(autouse=True)
    def setup(self, api_client: APIClient) -> None:
        """Initial setup for authentication tests"""
        self.api_client = api_client
        self.token_url: str = reverse("token_obtain_pair")

        # Crear un usuario de prueba con username y email
        self.username = "testauth"
        self.email = "testauth@example.com"
        self.password = "testpassword"

        self.test_user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password,
            role=RoleChoices.ADMIN,
        )

    def test_jwt_authentication_email(self) -> None:
        """Test JWT token authentication with email."""
        data: Dict[str, str] = {
            "email": self.email,
            "password": self.password,
        }
        response: Response = self.api_client.post(self.token_url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_jwt_authentication_invalid_credentials(self) -> None:
        """Test JWT token authentication with invalid credentials."""
        # Login request con credenciales inválidas
        data: Dict[str, str] = {
            "email": self.email,
            "password": "wrongpassword",
        }
        response: Response = self.api_client.post(self.token_url, data, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserAPI:
    @pytest.fixture(autouse=True)
    def setup(self, admin_user: User, external_user: User) -> None:
        """Initial setup for user tests"""
        # Create API clients for each test
        self.admin_client: APIClient = APIClient()
        self.external_client: APIClient = APIClient()

        # Authenticate directly
        self.admin_client.force_authenticate(user=admin_user)
        self.external_client.force_authenticate(user=external_user)

        self.admin_user: User = admin_user
        self.external_user: User = external_user

        # URLs
        self.user_list_url: str = reverse("user-list")

        # Test data
        self.new_user_data: Dict[str, Any] = {
            "username": "newuser",
            "password": "newuserpass",
            "email": "newuser@example.com",
            "role": RoleChoices.EXTERNAL,
        }

    def test_list_users_admin(self) -> None:
        """Test that users can be retrieved by admin user."""

        response: Response = self.admin_client.get(self.user_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_user(self) -> None:
        """Test that a user can be created."""

        response: Response = self.admin_client.post(self.user_list_url, self.new_user_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username="newuser").exists()
        assert User.objects.get(username="newuser").role == RoleChoices.EXTERNAL

    def test_retrieve_user(self) -> None:
        """Test that a user can be retrieved by ID."""

        url: str = reverse("user-detail", kwargs={"pk": self.admin_user.id})
        response: Response = self.admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == self.admin_user.username
        assert response.data["role"] == self.admin_user.role

    def test_update_user(self) -> None:
        """Test that a user can be updated."""
        url: str = reverse("user-detail", kwargs={"pk": self.external_user.id})
        data: Dict[str, Any] = {
            "username": self.external_user.username,
            "email": "updated@example.com",
        }
        response: Response = self.admin_client.patch(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Refresh from database and verify changes
        self.external_user.refresh_from_db()
        assert self.external_user.email == data["email"]

    def test_external_user_permissions(self) -> None:
        """Test that external users have limited permissions."""
        # External user attempt to create a new user
        response: Response = self.external_client.post(self.user_list_url, self.new_user_data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN
