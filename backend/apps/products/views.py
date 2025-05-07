"""
Views for products
"""
from rest_framework import viewsets
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from core.permissions import IsAdminOrReadOnly

# Create your views here.


class ProductViewSet(viewsets.ModelViewSet):
    """
    Viewset para productos.
    - Administradores pueden crear, leer, actualizar y eliminar productos.
    - Usuarios externos solo pueden ver los productos.
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
