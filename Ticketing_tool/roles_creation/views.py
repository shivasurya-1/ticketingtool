
# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from .models import Role,Permission,RolePermission
# # from .serializers import RoleSerializer,RolePermissionSerializer,PermissionSerializer
# # from rest_framework.permissions import IsAuthenticated
# # from rest_framework_simplejwt.authentication import JWTAuthentication
# # from .permissions import HasRolePermission
    
# # class RoleAPIView(APIView):
# #     permission_classes = [IsAuthenticated]
# #     # permission_classes = [HasRolePermission]
# #     authentication_classes = [JWTAuthentication]
    
# #     # authentication_classes = [JWTAuthentication]

# #     def get(self, request):
# #         self.permission_required = "view_roles"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)
# #         """Get a list of all roles"""
# #         roles = Role.objects.all()
# #         serializer = RoleSerializer(roles, many=True)
# #         return Response(serializer.data, status=status.HTTP_200_OK)

# #     def post(self, request):
# #         self.permission_required = "create_roles"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)

# #         serializer = RoleSerializer(data=request.data)
# #         if serializer.is_valid():
# #             serializer.save()
# #             return Response(serializer.data, status=status.HTTP_201_CREATED)
# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# #     def put(self, request, pk):
# #         self.permission_required = "update_roles"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)
# #         """Update a role"""
# #         try:
# #             role = Role.objects.get(pk=pk)
# #         except Role.DoesNotExist:
# #             return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)

# #         serializer = RoleSerializer(role, data=request.data, partial=True)
# #         if serializer.is_valid():
# #             serializer.save()
# #             return Response(serializer.data, status=status.HTTP_200_OK)
# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# #     def delete(self, request, pk):
# #         self.permission_required = "delete_roles"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)
# #         """Delete a role"""
# #         try:
# #             role = Role.objects.get(pk=pk)
# #             role.delete()
# #             return Response(status=status.HTTP_204_NO_CONTENT)
# #         except Role.DoesNotExist:
# #             return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
# #     # def get_permissions(self, request):
# #     #     self.permission_required = "view_roles"
    
# #     #     if not HasRolePermission().has_permission(request, self.permission_required):
# #     #      return Response({'error': 'Permission denied.'}, status=403)
# #     #     """Get a list of all permissions"""
# #     #     permissions = Permission.objects.all()
# #     #     serializer = PermissionSerializer(permissions, many=True)
# #     #     return Response(serializer.data, status=status.HTTP_200_OK)
    



# # class PermissionAPIView(APIView):
# #     permission_classes = [IsAuthenticated]
# #     authentication_classes = [JWTAuthentication]
    

# #     def get(self, request):
# #         """Get a list of all permissions"""
# #         permissions = Permission.objects.all()
# #         serializer = PermissionSerializer(permissions, many=True)
# #         return Response(serializer.data, status=status.HTTP_200_OK)

    
# #     def post(self, request):
# #         """Create a new permission (Only Admins should be able to do this)"""
# #         if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
# #             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

# #         serializer = PermissionSerializer(data=request.data)
# #         if serializer.is_valid():
# #             serializer.save()
# #             return Response(serializer.data, status=status.HTTP_201_CREATED)
# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# #     def put(self, request, pk):
# #         """Update a permission (Only Admins should be able to do this)"""
# #         if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
# #             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

# #         try:
# #             permission = Permission.objects.get(pk=pk)
# #         except Permission.DoesNotExist:
# #             return Response({"error": "Permission not found"}, status=status.HTTP_404_NOT_FOUND)

# #         serializer = PermissionSerializer(permission, data=request.data, partial=True)
# #         if serializer.is_valid():
# #             serializer.save()
# #             return Response(serializer.data, status=status.HTTP_200_OK)
# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# #     def delete(self, request, pk):
# #         """Delete a permission (Only Admins should be able to do this)"""
# #         if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
# #             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

# #         try:
# #             permission = Permission.objects.get(pk=pk)
# #             permission.delete()
# #             return Response(status=status.HTTP_204_NO_CONTENT)
# #         except Permission.DoesNotExist:
# #             return Response({"error": "Permission not found"}, status=status.HTTP_404_NOT_FOUND)

