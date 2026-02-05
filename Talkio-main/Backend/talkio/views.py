from django.shortcuts import render
from rest_framework import generics
from .models import User
from .serializers import UserSerializer, ChatSerializer
from rest_framework.permissions import AllowAny

# Create your views here.

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ChatInbox(generics.ListAPIView):
    serializer_class = ChatSerializer