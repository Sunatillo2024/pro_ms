# apps/templates_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentTemplateViewSet

router = DefaultRouter()
router.register('templates', DocumentTemplateViewSet)

urlpatterns = [path('', include(router.urls))]