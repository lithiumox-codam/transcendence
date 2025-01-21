from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import (
    signup,
    get_user,
)

urlpatterns = [
    path("signup/", signup, name="signup"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("profile/", get_user, name="profile"),
]
