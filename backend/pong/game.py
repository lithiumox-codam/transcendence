from pong.models import GameState

def update_game_state(game_id, inputs):
	game = GameState.objects.get(game_id=game_id)

	if inputs.get('w') and game.paddle1_y > 0:
		game.paddle1_y -= 5
	if inputs.get('s') and game.paddle1_y < game.game_height - game.paddle_height:
		game.paddle1_y += 5
	if inputs.get('ArrowUp') and game.paddle2_y > 0:
		game.paddle2_y -= 5
	if inputs.get('ArrowDown') and game.paddle2_y < game.game_height - game.paddle_height:
		game.paddle2_y += 5

	game.ball_x += game.ball_speed_x
	game.ball_y += game.ball_speed_y

	# handle top & bottom wall collision
	if game.ball_y < game.ball_size / 2 or game.ball_y > game.game_height - game.ball_size / 2:
		game.ball_speed_y = -game.ball_speed_y
	
	# handle paddle collision
	if (game.ball_x < game.paddle_width + game.ball_size / 2 and 
		game.paddle1_y < game.ball_y < game.paddle1_y + game.paddle_height):
		game.ball_speed_x = -game.ball_speed_x

	if (game.ball_x > game.game_width - game.paddle_width - game.ball_size / 2 and 
		game.paddle2_y < game.ball_y < game.paddle2_y + game.paddle_height):
		game.ball_speed_x = -game.ball_speed_x
	
	# handle goal ball reset
	if game.ball_x < 0:
		game.ball_x = game.game_width / 2
		game.ball_y = game.game_height / 2
		game.ball_speed_x = 5
		game.ball_speed_y = 2

	elif game.ball_x > game.game_width:
		game.ball_x = game.game_width / 2
		game.ball_y = game.game_height / 2
		game.ball_speed_x = -5
		game.ball_speed_y = 2

	game.save()
	return game

def get_game_state(game_id):
	game = GameState.objects.get(game_id=game_id)
	return game

def game_state_to_json(game):
	return {
		'game_id': game.game_id,
		'paddle1_y': game.paddle1_y,
		'paddle2_y': game.paddle2_y,
		'ball_x': game.ball_x,
		'ball_y': game.ball_y,
		'ball_speed_x': game.ball_speed_x,
		'ball_speed_y': game.ball_speed_y,
	}
