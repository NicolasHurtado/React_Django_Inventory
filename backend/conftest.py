"""
Conftest for Django tests
"""
import pytest
from django.conf import settings
from model_bakery import baker
from rest_framework.test import APIClient
from apps.users.models import User, RoleChoices


@pytest.fixture(scope="session")
def django_db_setup():
    """
    Configures an in-memory database for testing.
    This configuration overrides the database configuration in settings.py
    only during the execution of the tests.
    """
    settings.DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
            "TEST": {
                "NAME": ":memory:",
            },
        },
    }


@pytest.fixture
def api_client():
    """
    Provides an API client for testing the API views.
    """
    return APIClient()


@pytest.fixture
def user_factory(django_db_setup, db):
    """
    Factory to create test users.
    """

    def _create_user(**kwargs):
        username = kwargs.get("username", "testuser").strip()

        # Try to get the user, or create it if it doesn't exist
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": kwargs.get("email", ""),
                "role": kwargs.get("role", RoleChoices.EXTERNAL),
                "is_active": True,
                "is_staff": kwargs.get("role", RoleChoices.EXTERNAL) == RoleChoices.ADMIN,
            },
        )

        # If a password is provided and the user is new, set it
        if created and "password" in kwargs:
            user.set_password(kwargs["password"])
            user.save()

        return user

    return _create_user


@pytest.fixture
def company_factory():
    """
    Factory to create test companies.
    """

    def _create_company(**kwargs):
        defaults = {"nit": "123456789", "name": "Test Company", "address": "Test Address 123", "phone": "555-1234"}
        defaults.update(kwargs)
        return baker.make("companies.Company", **defaults)

    return _create_company


@pytest.fixture
def product_factory():
    """
    Factory to create test products.
    """

    def _create_product(**kwargs):
        defaults = {
            "code": "P001",
            "name": "Test Product",
            "features": "Feature 1, Feature 2",
            "price": {"USD": 10.99, "EUR": 9.99},
        }
        # If company is not provided, create one
        if "company" not in kwargs:
            company = baker.make("companies.Company")
            defaults["company"] = company

        defaults.update(kwargs)
        return baker.make("products.Product", **defaults)

    return _create_product


@pytest.fixture
def inventory_factory():
    """
    Factory to create test inventory records.
    """

    def _create_inventory(**kwargs):
        defaults = {"quantity": 100}
        # If company and product are not provided, create them
        if "company" not in kwargs:
            company = baker.make("companies.Company")
            defaults["company"] = company

        if "product" not in kwargs:
            product = baker.make("products.Product", company=defaults.get("company", None))
            defaults["product"] = product

        defaults.update(kwargs)
        return baker.make("inventories.Inventory", **defaults)

    return _create_inventory


@pytest.fixture(scope="session")
def admin_user(django_db_setup, django_db_blocker):
    """
    Creates an admin user for testing. Session scope ensures only one is created.
    """
    with django_db_blocker.unblock():
        # Use get_or_create to avoid uniqueness errors
        user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "role": RoleChoices.ADMIN,
                "is_active": True,
                "is_staff": True,
            },
        )
        if created:
            user.set_password("adminpass")
            user.save()
        return user


@pytest.fixture(scope="session")
def external_user(django_db_setup, django_db_blocker):
    """
    Creates an external user for testing. Session scope ensures only one is created.
    """
    with django_db_blocker.unblock():
        # Use get_or_create to avoid uniqueness errors
        user, created = User.objects.get_or_create(
            username="external",
            defaults={
                "email": "external@example.com",
                "role": RoleChoices.EXTERNAL,
                "is_active": True,
            },
        )
        if created:
            user.set_password("externalpass")
            user.save()
        return user


@pytest.fixture
def company(company_factory):
    """
    Creates a default company for testing.
    """
    return company_factory()


@pytest.fixture
def product(product_factory, company):
    """
    Creates a default product for testing with the default company.
    """
    return product_factory(company=company)


@pytest.fixture
def inventory(inventory_factory, company, product):
    """
    Creates a default inventory record for testing with the default company and product.
    """
    return inventory_factory(company=company, product=product)


@pytest.fixture
def authenticated_admin_client(api_client, admin_user):
    """
    Provides an authenticated API client with admin role.
    """
    api_client.force_authenticate(user=admin_user)
    return api_client, admin_user


@pytest.fixture
def authenticated_external_client(api_client, external_user):
    """
    Provides an authenticated API client with external role.
    """
    api_client.force_authenticate(user=external_user)
    return api_client, external_user


@pytest.fixture
def admin_client(api_client, admin_user):
    """
    Provides an authenticated API client with admin privileges.
    """
    # Force authentication directly with the admin user
    # Do not use JWT tokens to avoid permission issues
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def external_client(api_client, external_user):
    """
    Provides an authenticated API client with external privileges.
    """
    # Force authentication directly with the external user
    # Do not use JWT tokens to avoid permission issues
    api_client.force_authenticate(user=external_user)
    return api_client
