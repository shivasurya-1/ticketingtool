from rest_framework import serializers
from .models import History, Reports, Attachment
from timer.models import Ticket
 
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
    created_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    modified_by = serializers.SlugRelatedField(read_only=True, slug_field='username')
    class Meta:
        model = History
        fields = ['history_id', 'title', 'ticket', 'modified_at','created_by', 'modified_by']
 
class ReportSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    report_attachments = AttachmentSerializer(many=True, read_only=True)
    username = serializers.SerializerMethodField()
    # ticket_id  = serializers.PrimaryKeyRelatedField(
    #     queryset=History.objects.all(),  # Adjust this queryset as needed
    #     write_only=True,
    # )
    # title = serializers.SerializerMethodField()
    title = serializers.CharField(required=False, allow_blank=True)
    # ticket_id = serializers.IntegerField(write_only=True, required=True)
    ticket_id = serializers.CharField(write_only=True, required=True)  
    # ticket_id_display = serializers.CharField(source="ticket.ticket_id", read_only=True)  # To include ticket_id in the response
 
 
    class Meta:
        model = Reports
        fields = [
            'report_id', 'title', 'created_by', 'modified_by',
            'created_at', 'modified_at',
            'attachments', 'report_attachments', 'username', 'ticket_id'
        ]
 
    def get_title(self, obj):
        return obj.title if obj.title else "No Title"
   
 
 
    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])
       
        title = validated_data.get("title", "").strip()
        if not title:
            validated_data["title"] = "No Title"
 
        ticket_id = validated_data.pop("ticket_id", None)
        if ticket_id is None:
            raise serializers.ValidationError({"ticket_id": "This field is required."})
 
        try:
            ticket = Ticket.objects.get(ticket_id=ticket_id)
        except Ticket.DoesNotExist:
            raise serializers.ValidationError({"ticket_id": f"Ticket with ID {ticket_id} does not exist"})
 
        validated_data["ticket"] = ticket
        report = Reports.objects.create(**validated_data)
 
        for file in attachments:
            Attachment.objects.create(report=report, ticket=ticket, file=file)
 
        return report
 
 
 
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
   
   
 
 