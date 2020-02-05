# -*- coding: utf-8 -*-
# Generated by Django 1.11.24 on 2020-02-05 13:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gvsigol_core', '0022_project_baselayer_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='sharedview',
            name='internal',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AlterField(
            model_name='sharedview',
            name='name',
            field=models.CharField(max_length=40, unique=True),
        ),
    ]
