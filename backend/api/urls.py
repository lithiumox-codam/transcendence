from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_items, name='get_items'),
    path('<int:id>/', views.get_item, name='get_item'),
    path('create/', views.create_item, name='create_item'),
]
