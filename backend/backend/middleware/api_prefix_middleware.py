from django.http import HttpResponseRedirect, HttpResponsePermanentRedirect
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

class ApiPrefixMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/'):
            request.path = request.path[4:]
            request.path_info = request.path_info[4:]

    def process_response(self, request, response):
        if isinstance(response, (HttpResponseRedirect, HttpResponsePermanentRedirect)):
            location = response['Location']
            if location.startswith('/') and not location.startswith('/api/'):
                response['Location'] = f'/api{location}'
        
        if response.get('Content-Type', '').startswith('text/html'):
            content = response.content.decode('utf-8')
            if '<form' in content:
                content = content.replace('action="/', 'action="/api/')
                response.content = content.encode('utf-8')
                
        return response