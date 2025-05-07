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
    
    def validate(self, data):
        """Validate that at least one company_id is provided"""
        if 'company_id' not in data:
            raise serializers.ValidationError("You must provide a company_id")
        return data
