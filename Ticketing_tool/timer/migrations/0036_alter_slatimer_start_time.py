# Generated by Django 4.2.20 on 2025-04-19 07:58

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0035_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 19, 7, 58, 2, 750824, tzinfo=datetime.timezone.utc)),
        ),
    ]
