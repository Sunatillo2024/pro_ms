# apps/templates_app/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import DocumentTemplate
from .serializers import DocumentTemplateSerializer


class DocumentTemplateViewSet(viewsets.ModelViewSet):
    queryset = DocumentTemplate.objects.filter(is_active=True)
    serializer_class = DocumentTemplateSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def placeholders(self, request, pk=None):
        """Shablondagi barcha placeholder'larni qaytaradi"""
        template = self.get_object()
        try:
            placeholders = template.get_placeholders()
            return Response({
                'template_id': template.id,
                'template_name': template.name,
                'placeholders': placeholders
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )