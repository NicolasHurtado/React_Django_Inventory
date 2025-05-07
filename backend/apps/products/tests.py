"""
Tests for products
"""
import pytest
from apps.products.models import Product
from apps.companies.models import Company
from apps.users.models import User
from rest_framework import status
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIClient
from typing import Dict, Any


# Create your tests here.


@pytest.mark.django_db
class TestProductAPI:
    @pytest.fixture(autouse=True)
    def setup(self, admin_user: User, external_user: User, company: Company) -> None:
        """Initial setup for all tests"""
        # Crear clientes API para cada test
        self.admin_client: APIClient = APIClient()
        self.external_client: APIClient = APIClient()

        # Autenticar directamente
        self.admin_client.force_authenticate(user=admin_user)
        self.external_client.force_authenticate(user=external_user)
        self.company = company
        # URLs
        self.product_list_url: str = reverse("product-list")

        # Test data
        self.product_data: Dict[str, Any] = {
            "code": "P002",
            "name": "New Product",
            "features": "New Feature 1, New Feature 2",
            "price": {"USD": 20.99, "EUR": 18.99},
            "company": self.company.id,
        }

    def test_list_products_admin(self) -> None:
        """Test that products can be retrieved by admin user."""
        response: Response = self.admin_client.get(self.product_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_products_external(self) -> None:
        """Test that products can be retrieved by external user."""
        response: Response = self.external_client.get(self.product_list_url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_product_admin(self) -> None:
        """Test that a product can be created by admin user."""

        response: Response = self.admin_client.post(self.product_list_url, self.product_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Product.objects.count() == 1
        assert Product.objects.get().name == self.product_data["name"]

    def test_retrieve_product(self, product) -> None:
        """Test that a product can be retrieved by ID."""
        url: str = reverse("product-detail", kwargs={"pk": product.id})
        response: Response = self.admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["code"] == product.code
        assert response.data["name"] == product.name

    def test_update_product(self, product) -> None:
        """Test that a product can be updated."""
        url: str = reverse("product-detail", kwargs={"pk": product.id})
        updated_data: Dict[str, Any] = {
            "code": "P001",
            "name": "Updated Product",
            "features": "Updated Feature 1, Updated Feature 2",
            "price": {"USD": 25.99, "EUR": 23.99},
            "company": product.company.id,
        }
        response: Response = self.admin_client.put(url, updated_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Refresh from database and verify changes
        product.refresh_from_db()
        assert product.name == updated_data["name"]
        assert product.price["USD"] == updated_data["price"]["USD"]

    def test_delete_product(self, product) -> None:
        """Test that a product can be deleted."""

        url: str = reverse("product-detail", kwargs={"pk": product.id})
        response: Response = self.admin_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Product.objects.count() == 0

    def test_product_company_relation(self) -> None:
        """Test that a product is correctly associated with its company."""

        response: Response = self.admin_client.post(self.product_list_url, self.product_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
