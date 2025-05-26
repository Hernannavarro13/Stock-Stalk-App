from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockViewSet, WatchlistViewSet

router = DefaultRouter()
router.register(r'stocks', StockViewSet)
router.register(r'watchlists', WatchlistViewSet, basename='watchlist')

urlpatterns = [
    path('', include(router.urls)),
]
