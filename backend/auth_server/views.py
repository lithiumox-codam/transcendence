from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views import View
from django.contrib.auth import authenticate, login
from .utils import generate_jwt_token
from django.views.decorators.csrf import csrf_exempt
import json

User = get_user_model()


class RegisterView(View):
	@csrf_exempt
	def post(self, request):
		try:
			data = json.loads(request.body)
			username = data.get('username')
			password = data.get('password')

			if not username or not password:
				return JsonResponse({'error': 'Invalid request data'}, status=400)
			if User.objects.filter(username=username).exists():
				return JsonResponse({'error': 'Username already exists'}, status=400)
			
			user = User.objects.create_user(username=username, password=password)
			token = generate_jwt_token(user)
			return JsonResponse({'message': 'User registered successfully', 'token': token, 'user': user.username}, status=201)
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid request data'}, status=400)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)


class LoginView(View):
	@csrf_exempt
	def post(self, request):
		try:
			data = json.loads(request.body)
			username = data.get('username')
			password = data.get('password')

			user = authenticate(username=username, password=password)
			if user is None:
				return JsonResponse({'error': 'Invalid credentials'}, status=401)
			token = generate_jwt_token(user)
			login(request, user)
			return JsonResponse({'message': f'Welcome, {user.username}!', 'token': token, 'user': user.username}, status=200)
		except json.JSONDecodeError:
			return JsonResponse({'error': 'Invalid request data'}, status=400)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)


