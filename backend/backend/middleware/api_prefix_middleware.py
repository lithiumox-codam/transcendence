from django.http import HttpResponseRedirect, HttpResponsePermanentRedirect
from django.utils.deprecation import MiddlewareMixin

class ApiPrefixMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if isinstance(response, (HttpResponseRedirect, HttpResponsePermanentRedirect)):
            location = response['Location']
            if location.startswith('/') and not location.startswith('/api'):
                response['Location'] = '/api' + location
        return response
