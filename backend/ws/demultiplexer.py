from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer

from .consumers import EchoConsumer, SocketConsumer
from chat.consumer import ChatConsumer

demultiplexer = AsyncJsonWebsocketDemultiplexer.as_asgi(
    chat = SocketConsumer.as_asgi(),
    echo = EchoConsumer.as_asgi(),
)