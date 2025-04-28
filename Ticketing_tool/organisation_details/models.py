
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.core.exceptions import ValidationError
from roles_creation.models import UserRole

class Organisation(models.Model):
    organisation_id = models.BigAutoField(primary_key=True) 
    organisation_name = models.CharField(max_length=255,unique=True)  # Ensuring unique organisation name
    organisation_mail = models.EmailField(unique=True)  # Ensuring unique email
    is_active = models.BooleanField(default=True)  # Soft deletion flag
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='organisations_created_by'
    )
    modified_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='organisations_modified_by'
    )

    class Meta:
        unique_together = ('organisation_name', 'organisation_mail')

    def __str__(self):
        return self.organisation_name


class Employee(MPTTModel):
    employee_id = models.BigAutoField(primary_key=True)  # Changed to BigAutoField for consistency
    user_role = models.OneToOneField(UserRole, on_delete=models.CASCADE, related_name='employee')
    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='employees')
    position_name = models.CharField(max_length=255)
    level = models.PositiveIntegerField()  # Prevents negative values automatically
    parent = TreeForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='employees_created_by'
    )
    modified_by = models.ForeignKey(
        'login_details.User', on_delete=models.SET_NULL, null=True, related_name='employees_modified_by'
    )

    class MPTTMeta:
        order_insertion_by = ['position_name']

    class Meta:
        unique_together = ('user_role', 'organisation')

    def clean(self):
        """ Validates Employee constraints before saving. """
        if self.pk is None and Employee.objects.filter(user_role=self.user_role, organisation=self.organisation).exists():
            raise ValidationError('This user is already assigned to the given organisation.')

        if self.parent == self:
            raise ValidationError("An employee cannot be their own supervisor.")

    def __str__(self):
        return f"{self.position_name} (Level {self.level})"
