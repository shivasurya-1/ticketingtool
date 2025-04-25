
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.core.exceptions import ValidationError
from roles_creation.models import UserRole

class ProjectsDetails(models.Model):
    project_id = models.BigAutoField(primary_key=True) 
    project_name = models.CharField(max_length=255)
    organisation = models.ForeignKey(
        'organisation_details.Organisation', on_delete=models.SET_NULL, null=True, related_name='project_organisation'
    )
    product_mail = models.EmailField(unique=True)  # Ensuring unique email
    is_active = models.BooleanField(default=True)  # Soft deletion flag
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='project_created_by'
    )
    modified_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='project_modified_by'
    )
    file = models.FileField(upload_to='attachments/')
    

    class Meta:
        unique_together = ('project_name', 'product_mail')

    def __str__(self):
        return self.project_name


class ProjectMember(models.Model):
    project_asignee = models.ForeignKey("login_details.User", on_delete=models.CASCADE, related_name='project_engineer')
    member_id = models.BigAutoField(primary_key=True)  # Changed to BigAutoField for consistency
    project_name = models.ForeignKey(ProjectsDetails, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='projectid_created_by'
    )
    modified_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='projectid_modified_by'
    )

#     class MPTTMeta:
#         order_insertion_by = ['position_name']

#     class Meta:
#         unique_together = ('user_role', 'organisation')

#     def clean(self):
#         """ Validates Employee constraints before saving. """
#         if self.pk is None and Employee.objects.filter(user_role=self.user_role, organisation=self.organisation).exists():
#             raise ValidationError('This user is already assigned to the given organisation.')

#         if self.parent == self:
#             raise ValidationError("An employee cannot be their own supervisor.")

#     def __str__(self):
#         return f"{self.position_name} (Level {self.level})"
