# Generated by Django 4.2.20 on 2025-04-18 18:26

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0025_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 18, 18, 26, 51, 159012, tzinfo=datetime.timezone.utc)),
        ),
    ]
