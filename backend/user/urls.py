from django.urls import path
from .views import get_user, update_user

urlpatterns = [
    path("profile/", get_user, name="profile"),
    path("update/", update_user, name="update"),
]
