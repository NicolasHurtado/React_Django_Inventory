from django.db import models
from django.contrib.auth.models import AbstractUser


class RoleChoices(models.TextChoices):
    """Role choices"""

    ADMIN = "ADMIN"
    EXTERNAL = "EXTERNAL"


class User(AbstractUser):
    """User model"""

    role = models.CharField(max_length=10, choices=RoleChoices.choices, default=RoleChoices.EXTERNAL)
    email = models.EmailField(verbose_name="email address", max_length=255, unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.username} ({self.role})"
