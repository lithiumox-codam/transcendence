from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Channel

class ChatConsumer(AsyncJsonWebsocketConsumer):
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
        
        if message_type == 'chat.message':
            message = content.get('message', '')
            for group in self.groups:
                await self.channel_layer.group_send(
                    group,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat.message',
            'message': event['message']
        })

    @database_sync_to_async
    def get_user_channels(self, user):
        channels = Channel.objects.filter(users=user)
        return [f'chat_{channel.id}' for channel in channels]