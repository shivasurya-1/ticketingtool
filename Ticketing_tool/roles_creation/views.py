
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Role,Permission,RolePermission
from .serializers import RoleSerializer,RolePermissionSerializer,PermissionSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import HasRolePermission
    
class RoleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    # permission_classes = [HasRolePermission]
    authentication_classes = [JWTAuthentication]
    
    # authentication_classes = [JWTAuthentication]

    def get(self, request):
        self.permission_required = "create_users"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        """Get a list of all roles"""
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        self.permission_required = "create_users"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)

        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PermissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    

    def get(self, request):
        """Get a list of all permissions"""
        permissions = Permission.objects.all()
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

   
def post(self, request):
    """Create a new permission (Only Admins should be able to do this)"""
    if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    serializer = PermissionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RolePermissionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = RolePermission.objects.prefetch_related("permission").all()
        serializer = RolePermissionSerializer(roles, many=True)
        return Response(serializer.data)



    def post(self, request):
        """Assign permissions to a role (Only Admins should be able to do this)"""
        if not request.user.role.name == "Admin":
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        role_name = request.data.get("role")
        permission_names = request.data.get("permissions", [])

        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)

        permissions = Permission.objects.filter(name__in=permission_names)

        for perm in permissions:
            RolePermission.objects.get_or_create(role=role, permission=perm)

        return Response({"message": "Permissions assigned successfully"}, status=status.HTTP_200_OK)
   


from .models import UserRole, Role
from .serializers import UserRoleSerializer

# class UserRoleAPIView(APIView):
#     permission_classes = [IsAuthenticated,HasRolePermission]
#     authentication_classes = [JWTAuthentication]

#     def get(self, request):
#         """Fetch all user-role mappings"""
#         self.required_permission = "view_roles"  
#         self.check_permissions(request) 
#         user_roles = UserRole.objects.all()
#         serializer = UserRoleSerializer(user_roles, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


from django.contrib.auth import get_user_model  
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()  

class UserRoleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [ JWTAuthentication]

    def post(self, request):
        self.permission_required = "create_roleS"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        """Assign a role to a user"""
        user_id = request.data.get('user_id')
        role_name = request.data.get('role')

        if not user_id or not role_name:
            return Response({"error": "Both 'user_id' and 'role' are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id) 
        except User.DoesNotExist:
                    return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            role = Role.objects.get(role_id=int(role_name))  # Fetch by role_id
        except ObjectDoesNotExist:
            return Response({"error": f"Role '{role_name}' not found."}, status=404)

                # Create or update the UserRole mapping
        user_role, created = UserRole.objects.update_or_create(
            user=user,
            defaults={'role': role, 'is_active': True}  # Ensure role assignment is active
        )

        message = "Role assigned successfully" if created else "Role updated successfully"
        serializer = UserRoleSerializer(user_role)

        return Response(
            {"message": message, "user_role": serializer.data},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    def get(self, request):
        """Fetch all user-role mappings"""
        self.permission_required = "view_roles"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        user_roles = UserRole.objects.all()
        serializer = UserRoleSerializer(user_roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserRoleDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]  
    authentication_classes = [ JWTAuthentication]

    def get(self, request, user_role_id):
        """Fetch a specific user-role mapping"""
        self.permission_required = "view_roles"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        try:
            user_role = UserRole.objects.get(pk=user_role_id)
        except UserRole.DoesNotExist:
            return Response({"error": "User role mapping not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserRoleSerializer(user_role)
        return Response(serializer.data, status=status.HTTP_200_OK)
