from django.contrib import admin

from .models import Solution
@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    list_display = ("solution_id", "ticket", "solution_text", "org_group", "user", "created_at", "updated_at")
