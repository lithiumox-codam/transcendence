from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer

from .consumers import EchoConsumer
from chat.consumer import ChatConsumer
from user.consumer import UserConsumer

demultiplexer = AsyncJsonWebsocketDemultiplexer.as_asgi(
    chat = ChatConsumer.as_asgi(),
    echo = EchoConsumer.as_asgi(),
    user = UserConsumer.as_asgi(),
)