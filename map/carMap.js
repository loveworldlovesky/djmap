var map,baseLayer,pointLayer,lineLayer,polygonLayer,drawPoint,drawLine,drawPolygon;
var url="http://localhost:8090/iserver/services/map-djtest/rest/maps/djtest@djtest_ds";
var dataAdded = false;
var vector;
var polygonLayer,drawPolygon;
var dragFeature;
var markerLayer;//闪烁

function init(){
	//TODO 通过点击,可获取比较准确的点击点位置,开发完成后不再需要
	tempLayer = new SuperMap.Layer.Vector("temVectorLayer");
	drawTempPoint = new SuperMap.Control.DrawFeature(tempLayer,SuperMap.Handler.Point);
	drawTempPoint.events.on({
		"featureadded" : drawTempPointCompleted
	});
    //新建面矢量图层,用来画图
    polygonLayer = new SuperMap.Layer.Vector("vector");
    //画多边形要素
    drawPolygon = new SuperMap.Control.DrawFeature(polygonLayer, SuperMap.Handler.Polygon);
	//支持拖拽要素
	dragFeature = new SuperMap.Control.DragFeature(polygonLayer);
	//dragFeature.onComplete=onComplete;
	//查询闪烁功能
	markerLayer = new SuperMap.Layer.Markers("markerLayer");
	
	map = new SuperMap.Map("map",{
		controls: [
			new SuperMap.Control.OverviewMap({
						autoPan : true
					}),
					new SuperMap.Control.MousePosition(),
					new SuperMap.Control.PanZoomBar({
						showSlider : true
					}),
					new SuperMap.Control.Navigation( {
						dragPanOptions : {
							enableKinetic : true
						}
					}),
					drawTempPoint,drawPolygon,dragFeature
		]
	});
	//map.numZoomLevels=8;

	baseLayer = new SuperMap.Layer.TiledDynamicRESTLayer("djtest@djtest_ds", url, {transparent: true, cacheEnabled: true}, {maxResolution: "auto"});
	baseLayer.events.on({"layerInitialized": addLayer});
	
	var callbacks={
            click: function(currentFeature){
	            closeInfoWin();
	            var trainNo = currentFeature.data.trainNo;
	            var trainName = currentFeature.data.trainName;
	            var vehicleType = currentFeature.data.vehicleType;
	            var htmlContent = '<div>';
	            if(vehicleType =='1' || vehicleType =='2' || vehicleType =='3'){
	            	htmlContent+='<div><a  href="javascript:void(0)" onclick="javascript:openAsset(\''+trainNo+'\',\''+vehicleType+'\');return false;">'+trainNo+'</a></div>';
	        	}else{
	        		htmlContent+='<div>'+trainNo+'</div>';
	        	}
	            
	            htmlContent+='<div>'+trainName+'</div>';
	            htmlContent+='</div>';
	            var popup = new SuperMap.Popup.FramedCloud("popwin",
	                    //new SuperMap.LonLat(572223.37246,5225349.40050),
	            		currentFeature.geometry.getBounds().getCenterLonLat(),
	                    null,
	                    htmlContent,
	                    null,
	                    true);
	            infowin = popup;
	            map.addPopup(popup);
        }
    };
	map.events.register("zoomend", map, mapzoomend);
	drawTempPoint.activate();
	
	addData();
	
	 var  selectFeature = new SuperMap.Control.SelectFeature(polygonLayer,
             {
                 callbacks: callbacks
             });
     map.addControl(selectFeature);
     selectFeature.activate();
     
     mini.parse();
     
     mf.bindChange("train_no", function(e) {
    	 queryByTrainNo();
 	 });
     
}
var  infowin=null;
function closeInfoWin(){
    if(infowin){
        try{
            infowin.hide();
            infowin.destroy();
        }
        catch(e){}
    }
}
function draw_polygon(){
    deactiveAll();
    drawPolygon.activate();
}
function deactiveAll(){
    drawPolygon.deactivate();
}
//激活拖拽要素控件
function activateDragFeature(){
    dragFeature.activate();
}
function deactivateDragFeature(){
    dragFeature.deactivate();
}
function addLayer() {
	map.addLayers([markerLayer,baseLayer,tempLayer,polygonLayer]);
	var centerXY = new SuperMap.LonLat(572223.37246,5225349.40050);
	map.setCenter(centerXY, 2);
}
function drawTempPointCompleted(drawGeometryArgs) {
	var feature = new SuperMap.Feature.Vector();
	console.log('feature.geometry='+drawGeometryArgs.feature.geometry);
    feature.geometry = drawGeometryArgs.feature.geometry,
    feature.style = {
        strokeColor: "#304DBE",
        strokeWidth: 1,
        pointerEvents: "visiblePainted",
        fillColor: "#304DBE",
        fillOpacity: 0.8
    };
    tempLayer.addFeatures(feature);
    
	var queryParam;
	var queryParams = new Array();
	var distance = 0.01;
	queryParam = new SuperMap.REST.FilterParameter({
		name : "djtest@djtest_ds"
	});
	queryParams[0] = queryParam;
	
	var queryByDistanceParams = new SuperMap.REST.QueryByDistanceParameters({
		queryParams : queryParams,
		returnContent : true,
		distance : distance,
		isNearest : true,
		geometry : drawGeometryArgs.feature.geometry
	});

	var queryByDistanceService = new SuperMap.REST.QueryByDistanceService(url);
	queryByDistanceService.events.on({
		"processCompleted" : processCompleted,
		"processFailed" : processFailed
	});
	queryByDistanceService.processAsync(queryByDistanceParams);
}
function processCompleted(queryEventArgs){
	var i, j, result = queryEventArgs.result;
	var features;
	if (result && result.recordsets) {
		var stationData = "";
		for (i = 0, recordsets = result.recordsets, len = recordsets.length; i < len; i++) {
			if (recordsets[i].features) {
				for (j = 0; j < recordsets[i].features.length; j++) {
					features = recordsets[i].features[j];
					var data = features.data;
					alert(data.NAME+"-"+data.X+","+data.Y);
				}
			}
		}
	}
}
function processFailed(ServiceFailedEventArgs){
	alert(ServiceFailedEventArgs.error.errorMsg);
}

