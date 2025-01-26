import jwt
from channels.auth import AuthMiddlewareStack
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()
        headers = dict(scope["headers"])
        token = None

        if b'sec-websocket-protocol' in headers:
            protocols = headers[b'sec-websocket-protocol'].decode().split(',')
            if len(protocols) == 2 and protocols[0] == 'access_token':
                token = protocols[1].strip()

        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token["user_id"]
                from user.models import User
                user = await sync_to_async(User.objects.get)(id=user_id)
                scope["user"] = user
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist) as e:
                await self.close_connection(send, "Token invalid or expired!\n" + str(e))
        else:
            await self.close_connection(send, "No token provided")

        return await super().__call__(scope, receive, send)
    
    async def close_connection(self, send, message):
        await send({
            "type": "websocket.close",
            "code": 4001,
            "reason": message
        })

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))