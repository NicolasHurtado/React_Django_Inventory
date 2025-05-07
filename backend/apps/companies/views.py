"""
Views for companies
"""
from rest_framework import viewsets
from apps.companies.models import Company
from apps.companies.serializers import CompanySerializer
from core.permissions import IsAdminOrReadOnly

# Create your views here.


class CompanyViewSet(viewsets.ModelViewSet):
    """
    Viewset para empresas.
    - Administradores pueden crear, leer, actualizar y eliminar empresas.
    - Usuarios externos solo pueden ver las empresas.
    """

    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminOrReadOnly]
