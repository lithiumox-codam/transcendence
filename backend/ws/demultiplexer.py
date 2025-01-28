from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer

from .consumers import EchoConsumer
from chat.consumer import ChatConsumer
from user.consumer import UserConsumer
from pong.consumer import GameConsumer

demultiplexer = AsyncJsonWebsocketDemultiplexer.as_asgi(
    chat = ChatConsumer.as_asgi(),
    echo = EchoConsumer.as_asgi(),
    user = UserConsumer.as_asgi(),
	pong = GameConsumer.as_asgi(),
)