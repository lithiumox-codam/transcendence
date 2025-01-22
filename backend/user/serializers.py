from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def validate(self, data):
        if User.objects.filter(username__iexact=data["username"]).exists():
            raise serializers.ValidationError("Username already exists")

        if User.objects.filter(email__iexact=data["email"]).exists():
            raise serializers.ValidationError("Email already exists")

        return data
