from rest_framework import serializers
from .models import Role, Permission, RolePermission,UserRole

class RoleSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(
        read_only=True, slug_field='username'
    )
    modified_by = serializers.SlugRelatedField(
        read_only=True, slug_field='username'
    )
    class Meta:
        model = Role
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(
        read_only=True, slug_field='username'
    )
    modified_by = serializers.SlugRelatedField(
        read_only=True, slug_field='username'
    )
    class Meta:
        model = Permission
        fields = '__all__'


# class RolePermissionSerializer(serializers.ModelSerializer):
#     permission = serializers.PrimaryKeyRelatedField(
#         queryset=Permission.objects.all(), many=True, required=False
#     )

#     class Meta:
#         model = RolePermission
#         fields = ["role", "permission"]

#     def validate_permission(self, value): 
#         """
#         If 'all' is in the request data, assign all permissions.
#         Otherwise, assign only the selected permissions.
#         """
#         request_data = self.context["request"].data.get("permission", [])

#         if "all" in request_data:
#             return Permission.objects.all()  # Assign all permissions
        
#         return value  # Assign only the selected permissions

#     def to_representation(self, instance):
#         """
#         Modify the response to return role name and permission names instead of IDs.
#         """
#         representation = super().to_representation(instance)
#         representation["role"] = instance.role.name  # Convert role ID to role name
#         representation["permission"] = list(instance.permission.values_list("name", flat=True))  # Convert permission IDs to names
#         return representation

# class RolePermissionSerializer(serializers.ModelSerializer):
#     permission = serializers.PrimaryKeyRelatedField(
#         queryset=Permission.objects.all(), many=True, required=False
#     )

#     class Meta:
#         model = RolePermission
#         fields = ["role", "permission"]

#     def validate_permission(self, value):
#         """
#         If 'all' is in the request data, assign all permissions.
#         Otherwise, assign only the selected permissions.
#         """
#         request_data = self.context.get("request")

#         if request_data:
#             permission_data = request_data.data.get("permission", [])
#             if "all" in permission_data:
#                 return Permission.objects.all()  # Assign all permissions

#         return value  # Assign only the selected permissions

#     def to_representation(self, instance):
#         """
#         Modify the response to return role name and permission names instead of IDs.
#         """
#         representation = super().to_representation(instance)
#         representation["role"] = instance.role.name  # Convert role ID to role name
#         representation["permission"] = list(instance.permission.values_list("name", flat=True))  # Convert permission IDs to names
#         return representation
from rest_framework import serializers
from django.contrib.auth.models import Permission
from .models import RolePermission

class RolePermissionSerializer(serializers.ModelSerializer):
    permission = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), many=True, required=False
    )

    class Meta:
        model = RolePermission
        fields = ["role", "permission"]

    def validate_permission(self, value):
        """
        Handle the 'all' keyword in the request and ensure proper IDs.
        """
        request = self.context.get("request")
        if request:
            raw_permission_data = request.data.get("permission", [])

            if isinstance(raw_permission_data, list) and "all" in raw_permission_data:
                return Permission.objects.all()

        return value

    def create(self, validated_data):
        # Pop permission data
        permission_data = validated_data.pop("permission", [])

        # Extract IDs from Permission instances if needed
        permission_ids = [
            perm.pk if isinstance(perm, Permission) else int(perm)
            for perm in permission_data
        ]

        # Create the RolePermission instance
        instance = RolePermission.objects.create(**validated_data)

        # Set permissions using IDs
        instance.permission.set(permission_ids)

        return instance

    def to_representation(self, instance):
        """
        Display role name and permission names in response.
        """
        rep = super().to_representation(instance)
        rep["role"] = instance.role.name
        rep["permission"] = list(instance.permission.values_list("name", flat=True))
        return rep




# class UserRoleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserRole
#         fields = '__all__'

#     def to_representation(self, instance):
#     #     """
#         # Modify the response to return user and role names instead of their IDs.
#         # """
#         representation = super().to_representation(instance)
#         representation["user"] = instance.user.username  # Convert user ID to username
#         representation["role"] = instance.role.name  # Convert role ID to role name
#         return representation
#     # def validate(self, data):
#     #     if UserRole.objects.filter(user=data['user'], role=data['role']).exists():
#     #         raise serializers.ValidationError("This role is already assigned to the user.")
#     #     return data
class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["user"] = instance.user.username
        representation["role"] = instance.role.name
        return representation
