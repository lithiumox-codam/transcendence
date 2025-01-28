from django.db import models
from django.contrib.auth.models import AbstractUser

class UserStatus(models.TextChoices):
    ONLINE = 'online', ('Online')
    OFFLINE = 'offline', ('Offline')
    BUSY = 'busy', ('Busy')
    AWAY = 'away', ('Away')

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    nickname = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=UserStatus.choices, default=UserStatus.OFFLINE)

    def __str__(self):
        return self.username
