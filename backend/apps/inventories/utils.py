from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO


def generate_inventory_pdf(inventory_queryset):
    """Generate inventory PDF"""
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Inventory Report")
    y -= 30
    p.setFont("Helvetica", 10)
    for inv in inventory_queryset:
        # Dividir el texto largo en componentes para evitar líneas demasiado largas
        company_info = f"Company: {inv.company.name}"
        product_info = f"Product: {inv.product.name}"
        quantity_info = f"Quantity: {inv.quantity}"
        date_info = f"Date: {inv.created_at.strftime('%Y-%m-%d %H:%M')}"

        # Combinar los componentes con separadores
        text = f"{company_info} | {product_info} | {quantity_info} | {date_info}"
        p.drawString(40, y, text)
        y -= 20
        if y < 40:
            p.showPage()
            y = height - 40
    p.save()
    buffer.seek(0)
    return buffer
