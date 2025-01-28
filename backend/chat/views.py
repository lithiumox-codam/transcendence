from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Channel, Message
from user.models import User

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_channels(request) -> Response:
    """
    Retrieve the channels that the authenticated user is a member of.
    Returns a list of channel objects with their respective details.
    """
    channels = Channel.objects.filter(users=request.user)
    return Response(
        {
            "channels": [
                {
                    "id": channel.id,
                    "name": channel.name,
                    "users": [user.username for user in channel.users.all()],
                    "created_at": channel.created_at,
                }
                for channel in channels
            ]
        }
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, channel_id) -> Response:
    """
    Retrieve the messages of a specific channel that the authenticated user is a member of.
    Returns a list of message objects with their respective details.
    """
    channel = Channel.objects.get(id=channel_id)
    if request.user not in channel.users.all():
        return Response({"error": "You are not a member of this channel"}, status=status.HTTP_403_FORBIDDEN)
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    start = (page - 1) * page_size
    end = start + page_size
    messages = channel.messages.all().order_by('-timestamp')[start:end]
    
    return Response(
        {
            "messages": [
                {
                    "id": message.id,
                    "user": message.user.username,
                    "content": message.content,
                    "timestamp": message.timestamp,
                }
                for message in messages
            ]
        }
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_channel(request) -> Response:
    """
    Create a new channel with the provided name and add the authenticated user as a member.
    Returns the details of the created channel.
    """
    name = request.data.get("name", None)
    if name is None:
        return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    channel = Channel.objects.create(name=name)
    channel.users.add(request.user)
    channel.save()
    
    response_data = {
        "id": channel.id,
        "name": channel.name,
        "users": [user.username for user in channel.users.all()],
        "created_at": channel.created_at,
    }
    
    # Announce the new channel to all users
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'chat_{channel.id}',
        {
            'type': 'chat.message',
            'message': f'New channel created: {channel.name}'
        }
    )
    
    return Response(response_data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_message(request, channel_id) -> Response:
    """
    Create a new message in the specified channel with the provided content.
    Returns the details of the created message.
    """
    channel = Channel.objects.get(id=channel_id)
    if request.user not in channel.users.all():
        return Response({"error": "You are not a member of this channel"}, status=status.HTTP_403_FORBIDDEN)
    
    content = request.data.get("content", None)
    if content is None:
        return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    message = Message.objects.create(channel=channel, user=request.user, content=content)
    
    response_data = {
        "id": message.id,
        "user": message.user.username,
        "content": message.content,
        "timestamp": message.timestamp,
    }
    
    # Announce the new message to the channel
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'chat_{channel.id}',
        {
            'type': 'chat.message',
            'message': f'New message from {message.user.username}: {message.content}'
        }
    )
    
    return Response(response_data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_user_to_channel(request, channel_id) -> Response:
    """
    Add a user to the specified channel by their username.
    Returns the details of the channel after adding the user.
    """
    channel = Channel.objects.get(id=channel_id)
    username = request.data.get("username", None)
    if username is None:
        return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.filter(username=username).first()
    if user is None:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    channel.users.add(user)
    channel.save()
    
    response_data = {
        "id": channel.id,
        "name": channel.name,
        "users": [user.username for user in channel.users.all()],
        "created_at": channel.created_at,
    }
    
    # Announce the new user to the channel
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'chat_{channel.id}',
        {
            'type': 'chat.message',
            'message': f'User {user.username} added to channel {channel.name}'
        }
    )
    
    return Response(response_data, status=status.HTTP_200_OK)