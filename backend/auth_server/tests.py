from django.test import TestCase
from django.urls import reverse
from users.models import PlaceholderUser
import json
from .utils import verify_jwt_token

# Create your tests here.

class RegisterViewTest(TestCase):
    def test_register_user(self):
        url = reverse('register')
        data = {
            'password': 'testpassword123',
            'username': 'testuser'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Check response status
        self.assertEqual(response.status_code, 201)
        
        # Parse response data
        response_data = json.loads(response.content)
        
        # Check if token exists and is valid
        self.assertIn('token', response_data)
        token = response_data['token']
        
        # Verify token
        payload = verify_jwt_token(token)
        self.assertIsNotNone(payload)
        
        # Get the created user
        user = PlaceholderUser.objects.get(username='testuser')
        # Check if the user_id in token matches the created user's id
        self.assertEqual(payload['user_id'], user.id)
        
        # Check if user was created in database
        self.assertEqual(user.username, 'testuser')

class LoginViewTest(TestCase):
    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.user = PlaceholderUser.objects.create_user(
            username=self.username,
            password=self.password
        )

    def test_login_user(self):
        url = reverse('login')
        data = {
            'username': self.username,
            'password': self.password
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Check response status
        self.assertEqual(response.status_code, 200)
        
        # Parse response data
        response_data = json.loads(response.content)
        
        # Check if token exists and is valid
        self.assertIn('token', response_data)
        token = response_data['token']
        
        # Verify token
        payload = verify_jwt_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload['user_id'], self.user.id)
        
        # Check welcome message
        self.assertEqual(response_data['message'], f'Welcome, {self.username}!')

    def test_login_invalid_credentials(self):
        url = reverse('login')
        data = {
            'username': self.username,
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', json.loads(response.content))
