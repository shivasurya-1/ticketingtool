from django.contrib import admin

# # # Register your models here.
# # from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email')
    search_fields = ('username', 'email')
    # list_filter = ('role',)
# # class UserAdmin(admin.ModelAdmin):
# #     def get_roles(self, obj):
# #         return ", ".join([role.name for role in obj.roles.all()])

# #     get_roles.short_description = "Roles"
# #     list_display = ('id', 'username', 'email', 'get_roles')  # Use get_roles instead of 'role'
# #     list_filter = ('roles',)  # Ensure 'roles' is configured properly in the ManyToManyField

# class UserAdmin(admin.ModelAdmin):
#     list_display = ['id', 'username', 'email', 'roles']  # Ensure 'role' exists in User model
#     list_filter = ['role__name']
# from .models import User
# admin.site.register(User)
