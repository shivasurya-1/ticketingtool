from django.db import models
# from timer.models import Ticket



class Resolution(models.Model):
    resolution_id = models.AutoField(primary_key=True)
    resolution_choices = [
        ('fixed', 'Fixed'),
        ('cannot reproduce', 'Cannot Reproduce'),
        ('Not a bug', 'Not a Bug'),
        ('solved by workaround', 'Solved by Workaround'),
        ('user instruction provided', 'User Instruction Provided'),
        ('withdrawn by user', 'Withdrawn by User'),
        ('no solution availabale', 'No Solution Available'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('known error', 'Known Error'),
        ('hardware failure', 'Hardware Failure'),
        ('software failure', 'Software Failure'),
        ('network failure', 'Network Failure'),
        ('implemented', 'Implemented'),
        ('other', 'Other'),
    ]



    incident_choices = [
        ('none', 'None'),
        ('access issues', 'Access Issues'),
        ('configuration', 'Configuration'),
        ('data quality', 'Data Quality'),
        ('development', 'Development'),
        ('infrastructure', 'Infrastructure'),
        ('missing user knowledge', 'Missing User Knowledge'),
        ('mistake', 'Mistake'),
        # ('other cus requests', 'Other Customer Requests'),
        ('short dump', 'Short Dump'), 
        ('work flow issue', 'Work Flow Issue'),
        ('others', 'Others'),
    ]


    incident_category_choices = [
        ('none', 'None'),
        ('development activities needed', 'Development Activities Needed'),
        ('incident of sr category', 'Incident of SR Category'),
        ('dependency with third part service provider', 'Dependency with Third Party Service Provider'),
        ('inappropriate incidents(incident not reproduceable, withdrawl requests)', 'Inappropriate Incidents(Incident not Reproduceable, Withdrawl Requests)'),
        ('other', 'Other'),
    ]

    resolution_description = models.TextField(blank=True, null=True)
    resolution_type = models.CharField(max_length=100, choices=resolution_choices)
    is_active = models.BooleanField(default=True)
    incident_based_on = models.CharField(max_length=100, choices=incident_choices)
    incident_category = models.CharField(max_length=100, choices=incident_category_choices)
    ticket_id = models.ForeignKey('timer.Ticket', on_delete=models.SET_NULL, null=True, blank=True)
    attachment = models.FileField(upload_to='resolution_attachments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, blank=True, related_name="resolutions_created"
    )
    modified_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, blank=True, related_name="resolutions_updated"
    )