"""
Tests for inventories
"""
import pytest
from apps.inventories.models import Inventory
from apps.companies.models import Company
from apps.products.models import Product
from rest_framework import status
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIClient
from typing import Dict, Any
from apps.users.models import User

# Create your tests here.


@pytest.mark.django_db
class TestInventoryAPI:
    @pytest.fixture
    def inventory(self, company, product):
        """
        Fixture que crea un registro de inventario para usar en múltiples tests.
        """
        return Inventory.objects.create(company=company, product=product, quantity=75)

    @pytest.fixture(autouse=True)
    def setup(self, admin_user: User, external_user: User, company: Company, product: Product) -> None:
        """Initial setup for all tests"""
        # Crear clientes API para cada test
        self.admin_client: APIClient = APIClient()
        self.external_client: APIClient = APIClient()

        # Autenticar directamente
        self.admin_client.force_authenticate(user=admin_user)
        self.external_client.force_authenticate(user=external_user)

        self.company = company
        self.product = product

        # URLs
        self.inventory_list_url: str = reverse("inventory-list")
        self.inventory_pdf_url: str = reverse("inventory-download-pdf")

        # Test data
        self.inventory_data: Dict[str, Any] = {"company": self.company.id, "product": self.product.id, "quantity": 100}

    def test_list_inventories_admin(self) -> None:
        """Test that inventories can be retrieved by admin user."""
        response: Response = self.admin_client.get(self.inventory_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_inventories_external(self) -> None:
        """Test that inventories can be retrieved by external user."""
        response: Response = self.external_client.get(self.inventory_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_inventory_admin(self) -> None:
        """Test that an inventory record can be created by admin user."""

        response: Response = self.admin_client.post(self.inventory_list_url, self.inventory_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Inventory.objects.count() == 1
        assert Inventory.objects.get().quantity == self.inventory_data["quantity"]

    def test_retrieve_inventory(self, inventory: Inventory) -> None:
        """Test that an inventory record can be retrieved by ID."""
        url: str = reverse("inventory-detail", kwargs={"pk": inventory.id})
        response: Response = self.admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["quantity"] == inventory.quantity

    def test_update_inventory(self, inventory: Inventory) -> None:
        """Test that an inventory record can be updated."""

        url: str = reverse("inventory-detail", kwargs={"pk": inventory.id})
        updated_data: Dict[str, Any] = {"company": self.company.id, "product": self.product.id, "quantity": 200}
        response: Response = self.admin_client.put(url, updated_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Refresh from database and verify change
        inventory.refresh_from_db()
        assert inventory.quantity == updated_data["quantity"]

    def test_retrieve_inventory_external(self, inventory: Inventory) -> None:
        """Test that an inventory record can be retrieved by ID by external user."""
        url: str = reverse("inventory-detail", kwargs={"pk": inventory.id})
        updated_data: Dict[str, Any] = {"company": self.company.id, "product": self.product.id, "quantity": 200}
        response: Response = self.external_client.put(url, updated_data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_inventory(self, inventory: Inventory) -> None:
        """Test that an inventory record can be deleted."""

        url: str = reverse("inventory-detail", kwargs={"pk": inventory.id})
        response: Response = self.admin_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Inventory.objects.count() == 0

    def test_download_pdf(self) -> None:
        """Test the PDF download functionality."""
        response: Response = self.admin_client.get(self.inventory_pdf_url)
        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/pdf"
        assert response["Content-Disposition"] == 'attachment; filename="inventory.pdf"'
