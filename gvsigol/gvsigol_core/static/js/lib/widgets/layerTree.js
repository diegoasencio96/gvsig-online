/**
 * gvSIG Online.
 * Copyright (C) 2010-2017 SCOLAB.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @author: Javier Rodrigo <jrodrigo@scolab.es>
 */

/**
 * TODO
 */
var layerTree = function(conf, map, isPublic) {
	this.map = map;	
	this.conf = conf;
	this.isPublic= isPublic;
	this.editionBar = null;
	this.$container = $('#layer-tree-tab');
	this.createTree();
	$(".layer-tree-groups").sortable({
		placeholder: "sort-highlight",
		handle: ".handle",
		forcePlaceholderSize: true,
		zIndex: 999999
	});
	var self = this;
	$(".layer-tree-groups").on("sortupdate", function(event, ui){
		self.reorder(event, ui);
	});
};

/**
 * TODO.
 */
layerTree.prototype.createTree = function() {
	
	var self = this;
	this.layerCount = 0;
	var groupCount = 1;
	
	var tree = '';
	tree += '<div class="box">';
	tree += '	<div class="box-body">';
	tree += '		<ul class="layer-tree">';
	tree += '			<li class="box box-default"; id="base-layers">';
	tree += '				<div class="box-header with-border">';
	tree += '					<span class="text">' + gettext('Base layers') + '</span>';
	tree += '					<div class="box-tools pull-right">';
	tree += '						<button class="btn btn-box-tool btn-box-tool-custom" data-widget="collapse">';
	tree += '							<i class="fa fa-minus"></i>';
	tree += '						</button>';
	tree += '					</div>';
	tree += '				</div>';
	tree += '				<div id="baselayers-group" class="box-body" style="display: block; font-size: 12px;">';
	tree += 					self.createBaseLayerUI(gettext('None'), false);
	tree += 					self.createBaseLayerUI('OpenStreetMap', true);
	if (this.conf.base_layers.bing.active) {
		tree += 				self.createBaseLayerUI(gettext("Bing roads"), false);
		tree += 				self.createBaseLayerUI(gettext("Bing aerial"), false);
		tree += 				self.createBaseLayerUI(gettext("Bing aerial with labels"), false);
    }
	tree += '				</div>';
	tree += '			</li>';
	if (this.conf.layerGroups) {
		for (var i=0; i<this.conf.layerGroups.length; i++) {
			var layerGroup = this.conf.layerGroups[i];
			tree += '			<li class="box box-default collapsed-box" id="' + layerGroup.groupId + '">';
			tree += '				<div class="box-header with-border">';
			tree += '					<input type="checkbox" class="layer-group" id="layergroup-' + layerGroup.groupId + '">';
			tree += '					<span class="text">' + layerGroup.groupTitle + '</span>';
			tree += '					<div class="box-tools pull-right">';
			tree += '						<button class="btn btn-box-tool btn-box-tool-custom" data-widget="collapse">';
			tree += '							<i class="fa fa-plus"></i>';
			tree += '						</button>';
			tree += '					</div>';
			tree += '				</div>';
			tree += '				<div data-groupnumber="' + (groupCount++) * 100 + '" class="box-body layer-tree-groups" style="display: none;">';
			for (var j=0; j<layerGroup.layers.length; j++) {	
				var layer = layerGroup.layers[j];				
				tree += self.createOverlayUI(layer);
			}
			tree += '				</div>';
			tree += '			</li>';
		}
	}
	tree += '		</ul>';
	tree += '	</div>';
	tree += '</div>';
	
	this.$container.append(tree);
	
	$( ".layer-opacity-slider" ).slider({
	    min: 0,
	    max: 100,
	    value: 100,
	    slide: function( event, ui ) {
	    	var layers = self.map.getLayers();
			var id = this.dataset.layerid;
			layers.forEach(function(layer){
				if (layer.baselayer == false) {
					if (id===layer.get("id")) {
						layer.setOpacity(parseFloat(ui.value)/100);
						$("#layer-opacity-output-" + id).text(ui.value + '%');
					}
				}						
			}, this);
	    }
	});

	$("input[name=baselayers-group]:radio").change(function (e) {
		var baseLayers = self.map.getLayers();
		baseLayers.forEach(function(layer){
			if (layer.baselayer) {
				if (layer.getVisible() == true) {
					layer.setVisible(false);
				}
				if (layer.get('id') == this.id) {
					layer.setVisible(true);
				}
			}						
		}, this);
	});
	
	$("input[type=checkbox]").change(function (e) {
		var layers = self.map.getLayers();
		layers.forEach(function(layer){
			if (!layer.baselayer) {
				if (layer.get("id") === this.id) {
					if (layer.getVisible() == true) {
						layer.setVisible(false);
					} else {
						layer.setVisible(true);
					}
				}
			};
		}, this);
	});
	
	$(".layer-group").change(function (e) {
		var groupId = this.id.split('-')[1]; 
		var checked = this.checked;
		for (var i=0; i<self.conf.layerGroups.length; i++) {			
			var group = self.conf.layerGroups[i];
			if (group.groupId == groupId) {
				var mapLayer = self.getGroupLayerFromMap(group.groupName);
				if (checked) {
					mapLayer.setVisible(true);
				} else {
					mapLayer.setVisible(false);
				}
				for (var j=0; j<group.layers.length; j++) {
					var layer = group.layers[j];
					var layerCheckbox = document.getElementById(layer.id);
					var mapLayer = self.getLayerFromMap(layer);
					if (checked) {
						mapLayer.setVisible(false);
						layerCheckbox.checked = true;
						layerCheckbox.disabled = true;
						
						$(".layer-opacity-slider[data-layerid='"+layer.id+"']").slider( "option", "disabled", true );
					} else {
						mapLayer.setVisible(false);
						layerCheckbox.checked = false;
						layerCheckbox.disabled = false;
						
						$(".layer-opacity-slider[data-layerid='"+layer.id+"']").slider( "option", "disabled", false );
					}
				}
			}			
		}
	});
	
	$(".opacity-range").on('change', function(e) {
		var layers = self.map.getLayers();
		var id = this.id.split("opacity-range-")[1];
		layers.forEach(function(layer){
			if (layer.baselayer == false) {
				if (id===layer.get("id")) {
					layer.setOpacity(this.valueAsNumber/100);
				}
			}						
		}, this);
	});
	
	$(".show-attribute-table-link").on('click', function(e) {
		var selectedLayer = null;
		var layers = self.map.getLayers();
		layers.forEach(function(layer){
			if (layer.baselayer == false) {
				if (this.dataset.id == layer.get('id')) {
					selectedLayer = layer;
				}
			}						
		}, this);
		var dataTable = new attributeTable(selectedLayer, self.map, self.conf);
		dataTable.show();
		dataTable.registerEvents();
	});
	
	
	$(".start-edition-link").on('click', function(e) {
		if (self.editionBar == null) {
			var selectedLayer = null;
			var id = this.id.split("start-edition-")[1];
			var layers = self.map.getLayers();
			layers.forEach(function(layer){
				if (layer.baselayer == false) {
					if (id==layer.get('id')) {
						selectedLayer = layer;
					}
				}						
			}, this);

			self.startEdition(selectedLayer, self);
		} else {
			messageBox.show('warning', gettext('You are editing the layer') + ': ' + self.editionBar.getSelectedLayer().title);
		}
	});
	
	$(".show-metadata-link").on('click', function(e) {
		var layers = self.map.getLayers();
		var selectedLayer = null;
		var id = this.id.split("show-metadata-")[1];
		layers.forEach(function(layer){
			if (layer.baselayer == false) {
				if (id===layer.get("id")) {
					selectedLayer = layer;
				}
			}						
		}, this);
		self.showMetadata(selectedLayer);
	});
	
	$(".zoom-to-layer").on('click', function(e) {
		var layers = self.map.getLayers();
		var selectedLayer = null;
		var id = this.id.split("zoom-to-layer-")[1];
		layers.forEach(function(layer){
			if (layer.baselayer == false) {
				if (id===layer.get("id")) {
					selectedLayer = layer;
				}
			}						
		}, this);
		self.zoomToLayer(selectedLayer);
	});
	
};

