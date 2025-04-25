from rest_framework import serializers
from .models import Role, Permission, RolePermission,UserRole

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'


class RolePermissionSerializer(serializers.ModelSerializer):
    permission = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), many=True, required=False
    )

    class Meta:
        model = RolePermission
        fields = ["role", "permission"]

    def validate_permission(self, value): 
        """
        If 'all' is in the request data, assign all permissions.
        Otherwise, assign only the selected permissions.
        """
        request_data = self.context["request"].data.get("permission", [])

        if "all" in request_data:
            return Permission.objects.all()  # Assign all permissions
        
        return value  # Assign only the selected permissions

    def to_representation(self, instance):
        """
        Modify the response to return role name and permission names instead of IDs.
        """
        representation = super().to_representation(instance)
        representation["role"] = instance.role.name  # Convert role ID to role name
        representation["permission"] = list(instance.permission.values_list("name", flat=True))  # Convert permission IDs to names
        return representation

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'

    def to_representation(self, instance):
        """
        Modify the response to return user and role names instead of their IDs.
        """
        representation = super().to_representation(instance)
        representation["user"] = instance.user.username  # Convert user ID to username
        representation["role"] = instance.role.name  # Convert role ID to role name
        return representation
