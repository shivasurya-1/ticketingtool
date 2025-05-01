from rest_framework import serializers
from .models import ProjectsDetails,ProjectMember, ProjectAttachment
from roles_creation.models import UserRole


class ProjectAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAttachment
        fields = ['id', 'files', 'uploaded_at', 'uploaded_by']

class ProjectsSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    modified_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    organisation = serializers.SlugRelatedField(read_only=True, slug_field='organisation_name')
    attachments = ProjectAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectsDetails
        exclude = []  # or use `fields = '__all__'` if you're sure all fields are safe to expose

# class ProjectsSerializer(serializers.ModelSerializer):
#     created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
#     modified_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
#     organisation = serializers.SlugRelatedField(read_only=True, slug_field='organisation_name')
#     class Meta:
#         model = ProjectsDetails
#         # fields = ['project_name','product_mail']

#         fields = '__all__'
#         # extra_kwargs = {
#         #     'created_by': {'read_only': True},  
#         #     'modified_by': {'read_only': True},
#         # }
class ProjectsDashSerializer(serializers.ModelSerializer):
    org_name= serializers.SerializerMethodField()
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    modified_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    attachments = ProjectAttachmentSerializer(many=True, read_only=True)
    class Meta:
        model = ProjectsDetails
     
        fields = '__all__'
        # extra_kwargs = {
        #     'created_by': {'read_only': True},  
        #     'modified_by': {'read_only': True},
        # }   
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
    