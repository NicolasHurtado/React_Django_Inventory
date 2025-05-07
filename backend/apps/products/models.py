from django.db import models
from apps.companies.models import Company


class Product(models.Model):
    """Product model"""

    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    name = models.CharField(max_length=255, verbose_name="Name")
    features = models.TextField(verbose_name="Features")
    price = models.JSONField(verbose_name="Price in multiple currencies")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="products", verbose_name="Company")

    def __str__(self):
        """String representation of the product"""
        return f"{self.name} ({self.code})"

    class Meta:
        """Meta class"""

        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"]
