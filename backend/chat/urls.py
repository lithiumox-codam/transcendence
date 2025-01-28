from django.urls import path
from .views import get_channels, get_messages, create_channel, create_message, add_user_to_channel

urlpatterns = [
    path("channels/", get_channels, name="channels"),
    path("channels/<int:channel_id>/messages/", get_messages, name="messages"),
    path("channels/create/", create_channel, name="create_channel"),
    path("messages/create/<int:channel_id>", create_message, name="create_message"),
    path("channels/<int:channel_id>/add_user/", add_user_to_channel, name="add_user_to_channel"),
]