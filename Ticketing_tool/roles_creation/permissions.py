# import logging
# from rest_framework.permissions import BasePermission
# from roles_creation.models import UserRole, RolePermission, Permission

# logger = logging.getLogger(__name__)

# class HasRolePermission(BasePermission):
#     ACTION_PERMISSIONS = {
#         "GET": "view",
#         "POST": "create",
#         "PUT": "update",
#         "PATCH": "update",
#         "DELETE": "delete",
#     }

#     def has_permission(self, request, required_permission:str):
#         logger.info(f"🔍 Checking permissions for user: {request.user}")

#         if not request.user or not request.user.is_authenticated:
#             logger.warning("⛔ User is not authenticated!")
#             return False



#         print(required_permission)
#         user_roles = UserRole.objects.filter(user=request.user).values_list('role__name', flat=True)
#         print(user_roles)

#         assigned_permissions = RolePermission.objects.filter(
#             role__name__in=user_roles

#         ).values_list('permission__name', flat=True)
#         print(assigned_permissions)
#         if required_permission in assigned_permissions:
#             pass
#         else:
#             self.permission_denied(
#                     request,
#                     message=getattr(required_permission, 'message', None),
#                     code=getattr(required_permission, 'code', None)
#                 )
#         logger.info(f"🔍 Assigned permissions: {list(assigned_permissions)}")

#         # Check if required permission exists
#         if required_permission in assigned_permissions:
#             logger.info(f"✅ Permission granted: {required_permission}")
#             return True
#         else:
#             logger.warning(f"⛔ Permission denied: {required_permission}")
#             self.permission_denied(
#                     request,
#                     message=getattr(required_permission, 'message', None),
#                     code=getattr(required_permission, 'code', None)
#                 )
#             return False

# import logging
# from rest_framework.permissions import BasePermission
# from rest_framework.exceptions import PermissionDenied
# from roles_creation.models import UserRole, RolePermission

# logger = logging.getLogger(__name__)

# class HasRolePermission(BasePermission):
#     ACTION_PERMISSIONS = {
#         "GET": "view",
#         "POST": "create",
#         "PUT": "update",
#         "PATCH": "update",
#         "DELETE": "delete",
#     }

#     def has_permission(self, request, required_permission: str):
#         logger.info(f"🔍 Checking permissions for user: {request.user}")

#         if not request.user or not request.user.is_authenticated:
#             logger.warning("⛔ User is not authenticated!")
#             return False

#         print(required_permission)
#         user_roles = UserRole.objects.filter(user=request.user).values_list('role__name', flat=True)
#         print(user_roles)

#         assigned_permissions = RolePermission.objects.filter(
#             role__name__in=user_roles
#         ).values_list('permission__name', flat=True)
#         print(assigned_permissions)

#         logger.info(f"🔍 Assigned permissions: {list(assigned_permissions)}")

#         # Check if required permission exists
#         if required_permission in assigned_permissions:
#             logger.info(f"✅ Permission granted: {required_permission}")
#             return True
#         else:
#             logger.warning(f"⛔ Permission denied: {required_permission}")
#             raise PermissionDenied(detail=f"You do not have the '{required_permission}' permission.")

import logging
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from roles_creation.models import UserRole, RolePermission

logger = logging.getLogger(__name__)

class HasRolePermission(BasePermission):
    ACTION_PERMISSIONS = {
        "GET": "view",
        "POST": "create",
        "PUT": "update",
        "PATCH": "update",
        "DELETE": "delete",
    }

    def has_permission(self, request, required_permission: str):
        logger.info(f"🔍 Checking permissions for user: {request.user}")

        if not request.user or not request.user.is_authenticated:
            logger.warning("⛔ User is not authenticated!")
            return False

        try:
            # Log user roles
            user_roles = UserRole.objects.filter(user=request.user).values_list('role__name', flat=True)
            logger.info(f"User roles: {list(user_roles)}")

            # Log assigned permissions
            assigned_permissions = RolePermission.objects.filter(role__name__in=user_roles).values_list('permission__name', flat=True)
            logger.info(f"Assigned permissions: {list(assigned_permissions)}")

            # Check if required permission exists
            if required_permission in assigned_permissions:
                logger.info(f"✅ Permission granted: {required_permission}")
                return True
            else:
                logger.warning(f"⛔ Permission denied: {required_permission}")
                raise PermissionDenied(detail=f"You do not have the '{required_permission}' permission.")
        
        except Exception as e:
            logger.error(f"Error checking permissions: {str(e)}")
            raise PermissionDenied(detail="An unexpected error occurred while checking permissions.")