# # class RolePermissionAPIView(APIView):
# #     permission_classes = [IsAuthenticated]

# #     def get(self, request):
# #         roles = RolePermission.objects.prefetch_related("permission").all()
# #         serializer = RolePermissionSerializer(roles, many=True)
# #         return Response(serializer.data)



# #     def post(self, request):
# #         """Assign permissions to a role (Only Admins should be able to do this)"""
# #         if not request.user.role.name == "Admin":
# #             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

# #         role_name = request.data.get("role")
# #         permission_names = request.data.get("permissions", [])

# #         try:
# #             role = Role.objects.get(name=role_name)
# #         except Role.DoesNotExist:
# #             return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)

# #         permissions = Permission.objects.filter(name__in=permission_names)

# #         for perm in permissions:
# #             RolePermission.objects.get_or_create(role=role, permission=perm)

# #         return Response({"message": "Permissions assigned successfully"}, status=status.HTTP_200_OK)
# #     def delete(self, request, pk):
# #         """Remove permissions from a role (Only Admins should be able to do this)"""
# #         if not request.user.role.name == "Admin":
# #             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

# #         try:
# #             role_permission = RolePermission.objects.get(pk=pk)
# #             role_permission.delete()
# #             return Response(status=status.HTTP_204_NO_CONTENT)
# #         except RolePermission.DoesNotExist:
# #             return Response({"error": "Role permission mapping not found"}, status=status.HTTP_404_NOT_FOUND)
# #     def put(self, request, pk):
# #         """Update permissions for a role (Only Admins should be able to do this)"""
# #         if not request.user.role.name == "Admin":
# #             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
# #         try:
# #             role_permission = RolePermission.objects.get(pk=pk)
# #         except RolePermission.DoesNotExist:
# #             return Response({"error": "Role permission mapping not found"}, status=status.HTTP_404_NOT_FOUND)
# #         role_name = request.data.get("role")
# #         permission_names = request.data.get("permissions", [])
# #         try:    
# #             role = Role.objects.get(name=role_name)
# #         except Role.DoesNotExist:
# #             return Response({"error": "Role not found"}, status=status.HTTP_404_NOT_FOUND)
# #         permissions = Permission.objects.filter(name__in=permission_names)
# #         role_permission.role = role
# #         role_permission.permission.set(permissions)
# #         role_permission.save()
# #         return Response({"message": "Permissions updated successfully"}, status=status.HTTP_200_OK)
   


# # from .models import UserRole, Role
# # from .serializers import UserRoleSerializer

# # # class UserRoleAPIView(APIView):
# # #     permission_classes = [IsAuthenticated,HasRolePermission]
# # #     authentication_classes = [JWTAuthentication]

# # #     def get(self, request):
# # #         """Fetch all user-role mappings"""
# # #         self.required_permission = "view_roles"  
# # #         self.check_permissions(request) 
# # #         user_roles = UserRole.objects.all()
# # #         serializer = UserRoleSerializer(user_roles, many=True)
# # #         return Response(serializer.data, status=status.HTTP_200_OK)


# # from django.contrib.auth import get_user_model  
# # from django.core.exceptions import ObjectDoesNotExist

# # User = get_user_model()  

# # class UserRoleAPIView(APIView):
# #     permission_classes = [IsAuthenticated]
# #     authentication_classes = [ JWTAuthentication]

# #     def post(self, request):
# #         self.permission_required = "create_roleS"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)
# #         """Assign a role to a user"""
# #         user_id = request.data.get('user_id')
# #         role_name = request.data.get('role')

# #         if not user_id or not role_name:
# #             return Response({"error": "Both 'user_id' and 'role' are required."}, status=status.HTTP_400_BAD_REQUEST)
# #         try:
# #             user = User.objects.get(id=user_id) 
# #         except User.DoesNotExist:
# #                     return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
# #         try:
# #             role = Role.objects.get(role_id=int(role_name))  # Fetch by role_id
# #         except ObjectDoesNotExist:
# #             return Response({"error": f"Role '{role_name}' not found."}, status=404)

