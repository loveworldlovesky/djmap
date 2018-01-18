<!doctype html>
<html style="height: 99%">
<head>
<title>调车地图</title>
<%@ page contentType="text/html;charset=UTF-8"%>
<%@ include file="/mf/include/meta.jsp"%>
<%	rdm = SpringBeanUtils.getBean("resultDataManager");%>
<style type="text/css">
#map{
	position: relative;
	height: 100%;
	border:1px solid #3473b7;
	background-color: BLACK;
}
#qinfo{
	color: red;
}
</style>
<script type="text/javascript">
//定义停车区域字典,停车区域中心点
var stopAreas = [
                 { "id": 1, "text": "大机检修库","sx":571996.28117678,"sy":5225386.2924699}, 
                 { "id": 2, "text": "检修库前区域","sx":572266.20920238,"sy":5225389.3472189},
                 { "id": 3, "text": "大机停留库1","sx":571945.06083982,"sy":5225315.0933175},
                 { "id": 4, "text": "大机停留库2","sx":571721.59419373,"sy":5225314.8583368},
             	{ "id": 5, "text": "大机停留库3","sx":571729.14870359,"sy":5225270.4469843},
             	{ "id": 6, "text": "大机停留库4","sx":571948.62067777,"sy":5225270.4469843},
                 { "id": 7, "text": "大机停留库1前区域","sx":572174.43713086,"sy":5225316.0332402},
                 { "id": 8, "text": "大机停留库4前区域","sx":572204.51466051,"sy":5225278.4363281},
             	{ "id": 9, "text": "北停留库[站前区域]","sx":573006.30393776,"sy":5225388.8772572}
             ];             
</script>
</head>
<body style="height: 100%;"  onload="init()">
   	<div style="width:100%;">
    <div class="mini-toolbar" style="border-bottom:0;padding:0px;">
            <table style="width:100%;">
                <tr>
                    <td style="width:100%;">
                        <label>定位停车区域:</label><input id="stopArea" class="mini-combobox" style="width:150px;" textField="text" valueField="id" emptyText="请选择..."
      data=stopAreas onvaluechanged="onStopAreaChanged" allowInput="true" showNullItem="true" nullItemText="请选择..."/>
      					<label>按车号查询:</label>
      					<%=rdm.getParsedHTML("train_no", null, "hm.moveop.mapasset",PresentStyleType.EDIT)%>
                    	&nbsp;&nbsp;<label id="qinfo"></label>
                    </td>
                </tr>
            </table>           
        </div>
    </div>
	
	<div id="map"></div>
	<script src="libs/SuperMap.Include.js"></script>
	<script src="carMap.js"></script>
	<script src="addData.js"></script>
</body>
</html>
