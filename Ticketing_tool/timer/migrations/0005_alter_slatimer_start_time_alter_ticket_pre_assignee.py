# Generated by Django 5.1.5 on 2025-04-10 13:30

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0004_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 10, 13, 30, 15, 194942, tzinfo=datetime.timezone.utc)),
        ),
        migrations.AlterField(
            model_name='ticket',
            name='pre_assignee',
            field=models.JSONField(default=list, null=True),
        ),
    ]
