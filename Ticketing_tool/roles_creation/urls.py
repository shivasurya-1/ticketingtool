
from django.urls import path
from .views import RoleAPIView, PermissionAPIView, RolePermissionAPIView,UserRoleAPIView

urlpatterns = [
    path('create/', RoleAPIView.as_view(), name='role-list-create'),
    path('<int:pk>/',RoleAPIView.as_view(),name = 'role_update'),
    path('permissions/', PermissionAPIView.as_view(), name='permission-list-create'),
    path('assign-permissions/', RolePermissionAPIView.as_view(), name='assign-permissions'),
    path('user_role/',UserRoleAPIView.as_view(),name = 'user_role'),
    # path('user_role/<int:user_role_id>/',UserRoleDetailAPIView.as_view(),name = 'user_role_detail')
]
