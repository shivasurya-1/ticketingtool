# Generated by Django 5.1.5 on 2025-04-26 12:06

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timer', '0051_alter_slatimer_start_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slatimer',
            name='start_time',
            field=models.DateTimeField(default=datetime.datetime(2025, 4, 26, 12, 6, 4, 712609, tzinfo=datetime.timezone.utc)),
        ),
    ]