/**
 * TODO
 */
layerTree.prototype.getLayerFromMap = function(tocLayer) {
	var layers = this.map.getLayers();
	var mapLayer = null;
	layers.forEach(function(layer){
		if (layer.baselayer == false) {
			if (layer.get('id')==tocLayer.id) {
				mapLayer = layer;
			}/* else {
				if (layer.getSource().params_) {
					if (layer.getSource().getParams().LAYERS.indexOf(tocLayer.name) > -1) {
						mapLayer = layer;
					}
					
				} else {
					if (tocLayer.name == layer.layer_name) {
						mapLayer = layer;
					}
				}
			}*/
			
		}
	}, this);
	return mapLayer;
};

/**
 * TODO
 */
layerTree.prototype.getGroupLayerFromMap = function(tocLayer) {
	var layers = this.map.getLayers();
	var mapLayer = null;
	layers.forEach(function(layer){
		if (layer.baselayer == false) {
			if (layer.get('id')==tocLayer) {
				mapLayer = layer;
			}/*
			if (layer.getSource().params_) {
				if (layer.getSource().getParams().LAYERS.indexOf(tocLayer.name) > -1) {
					mapLayer = layer;
				}
				
			} else {
				if (tocLayer.name == layer.layer_name) {
					mapLayer = layer;
				}
			}*/
		}
	}, this);
	return mapLayer;
};

