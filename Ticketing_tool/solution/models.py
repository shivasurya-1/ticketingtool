from django.db import models

# Create your models here.


from django.db import models
from login_details.models import User

class Solution(models.Model):
    solution_id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey('timer.Ticket', on_delete=models.CASCADE)
    solution_text = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="solutions_created"
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="solutions_updated"
    )
    org_group = models.ForeignKey('organisation_details.Organisation', on_delete=models.CASCADE)

    def __str__(self):
        return f"Solution {self.solution_id} for Ticket {self.ticket.ticket_id} - Org: {self.org_group.organisation_name}"
