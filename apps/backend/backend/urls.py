from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path(
        "api/",
        include(
            [
                path("admin/", admin.site.urls),
            ]
        ),
    )
]
