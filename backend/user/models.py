from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    nickname = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.username