# #                 # Create or update the UserRole mapping
# #         user_role, created = UserRole.objects.update_or_create(
# #             user=user,
# #             defaults={'role': role, 'is_active': True}  # Ensure role assignment is active
# #         )

# #         message = "Role assigned successfully" if created else "Role updated successfully"
# #         serializer = UserRoleSerializer(user_role)

# #         return Response(
# #             {"message": message, "user_role": serializer.data},
# #             status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
# #         )
    
# #     def get(self, request):
# #         """Fetch all user-role mappings"""
# #         self.permission_required = "view_roles"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)
# #         user_roles = UserRole.objects.all()
# #         serializer = UserRoleSerializer(user_roles, many=True)
# #         return Response(serializer.data, status=status.HTTP_200_OK)
    
# # class UserRoleDetailAPIView(APIView):
# #     permission_classes = [IsAuthenticated]  
# #     authentication_classes = [ JWTAuthentication]

# #     def get(self, request, user_role_id):
# #         """Fetch a specific user-role mapping"""
# #         self.permission_required = "view_roles"
    
# #         if not HasRolePermission().has_permission(request, self.permission_required):
# #          return Response({'error': 'Permission denied.'}, status=403)
# #         try:
# #             user_role = UserRole.objects.get(pk=user_role_id)
# #         except UserRole.DoesNotExist:
# #             return Response({"error": "User role mapping not found."}, status=status.HTTP_404_NOT_FOUND)
        
# #         serializer = UserRoleSerializer(user_role)
# #         return Response(serializer.data, status=status.HTTP_200_OK)



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import Role, Permission, RolePermission, UserRole
# from .serializers import RoleSerializer, PermissionSerializer, RolePermissionSerializer, UserRoleSerializer
# from rest_framework.permissions import IsAuthenticated
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from django.shortcuts import get_object_or_404
# from login_details.models import User
# from roles_creation.permissions import HasRolePermission
# from django.core.exceptions import ObjectDoesNotExist
# from django.contrib.auth import get_user_model
# from django.core.exceptions import ObjectDoesNotExist
# User = get_user_model()

# # Custom Permission Check Decorator for Admin Permissions
# def admin_required(func):
#     def wrapper(self, request, *args, **kwargs):
#         if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
#             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
#         return func(self, request, *args, **kwargs)
#     return wrapper

# class BasePermissionView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def check_permission(self, request, permission_required):
#         if not HasRolePermission().has_permission(request, permission_required):
#             return Response({'error': 'Permission denied.'}, status=403)


# class RoleAPIView(BasePermissionView):
#     def get(self, request):
#         self.check_permission(request, "view_roles")
#         roles = Role.objects.all()
#         serializer = RoleSerializer(roles, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def post(self, request):
#         self.check_permission(request, "create_roles")
#         serializer = RoleSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def put(self, request, pk):
#         self.check_permission(request, "update_roles")
#         role = get_object_or_404(Role, pk=pk)
#         serializer = RoleSerializer(role, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         self.check_permission(request, "delete_roles")
#         role = get_object_or_404(Role, pk=pk)
#         role.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class PermissionAPIView(BasePermissionView):
#     def get(self, request):
#         permissions = Permission.objects.all()
#         serializer = PermissionSerializer(permissions, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @admin_required
#     def post(self, request):
#         serializer = PermissionSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @admin_required
#     def put(self, request, pk):
#         permission = get_object_or_404(Permission, pk=pk)
#         serializer = PermissionSerializer(permission, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @admin_required
#     def delete(self, request, pk):
#         permission = get_object_or_404(Permission, pk=pk)
#         permission.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class RolePermissionAPIView(BasePermissionView):
#     def get(self, request):
#         roles = RolePermission.objects.prefetch_related("permission").all()
#         serializer = RolePermissionSerializer(roles, many=True)
#         return Response(serializer.data)

#     @admin_required
#     def post(self, request):
#         role_name = request.data.get("role")
#         permission_names = request.data.get("permissions", [])

#         role = get_object_or_404(Role, name=role_name)
#         permissions = Permission.objects.filter(name__in=permission_names)

#         for perm in permissions:
#             RolePermission.objects.get_or_create(role=role, permission=perm)

#         return Response({"message": "Permissions assigned successfully"}, status=status.HTTP_200_OK)

