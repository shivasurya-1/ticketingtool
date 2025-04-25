from django.urls import path
from .views import ProjectDetailsAPI,UserProjectDetailsAPI,ProjectDashDetailsAPI

urlpatterns = [
    path('details/', ProjectDetailsAPI.as_view(), name='details'),
    path('user_project_details/', UserProjectDetailsAPI.as_view(), name='user_project_details'),
    path('projectdetails/', ProjectDashDetailsAPI.as_view(), name='projectdetails'),


    # path('personal_details/<int:id>/', UserProfileLView.as_view(), name='user_profile_by_id'),
    # path('profile_icon/<int:pk>/', UserProfileLView.as_view(), name='user-profile-summary'),
    # path('my_profile/', UserProfileLView.as_view(), name='current-user-profile'),
]