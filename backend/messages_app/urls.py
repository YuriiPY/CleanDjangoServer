from django.urls import path
from .views import get_messages

urlpatterns = [
    path('messages/', get_messages, name='get_messages'),
]
