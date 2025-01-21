import jwt
from datetime import datetime, timedelta
from django.conf import settings


def generate_jwt_token(user):
	payload = {
		'user_id': user.id,
		'iat': datetime.utcnow(),
		'exp': datetime.utcnow() + timedelta(days=1)
	}
	return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def verify_jwt_token(token):
	try:
		payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
		return payload
	except jwt.InvalidTokenError:
		return None
	except jwt.ExpiredSignatureError:
		return None
	
