from channels.generic.websocket import AsyncJsonWebsocketConsumer

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_name = 'chat_group'  # Define the group name
        
        # get the user and print out the user details
        user = self.scope.get("user", None)
        # if there is a user get their details
        if user is not None:
            print(f"Authenticated user: {user}")
        else:
            print("Anonymous user")

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
