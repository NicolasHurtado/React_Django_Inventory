from rest_framework import serializers
from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    """Inventory serializer"""

    class Meta:
        """Meta class"""

        model = Inventory
        fields = "__all__"


class EmailInventorySerializer(serializers.Serializer):
    """Serializer for sending inventory by email"""
    email = serializers.EmailField()
    company_id = serializers.IntegerField(required=False)
