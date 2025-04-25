from django.db import models
from login_details.models import User
from django.core.exceptions import ValidationError
from cloudinary_storage.storage import MediaCloudinaryStorage
from roles_creation.models import UserRole



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
    email = models.EmailField(max_length=50, null=False)
    phone_number = models.CharField(max_length=15, null=False)
    address = models.CharField(max_length=255, null=False)
    city = models.CharField(max_length=50, null=False)
    state = models.CharField(max_length=50, null=False)
    country = models.CharField(max_length=50, null=False)
    # postal_code = models.CharField(max_length=10, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='profile_modified')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='profile_created')
    # role=models.ForeignKey(UserRole)

    def _str_(self):
        return f"{self.first_name} {self.last_name} (ID: {self.emp_id})"
   
    
    def save(self, *args, **kwargs):
        if self.pk:  # Prevent changes after creation
            original = UserProfile.objects.get(pk=self.pk)
            if self.email != original.email:
                raise ValidationError("Email cannot be changed.")
        super().save(*args, **kwargs)