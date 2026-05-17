# apps/documents/models.py
from django.db import models
from django.conf import settings
from templates_app.models import DocumentTemplate


class GeneratedDocument(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Qoralama'),
        ('completed', 'Tayyor'),
    ]

    template = models.ForeignKey(
        DocumentTemplate,
        on_delete=models.SET_NULL,
        null=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    filled_data = models.JSONField()  # {"ism": "Ali", "sana": "2025"}
    docx_file = models.FileField(upload_to='generated/docx/', blank=True)
    pdf_file = models.FileField(upload_to='generated/pdf/', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.template.name} - {self.created_by}"

    class Meta:
        verbose_name = "Yaratilgan hujjat"
        verbose_name_plural = "Yaratilgan hujjatlar"