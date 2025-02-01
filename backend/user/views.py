from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer, UserAvatarSerializer
from user.models import User


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request) -> Response:
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar": user.avatar.url if user.avatar else None,
            "status": user.status,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_avatar(request) -> Response:
    print(request.data)
    serializer = UserAvatarSerializer(data=request.data, instance=request.user)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_avatar(request, pk) -> Response:
    user = User.objects.get(pk=pk)
    return Response(
        {
            "avatar": user.avatar.url if user.avatar else None,
        }
    )