# Generated by Django 5.1.2 on 2025-01-22 19:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0002_gamestate_score1_gamestate_score2'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gamestate',
            name='score1',
        ),
        migrations.RemoveField(
            model_name='gamestate',
            name='score2',
        ),
    ]
