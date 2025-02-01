from django.urls import path
from .views import get_user, upload_avatar

urlpatterns = [
    path("profile/", get_user, name="profile"),
    path("avatar/", upload_avatar, name="avatar"),
]