//地图缩放时,动态修改文字大小
function changeFont(fontSize){
	var pfs = polygonLayer.features;
	for(var i = 0;i<pfs.length;i++){
		var feature = pfs[i];
		//style.label = feature.style.label;
		var oldSize = feature.style.fontSize;
		feature.style.fontSize = fontSize;
		//console.log('oldSize='+oldSize+',newfontSize='+feature.style.fontSize);
	}
	polygonLayer.redraw();
}
var fontSizeArray = [1,1,1,1,10,20,30,50];
function mapzoomend(){
	var index = map.zoom;
	console.log('mapzoomend='+index);
	changeFont(fontSizeArray[index]);
}
function onComplete(feature,pixel){
    var fea= feature;
    console.log(fea);
    var position = pixel;
    console.log(position);
    console.log(feature.style.label);
}
function onStopAreaChanged(e){
	mini.parse();
    var stopAreaCombo = mini.get("stopArea");
	var id = stopAreaCombo.getValue();
	var obj = stopAreas[parseInt(id)];
	var centerXY = new SuperMap.LonLat(obj.sx,obj.sy);
	map.setCenter(centerXY, 4);
}
var marker;
function queryByTrainNo(){
	if(marker!=null){
		markerLayer.removeMarker(marker);
	}
	
	var vehicle_type = $("#train_no\\$value").val();
	var vehicle_no = $("#train_no\\$text").val();
	
	if(vehicle_no==null || vehicle_no==''){
		return;	
	}
	
//	if(vehicle_type==vehicle_no){
//		//手动录入按其他车处理
//		vehicle_type = 4;
//	}
	for(var x = 1;x<=4;x++){
		$('#qinfo').html("正在执行查询,请稍后...");
		vehicle_type = x; 
		var pfs = polygonLayer.features;
		for(var i = 0;i<pfs.length;i++){
			var feature = pfs[i];
			var data = feature.data;
			var vehicleType = data.vehicleType;
			var trainNo = data.trainNo;
			
			if(vehicle_type == data.vehicleType && vehicle_no == data.trainNo){
				
				var size = new SuperMap.Size(30, 30);
				var offset = new SuperMap.Pixel(-(size.w/2), -size.h);
				var icon = new SuperMap.Icon("images/marker_red.gif",size);
				marker = new SuperMap.Marker(new SuperMap.LonLat(data.sx, data.sy), icon);
				markerLayer.addMarker(marker);
				map.setCenter(new SuperMap.LonLat(data.sx, data.sy), 5);
				$('#qinfo').html("查询完毕!");
				return;
			}
		}
	}
	
	$('#qinfo').html("未在地图上查询到,该车可能未入库!");
}
