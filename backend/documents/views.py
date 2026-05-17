# apps/documents/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.base import ContentFile
from django.http import FileResponse
from .models import GeneratedDocument
from .serializers import GeneratedDocumentSerializer
from .services import DocumentService
from templates_app.models import DocumentTemplate


class GeneratedDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return GeneratedDocument.objects.all()
        return GeneratedDocument.objects.filter(created_by=user)

    def create(self, request, *args, **kwargs):
        """Shablonni to'ldirib hujjat yaratish"""
        template_id = request.data.get('template_id')
        filled_data = request.data.get('filled_data', {})

        try:
            template = DocumentTemplate.objects.get(id=template_id)
        except DocumentTemplate.DoesNotExist:
            return Response(
                {'error': 'Shablon topilmadi'},
                status=status.HTTP_404_NOT_FOUND
            )

        # DOCX yaratish
        docx_buffer = DocumentService.fill_template(
            template.file.path,
            filled_data
        )

        # PDF yaratish
        pdf_buffer = DocumentService.docx_to_pdf(docx_buffer, filled_data)
        docx_buffer.seek(0)

        # Saqlash
        doc = GeneratedDocument.objects.create(
            template=template,
            created_by=request.user,
            filled_data=filled_data,
            status='completed'
        )

        filename = f"doc_{doc.id}_{template.name}"
        doc.docx_file.save(f"{filename}.docx", ContentFile(docx_buffer.read()))
        doc.pdf_file.save(f"{filename}.pdf", ContentFile(pdf_buffer.read()))
        doc.save()

        serializer = self.get_serializer(doc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download_docx(self, request, pk=None):
        doc = self.get_object()
        response = FileResponse(
            doc.docx_file.open('rb'),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{doc.template.name}.docx"'
        return response

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        doc = self.get_object()
        response = FileResponse(
            doc.pdf_file.open('rb'),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{doc.template.name}.pdf"'
        return response