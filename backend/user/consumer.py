from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class UserConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """
        Sends user data to the client and subscribes to user data updates
        """
        self.user = self.scope.get("user", None)
        await self.channel_layer.group_add(
            f"user_data_{self.user.id}",
            self.channel_name
        )
        await self.accept()
        await self.send_user_data()

    async def send_user_data(self):
        user_data = await self.get_user_data(self.user)
        await self.send_json({
            "type": "user_data",
            "data": user_data
        })

    @database_sync_to_async
    def get_user_data(self, user):
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar": user.avatar.url if user.avatar else None,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "status": user.status,
        }

    async def receive_json(self, content):
        """
        Receives and processes JSON messages from the client
        """
        print(content)
        if content.get("type") == "change_status":
            new_status = content.get("status")
            await self.change_status(new_status)
            await self.send_user_data()

    @database_sync_to_async
    def change_status(self, new_status):
        self.user.status = new_status
        self.user.save()
        return new_status
