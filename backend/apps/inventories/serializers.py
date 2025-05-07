from rest_framework import serializers
from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    """Inventory serializer"""

    class Meta:
        """Meta class"""

        model = Inventory
        fields = ["id", "company", "product", "quantity", "created_at"]
