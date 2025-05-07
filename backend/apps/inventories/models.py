from django.db import models
from apps.companies.models import Company
from apps.products.models import Product


class Inventory(models.Model):
    """Inventory model"""

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="inventories", verbose_name="Company")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="inventories", verbose_name="Product")
    quantity = models.PositiveIntegerField(verbose_name="Quantity")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")

    def __str__(self):
        """String representation of the inventory"""
        return f"{self.company.name} - {self.product.name}: {self.quantity}"

    class Meta:
        """Meta class"""

        verbose_name = "Inventory"
        verbose_name_plural = "Inventories"
        ordering = ["-created_at"]
