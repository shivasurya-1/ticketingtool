from django.urls import path
from .views import UserProfileLView

urlpatterns = [
    path('personal_details/', UserProfileLView.as_view(), name='personal-details-list-create'),
    path('personal_details/<int:id>/', UserProfileLView.as_view(), name='user_profile_by_id'),
    path('profile_icon/<int:pk>/', UserProfileLView.as_view(), name='user-profile-summary'),
    path('my_profile/', UserProfileLView.as_view(), name='current-user-profile'),
]