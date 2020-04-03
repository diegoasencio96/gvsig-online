FROM python:2.7.15
LABEL maintainer="diegoasencio96@gmail.com" \
      description="Django con Python 2.7.15" \
      version="1.0.0"
ENV PYTHONUNBUFFERED 1
ENV DOCKYARD_SRVPROJ=/srv/gvsig-online-deploy/gvsig-online
RUN apt-get update && apt-get install -y python python-pip libpq-dev python-dev python-pil build-essential gettext libxml2 libxml2-dev libxslt-dev binutils libproj-dev gdal-bin libsasl2-dev libldap2-dev libssl-dev
COPY gvsigol/requirements.txt ${DOCKYARD_SRVPROJ}/gvsigol/requirements.txt
RUN pip install -r ${DOCKYARD_SRVPROJ}/gvsigol/requirements.txt
COPY . ${DOCKYARD_SRVPROJ}
WORKDIR ${DOCKYARD_SRVPROJ}/gvsigol
# RUN pip install -r requirements.txt
RUN ln -s ../app_dev/gvsigol_app_dev
RUN ln -s ../plugin_edition/gvsigol_plugin_edition
RUN ln -s ../plugin_alfresco/gvsigol_plugin_alfresco
RUN ln -s ../plugin_catalog/gvsigol_plugin_catalog
RUN ln -s ../plugin_catastro/gvsigol_plugin_catastro
RUN ln -s ../plugin_downloadman/gvsigol_plugin_downloadman
RUN ln -s ../plugin_draw/gvsigol_plugin_draw
RUN ln -s ../plugin_elevation/gvsigol_plugin_elevation
RUN ln -s ../plugin_geocoding/gvsigol_plugin_geocoding
RUN ln -s ../plugin_importfromservice/gvsigol_plugin_importfromservice
RUN ln -s ../plugin_importvector/gvsigol_plugin_importvector
RUN ln -s ../plugin_print/gvsigol_plugin_print
RUN ln -s ../plugin_sampledashboard/gvsigol_plugin_sampledashboard
RUN ln -s ../plugin_samplemenubutton/gvsigol_plugin_samplemenubutton
RUN ln -s ../plugin_staticdownloads/gvsigol_plugin_staticdownloads
RUN ln -s ../plugin_survey/gvsigol_plugin_survey
RUN ln -s ../plugin_sync/gvsigol_plugin_sync
RUN ln -s ../plugin_trip_planner/gvsigol_plugin_trip_planner
RUN ln -s ../plugin_worldwind/gvsigol_plugin_worldwind
# do a ln -s for each plugin you want to use
RUN ls
RUN ls
CMD sh ../docker-entrypoint.sh
