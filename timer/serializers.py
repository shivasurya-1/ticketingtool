from rest_framework import serializers
from .models import Ticket, SLATimer,PauseLogs
from .models import Ticket, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']

class TicketSerializer(serializers.ModelSerializer):
    """Serializer for Ticket model."""
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = "__all__"
        extra_kwargs = {
            'created_by': {'read_only': True},  
            'modified_by': {'read_only': True},
        }

    def get_attachments(self, obj):
        return [attachment.file.url for attachment in obj.attachments.all()]

    def to_representation(self, instance):
        """Customize serialized output to return human-readable labels."""
        representation = super().to_representation(instance)
        representation["impact"] = instance.get_impact_display()
        # representation["issue_type"] = instance.get_issue_type_display()
        representation["support_team"] = instance.get_support_team_display()
        representation["status"] = instance.get_status_display()
        representation["solution_grp"] = instance.solution_grp.group_name if instance.solution_grp else None
        representation["developer_organization"] = instance.developer_organization.organisation_name if instance.developer_organization else None
        representation["priority"] = instance.priority.urgency_name if instance.priority else None
        representation["created_by"] = instance.created_by.username if instance.created_by else None
        representation["modified_by"] = instance.modified_by.username if instance.modified_by else None
        representation["assignee"] = instance.assignee.username if instance.assignee else None
        return representation

    # def validate_status(self, value):
    #     """Ensure assignee is a pk value."""
    #     from .models import Organisation  # Assuming assignee is a User model
    #     if isinstance(value, str):
    #         try:
    #             user = Organisation.objects.get(organisation_name=value)
    #             return user.pk  # Return the primary key of the user
    #         except Organisation.DoesNotExist:
    #             raise serializers.ValidationError(f'org with org "{value}" does not exist.')
    #     return value
    def validate_developer_organization(self, value):
        """Ensure assignee is a pk value."""
        from .models import Organisation  # Assuming assignee is a User model
        if isinstance(value, str):
            try:
                user = Organisation.objects.get(organisation_name=value)
                return user.pk  # Return the primary key of the user
            except Organisation.DoesNotExist:
                raise serializers.ValidationError(f'org with org "{value}" does not exist.')
        return value
    def validate_assignee(self, value):
        """Ensure assignee is a pk value."""
        from .models import User  # Assuming assignee is a User model
        if isinstance(value, str):
            try:
                user = User.objects.get(username=value)

                return user.pk  # Return the primary key of the user
            except User.DoesNotExist:
                raise serializers.ValidationError(f'User with username "{value}" does not exist.')
        return value

    def validate_solution_grp(self, value):
        """Ensure solution_grp is a pk value."""
        from .models import SolutionGroup  # Replace with your model
        if isinstance(value, str):
            print(f"Validating solution_grp with value: {value}")
            try:
                solution_group = SolutionGroup.objects.get(group_name__iexact=value)
                print(f"Solution group found: {solution_group.group_name} -> Primary key: {solution_group.pk}")
                return solution_group.pk  # Return the primary key (pk) of the solution group
            except SolutionGroup.DoesNotExist:
                print(f"Solution group {value} does not exist.")
                raise serializers.ValidationError(f'Solution group "{value}" does not exist.')
        return value

    # def validate(self, data):
    #     # Replace empty string fields with default values
    #     if not data.get("impact"):
    #         data["impact"] = "A"  # Default value corresponding to "High"
    #     if not data.get("issue_type"):
    #         data["issue_type"] = "F"  # Default value corresponding to "Incident"
    #     if not data.get("support_team"):
    #         data["support_team"] = "a"  # Default value corresponding to "FirstLevel"
    #     return data

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
        


# class SlaTimeHistorySerializer(serializers.ModelSerializer):
#     """Serializer for SlaTimeHistory model."""
#     class Meta:
#         model = SLATimeHistory
#         fields = "__all__" 