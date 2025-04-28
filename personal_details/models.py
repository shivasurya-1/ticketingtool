from django.db import models
from login_details.models import User
from django.core.exceptions import ValidationError
from cloudinary_storage.storage import MediaCloudinaryStorage
from roles_creation.models import UserRole
from organisation_details.models import Employee



class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    emp_id = models.AutoField(primary_key=True)  
    profile_pic = models.ImageField(
        upload_to='profile_pics', 
        blank=True,
        storage=MediaCloudinaryStorage()
    )
    first_name = models.CharField(max_length=50, null=False)
    last_name = models.CharField(max_length=50, null=False)
    is_active = models.BooleanField(default=True)
    email = models.EmailField(max_length=50, null=False)
    phone_number = models.CharField(max_length=15, null=False)
    address = models.CharField(max_length=255, null=False)
    city = models.CharField(max_length=50, null=False)
    state = models.CharField(max_length=50, null=False)
    country = models.CharField(max_length=50, null=False)
    department = models.CharField(max_length=100, null=True, blank=True)  # New Field
    date_of_birth = models.DateField(null=True, blank=True)
    # postal_code = models.CharField(max_length=10, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='profile_modified')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='profile_created')
    # role=models.ForeignKey(UserRole)
    
    @property
    def role(self):
        try:
            # Get the active user role
            return self.user.user_roles.get(is_active=True).role
        except UserRole.DoesNotExist:
            return None

    @property
    def organisation(self):
        try:
            # Get the organisation from the employee linked to the active user role
            user_role = self.user.user_roles.get(is_active=True)
            return user_role.employee.organisation
        except (UserRole.DoesNotExist, Employee.DoesNotExist):
            return None


    def _str_(self):
        return f"{self.first_name} {self.last_name} (ID: {self.emp_id})"
   
    
    def save(self, *args, **kwargs):
        if self.pk:  # Prevent changes after creation
            original = UserProfile.objects.get(pk=self.pk)
            if self.email != original.email:
                raise ValidationError("Email cannot be changed.")
        super().save(*args, **kwargs)

    