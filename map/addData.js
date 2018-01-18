function addData(){
	
    if(!dataAdded){
    	//查询所有库,所有轨道,所有车,画出每一个车
    	mf.data.invoke("hmVehicleMoveOpManager.getMapTrains", {
    		success : function(json) {
    			var data = JSON.parse(json);
    			drawTrains(data);
    		}
    	});
        dataAdded=true;
    }else{
        alert("数据已加载。");
    }
}
function drawTrains(data){
	var point_features=[];//记录所画的每一个图形
	for(var i = 0;i<data.length;i++){
		var x = data[i].sx1;
		var y = data[i].sy1;
		var dx = data[i].trainLen;
		var dy = 5;//机车默认高度,高度小于5时会导致lable随机偏移
		var trainNo = data[i].trainNo;//去除前缀
		var index = trainNo.indexOf('-');
		if(index != -1){
			trainNo = trainNo.substring(index+1);
		}
		var trainName = data[i].trainName;
		var vehicleType = data[i].vehicleType;
		createRec(trainNo,trainName,vehicleType,Math.round(x*10)/10,Math.round(y*10)/10,dx,dy,point_features)
	}
	polygonLayer.addFeatures(point_features);
	polygonLayer.redraw();
}
function createRec(trainNo,trainName,vehicleType,x,y,dx,dy,point_features){
	//var train_len = 15.95;//换算后的车长
	var train_len = Math.round(dx);//超图BUG,带小数时影响lable位置
	var mis_y = 1;//控制车辆在轨道的上下偏移
	
	y = y - mis_y;
	//右下
	var x1 = x + train_len;
	var y1 = y;
	//右上
	var x2 = x1 - 2;
	var y2 = y1 + dy;
	//左上
	var x3 = x;
	var y3 = y2;
	//左下
	var x4 = x;
	var y4 = y1;
	
	var polygon_data=[[x1,y1],[x2,y2],[x3,y3],[x4,y4]];
    var points=[];
    for(var i= 0,len=polygon_data.length;i<len;i++){
        var point = new SuperMap.Geometry.Point(polygon_data[i][0],polygon_data[i][1]);
        points.push(point);
    }
    var linearRing=new SuperMap.Geometry.LinearRing(points);
    var polygon=new SuperMap.Geometry.Polygon([linearRing]);
    //所画图形具备的属性数据
    var polygon_data = {"trainNo":trainNo,"trainName":trainName,"vehicleType":vehicleType,"sx":x,"sy":y};
    //按车类型设置多边形填充颜色
    var strokeColor = "";
    if(vehicleType == '1'){
    	strokeColor = "#0000FF";//	纯蓝
    }else if(vehicleType == '2'){
    	strokeColor = "#00FFFF";//	青色
    }else if(vehicleType == '3'){
    	strokeColor = "#FF7F50";//
    }else{
    	strokeColor = "#00FF00";//酸橙色
    }
    //指定样式
    var drawFeatureStyle = {  
            strokeColor: "#FF0000",  
            strokeWidth: 2,  
            strokeOpacity: 0.8,  
            pointRadius: 6,  
            fillColor: strokeColor,
            fillOpacity: 0.5,
            cursor: "pointer",
            label:trainNo,
            fontFamily:"宋体",//标签字体
            fontColor:"#00FF00",
            fontSize:1,
        	labelSelect:true
    };
    var polygon_feature=new SuperMap.Feature.Vector(polygon,polygon_data,drawFeatureStyle);
    point_features.push(polygon_feature);
}

function createCircle(origin, radius, sides,r,angel){
    var rR = r*Math.PI/(180*sides);
    var rotatedAngle, x, y;
    var points = [];
    for(var i=0; i<sides; ++i) {
        rotatedAngle = rR*i;
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(new SuperMap.Geometry.Point(x, y));
    }
    rotatedAngle = r*Math.PI/180;
    x = origin.x + (radius * Math.cos(rotatedAngle));
    y = origin.y + (radius * Math.sin(rotatedAngle));
    points.push(new SuperMap.Geometry.Point(x, y));

    var ring = new SuperMap.Geometry.LinearRing(points);
    ring.rotate(parseFloat(angel),origin);
    var geo = new SuperMap.Geometry.Collection([ring]);
    geo.origin = origin;
    geo.radius = radius;
    geo.r = r;
    geo.angel = angel;
    geo.sides = sides;
    geo.polygonType = "Curve";
    return geo;
}
function openAsset(trainNo,vehicleType){
	var url,title;

	if(vehicleType=='1'){
		mf.data.invoke("hmInReceiptManager.getAssetIdByTrainNo", {
			data : {
				"trainNo" : trainNo
			},
			success : function(ret) {
				assetid = ret;
			}
		});
		title = '工务机械车台账';
		url = mf.action.getCtxPath()+"//hjdj/hmmachineasset.do?method=edit&assetId="+ assetid;

	}else if(vehicleType == '2'){
		mf.data.invoke("hmQuarterAssetManager.getAssetIdByTrainNo", {
			data : {
				"trainNo" : trainNo
			},
			success : function(ret) {
				assetid = ret;
			}
		});
		title = '宿营车台账';
		url = mf.action.getCtxPath()+"//hjdj/hmquarterasset.do?method=edit&assetId="+ assetid;
	}else if(vehicleType == '3'){
		mf.data.invoke("hmTrackcarAssetManager.getAssetIdByTrainNo", {
			data : {
				"trainNo" : trainNo
			},
			success : function(ret) {
				assetid = ret;
			}
		});
		title = '轨道车台账';
		url = mf.action.getCtxPath()+"//hjdj/hmtrackcarasset.do?method=edit&assetId="+ assetid;
	}else{
		
	}
	
	var opt = {
			url : url,
			title : title,
			width : "95%",
			height : "90%",
			allowResize : true,
	};
	mf.window.open(opt);
}
//求x1,y1 x2,y2的旋转角度
function getAngle(x1,y1,x2,y2){
    var x = Math.abs(x1-x2);
    var y = Math.abs(y1-y2);
    var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
    var cos = y/z;
    var radina = Math.acos(cos);//用反三角函数求弧度
    var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

    return angle;
}