from rest_framework import serializers
from .models import UserProfile
from rest_framework.exceptions import ValidationError
from project_details.models import ProjectMember
# from project_details.serializers import ProjectsMemberSerializer
from organisation_details.models import Organisation
# from organisation_details.serializers import OrganisationSerializer
from roles_creation.models import UserRole
from django.contrib.auth import get_user_model
from organisation_details.models import Employee


class UserProfileSerializer(serializers.ModelSerializer): 
    assigned_projects = serializers.SerializerMethodField()
    # organisation_name = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()
    email = serializers.ReadOnlyField(source="user.email")  # Fetch email from user model
    created_by = serializers.ReadOnlyField(source="created_by.username")  # Ensure ID is shown
    modified_by = serializers.ReadOnlyField(source="modified_by.username")  # Ensure ID is shown
    # organisation_name = serializers.ReadOnlyField()
    # organisation_id = serializers.ReadOnlyField()
    organisation_name = serializers.SerializerMethodField()
    organisation_id = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'address', 'city', 'state', 'country', 'department', 'date_of_birth',
            'profile_pic', 'created_at', 'modified_at', 'assigned_projects', 'created_by', 'modified_by',
            'profile_pic_url', 'role', 'organisation_name', 'username', 'organisation_id', 'employee_id'
        ]
 # This will include all model fields plus your custom fields
        read_only_fields = ['user']
        # extra_kwargs = {
        #     'created_by': {'read_only': True},  
        #     'modified_by': {'read_only': True},
        # }

    def get_organisation_name(self, obj):
        if obj.organisation:  # check if organisation is not None
            return obj.organisation.organisation_name
        return None
    
 
    def get_organisation_id(self, obj):
        # Fetch the organisation ID using the property
        return obj.organisation_id
 
    
    def get_role(self, obj):
        try:
            user_role = obj.user.user_roles.filter(is_active=True).first()  # Fetch the active role for the user
            if user_role:
                return user_role.role.name  # Adjust 'name' if it's the actual field name in your Role model
        except UserRole.DoesNotExist:
            return None
        return None
    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return None

    def get_assigned_projects(self, obj):
        # Here we manually prepare assigned_projects with only project_name
        assigned_projects = ProjectMember.objects.filter(project_asignee=obj.user)
        return [{"project_name": project.project_name.project_name} for project in assigned_projects]
    
    def get_profile_pic_url(self, obj):
        return obj.profile_pic.url if obj.profile_pic else None

    def create(self, validated_data):
        # Check if user already has a profile
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if UserProfile.objects.filter(user=request.user).exists():
                raise ValidationError("A profile for this user already exists.")
            validated_data['user'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().update(instance, validated_data)
    
    def get_created_by(self, obj):
        if obj.created_by:
            return obj.created_by.username  
        return None

    def get_modified_by(self, obj):
        if obj.modified_by:
            return obj.modified_by.username
        return None