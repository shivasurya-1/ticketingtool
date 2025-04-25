from rest_framework import serializers
from .models import UserProfile
from rest_framework.exceptions import ValidationError

class UserProfileSerializer(serializers.ModelSerializer): 
    profile_pic_url = serializers.SerializerMethodField()
    email = serializers.ReadOnlyField(source="user.email")  # Fetch email from user model
    created_by = serializers.ReadOnlyField(source="created_by.id")  # Ensure ID is shown
    modified_by = serializers.ReadOnlyField(source="modified_by.id")  # Ensure ID is shown
    
    class Meta:
        model = UserProfile
        fields = '__all__' # This will include all model fields plus your custom fields
        read_only_fields = ['user']

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