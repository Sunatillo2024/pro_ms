# apps/templates_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GeneratedDocumentViewSet

router = DefaultRouter()
router.register('templates', GeneratedDocumentViewSet, basename='templates')
urlpatterns = [path('', include(router.urls))]