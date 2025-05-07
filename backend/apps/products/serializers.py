from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Product serializer"""

    class Meta:
        """Meta class"""

        model = Product
        fields = ["id", "code", "name", "features", "price", "company"]
