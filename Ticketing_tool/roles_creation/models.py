from django.db import models
from django.conf import settings
class Role(models.Model):
    """User roles (Admin, Developer, Support, etc.)"""
    role_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return self.name
class Permission(models.Model):
    """Permissions for actions like create_ticket, update_ticket, etc."""
    permission_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name
class RolePermission(models.Model):
    role_permission_id = models.AutoField(primary_key=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    # permission = models.ManyToManyField(Permission, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ManyToManyField(Permission, blank=True) 
    # permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="roles")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    # def __str__(self):
        # return f"{self.role.name} - {self.permission.name}"
    
    # class Meta:
    #     unique_together = ('role', 'permission')

    def __str__(self):
        return f"{self.role.name} - {self.permission.name}"

class UserRole(models.Model):
    user_role_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_roles")
    role = models.ForeignKey("roles_creation.Role", on_delete=models.CASCADE, related_name="user_roles")
    is_active = models.BooleanField(default=True)  
    assigned_at = models.DateTimeField(auto_now_add=True)
    # expires_at = models.DateTimeField(null=True, blank=True)  # Optional expiration

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.username} - {self.role.name} ({'Active' if self.is_active else 'Inactive'})"


