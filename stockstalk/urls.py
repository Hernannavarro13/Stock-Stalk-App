from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('stocks_api.urls')),   # <— all API routes under /api/
]
