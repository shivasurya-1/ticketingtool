# serializers.py
from rest_framework import serializers
from .models import IssueCategory, IssueType

class IssueTypeSerializer(serializers.ModelSerializer):
    icon_url = serializers.SerializerMethodField()
    created_by = serializers.SlugRelatedField(slug_field='username', read_only=True)
    modified_by = serializers.SlugRelatedField(slug_field='username', read_only=True)

    class Meta:
        model = IssueType
        fields = ['issue_type_id', 'name', 'description', 'icon_url','created_at', 'created_by', 'modified_at', 'modified_by','is_active']

    def get_icon_url(self, obj):
        request = self.context.get('request')
        if obj.icon:
            return request.build_absolute_uri(obj.icon.url)
        return None


class IssueCategorySerializer(serializers.ModelSerializer):
    issue_types = IssueTypeSerializer(many=True, read_only=True)
    icon_url = serializers.SerializerMethodField()
    created_by = serializers.SlugRelatedField(slug_field='username', read_only=True)
    modified_by = serializers.SlugRelatedField(slug_field='username', read_only=True)
    class Meta:
        model = IssueCategory
        fields = ['issue_category_id', 'name', 'description', 'icon_url', 'issue_types', 'created_at', 'created_by', 'modified_at', 'modified_by','is_active']
        # extra_kwargs = {
        #     'created_by': {'read_only': True},  
        #     'modified_by': {'read_only': True},
        # }

    def get_icon_url(self, obj):
        request = self.context.get('request')
        if obj.icon:
            return request.build_absolute_uri(obj.icon.url)
        return None
