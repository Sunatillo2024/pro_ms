# apps/documents/serializers.py
from rest_framework import serializers
from .models import GeneratedDocument


class GeneratedDocumentSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    download_docx_url = serializers.SerializerMethodField()
    download_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = GeneratedDocument
        fields = [
            'id', 'template', 'template_name',
            'created_by', 'created_by_name',
            'filled_data', 'status',
            'download_docx_url', 'download_pdf_url',
            'created_at'
        ]
        read_only_fields = ['created_by', 'status', 'created_at']

    def get_download_docx_url(self, obj):
        return f"/api/documents/{obj.id}/download_docx/"

    def get_download_pdf_url(self, obj):
        return f"/api/documents/{obj.id}/download_pdf/"