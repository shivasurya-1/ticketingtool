# Generated by Django 4.2.20 on 2025-04-17 18:55

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0017_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 17, 18, 55, 54, 869640, tzinfo=datetime.timezone.utc)),
        ),
    ]
