from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    """Company serializer"""

    class Meta:
        """Meta class"""

        model = Company
        fields = ["id", "nit", "name", "address", "phone"]
