# Generated by Django 5.1.2 on 2025-01-22 17:33

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paddle1_y', models.FloatField(default=160)),
                ('paddle2_y', models.FloatField(default=160)),
                ('ball_x', models.FloatField(default=400)),
                ('ball_y', models.FloatField(default=200)),
                ('ball_speed_x', models.FloatField(default=5)),
                ('ball_speed_y', models.FloatField(default=2)),
                ('game_width', models.IntegerField(default=800)),
                ('game_height', models.IntegerField(default=400)),
                ('paddle_height', models.IntegerField(default=100)),
                ('paddle_width', models.IntegerField(default=10)),
                ('ball_size', models.IntegerField(default=20)),
            ],
        ),
    ]
