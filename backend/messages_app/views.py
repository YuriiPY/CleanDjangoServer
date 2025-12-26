from django.http import JsonResponse
from .models import Message


def get_messages(request):
    if request.method == "GET":
        messages = Message.objects.all().values('text')
        messages_list = list(messages)

        return JsonResponse(messages_list, safe=False)
