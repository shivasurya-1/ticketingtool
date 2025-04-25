from rest_framework import serializers
from .models import ProjectsDetails,ProjectMember
from roles_creation.models import UserRole

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectsDetails
        fields = ['project_name','product_mail']
        # fields = '__all__'
        extra_kwargs = {
            'created_by': {'read_only': True},  
            'modified_by': {'read_only': True},
        }
class ProjectsDashSerializer(serializers.ModelSerializer):
    org_name= serializers.SerializerMethodField()
    class Meta:
        model = ProjectsDetails
     
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'read_only': True},  
            'modified_by': {'read_only': True},
        }   
    def get_org_name(self, obj):
        return obj.organisation.organisation_name if obj.organisation else None
      
class ProjectsMembersSerializer(serializers.ModelSerializer):
    project_asignee_username = serializers.SerializerMethodField()
    project_name_name = serializers.SerializerMethodField()

    
    class Meta:
        model = ProjectMember
        fields =['project_asignee_username','project_name_name']
        extra_kwargs = {
            'project_asignee': {'read_only': True},  
            'created_by': {'read_only': True},  
            'modified_by': {'read_only': True},
        }
    def get_project_asignee_username(self, obj):
        return obj.project_asignee.username if obj.project_asignee else None
    def get_project_name_name(self, obj):
        return obj.project_name.project_name if obj.project_name else None
    