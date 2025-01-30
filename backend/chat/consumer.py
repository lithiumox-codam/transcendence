from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Channel, Message

class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.handlers = {
            # 'message': self.handle_message
        }

    async def connect(self):
        self.user = self.scope.get("user", None)
        if self.user is not None:
            self.groups = await self.get_user_channels(self.user)
            print(f"User channels: {self.groups}")
            for group in self.groups:
                await self.channel_layer.group_add(
                    group,
                    self.channel_name
                )
            print(f"Authenticated user: {self.user}")
        else:
            print("Anonymous user")

        await self.accept()

    async def disconnect(self, close_code):
        if self.user is not None:
            for group in self.groups:
                await self.channel_layer.group_discard(
                    group,
                    self.channel_name
                )

    async def receive_json(self, content):
        message_type = content.get('type', None)
        
        if message_type is not None:
            handler = self.handlers.get(message_type, None)
            if handler is not None:
                await handler(content.get('payload', {}))
            else:
                print(f"Unknown message type: {message_type}")
        else:
            print("No message type provided")
            self.send_json({
                'type': 'error',
                'message': 'No message type provided'
            })

    @database_sync_to_async
    def get_user_channels(self, user):
        channels = Channel.objects.filter(users=user)
        return [f'chat_{channel.id}' for channel in channels]
    
    async def chat_message(self, event):
        """
        Handles messages of type 'chat.message' sent via the channel layer.
        Forwards the payload to the WebSocket client.
        """
        await self.send_json({
            'type': 'message',
            'payload': event['payload']
        })