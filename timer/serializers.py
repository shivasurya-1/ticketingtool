from rest_framework import serializers
from .models import Ticket, SLATimer,PauseLogs
from .models import Ticket, Attachment
from .models import Ticket, Attachment,TicketComment,TicketCommentAttachment
from organisation_details.models import Organisation
from login_details.models import User
from services.models import IssueCategory, IssueType
from solution_groups.models import SolutionGroup
 

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']

 
# class TicketSerializer(serializers.ModelSerializer):
#     # Manually define service_domain and service_type fields
#     service_domain = serializers.CharField(source='service_domain.name', default="Application Support", read_only=True)
#     service_type = serializers.CharField(source='service_type.name', default="SAP", read_only=True)
   
#     # Simplified attachments field
#     attachments = serializers.SerializerMethodField()
   
#     class Meta:
#         model = Ticket
#         fields = "__all__"
#         extra_kwargs = {
#             'created_by': {'read_only': True},
#             'modified_by': {'read_only': True},
#         }
   
#     def get_attachments(self, obj):
#         """Return only the file paths for attachments without id and uploaded_at"""
#         file_paths = []
#         for attachment in obj.attachments.all():
#             if attachment.file:
#                 file_paths.append(attachment.file.url)
#         return file_paths
   
#     def to_representation(self, instance):
#         """Customize serialized output to return human-readable labels."""
#         representation = super().to_representation(instance)
       
#         # Safely handle service_domain and service_type
#         if "service_domain" in representation and representation["service_domain"] is None:
#             representation["service_domain"] = "Application Support"
       
#         if "service_type" in representation and representation["service_type"] is None:
#             representation["service_type"] = "SAP"
       
#         # Add human-readable values for choice fields
#         if "impact" in representation:
#             representation["impact"] = instance.get_impact_display()
        
#         if "support_team" in representation:
#             representation["support_team"] = instance.get_support_team_display()
        
#         if "status" in representation:
#             representation["status"] = instance.get_status_display()
        
#         # Handle ForeignKey relationships safely
#         if hasattr(instance, 'solution_grp') and instance.solution_grp:
#             representation["solution_grp"] = instance.solution_grp.group_name
        
#         if hasattr(instance, 'developer_organization') and instance.developer_organization:
#             representation["developer_organization"] = instance.developer_organization.organisation_name
        
#         if hasattr(instance, 'priority') and instance.priority:
#             representation["priority"] = instance.priority.urgency_name
        
#         if hasattr(instance, 'created_by') and instance.created_by:
#             representation["created_by"] = instance.created_by.username
        
#         if hasattr(instance, 'modified_by') and instance.modified_by:
#             representation["modified_by"] = instance.modified_by.username
        
#         if hasattr(instance, 'assignee') and instance.assignee:
#             representation["assignee"] = instance.assignee.username
       
#         # Remove attachments_list if it exists (to avoid duplication)
#         if "attachments_list" in representation:
#             del representation["attachments_list"]
           
#         return representation
   
#     def validate_developer_organization(self, value):
#         from .models import Organisation
#         if isinstance(value, str):
#             try:
#                 org = Organisation.objects.get(organisation_name=value)
#                 return org.pk
#             except Organisation.DoesNotExist:
#                 raise serializers.ValidationError(f'Organisation "{value}" does not exist.')
#         return value
   
#     def validate_assignee(self, value):
#         from .models import User
#         if isinstance(value, str):
#             try:
#                 user = User.objects.get(username=value)
#                 return user.pk
#             except User.DoesNotExist:
#                 raise serializers.ValidationError(f'User "{value}" does not exist.')
#         return value
   
#     def validate_solution_grp(self, value):
#         from .models import SolutionGroup
#         if isinstance(value, str):
#             try:
#                 group = SolutionGroup.objects.get(group_name__iexact=value)
#                 return group.pk
#             except SolutionGroup.DoesNotExist:
#                 raise serializers.ValidationError(f'Solution group "{value}" does not exist.')
#         return value
 
    
class TicketSerializer(serializers.ModelSerializer):
    service_domain = serializers.PrimaryKeyRelatedField(
        queryset=IssueCategory.objects.all(),
        error_messages={'does_not_exist': 'Service domain does not exist.'}
    )
    service_type = serializers.PrimaryKeyRelatedField(
        queryset=IssueType.objects.all(),
        error_messages={'does_not_exist': 'Service type does not exist.'}
    )
    assignee = serializers.SlugRelatedField(

    queryset=User.objects.all(),

    slug_field='username',

    required=False,

    allow_null=True

    )
    
    developer_organization = serializers.SlugRelatedField(

        queryset=Organisation.objects.all(),

        slug_field='organisation_name',

        required=False,

        allow_null=True

    )
    
    solution_grp = serializers.SlugRelatedField(

        queryset=SolutionGroup.objects.all(),

        slug_field='group_name',

        required=False,

        allow_null=True

    )

 
    attachments = serializers.SerializerMethodField()
 
    class Meta:
        model = Ticket
        fields = "__all__"
        extra_kwargs = {
            'created_by': {'read_only': True},
            'modified_by': {'read_only': True},
        }
 
    def get_attachments(self, obj):
        """Return only the file URLs for attachments."""
        return [attachment.file.url for attachment in obj.attachments.all() if attachment.file]
 
    def to_representation(self, instance):
        """Customize serialized output to return human-readable labels."""
        representation = super().to_representation(instance)
 
        # Replace foreign key IDs with display names
        representation["service_domain"] = instance.service_domain.name if instance.service_domain else None
        representation["service_type"] = instance.service_type.name if instance.service_type else None
        representation["solution_grp"] = instance.solution_grp.group_name if instance.solution_grp else None
        representation["developer_organization"] = instance.developer_organization.organisation_name if instance.developer_organization else None
        representation["assignee"] = instance.assignee.username if instance.assignee else None
        representation["created_by"] = instance.created_by.username if instance.created_by else None
        representation["modified_by"] = instance.modified_by.username if instance.modified_by else None
        representation["priority"] = instance.priority.urgency_name if instance.priority else None
 
        # Choice field display values
        representation["impact"] = instance.get_impact_display()
        representation["support_team"] = instance.get_support_team_display()
        representation["status"] = instance.get_status_display()
 
        return representation
 
    
class AssignTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['assignee']

    def update(self, instance, validated_data):
        instance.assignee = validated_data.get('assignee', instance.assignee)
        instance.save()  # Just assign engineer, no status change, no SLA start
        return instance

class SLATimerSerializer(serializers.ModelSerializer):
    """Serializer for SLATimer model."""
    class Meta:
        model = SLATimer
        fields = "__all__"
        

class TicketCommentAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCommentAttachment
        fields = ['id', 'file', 'uploaded_at']
 
class TicketCommentCreateSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False
    )
 
    class Meta:
        model = TicketComment
        fields = ['ticket', 'comment', 'is_internal', 'attachments']
 
    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        comment = TicketComment.objects.create(**validated_data)
 
        TicketCommentAttachment.objects.bulk_create([
            TicketCommentAttachment(comment=comment, file=file) for file in attachments
        ])
        return comment
 
class TicketCommentListSerializer(serializers.ModelSerializer):
    attachments = TicketCommentAttachmentSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()
 
    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'comment', 'is_internal', 'attachments', 'created_by', 'created_at']
 
 