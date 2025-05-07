"""
Views for inventories
"""
from rest_framework import viewsets
from apps.inventories.models import Inventory
from apps.inventories.serializers import InventorySerializer
from rest_framework.decorators import action
from django.http import FileResponse
from apps.inventories.utils import generate_inventory_pdf
from core.permissions import IsAdminOrReadOnly

# Create your views here.


class InventoryViewSet(viewsets.ModelViewSet):
    """
    Viewset para inventario.
    - Administradores pueden crear, leer, actualizar y eliminar registros de inventario.
    - Usuarios externos solo pueden ver los inventarios.
    - Ambos roles pueden descargar el informe PDF.
    """

    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=["get"], url_path="download-pdf")
    def download_pdf(self, request):
        """
        Generar y descargar un informe PDF del inventario.
        Este endpoint es accesible tanto para administradores como para usuarios externos.
        """
        queryset = self.get_queryset()
        pdf_buffer = generate_inventory_pdf(queryset)
        return FileResponse(pdf_buffer, as_attachment=True, filename="inventory.pdf")
