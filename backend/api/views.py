from django.http import JsonResponse
from . import models

def get_items(request):
    items = list(models.Leaderboard.objects.order_by('-score').values())
    return JsonResponse({'items': items})

def get_item(request, id):
    try:
        item = models.Leaderboard.objects.values().get(id=id)
        return JsonResponse({'item': item})
    except models.Leaderboard.DoesNotExist:
        return JsonResponse({'error': 'Leaderboard entry not found'}, status=404)

def create_item(request):
    username = request.POST.get('username')
    score = request.POST.get('score')

    if not username:
        return JsonResponse({'error': 'Missing username'}, status=400)
    
    try:
        score = int(score)
    except (TypeError, ValueError):
        return JsonResponse({'error': 'Score must be a valid number'}, status=400)

    item = models.Leaderboard.objects.create(
        username=username,
        score=score
    )
    
    return JsonResponse({
        'message': 'Leaderboard entry created',
        'item': {
            'id': item.id,
            'username': item.username,
            'score': item.score,
            'updated_at': item.updated_at
        }
    }, status=201)
