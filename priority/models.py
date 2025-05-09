from django.db import models
from login_details.models import User
 
class Priority(models.Model):
 
    # PRIORITY_CHOICES = [
    #     ('critical', 'Critical'),
    #     ('major', 'Major'),
    #     ('medium', 'Medium'),
    #     ('minor', 'Minor'),
 
    # ]
    organisation = models.ForeignKey('organisation_details.organisation',on_delete=models.SET_NULL,null=True,related_name="org_priority")
    priority_id = models.AutoField(primary_key=True)
    urgency_name = models.CharField(max_length=10,unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True, related_name="priorities")
    modified_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,related_name="updated_priorities")
    # response_target_time = models.FloatField(help_text="Response time target in hours", default=0.0)
    response_target_time = models.DurationField()
 
 
   
    def __str__(self):
        return f"{self.urgency_name} (ID: {self.priority_id})"
   
    def save(self, *args, **kwargs):
        print("Debug - created_by before save:", self.created_by)
        super().save(*args, **kwargs)
     
 
 
 
 
 