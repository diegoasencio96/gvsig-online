# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2019-04-24 07:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gvsigol_core', '0008_auto_20171117_1128'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='tools',
            field=models.TextField(blank=True, null=True),
        ),
    ]