from rest_framework import serializers
from .models import History, Reports, Attachment

class AttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'file_url', 'uploaded_at', 'ticket']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return None

class TicketHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = History
        fields = ['history_id', 'title', 'ticket', 'modified_at']

class ReportSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    report_attachments = AttachmentSerializer(many=True, read_only=True)
    username = serializers.SerializerMethodField()

    class Meta:
        model = Reports
        fields = [
            'report_id', 'title', 'ticket', 'created_by', 'modified_by',
            'created_at', 'modified_at',
            'attachments', 'report_attachments', 'username'
        ]

    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
        report = Reports.objects.create(**validated_data)
        for file in attachments:
            Attachment.objects.create(report=report, ticket=report.ticket, file=file)
        return report

    def get_username(self, obj):
        return obj.modified_by.username if obj.modified_by else None

    def validate_attachments(self, value):
        for file in value:
            if file.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Each file must be less than 10MB.")
        return value
