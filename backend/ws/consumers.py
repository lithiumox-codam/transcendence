import json
import logging
from typing import List, TypedDict, Set

from channels.generic.websocket import WebsocketConsumer

logger = logging.getLogger(__name__)

class ChatMessage(TypedDict):
    message: str
    sender: str

store: List[ChatMessage] = []
# Keep track of all connected consumers
connected_consumers: Set[WebsocketConsumer] = set()

class SocketConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        # Add this consumer to the set of connected consumers
        connected_consumers.add(self)
        self.send(text_data=json.dumps(store))

    def disconnect(self, close_code):
        # Remove this consumer from the set when disconnected
        connected_consumers.remove(self)
        print("Disconnected")

    def receive(self, text_data: str):
        try:
            message_data: ChatMessage = json.loads(text_data)
            if not isinstance(message_data, dict) or 'message' not in message_data or 'sender' not in message_data:
                raise ValueError("Invalid message format")
            store.append(message_data)
            
            # Broadcast the message to all connected consumers
            for consumer in connected_consumers:
                consumer.send(text_data=json.dumps(message_data))
            
        except json.JSONDecodeError as e:
            self.send(text_data=json.dumps({
                "error": "Invalid JSON format"
            }))
        except ValueError as e:
            self.send(text_data=json.dumps({
                "error": str(e)
            }))
        except Exception as e:
            self.send(text_data=json.dumps({
                "error": "Internal server error"
            }))