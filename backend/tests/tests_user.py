from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
import io
from rest_framework import status
from rest_framework.test import APITestCase

user_data = {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "testpassword",
}

class TestSignup(APITestCase):
    def test_create_user(self):
        response = self.client.post("/api/auth/signup/", user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if the user was created by trying to log in
        response = self.client.post("/api/auth/login/", user_data)
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Check if the user can access the profile using the token
        response = self.client.get("/api/user/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_duplicate_user(self):
        response = self.client.post("/api/auth/signup/", user_data)

        # create user with same username
        response = self.client.post("/api/auth/signup/", {
            "username": user_data["username"],
            "email": "test@example.com",
            "password": "testpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # create user with same email
        response = self.client.post("/api/auth/signup/", {
            "username": "testuser1",
            "email": user_data["email"],
            "password": "testpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class TestAvatar(APITestCase):
    def setUp(self):
        response = self.client.post("/api/auth/signup/", user_data)
        self.token = response.data["access"]  # Store the token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_upload_avatar(self):
        image = Image.new("RGB", (100, 100))
        image_io = io.BytesIO()
        image.save(image_io, format="PNG")
        image_io.seek(0)
        avatar = SimpleUploadedFile(
            "avatar.png",
            image_io.getvalue(),
            content_type="image/png"
        )

        response = self.client.post(
            "/api/user/avatar/",
            {"avatar": avatar},
            format="multipart"  # Required for file uploads
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

class TestChangePassword(APITestCase):
    def setUp(self):
        response = self.client.post("/api/auth/signup/", user_data)
        self.token = response.data["access"]  # Store the token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_change_password(self):
        response = self.client.put(
            "/api/auth/change-password/",
            {"old_password": user_data["password"], "new_password": "newpassword"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the user can log in with the new password
        response = self.client.post("/api/auth/login/", {
            "username": user_data["username"],
            "password": "newpassword",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the user can't log in with the old password
        response = self.client.post("/api/auth/login/", {
            "username": user_data["username"],
            "password": user_data["password"],
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_invalid(self):
        # Try to change password with wrong old password
        response = self.client.put(
            "/api/auth/change-password/",
            {"old_password": "wrongpassword", "new_password": "newpassword"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Try to change password with the same password
        response = self.client.put(
            "/api/auth/change-password/",
            {"old_password": user_data["password"], "new_password": user_data["password"]}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        
