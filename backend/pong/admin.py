from django.contrib import admin
from .models import GameState

@admin.register(GameState)
class GameStateAdmin(admin.ModelAdmin):
    list_display = ('id', 'ball_x', 'ball_y', 'paddle1_y', 'paddle2_y')
