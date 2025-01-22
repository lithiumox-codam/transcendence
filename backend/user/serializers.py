from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]

    def validate(self, data):
        if User.objects.filter(username__iexact=data["username"]).exists():
            raise serializers.ValidationError("Username already exists")

        if User.objects.filter(email__iexact=data["email"]).exists():
            raise serializers.ValidationError("Email already exists")

        return data