layerTree.prototype.createBaseLayerUI = function(name, checked) {
	var count = this.layerCount++;
	var id = "gol-layer-" + count;		    
    
	var ui = '';
	ui += '<div style="margin-left:20px;">';
	if (checked) {
		ui += 	'<input type="radio" id="' + id + '" name="baselayers-group" checked>';
	} else {
		ui += 	'<input type="radio" id="' + id + '" name="baselayers-group">';
	}
	ui += 		'<span class="text">' + name + '</span>';
	ui += '</div>';
	
	return ui;
};

layerTree.prototype.createOverlayUI = function(layer) {
	
	var mapLayer = this.getLayerFromMap(layer);
	var id = layer.id;
	
	var ui = '';
	ui += '<div data-layerid="' + id + '" data-zindex="' + mapLayer.getZIndex() + '" class="box layer-box thin-border box-default collapsed-box">';
	ui += '		<div class="box-header with-border">';
	ui += '			<span class="handle"> ';
	ui += '				<i class="fa fa-ellipsis-v"></i>';
	ui += '				<i class="fa fa-ellipsis-v"></i>';
	ui += '			</span>';
	if (layer.visible) {
		ui += '		<input type="checkbox" id="' + id + '" checked>';
	} else {
		ui += '		<input type="checkbox" id="' + id + '">';
	}
	ui += '			<span class="text">' + layer.title + '</span>';
	ui += '			<div class="box-tools pull-right">';
	ui += '				<button class="btn btn-box-tool btn-box-tool-custom" data-widget="collapse">';
	ui += '					<i class="fa fa-plus"></i>';
	ui += '				</button>';
	ui += '			</div>';
	ui += '		</div>';
	ui += '		<div class="box-body" style="display: none;">';
	ui += '			<a id="show-metadata-' + id + '" class="btn btn-block btn-social btn-custom-tool show-metadata-link">';
	ui += '				<i class="fa fa-external-link"></i> ' + gettext('Layer metadata');
	ui += '			</a>';
	if (layer.queryable && layer.is_vector) {	    
	    ui += '	<a id="show-attribute-table-' + id + '" data-id="' + id + '" class="btn btn-block btn-social btn-custom-tool show-attribute-table-link">';
		ui += '		<i class="fa fa-table"></i> ' + gettext('Attribute table');
		ui += '	</a>';
    }	
	if (!this.isPublic){
		if (mapLayer.is_vector) {
	    	if (mapLayer.write_roles.length >= 1) {
	    		if (this.userCanWrite(mapLayer)) {
	    			ui += '	<a id="start-edition-' + id + '" href="#" class="btn btn-block btn-social btn-custom-tool start-edition-link">';
	    			ui += '		<i class="fa fa-edit"></i> ' + gettext('Edit layer');
	    			ui += '	</a>';
	    		}
	    	}
	    }
	}
	ui += '	<a id="zoom-to-layer-' + id + '" href="#" class="btn btn-block btn-social btn-custom-tool zoom-to-layer">';
	ui += '		<i class="fa fa-search" aria-hidden="true"></i> ' + gettext('Zoom to layer');
	ui += '	</a>';
	
	ui += '			<label style="display: block; margin-top: 8px; width: 95%;">' + gettext('Opacity') + '<span id="layer-opacity-output-' + layer.id + '" class="margin-l-15 gol-slider-output">%</span></label>';
	ui += '			<div id="layer-opacity-slider" data-layerid="' + layer.id + '" class="layer-opacity-slider"></div>';
	ui += '		</div>';
	ui += '</div>';
	
	
	
	return ui;
};

/**
 * TODO
 */
layerTree.prototype.describeFeatureType = function(layer) {
	
	var featureType = new Array();
	
	$.ajax({
		type: 'POST',
		async: false,
	  	url: layer.wfs_url,
	  	data: {
	  		'service': 'WFS',
			'version': '1.1.0',
			'request': 'describeFeatureType',
			'typeName': layer.getSource().getParams().LAYERS, 
			'outputFormat': 'text/xml; subtype=gml/3.1.1'
		},
	  	success	:function(response){
	  		var elements = null;
			try {
				elements = response.getElementsByTagName('sequence')[0].children;
		    } catch (error) {
		    	elements = response.getElementsByTagName('xsd:sequence')[0].children;
		    }
			
			for (var i=0; i<elements.length; i++) {
				var element = {
					'name': elements[i].attributes[2].nodeValue,
					'type': elements[i].attributes[4].nodeValue
				};
				featureType.push(element);
			}
		},
	  	error: function(){}
	});
	
	return featureType;
};

