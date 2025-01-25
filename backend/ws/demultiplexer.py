from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer

from .consumers import SocketConsumer, EchoConsumer

demultiplexer = AsyncJsonWebsocketDemultiplexer.as_asgi(
    chat = SocketConsumer.as_asgi(),
    echo = EchoConsumer.as_asgi(),
)