from django.urls import path
from . import views


urlpatterns = [
    path("my-messages/<int:user_id>/", views.ChatInbox.as_view(), name='my_inbox'),
    path("get-messages/<int:sender_id>/<int:receiver_id>/", views.GetChat.as_view(), name='get_messages'),
    path("send-message/", views.SendMessage.as_view(), name='send_messages'),

    
    path("profile/<int:pk>/", views.ProfileDetail.as_view(), name='profile'),
    path("search/<str:username>/", views.SearchUser.as_view(), name='search_user'),
]