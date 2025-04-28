from django.db import models
from django.db import models
from login_details.models import User


class History(models.Model):
    history_id = models.AutoField(primary_key=True)  # Primary Key
    title = models.CharField(max_length=255)  # Article Title
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when created
    modified_at = models.DateTimeField(auto_now=True)  # Timestamp when last modified
    ticket = models.ForeignKey("timer.Ticket",on_delete=models.SET_NULL, null=True, blank=True,related_name='ticket_history')  
    
    created_by = models.ForeignKey(         
        User,
        on_delete=models.SET_NULL,  
        null=True,
        related_name='history_created'
    )
    modified_by = models.ForeignKey(           
        User,
        on_delete=models.SET_NULL,  
        null=True,             
        related_name='history_updated'           
    )

    def __str__(self):
        return self.title

class Reports(models.Model):
    report_id = models.AutoField(primary_key=True)  # Primary Key
    title = models.CharField(max_length=255)  # Article Title
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when created
    modified_at = models.DateTimeField(auto_now=True)  # Timestamp when last modified
    ticket = models.ForeignKey("timer.Ticket",on_delete=models.SET_NULL, null=True, blank=True,related_name='report_ticket')  
    
    created_by = models.ForeignKey(         
        User,
        on_delete=models.SET_NULL,  
        null=True,
        related_name='report_created'
    )
    modified_by = models.ForeignKey(           
        User,
        on_delete=models.SET_NULL,  
        null=True,             
        related_name='report_updated' 
              
    )
    def __str__(self):
        return self.title

class Attachment(models.Model):
    report = models.ForeignKey(Reports, on_delete=models.CASCADE, related_name='report_attachments')
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey("timer.Ticket",on_delete=models.SET_NULL, null=True, blank=True,related_name='report_attach_ticket')  

    def __str__(self):
      
        return self.file.name