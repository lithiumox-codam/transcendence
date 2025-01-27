# Generated by Django 5.1.2 on 2025-01-27 09:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_user_created_at_user_nickname'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='status',
            field=models.CharField(choices=[('online', 'Online'), ('offline', 'Offline'), ('busy', 'Busy'), ('away', 'Away')], default='offline', max_length=20),
        ),
    ]
