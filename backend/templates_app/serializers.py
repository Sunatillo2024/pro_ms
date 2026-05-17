# apps/templates_app/serializers.py
from rest_framework import serializers
from .models import DocumentTemplate


class DocumentTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )

    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'name', 'description', 'file',
            'created_by', 'created_by_name',
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']