from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer, ChatSerializer, ProfileSerializer
from .models import Chat, Profile

from django.db.models import Subquery, OuterRef
from django.db.models import Q

# Create your views here.

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# Chat list
class ChatInbox(generics.ListAPIView):
    serializer_class = ChatSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']

        messages = Chat.objects.filter(
            id__in =  Subquery(
                User.objects.filter(
                    Q(sender__receiver=user_id) |
                    Q(receiver__sender=user_id)
                ).distinct().annotate(
                    last_msg=Subquery(
                        Chat.objects.filter(
                            Q(sender=OuterRef('id'),receiver=user_id) |
                            Q(receiver=OuterRef('id'),sender=user_id)
                        ).order_by('-id')[:1].values_list('id',flat=True) 
                    )
                ).values_list('last_msg', flat=True).order_by("-id")
            )
        ).order_by("-id")
            
        return messages
    
# show single message
class GetChat(generics.ListAPIView):
    serializer_class = ChatSerializer
    
    def get_queryset(self):
        sender_id = self.kwargs['sender_id']
        receiver_id = self.kwargs['receiver_id']
        messages =  Chat.objects.filter(sender__in=[sender_id, receiver_id], receiver__in=[sender_id, receiver_id]).order_by("sent_at")
        return messages
    

# Allow sending of message by creating a chat object
class SendMessage(generics.CreateAPIView):
    serializer_class = ChatSerializer


# Show User Profile and allow user to update their details
class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]





class SearchUser(generics.ListAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]  

    def list(self, request, *args, **kwargs):
        username = self.kwargs['username']
        logged_in_user = self.request.user
        # users = Profile.objects.filter(Q(user__username__icontains=username) | Q(full_name__icontains=username) | Q(user__email__icontains=username) & 
        #                                ~Q(user=logged_in_user))
        users = Profile.objects.filter(
            (
                Q(user__username__icontains=username) |
                Q(full_name__icontains=username) |
                Q(user__email__icontains=username)
            ) &
            ~Q(user=logged_in_user)
        )

        if not users.exists():
            return Response(
                {"detail": "No users found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)