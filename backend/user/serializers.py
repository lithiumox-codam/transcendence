from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    # TODO: Add password validation
    def validate(self, data):
        if User.objects.filter(username__iexact=data["username"]).exists():
            raise serializers.ValidationError("Username already exists")

        if User.objects.filter(email__iexact=data["email"]).exists():
            raise serializers.ValidationError("Email already exists")

        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "avatar"]

    def validate(self, data):
        if len(data) == 0:
            raise serializers.ValidationError("No fields to update")

        if (
            data.get("username")
            and User.objects.filter(username__iexact=data["username"]).exists()
        ):
            raise serializers.ValidationError("Username already exists")

        if (
            data.get("email")
            and User.objects.filter(email__iexact=data["email"]).exists()
        ):
            raise serializers.ValidationError("Email already exists")

        return data

    def save(self, *args, **kwargs):
        if self.validated_data.get("avatar"):
            if self.instance.avatar:
                self.instance.avatar.delete()

            # change file name to user id
            # change file name to user id
            # TODO: support other image formats
            self.validated_data["avatar"].name = f"{self.instance.id}.png"

        return super().save(*args, **kwargs)
