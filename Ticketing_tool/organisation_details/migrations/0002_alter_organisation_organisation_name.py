# Generated by Django 5.1.5 on 2025-04-26 09:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organisation_details', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organisation',
            name='organisation_name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
