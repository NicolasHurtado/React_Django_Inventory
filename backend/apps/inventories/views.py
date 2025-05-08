"""
Views for inventories
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.inventories.models import Inventory
from apps.inventories.serializers import InventorySerializer, EmailInventorySerializer
from rest_framework.decorators import action
from django.http import FileResponse
from apps.inventories.utils import generate_inventory_pdf, generate_inventory_pdf_for_email, send_inventory_email
from core.permissions import IsAdminOrReadOnly
from django.db.models import QuerySet
import os
import logging

logger = logging.getLogger(__name__)
# Create your views here.


class InventoryViewSet(viewsets.ModelViewSet):
    """
    Viewset for inventory.
    - Administrators can create, read, update and delete inventory records.
    - External users can only view inventories.
    - Both roles can download the inventory PDF report.
    """

    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=["get"])
    def download_pdf(self, request):
        """
        Generate and download an inventory PDF report.
        This endpoint is accessible to both administrators and external users.
        """
        queryset = self.get_queryset()
        pdf_buffer = generate_inventory_pdf(queryset)
        return FileResponse(pdf_buffer, as_attachment=True, filename="inventory.pdf")

    @action(detail=False, methods=['post'])
    def send_email(self, request):
        """
        Send an inventory PDF by email.
        This endpoint allows sending an email with a PDF of all inventories
        of a specific company.
        
        Example request:
        {
            "email": "recipient@example.com",
            "company_id": 1
        }
        """
        serializer = EmailInventorySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"Received request: {request.data}")
        try:
            company_id : int | None = request.data.get('company_id')
            email : str = request.data.get('email')

            logger.info(f"Sending email to {email} for company {company_id}")

            # Get all inventories of that company
            inventories : QuerySet[Inventory] = Inventory.objects.filter(company_id=company_id) if company_id else Inventory.objects.all()
            
            if not inventories.exists():
                return Response({
                    'error': 'There are no inventory records for this company.'
                }, status=status.HTTP_404_NOT_FOUND)

            logger.info(f"Generating PDF for all companies with {len(inventories)} inventories")
            # Generate the PDF with all inventories
            pdf_path : str = generate_inventory_pdf_for_email(
                inventory_data=inventories
            )
            logger.info(f"PDF generated at: {pdf_path}")

            # Send the email
            send_inventory_email(
                email=email,
                pdf_path=pdf_path,
            )

            # Clean the temporary file
            os.unlink(pdf_path)

            return Response({
                'message': f'The inventory has been sent successfully to {email}.'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error sending the email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
