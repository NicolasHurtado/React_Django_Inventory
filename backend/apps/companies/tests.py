import pytest
from rest_framework import status
from apps.companies.models import Company
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIClient
from typing import Dict, Any


@pytest.mark.django_db
class TestCompanyAPI:
    @pytest.fixture(autouse=True)
    def setup(self, admin_user, external_user) -> None:
        """Initial setup for all tests"""
        # Crear clientes API para cada test (evita problemas de estado compartido)
        self.admin_client = APIClient()
        self.external_client = APIClient()

        # Autenticar directamente
        self.admin_client.force_authenticate(user=admin_user)
        self.external_client.force_authenticate(user=external_user)

        # URLs
        self.company_list_url: str = reverse("company-list")

        # Test data
        self.company_data: Dict[str, Any] = {
            "nit": "987654321",
            "name": "New Company",
            "address": "New Address 123",
            "phone": "555-9876",
        }

    def test_list_companies_admin(self) -> None:
        """Test that companies can be retrieved by admin user."""
        response: Response = self.admin_client.get(self.company_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_companies_external(self) -> None:
        """Test that companies can be retrieved by external user."""
        response: Response = self.external_client.get(self.company_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_company_admin(self, admin_user) -> None:
        """Test that a company can be created by admin user."""

        response: Response = self.admin_client.post(self.company_list_url, self.company_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Company.objects.count() == 1
        assert Company.objects.get().name == self.company_data["name"]

    def test_retrieve_company(self, company) -> None:
        """Test that a company can be retrieved by ID."""
        url: str = reverse("company-detail", kwargs={"pk": company.id})
        response: Response = self.admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["nit"] == company.nit
        assert response.data["name"] == company.name

    def test_update_company(self, company, admin_user) -> None:
        """Test that a company can be updated."""
        # Crear un cliente API fresco para este test específico
        client = APIClient()
        client.force_authenticate(user=admin_user)

        url: str = reverse("company-detail", kwargs={"pk": company.id})
        updated_data: Dict[str, Any] = {
            "nit": "123456789",
            "name": "Updated Company",
            "address": "Updated Address 456",
            "phone": "555-4321",
        }
        response: Response = client.put(url, updated_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Refresh from database and verify changes
        company.refresh_from_db()
        assert company.name == updated_data["name"]
        assert company.address == updated_data["address"]

    def test_delete_company(self, company, admin_user) -> None:
        """Test that a company can be deleted."""
        # Crear un cliente API fresco para este test específico
        client = APIClient()
        client.force_authenticate(user=admin_user)

        url: str = reverse("company-detail", kwargs={"pk": company.id})
        response: Response = client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Company.objects.count() == 0

    def test_external_user_permissions(self) -> None:
        """Test that external users have limited permissions."""
        # Create attempt should fail for external users (once permission system is implemented)
        response: Response = self.external_client.post(self.company_list_url, self.company_data, format="json")

        # This test depends on if permissions are implemented
        # If permissions are set up, it should be 403 FORBIDDEN
        # Currently it might be 201 CREATED without proper permissions
        assert response.status_code in [status.HTTP_403_FORBIDDEN]