#     @admin_required
#     def delete(self, request, pk):
#         role_permission = get_object_or_404(RolePermission, pk=pk)
#         role_permission.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

#     @admin_required
#     def put(self, request, pk):
#         role_permission = get_object_or_404(RolePermission, pk=pk)
#         role_name = request.data.get("role")
#         permission_names = request.data.get("permissions", [])

#         role = get_object_or_404(Role, name=role_name)
#         permissions = Permission.objects.filter(name__in=permission_names)

#         role_permission.role = role
#         role_permission.permission.set(permissions)
#         role_permission.save()

#         return Response({"message": "Permissions updated successfully"}, status=status.HTTP_200_OK)


# class UserRoleAPIView(BasePermissionView):
#     def post(self, request):
#         self.check_permission(request, "create_roles")
#         user_id = request.data.get('user_id')
#         role_name = request.data.get('role')

#         if not user_id or not role_name:
#             return Response({"error": "Both 'user_id' and 'role' are required."}, status=status.HTTP_400_BAD_REQUEST)

#         user = get_object_or_404(User, id=user_id)
#         role = get_object_or_404(Role, role_id=int(role_name))  # Ensure role_id is integer
#         user_role, created = UserRole.objects.update_or_create(user=user, defaults={'role': role, 'is_active': True})

#         message = "Role assigned successfully" if created else "Role updated successfully"
#         serializer = UserRoleSerializer(user_role)

#         return Response(
#             {"message": message, "user_role": serializer.data},
#             status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
#         )

#     def get(self, request):
#         self.check_permission(request, "view_roles")
#         user_roles = UserRole.objects.all()
#         serializer = UserRoleSerializer(user_roles, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class UserRoleDetailAPIView(BasePermissionView):
#     def get(self, request, user_role_id):
#         self.check_permission(request, "view_roles")
#         user_role = get_object_or_404(UserRole, pk=user_role_id)
#         serializer = UserRoleSerializer(user_role)
#         return Response(serializer.data, status=status.HTTP_200_OK)


from rest_framework.exceptions import NotFound, ValidationError
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Role, Permission, RolePermission, UserRole
from .serializers import RoleSerializer, PermissionSerializer, RolePermissionSerializer, UserRoleSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from roles_creation.permissions import HasRolePermission
from django.core.exceptions import ObjectDoesNotExist
User = get_user_model()
from .permissions import HasRolePermission
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied

# Custom Permission Check Decorator for Admin Permissions
# def admin_required(func):
#     def wrapper(self, request, *args, **kwargs):
#         if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
#             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
#         return func(self, request, *args, **kwargs)
#     return wrapper

# class BasePermissionView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def check_permission(self, request, permission_required):
#         if not HasRolePermission().has_permission(request, permission_required):
#             return Response({'error': 'Permission denied.'}, status=403)
# # 🔐 Admin decorator (optional usage)
# def admin_required(func):
#     def wrapper(self, request, *args, **kwargs):
#         if not request.user.user_roles.filter(role__name="Admin", is_active=True).exists():
#             return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
#         return func(self, request, *args, **kwargs)
#     return wrapper