/**
 * Tries to add a layer lock and starts edition on success
 */
layerTree.prototype.startEdition = function(layer, layerTree) {
	$.ajax({
		type: 'POST',
		async: true,
	  	url: '/gvsigonline/services/add_layer_lock/',
	  	data: {
		  	workspace: layer.workspace,
		  	layer: layer.layer_name
		},
		origdata: {
			layer: layer,
			layertree: layerTree
		},
	  	beforeSend:function(xhr){
	    	xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
	  	},
	  	success	:function(response){
	  		var self = this.origdata.layertree;
	  		var selectedLayer = this.origdata.layer;
	  		var featureType = self.describeFeatureType(selectedLayer);
	  		self.editionBar = new editionBar(self, self.map, featureType, selectedLayer);
	  	},
	  	error: function(){
	  		messageBox.show('error', gettext('The layer you are trying to edit is locked'));
	  	}
	});
};

/**
 * TODO
 */
layerTree.prototype.userCanWrite = function(layer) {
	var canWrite = false;
	for (var i=0; i<layer.write_roles.length; i++) {
		for (var k=0; k<this.conf.user.permissions.roles.length; k++) {
			if (layer.write_roles[i] == this.conf.user.permissions.roles[k]) {
				canWrite = true;
			}
		}
	}
	return canWrite;
};


layerTree.prototype.zoomToLayer = function(layer) {
	var self = this;
	var layer_name = layer.layer_name;
	var layer_crs = null;
	if(layer.crs &&  layer.crs.crs){
		layer_crs = layer.crs.crs;
	}
	if(layer.parentGroup && layer.parentGroup.layers){
		for(var lyr in layers){
			if(lyr.name == layer_name){
				layer_crs = lyr.crs.crs;
			}
		}
	}
	var url = layer.wms_url+'?request=GetCapabilities&service=WMS&version=1.1.1';
	var parser = new ol.format.WMSCapabilities();
	$.ajax(url).then(function(response) {
		   var result = parser.read(response);
		   var Layers = result.Capability.Layer.Layer; 
		   var extent;
		   for (var i=0, len = Layers.length; i<len; i++) {
		     var layerobj = Layers[i];
		     if (layerobj.Name == layer_name) {
		         extent = layerobj.BoundingBox[0].extent;
		         break;
		     }
		   }
		   
		   if(layer_crs != null){
			   var ext = ol.proj.transformExtent(extent, ol.proj.get(layer_crs), ol.proj.get('EPSG:3857'));
			   self.map.getView().fit(ext, self.map.getSize());
		   }
		});
}


/**
 * TODO
 */
layerTree.prototype.getEditionBar = function(layer) {
	return this.editionBar;
};

/**
 * TODO
 */
layerTree.prototype.showMetadata = function(layer) {
	
	$('#float-modal .modal-title').empty();
	$('#float-modal .modal-title').append(gettext('Layer metadata'));
	
	var body = '';
	body += '<div class="row">';
	body += 	'<div class="col-md-12">';
	body += 		'<p>' + layer.abstract + '</p>';				
	body += 	'</div>';
	body += '</div>';
	
	$('#float-modal .modal-body').empty();
	$('#float-modal .modal-body').append(body);
	
	var buttons = '';
	buttons += '<button id="float-modal-cancel-metadata" type="button" class="btn btn-default" data-dismiss="modal">' + gettext('Cancel') + '</button>';
	if (layer.metadata != '') {
		buttons += '<button id="float-modal-show-metadata" type="button" class="btn btn-default">' + gettext('Show in geonetwork') + '</button>';
	}
	
	$('#float-modal .modal-footer').empty();
	$('#float-modal .modal-footer').append(buttons);
	
	$("#float-modal").modal('show');
	
	var self = this;	
	$('#float-modal-show-metadata').on('click', function () {
		var win = window.open(layer.metadata, '_blank');
		  win.focus();
		
		$('#float-modal').modal('hide');
	});
};

/**
 * TODO
 */
layerTree.prototype.reorder = function(event,ui) {
	var groupNumber = ui.item[0].parentNode.dataset.groupnumber;
	var groupLayers = ui.item[0].parentNode.children;
	var mapLayers = this.map.getLayers();
	
	var zindex = parseInt(groupNumber);
	var mapLayers_length = mapLayers.getLength();
	
	for (var i=0; i<groupLayers.length; i++) {
		var layerid = groupLayers[i].dataset.layerid;
		mapLayers.forEach(function(layer){
			if (layer.get('id') == layerid) {
				layer.setZIndex(parseInt(zindex) + mapLayers_length);
				mapLayers_length--;
			}
		}, this);
	}
};
