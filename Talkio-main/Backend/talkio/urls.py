from django.urls import path
from . import views


urlpatterns = [
    path("my-messages/<user_id>/", views.ChatInbox.as_view(), name='my_inbox'),
    path("get-messages/<sender_id>/<reciever_id>/", views.GetChat.as_view(), name='get_messages'),
    path("send-messages/", views.SendMessage.as_view(), name='send_messages'),

    
    path("profile/<int:pk>/", views.ProfileDetail.as_view(), name='profile'),
    path("search/<username>/", views.SearchUser.as_view(), name='search_user'),
]