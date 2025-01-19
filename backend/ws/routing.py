from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # listen for / ws connections
    re_path(r'^ws/$', consumers.SocketConsumer.as_asgi()),
]