from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from user.serializers import UserSerializer


@api_view(["POST"])
def signup(request):
    user = UserSerializer(data=request.data)

    if not user.is_valid():
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

    user.save()

    # Return access and refresh token
    refresh = RefreshToken.for_user(user.instance)
    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
        status=status.HTTP_201_CREATED,
    )
