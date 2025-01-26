import json
import logging
from typing import List, TypedDict

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

class ChatMessage(TypedDict):
    message: str
    sender: str

store: List[ChatMessage] = []

class SocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'chat_group'
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        # Send the current store to the newly connected consumer
        await self.send(text_data=json.dumps(store))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print("Disconnected")

    async def receive(self, text_data: str):
        try:
            message_data: ChatMessage = json.loads(text_data)
            if not isinstance(message_data, dict) or 'message' not in message_data or 'sender' not in message_data:
                raise ValueError("Invalid message format")
            store.append(message_data)
            
            # Broadcast the message to all connected consumers in the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data
                }
            )
            
        except json.JSONDecodeError as e:
            await self.send(text_data=json.dumps({
                "error": "Invalid JSON format"
            }))
        except ValueError as e:
            await self.send(text_data=json.dumps({
                "error": str(e)
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                "error": "Internal server error"
            }))

    async def chat_message(self, event):
        message = event['message']
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

class EchoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data: str):
        await self.send(text_data=text_data)