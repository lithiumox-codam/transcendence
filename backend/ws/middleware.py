import jwt
from urllib.parse import parse_qs
from channels.auth import AuthMiddlewareStack
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        self.scope = scope
        close_old_connections()
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("jwt", [None])[0]

        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token["user_id"]
                from user.models import User
                user = await sync_to_async(User.objects.get)(id=user_id)
                scope["user"] = user
                await self.update_status(user, "online")
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist) as e:
                await self.close_connection(send, "Token invalid or expired!\n" + str(e))
        else:
            await self.close_connection(send, "No token provided")

        async def custom_receive():
            message = await receive()
            if message["type"] == "websocket.disconnect":
                await self.update_status(scope["user"], "offline")
            return message

        return await super().__call__(scope, custom_receive, send)
    
    async def close_connection(self, send, message):
        user = self.scope.get("user", None)
        if user is not None:
            await self.update_status(user, "offline")
        await send({
            "type": "websocket.close",
            "code": 4001,
            "reason": message
        })
    
    async def update_status(self, user, status):
        user.status = status
        await sync_to_async(user.save)()

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))