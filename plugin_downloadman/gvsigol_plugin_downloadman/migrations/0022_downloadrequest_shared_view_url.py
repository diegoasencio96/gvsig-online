# -*- coding: utf-8 -*-
# Generated by Django 1.11.24 on 2020-02-06 09:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gvsigol_plugin_downloadman', '0021_downloadlink_is_temporary'),
    ]

    operations = [
        migrations.AddField(
            model_name='downloadrequest',
            name='shared_view_url',
            field=models.TextField(blank=True, default='', null=True),
        ),
    ]
