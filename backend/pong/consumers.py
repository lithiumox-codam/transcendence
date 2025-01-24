import json
import asyncio
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import GameState
from .game import update_game_state, get_game_state, game_state_to_json

class GameConsumer(AsyncWebsocketConsumer):
	async def init_game(self):
		try:
			game = await database_sync_to_async(get_game_state)(game_id=self.game_id)
		except GameState.DoesNotExist:
			game = GameState.objects.create(game_id=self.game_id)
		return game

	async def connect(self):
		self.game_id = 1
		await self.accept()
		print('WebSocket connected')
		await self.init_game()
		self.game_loop_task = asyncio.create_task(self.game_loop())
		await self.send_game_state()

	async def disconnect(self, close_code):
		if hasattr(self, 'game_loop_task'):
			self.game_loop_task.cancel()
			try:
				await self.game_loop_task
			except asyncio.CancelledError:
				pass
		print(f"WebSocket connection closed with code {close_code}")
		pass

	async def receive(self, text_data):
		print(f"Received message: {text_data}")
		try:
			data = json.loads(text_data)
			if (data.get('type') == 'game_inputs'):
				inputs = data.get('inputs', {})
				print(f"Received inputs: {inputs}")
				self.game = await database_sync_to_async(update_game_state)(game_id=self.game_id, inputs=inputs)
				await self.send_game_state()
		except Exception as e:
			print(f"Error processing message: {e}")
			self.send(text_data=json.dumps({
				'type': 'websocket.error',
				'message': f"Error processing message: {e}"
			}))

	async def send_game_state(self):
		try:
			self.game = await database_sync_to_async(get_game_state)(game_id=self.game_id)
			await self.send(text_data=json.dumps({
				'type': 'game_state',
				'game': game_state_to_json(self.game)
			}))
		except Exception as e:
			print(f"Error sending game state: {e}")

	async def game_loop(self):
		try:
			while True:
				self.game = await database_sync_to_async(update_game_state)(game_id=self.game_id, inputs={})
				await self.send_game_state()
				await asyncio.sleep(1/60)
		except asyncio.CancelledError:
			print("Game loop cancelled")
			pass
		except Exception as e:
			print(f"Error in game loop: {e}")


