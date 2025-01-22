from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import GameState
from .game import update_game_state
from django.core.exceptions import ObjectDoesNotExist

@api_view(['GET'])
def getGameState(request, game_id):
	try:
		game = GameState.objects.get(id=game_id)
		return Response({
			'paddle1_y': game.paddle1_y,
			'paddle2_y': game.paddle2_y,
			'ball_x': game.ball_x,
			'ball_y': game.ball_y,
			'ball_speed_x': game.ball_speed_x,
			'ball_speed_y': game.ball_speed_y,
		})
	except ObjectDoesNotExist:
		# Create a new game if one doesn't exist
		game = GameState.objects.create()
		return Response({
			'paddle1_y': game.paddle1_y,
			'paddle2_y': game.paddle2_y,
			'ball_x': game.ball_x,
			'ball_y': game.ball_y,
			'ball_speed_x': game.ball_speed_x,
			'ball_speed_y': game.ball_speed_y,
		}, status=201)  # 201 Created
	except Exception as e:
		print(f"Error in getGameState: {str(e)}")  # Add logging
		return Response(
			{"error": "Failed to get game state", "detail": str(e)}, 
			status=500
		)

@api_view(['POST'])
def updateGameState(request, game_id):
	try:
		inputs = request.data.get('inputs', {})
		game = update_game_state(game_id, inputs)
		return Response({
			'status': 'updated',
			'game': {
				'paddle1_y': game.paddle1_y,
				'paddle2_y': game.paddle2_y,
				'ball_x': game.ball_x,
				'ball_y': game.ball_y,
				'ball_speed_x': game.ball_speed_x,
				'ball_speed_y': game.ball_speed_y,
			}
		})
	except ObjectDoesNotExist:
		return Response(
			{"error": "Game not found"}, 
			status=404
		)
	except Exception as e:
		print(f"Error in updateGameState: {str(e)}")  # Add logging
		return Response(
			{"error": "Failed to update game state", "detail": str(e)}, 
			status=500
		)
