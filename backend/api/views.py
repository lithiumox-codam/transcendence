from django.http import JsonResponse
from . import models

def get_items(request):
    items = list(models.Item.objects.values())
    return JsonResponse({'items': items})

def get_item(request, id):
    try:
        item = models.Item.objects.values().get(id=id)
        return JsonResponse({'item': item})
    except models.Item.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)

def create_item(request):
    name = request.POST.get('name')
    description = request.POST.get('description')

    if not name or not description:
        return JsonResponse({'error': 'Missing name or description'}, status=400)

    item = models.Item.objects.create(name=name, description=description)
    return JsonResponse({'message': 'Item created', 'item_id': item.id}, status=201)
