"""
Models for companies
"""
from django.db import models

# Create your models here.


class Company(models.Model):
    """Company model"""

    nit = models.CharField(max_length=20, unique=True, verbose_name="NIT")
    name = models.CharField(max_length=255, verbose_name="Nombre de la empresa")
    address = models.CharField(max_length=255, verbose_name="Dirección")
    phone = models.CharField(max_length=20, verbose_name="Teléfono")

    def __str__(self):
        return f"{self.name} ({self.nit})"

    class Meta:
        """Meta class"""

        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ["name"]
