from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        
        # Add this channel to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Remove this channel from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        # Handle incoming JSON messages
        message_type = content.get('type', None)
        
        if message_type == 'chat.message':
            message = content.get('message', '')
            # Broadcast the message to the group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat.message',
                    'message': message
                }
            )

    async def chat_message(self, event):
        # Send the message to WebSocket
        await self.send_json({
            'type': 'chat.message',
            'message': event['message']
        })
