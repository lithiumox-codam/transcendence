from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response(
            {"error": "Old password and new password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.check_password(old_password):
        return Response(
            {"error": "Old password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if old_password == new_password:
        return Response(
            {"error": "New password must be different from old password"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # TODO: Add password validation

    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully"}, status=status.HTTP_200_OK
    )