# # 🔐 Base class for authentication and permission checking
# class BasePermissionView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def check_permission(self, request, permission_required):
#         if not HasRolePermission().has_permission(request, permission_required):
#             raise PermissionDenied("Permission denied: {}".format(permission_required))
class RoleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        """ Handle GET requests to fetch all roles """
        self.permission_required = "view_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "view_roles")
            roles = Role.objects.all()
            if not roles:
                raise NotFound("No roles found.")
            serializer = RoleSerializer(roles, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """ Handle POST requests to create a new role """
        self.permission_required = "create_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "create_roles")
            serializer = RoleSerializer(data=request.data)
            if serializer.is_valid():
                # Check for duplicate roles based on some field
                if Role.objects.filter(name=request.data.get('name')).exists():
                    raise ValidationError("A role with this name already exists.")
                serializer.save(created_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({"error": f"Integrity Error: {str(e)}"}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class RoleDetailAPIView(APIView):
    def get(self, request, pk):
        """ Handle GET requests to fetch a specific role """
        self.permission_required = "view_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "view_roles")
            role = get_object_or_404(Role, pk=pk)
            serializer = RoleSerializer(role)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, role_id):
        """ Handle PUT requests to update an existing role """
        self.permission_required = "update_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "update_roles")
            role = get_object_or_404(Role, pk=role_id)
            serializer = RoleSerializer(role, data=request.data, partial=True)
            if serializer.is_valid():
                # Check for duplicate roles based on some field
                if Role.objects.filter(name=request.data.get('name')).exclude(pk=role_id).exists():
                    raise ValidationError("A role with this name already exists.")
                serializer.save(modified_by=request.user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist as e:
            return Response({"error": f"Role not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, role_id):
        """ Handle DELETE requests to remove a role """
        self.permission_required = "delete_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "delete_roles")
            role = get_object_or_404(Role, pk=role_id)
            role.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Role.DoesNotExist:
            return Response({"error": "Role not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PermissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]    

    def get(self, request):
        """ Handle GET requests to fetch all permissions """
        self.permission_required = "view_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            permissions = Permission.objects.all()
            if not permissions:
                raise NotFound("No permissions found.")
            serializer = PermissionSerializer(permissions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # @admin_required
    def post(self, request):
        """ Handle POST requests to create a new permission """
        self.permission_required = "create_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            serializer = PermissionSerializer(data=request.data)
            if serializer.is_valid():
                # Check for duplicate permissions based on the name
                if Permission.objects.filter(name=request.data.get('name')).exists():
                    raise ValidationError("A permission with this name already exists.")
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({"error": f"Integrity Error: {str(e)}"}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # @admin_required
    def put(self, request, pk):
        """ Handle PUT requests to update an existing permission """
        self.permission_required = "update_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            permission = get_object_or_404(Permission, pk=pk)
            serializer = PermissionSerializer(permission, data=request.data, partial=True)
            if serializer.is_valid():
                # Check for duplicate permissions based on name
                if Permission.objects.filter(name=request.data.get('name')).exclude(pk=pk).exists():
                    raise ValidationError("A permission with this name already exists.")
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Permission.DoesNotExist:
            return Response({"error": "Permission not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # @admin_required
    def delete(self, request, pk):
        """ Handle DELETE requests to remove a permission """
        self.permission_required = "delete_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            permission = get_object_or_404(Permission, pk=pk)
            permission.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Permission.DoesNotExist:
            return Response({"error": "Permission not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
class RolePermissionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]    

    def get(self, request):
        """ Handle GET requests to fetch all role-permission associations """ 
        self.permission_required = "view_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            role_permissions = RolePermission.objects.all()
            if not role_permissions:
                raise NotFound("No role-permission associations found.")
            serializer = RolePermissionSerializer(role_permissions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """ Handle POST requests to assign a permission to a role """
        self.permission_required = "create_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "assign_permissions_to_roles")
            serializer = RolePermissionSerializer(data=request.data)
            if serializer.is_valid():
                # Validate if the role already has the permission
                if RolePermission.objects.filter(role=request.data['role'], permission=request.data['permission']).exists():
                    raise ValidationError("This permission is already assigned to the role.")
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def put(self, request, pk):
        """ Handle PUT requests to update a role-permission association """
        self.permission_required = "update_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "update_permissions")
            role_permission = get_object_or_404(RolePermission, pk=pk)
            serializer = RolePermissionSerializer(role_permission, data=request.data, partial=True)
            if serializer.is_valid():
                # Validate if the role already has the permission
                if RolePermission.objects.filter(role=request.data['role'], permission=request.data['permission']).exclude(pk=pk).exists():
                    raise ValidationError("This permission is already assigned to the role.")
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request, role_permission_id):
        """ Handle GET requests to fetch a specific role-permission association """
        self.permission_required = "view_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "view_permissions")
            role_permission = get_object_or_404(RolePermission, pk=role_permission_id)
            serializer = RolePermissionSerializer(role_permission)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except RolePermission.DoesNotExist:
            return Response({"error": "Role-Permission association not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # @admin_required
    def delete(self, request, pk):
        """ Handle DELETE requests to remove a role-permission association """
        self.permission_required = "dlete_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "remove_permissions_from_roles")
            role_permission = get_object_or_404(RolePermission, pk=pk)
            role_permission.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RolePermission.DoesNotExist:
            return Response({"error": "Role-Permission association not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserRoleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def check_permission(self, request, permission_required):
        """ Check if the user has the required permission """
        if not HasRolePermission().has_permission(request, permission_required):
            return Response({'error': 'Permission denied.'}, status=403)

    def get(self, request):     
        """ Handle GET requests to fetch all user-role associations """
        self.permission_required = "view_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user_roles = UserRole.objects.all()
            if not user_roles:
                raise NotFound("No user-role associations found.")
            serializer = UserRoleSerializer(user_roles, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # def post(self, request):
    #     """ Handle POST requests to assign a role to a user """
    #     self.permission_required = "create_roles"
    #     try:
    #         self.check_permission(request, "assign_roles_to_users")
    #         serializer = UserRoleSerializer(data=request.data)
    #         if serializer.is_valid():
    #             # Validate if the user already has the role
    #             if UserRole.objects.filter(user=request.data['user'], role=request.data['role']).exists():
    #                 raise ValidationError("This role is already assigned to the user.")
    #             serializer.save()
    #             return Response(serializer.data, status=status.HTTP_201_CREATED)
    #         raise ValidationError(serializer.errors)
    #     except ValidationError as e:
    #         return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # def post(self, request):
    #     """ Handle POST requests to assign a role to a user """
    #     self.permission_required = "create_roles"
    
    #     if not HasRolePermission().has_permission(request, self.permission_required):
    #      return Response({'error': 'Permission denied.'}, status=403)
    #     try:
    #         # self.check_permission(request, "assign_roles_to_users")
    #         serializer = UserRoleSerializer(data=request.data)
    #         if serializer.is_valid():
    #             if UserRole.objects.filter(user=request.data['user'], role=request.data['role']).exists():
    #                 raise ValidationError("This role is already assigned to the user.")
    #             serializer.save()
    #             return Response(serializer.data, status=status.HTTP_201_CREATED)
    #         raise ValidationError(serializer.errors)
    #     except ValidationError as e:
    #         return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    #     except PermissionDenied as e:
    #         return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
    #     except Exception as e:
    #         return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Assign a role to a user."""
        self.permission_required = "create_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            # ✅ Expecting: {"user": 1, "role": 2}
            serializer = UserRoleSerializer(data=request.data)
            if serializer.is_valid():
                # ✅ Check for duplicate
                if UserRole.objects.filter(user=request.data['user'], role=request.data['role']).exists():
                    return Response({'error': 'This role is already assigned to the user.'}, status=status.HTTP_400_BAD_REQUEST)

                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class UserRoleDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]  
    authentication_classes = [JWTAuthentication]
    def put(self, request,user_role_id):
        """ Handle PUT requests to update a user-role association """
        self.permission_required = "update_roles"
        if not HasRolePermission().has_permission(request, self.permission_required):   
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # self.check_permission(request, "update_roles")
            user_role = get_object_or_404(UserRole, pk=user_role)
            serializer = UserRoleSerializer(user_role, data=request.data, partial=True)
            if serializer.is_valid():
                # Validate if the user already has the role
                if UserRole.objects.filter(user=request.data['user'], role=request.data['role']).exclude(pk=user_role_id).exists():
                    raise ValidationError("This role is already assigned to the user.")
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            raise ValidationError(serializer.errors)
        except ValidationError as e:
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request, user_role_id):
        """ Handle GET requests to fetch a specific user-role association """
        try:
            # self.check_permission(request, "view_roles")
            user_role = get_object_or_404(UserRole, pk=user_role_id)
            serializer = UserRoleSerializer(user_role)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserRole.DoesNotExist:
            return Response({"error": "User-Role association not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def delete(self, request, user_role_id):
        """ Handle DELETE requests to remove a user-role association """
        try:
            # self.check_permission(request, "remove_roles_from_users")
            user_role = get_object_or_404(UserRole, pk=user_role_id)
            user_role.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserRole.DoesNotExist:
            return Response({"error": "User-Role association not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)