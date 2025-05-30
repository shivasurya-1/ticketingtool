# Generated by Django 5.1.5 on 2025-04-06 05:39

import django.db.models.deletion
import mptt.fields
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('roles_creation', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organisation',
            fields=[
                ('organisation_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('organisation_name', models.CharField(max_length=255)),
                ('organisation_mail', models.EmailField(max_length=254, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='organisations_created_by', to=settings.AUTH_USER_MODEL)),
                ('modified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='organisations_modified_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('organisation_name', 'organisation_mail')},
            },
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('employee_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('position_name', models.CharField(max_length=255)),
                ('level', models.PositiveIntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('lft', models.PositiveIntegerField(editable=False)),
                ('rght', models.PositiveIntegerField(editable=False)),
                ('tree_id', models.PositiveIntegerField(db_index=True, editable=False)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='employees_created_by', to=settings.AUTH_USER_MODEL)),
                ('modified_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='employees_modified_by', to=settings.AUTH_USER_MODEL)),
                ('parent', mptt.fields.TreeForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='organisation_details.employee')),
                ('user_role', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='employee', to='roles_creation.userrole')),
                ('organisation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='employees', to='organisation_details.organisation')),
            ],
            options={
                'unique_together': {('user_role', 'organisation')},
            },
        ),
    ]
