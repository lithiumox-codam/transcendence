from django.db.models.signals import post_migrate
from django.contrib.auth import get_user_model
from django.conf import settings
from django.dispatch import receiver


@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    username = settings.ADMIN_USERNAME
    email = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASSWORD

    if not get_user_model().objects.filter(username=username).exists():
        get_user_model().objects.create_superuser(username, email, password)
        print(f"Superuser created with username: {username}")
