# Generated by Django 5.1.5 on 2025-04-27 04:51

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0056_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 27, 4, 51, 16, 958135, tzinfo=datetime.timezone.utc)),
        ),
    ]
