from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer

from .consumers import EchoConsumer, SocketConsumer
from chat.consumer import ChatConsumer

demultiplexer = AsyncJsonWebsocketDemultiplexer.as_asgi(
    chat = ChatConsumer.as_asgi(),
    echo = EchoConsumer.as_asgi(),
)