# Generated by Django 4.2.20 on 2025-04-18 11:44

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0019_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticket',
            name='contact_mode',
        ),
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 18, 11, 44, 55, 761587, tzinfo=datetime.timezone.utc)),
        ),
    ]
