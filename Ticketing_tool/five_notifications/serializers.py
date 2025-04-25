
from rest_framework import serializers
from .models import Appreciation,Announcement,RecentItem
# from .models import RecentItem
# from timer.models import Ticket
class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
        created_by = serializers.ReadOnlyField(source='created_by.username')
        updated_by = serializers.ReadOnlyField(source='updated_by.username')
 
 
class AppreciationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appreciation
        fields = '__all__'
        created_by = serializers.ReadOnlyField(source='created_by.username')
        updated_by = serializers.ReadOnlyField(source='updated_by.username')


class RecentItemSerializer(serializers.ModelSerializer):
    knowledge_article = serializers.StringRelatedField()  # If you want to display the article's title

    class Meta:
        model = RecentItem
        # fields = ['title', 'content', 'viewed_at']
        # fields = '__all__'
        fields = '__all__'