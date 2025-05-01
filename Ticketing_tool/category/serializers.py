from rest_framework import serializers
from .models import Category
class CategorySerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    modified_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    class Meta:
        model=Category
        # fields=['category_id','category_name','description','organisation','created_by','modified_by','is_active','created_at','modified_at']
        fields = '__all__'
        # extra_kwargs = {
        #     'created_by': {'read_only': True},  
        #     'modified_by': {'read_only': True},
        # } 
           


    def to_representation(self, instance):
        """
            Modify the response to return user and role names instead of their IDs.
            """
        representation = super().to_representation(instance)
        representation["organisation"] = instance.organisation.organisation_name # Convert user ID to username
            # Convert role ID to role name
        return representation

        