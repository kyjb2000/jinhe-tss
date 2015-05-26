
function isArray(v){
    return Object.prototype.toString.call(v) === '[object Array]';
} 

function groupby(arr, fields, vFiled) {
	vFiled = vFiled || "value";
	var result = [], keySet = [], map = {}, fields = fields.split(",");
	arr.each(function(i, row){
		var key = [];
		fields.each(function(i, f){
			key.push(row[f]);
		});
		key = key.join(",");

		if( !map[key] ) {
			map[key] = 0
			keySet.push(key);
		}
		map[key] = map[key] + row[vFiled];
	});

	keySet.each(function(i, key) {
		var item = {}, key = key.split(",");
		item[vFiled] = parseFloat( map[key].toFixed(1) );
		fields.each(function(i, f){
			item[f] = key[i];
		});

		result.push(item);
	});

	return result;
}

Array.prototype.groupby = function(fields, vFiled) {
	groupby(this, fields, vFiled);
}

// 计算百分比，保留一位小数
function calculatePercent(val1, val2) {
	if( (val1 || val1 == 0) && val2) {
		return parseFloat(val1 * 1000 / val2 / 10).toFixed(1) + "%";
	}
	return '';
}

function divide(val1, val2) {
	if(val1 && val2) {
		return Math.round(val1 * 1000 / val2) / 10;
	}
	return 0;
}

// 14345 返回 15000，坐标展示用 
function $round(intNum) {
	intNum = Math.round(intNum);

	if(intNum <= 10) return 10;
	if(intNum <= 100) return 100;

	var toString = intNum.toString();
	var length = toString.length;

	var result = parseInt(toString.charAt(0) + toString.charAt(1)) + 1;
	for(var i = 0; i < length - 2; i++) {
		result = result + "0";
	}

	return parseInt(result);
}

// 14345 返回 14000，坐标展示用 
function $ceil(intNum) {
	intNum = Math.ceil(intNum);

	if(intNum <= 10) return 0;
	if(intNum <= 100) return 10;

	var toString = intNum.toString();
	var length = toString.length;

	var result = parseInt(toString.charAt(0) + toString.charAt(1)) ;
	for(var i = 0; i < length - 2; i++) {
		result = result + "0";
	}

	return parseInt(result);
}

/*
 * 读取给定数组指定字段的最大值、最小值、平均值、总和
 * 参数1  dataArray 数组（一维数组 或 二维数组 或 一维对象数组）
 * 参数2  fieldIndex 字段的下标或Key值，为空则是一维数组
 */
function selectEdge(dataArray, fieldIndex) {
	if( dataArray == null ||　dataArray.length == 0 ) {
		return {"max" : 0, "min" : 0, "avg" : 0, "total" : 0};
	}
	var length = dataArray.length;

	var maxValue = 0, minValue = 999999999, total = 0, avgValue = 0;
	for(var i = 0; i < length; i++) {

		var value = fieldIndex ? dataArray[i][fieldIndex] : dataArray[i];

		maxValue = Math.max(maxValue, value);
		minValue = Math.min(minValue, value);
		total += value;
	}
	avgValue = Math.round(total / length);

	return {"max" : maxValue, "min" : minValue, "avg" : avgValue, "total" : total};
}


/*
 * 处理图表横轴坐标个数（太多了显示难看）。
 * 如果大于12个，则截取n + 1个
 */
function processLabelSize(labels, n) {
	n = n || 6;

	var _length = labels.length;
	if(_length > 12) {
		var labels2 = [];

		for(var i = 0; i < n; i++) {
			labels2.push(labels[Math.round(_length * i / n)]);
		}
		labels2.push(labels[_length - 1]);

		labels = labels2;
	}

	return labels;
}

/*
 * 给定数据，按数据大小划定为N个区间，并计算出每个区间值的频度。
 */
function delimitScope(dataArray, n, fieldIndex) {
	var edge = selectEdge(dataArray, fieldIndex);
	var max = $round(edge.max);
	var min = $ceil(edge.min);

	var scopes = [];
	if(max <= 100) {
		n = 5;
		scopes = [0, 10, 30, 50, 80, 100];
	}
	else {
		for(var i = 0; i <= n; i++) {
			scopes.push( $round( min + ((max - min) * i / n)) );
		}
	}

	var result = {};
	for(var j = 1; j <= n; j++) {
		var key =  scopes[j - 1] + " ~ " +  scopes[j];
		result[key] = 0;
	}

	var _length = dataArray.length;
	for(var i = 0; i < _length; i++) {
		var value = fieldIndex ? dataArray[i][fieldIndex] : dataArray[i];

		for(var j = 1; j <= n; j++) {
			if(value < scopes[j]) {
				var key =  scopes[j - 1] + " ~ " +  scopes[j];
				result[key] = result[key] + 1;
				break;
			}
		}
	}

	return result;
}


// 合并两个对象的属性
function combine(obj1, obj2) {
	if(obj1 == null) return obj2;
    if(obj2 == null) return obj1;

    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

/*
 * 过滤参数集，剔除掉为空的参数项。
 * PASS: 因JQuery的ajax会发送空字符串，而TSS的ajax不发送，导致数据缓存条件失效。
 */
function filterEmptyParams(params) {
	for(var key in params) {
		if(params[key] == null || params[key] == "") {
			delete params[key];
		}
	}
}

// 读取画布上一级element的大小，以自动调整画布的大小
function autoAdjustSize(elementID) {
	var parentNode, node = $1(elementID);
	parentNode = node.parentNode ? node.parentNode : document.body;

	var _width  = Math.max(600, parentNode.offsetWidth - 5);
    var _height = Math.max(300, parentNode.offsetHeight - 5);
    $(node).css("width", _width + "px").css("height", _height + "px");

    return [ _width, _height];
}

function getLastFlushTime() {
	var today = new Date();
	return today.format('yyyy-MM-dd hh:mm:ss');  
}

/* ---------------------------------- 标准图标模板相关 ----------------------------------------------- */

function initResearhBt() {
	var researhBt = $1("researh");
	if(researhBt == null) {
		researhBt = tssJS.createElement("input", "dmsbt"); 
		researhBt.setAttribute("id", "researh");
		researhBt.setAttribute("type", "button");
		researhBt.setAttribute("value", "查询条件");
		document.body.appendChild(researhBt);
	}

    if(window.parent.$1("searchFormDiv") && window.parent.$1("btCloseSearchForm")) {
        researhBt.onclick = function() {
            window.parent.$("#searchFormDiv").css("display", "block").center(500, 500);
        }
    }
    else {
        researhBt.style.display = "none";
    }
}

/* ---------------------------------- 数据导出 ----------------------------------------------- */

URL_EXPORT_DATA = '../../data/export/data2csv';
URL_DOWNLOAD    = '../../data/download/';

function data2CSV(name, header, data) {
    if(data && data.length > 0) {
        var params = {"name": name};

        var fields = [], fieldKeys = [];
        header.each(function(i, field){
            fields.push(field.title);
			fieldKeys.push(field.field);
        });
        params.data = fields.join(",") + "\n";

        data.each(function(i, row){
            var values = [];
            fieldKeys.each(function(i, key){
            	values.push( row[key] );
            });

            params.data += values.join(",") + "\n";
        });

        $exportCSV(URL_EXPORT_DATA, params);
    }
}

/*
 * 导出数据为CSV文件。
 * 由数据服务先行生成CSV文件放在服务器的固定目录上，返回文件名称，再以http连接上去下载。
 *
 * 参数1  dataUrl 数据服务地址
 * 参数2  queryParams 数据服务参数
 */
function $exportCSV(dataUrl, queryParams) {
	tssJS.ajax({
		url: dataUrl,
		method: 'POST',
		params: queryParams, 
		type: 'json',
		ondata : function() {
			// 根据返回的导出文件名（压缩后的），生成下载链接。
			var fileName = this.getResponseText();
			if (fileName) {
				var frameName = createExportFrame();
    			$1(frameName).setAttribute("src", URL_DOWNLOAD + fileName);
			}
		}
	});
}

/* 创建导出用iframe */
function createExportFrame() {
	var frameName = "exportFrame";
	var frameObj = $1(frameName);
	if( frameObj == null ) {
		var exportDiv = $.createElement("div"); 
		exportDiv.innerHTML = "<div><iframe id='" + frameName + "' src='about:blank' style='display:none'></iframe></div>";
		document.body.appendChild(exportDiv);
	}
	return frameName;
}

var COLORS = ["#FFD700", "#90EE90", "#9370DB", "#9ACD32", "#AFEEEE", "#FF6347", "#00BFFF", "#228B22", 
	"gray", "green", "red", "blue", "yellow", "silver", "orange", "olive"];

var City_Coordinates = {
    "合肥":[117.17, 31.52],
	"安庆":[117.02, 30.31],
	"蚌埠":[117.21, 32.56],
	"亳州":[115.47, 33.52],
	"巢湖":[117.52, 31.36],
	"滁州":[118.18, 32.18],
	"阜阳":[115.48, 32.54],
	"贵池":[117.28, 30.39],
	"淮北":[116.47, 33.57],
	"淮南":[116.58, 32.37],
	"黄山":[118.18, 29.43],
	"界首":[115.21, 33.15],
	"六安":[116.28, 31.44],
	"马鞍山":[118.28, 31.43],
	"明光":[117.58, 32.47],
	"宿州":[116.58, 33.38],
	"天长":[118.59, 32.41],
	"铜陵":[117.48, 30.56],
	"芜湖":[118.22, 31.19],
	"宣州":[118.44, 30.57],
	"澳门":[115.07, 21.33],
	"北京":[116.24, 39.55],
	"福州":[119.18, 26.05],
	"长乐":[119.31, 25.58],
	"福安":[119.39, 27.06],
	"福清":[119.23, 25.42],
	"建瓯":[118.2, 27.03],
	"建阳":[118.07, 27.21],
	"晋江":[118.35, 24.49],
	"龙海":[117.48, 24.26],
	"龙岩":[117.01, 25.06],
	"南安":[118.23, 24.57],
	"南平":[118.1, 26.38],
	"宁德":[119.31, 26.39],
	"莆田":[119.00, 25.44],
	"泉州":[118.36, 24.56],
	"三明":[117.36, 26.13],
	"邵武":[117.29, 27.2],
	"石狮":[118.38, 24.44],
	"武夷山":[118.02, 27.46],
	"厦门":[118.06, 24.27],
	"永安":[117.23, 25.58],
	"漳平":[117.24, 25.17],
	"漳州":[117.39, 24.31],
	"兰州":[103.51, 36.04],
	"白银":[104.12, 36.33],
	"敦煌":[94.41, 40.08],
	"嘉峪关":[98.14, 39.48],
	"金昌":[102.1, 38.28],
	"酒泉":[98.31, 39.44],
	"临夏":[103.12, 35.37],
	"平凉":[106.4, 35.32],
	"天水":[105.42, 34.37],
	"武威":[102.39, 37.56],
	"西峰":[107.4, 35.45],
	"玉门":[97.35, 39.49],
	"张掖":[100.26, 38.56],
	"广州":[113.14, 23.08],
	"潮阳":[116.36, 23.16],
	"潮州":[116.38, 23.4],
	"澄海":[116.46, 23.28],
	"从化":[113.33, 23.33],
	"东莞":[113.45, 23.02],
	"恩平":[112.19, 22.12],
	"佛山":[113.06, 23.02],
	"高明":[112.5, 22.53],
	"高要":[112.26, 23.02],
	"高州":[110.5, 21.54],
	"鹤山":[112.57, 22.46],
	"河源":[114.41, 23.43],
	"花都":[113.12, 23.23],
	"化州":[110.37, 21.39],
	"惠阳":[114.28, 22.48],
	"惠州":[114.22, 23.05],
	"江门":[113.04, 22.35],
	"揭阳":[116.37, 23.55],
	"开平":[112.4, 22.22],
	"乐昌":[113.21, 25.09],
	"雷州":[110.04, 20.54],
	"廉江":[110.17, 21.37],
	"连州":[112.23, 24.48],
	"罗定":[111.33, 22.46],
	"茂名":[110.53, 21.4],
	"梅州":[116.07, 24.19],
	"南海":[113.09, 23.01],
	"番禺":[113.22, 22.57],
	"普宁":[116.1, 23.18],
	"清远":[113.01, 23.42],
	"三水":[112.52, 23.1],
	"汕头":[116.41, 23.22],
	"汕尾":[115.21, 22.47],
	"韶关":[113.37, 24.48],
	"深圳":[114.07, 22.33],
	"顺德":[113.15, 22.5],
	"四会":[112.41, 23.21],
	"台山":[112.48, 22.15],
	"吴川":[110.47, 21.26],
	"新会":[113.01, 22.32],
	"兴宁":[115.43, 24.09],
	"阳春":[111.48, 22.1],
	"阳江":[111.58, 21.5],
	"英德":[113.22, 24.1],
	"云浮":[112.02, 22.57],
	"增城":[113.49, 23.18],
	"湛江":[110.24, 21.11],
	"肇庆":[112.27, 23.03],
	"中山":[113.22, 22.31],
	"珠海":[113.34, 22.17],
	"南宁":[108.19, 22.48],
	"北海":[109.07, 21.28],
	"北流":[110.21, 22.42],
	"百色":[106.36, 23.54],
	"防城港":[108.2, 21.37],
	"贵港":[109.36, 23.06],
	"桂林":[110.17, 25.17],
	"桂平":[110.04, 23.22],
	"河池":[108.03, 24.42],
	"合山":[108.52, 23.47],
	"柳州":[109.24, 23.19],
	"赁祥":[106.44, 22.07],
	"钦州":[108.37, 21.57],
	"梧州":[111.2, 23.29],
	"玉林":[110.09, 22.38],
	"宜州":[108.4, 24.28],
	"贵阳":[106.42, 26.35],
	"安顺":[105.55, 26.14],
	"毕节":[105.18, 27.18],
	"赤水":[105.42, 28.34],
	"都匀":[107.31, 26.15],
	"凯里":[107.58, 26.35],
	"六盘水":[104.5, 26.35],
	"清镇":[106.27, 26.33],
	"铜仁":[109.12, 27.43],
	"兴义":[104.53, 25.05],
	"遵义":[106.55, 27.42],
	"海口":[110.2, 20.02],
	"儋州":[109.34, 19.31],
	"琼海":[110.28, 19.14],
	"琼山":[110.21, 19.59],
	"三亚":[109.31, 18.14],
	"通什":[109.31, 18.46],
	"石家庄":[114.3, 38.02],
	"安国":[115.2, 38.24],
	"保定":[115.3, 38.51],
	"霸州":[116.24, 39.06],
	"泊头":[116.34, 38.04],
	"沧州":[116.52, 38.18],
	"承德":[117.57, 40.59],
	"定州":[115, 38.3],
	"丰南":[118.06, 39.34],
	"高碑店":[115.51, 39.2],
	"蒿城":[114.5, 38.02],
	"邯郸":[114.28, 36.36],
	"河间":[116.05, 38.26],
	"衡水":[115.42, 37.44],
	"黄骅":[117.21, 38.21],
	"晋州":[115.02, 38.02],
	"冀州":[115.33, 37.34],
	"廓坊":[116.42, 39.31],
	"鹿泉":[114.19, 38.04],
	"南宫":[115.23, 37.22],
	"秦皇岛":[119.35, 39.55],
	"任丘":[116.07, 38.42],
	"三河":[117.04, 39.58],
	"沙河":[114.3, 36.51],
	"深州":[115.32, 38.01],
	"唐山":[118.11, 39.36],
	"武安":[114.11, 36.42],
	"邢台":[114.3, 37.04],
	"辛集":[115.12, 37.54],
	"新乐":[114.41, 38.2],
	"张家口":[114.53, 40.48],
	"涿州":[115.59, 39.29],
	"遵化":[117.58, 40.11],
	"郑州":[113.40, 34.46],
	"安阳":[114.21, 36.06],
	"长葛":[113.47, 34.12],
	"登封":[113.02, 34.27],
	"邓州":[112.05, 32.42],
	"巩义":[112.58, 34.46],
	"鹤壁":[114.11, 35.54],
	"辉县":[113.47, 35.27],
	"焦作":[113.12, 35.14],
	"济源":[112.35, 35.04],
	"开封":[114.21, 34.47],
	"灵宝":[110.52, 34.31],
	"林州":[113.49, 36.03],
	"漯河":[114.02, 33.33],
	"洛阳":[112.27, 34.41],
	"南阳":[112.32, 33],
	"平顶山":[113.17, 33.44],
	"濮阳":[115.01, 35.44],
	"沁阳":[112.57, 35.05],
	"汝州":[112.5, 34.09],
	"三门峡":[111.12, 34.47],
	"商丘":[115.38, 34.26],
	"卫辉":[114.03, 35.24],
	"舞钢":[113.3, 33.17],
	"项城":[114.54, 33.26],
	"荥阳":[113.21, 34.46],
	"新密":[113.22, 34.31],
	"新乡":[113.52, 35.18],
	"信阳":[114.04, 32.07],
	"新郑":[113.43, 34.24],
	"许昌":[113.49, 34.01],
	"偃师":[112.47, 34.43],
	"义马":[111.55, 34.43],
	"禹州":[113.28, 34.09],
	"周口":[114.38, 33.37],
	"驻马店":[114.01, 32.58],
	"哈尔滨":[126.36, 45.44],
	"阿城":[126.58, 45.32],
	"安达":[125.18, 46.24],
	"北安":[126.31, 48.15],
	"大庆":[125.01, 46.36],
	"富锦":[132.02, 47.15],
	"海林":[129.21, 44.35],
	"海伦":[126.57, 47.28],
	"鹤岗":[130.16, 47.2],
	"黑河":[127.29, 50.14],
	"佳木斯":[130.22, 46.47],
	"鸡西":[130.57, 45.17],
	"密山":[131.5, 45.32],
	"牡丹江":[129.36, 44.35],
	"讷河":[124.51, 48.29],
	"宁安":[129.28, 44.21],
	"齐齐哈尔":[123.57, 47.2],
	"七台河":[130.49, 45.48],
	"双城":[126.15, 45.22],
	"尚志":[127.55, 45.14],
	"双鸭山":[131.11, 46.38],
	"绥芬河":[131.11, 44.25],
	"绥化":[126.59, 46.38],
	"铁力":[128.01, 46.59],
	"同江":[132.3, 47.39],
	"五常":[127.11, 44.55],
	"五大连池":[126.07, 48.38],
	"伊春":[128.56, 47.42],
	"肇东":[125.58, 46.04],
	"武汉":[114.17, 30.35],
	"安陆":[113.41, 31.15],
	"当阳":[111.47, 30.5],
	"丹江口":[108.3, 32.33],
	"大冶":[114.58, 30.06],
	"恩施":[109.29, 30.16],
	"鄂州":[114.52, 30.23],
	"广水":[113.48, 31.37],
	"洪湖":[113.27, 29.48],
	"黄石":[115.06, 30.12],
	"黄州":[114.52, 30.27],
	"荆门":[112.12, 31.02],
	"荆沙":[112.16, 30.18],
	"老河口":[111.4, 32.23],
	"利川":[108.56, 30.18],
	"麻城":[115.01, 31.1],
	"浦圻":[113.51, 29.42],
	"潜江":[112.53, 30.26],
	"石首":[112.24, 29.43],
	"十堰":[110.47, 32.4],
	"随州":[113.22, 31.42],
	"天门":[113.1, 30.28],
	"武穴":[115.33, 29.51],
	"襄阳":[112.08, 32.02],
	"咸宁":[114.17, 29.53],
	"仙桃":[113.27, 30.22],
	"孝感":[113.54, 30.56],
	"宜昌":[111.17, 30.42],
	"宜城":[112.15, 31.42],
	"应城":[113.33, 30.57],
	"枣阳":[112.44, 32.07],
	"枝城":[111.27, 30.23],
	"钟祥":[112.34, 31.1],
	"长沙":[112.59, 28.12],
	"常德":[111.51, 29.02],
	"郴州":[113.02, 25.46],
	"衡阳":[112.37, 26.53],
	"洪江":[109.59, 27.07],
	"怀化":[109.58, 27.33],
	"津市":[111.52, 29.38],
	"吉首":[109.43, 28.18],
	"耒阳":[112.51, 26.24],
	"冷水江":[111.26, 27.42],
	"冷水滩":[111.35, 26.26],
	"涟源":[111.41, 27.41],
	"醴陵":[113.3, 27.4],
	"临湘":[113.27, 29.29],
	"浏阳":[113.37, 28.09],
	"娄底":[111.59, 27.44],
	"汨罗":[113.03, 28.49],
	"韶山":[112.29, 27.54],
	"邵阳":[111.28, 27.14],
	"武冈":[110.37, 26.43],
	"湘潭":[112.53, 27.52],
	"湘乡":[112.31, 27.44],
	"益阳":[112.2, 28.36],
	"永州":[111.37, 26.13],
	"沅江":[112.22, 28.5],
	"岳阳":[113.06, 29.22],
	"张家界":[110.29, 29.08],
	"株洲":[113.09, 27.51],
	"资兴":[113.13, 25.58],
	"长春":[125.19, 43.54],
	"白城":[122.5, 45.38],
	"白山":[126.26, 41.56],
	"大安":[124.18, 45.3],
	"德惠":[125.42, 44.32],
	"敦化":[128.13, 43.22],
	"公主岭":[124.49, 43.31],
	"和龙":[129, 42.32],
	"桦甸":[126.44, 42.58],
	"珲春":[130.22, 42.52],
	"集安":[126.11, 41.08],
	"蛟河":[127.21, 43.42],
	"吉林":[126.33, 43.52],
	"九台":[125.51, 44.09],
	"辽源":[125.09, 42.54],
	"临江":[126.53, 41.49],
	"龙井":[129.26, 42.46],
	"梅河口":[125.4, 42.32],
	"舒兰":[126.57, 44.24],
	"四平":[124.22, 43.1],
	"松原":[124.49, 45.11],
	"洮南":[122.47, 45.2],
	"通化":[125.56, 41.43],
	"图们":[129.51, 42.57],
	"延吉":[129.3, 42.54],
	"愉树":[126.32, 44.49],
	"南京":[118.46, 32.03],
	"常熟":[120.43, 31.39],
	"常州":[119.58, 31.47],
	"丹阳":[119.32, 32],
	"东台":[120.19, 32.51],
	"高邮":[119.27, 32.47],
	"海门":[121.09, 31.53],
	"淮安":[119.09, 33.3],
	"淮阴":[119.02, 33.36],
	"江都":[119.32, 32.26],
	"姜堰":[120.08, 32.34],
	"江阴":[120.17, 31.54],
	"靖江":[120.17, 32.02],
	"金坛":[119.33, 31.46],
	"昆山":[120.57, 31.23],
	"连去港":[119.1, 34.36],
	"溧阳":[119.29, 31.26],
	"南通":[120.51, 32.01],
	"邳州":[117.59, 34.19],
	"启乐":[121.39, 31.48],
	"如皋":[120.33, 32.23],
	"宿迁":[118.18, 33.58],
	"苏州":[120.37, 31.19],
	"太仓":[121.06, 31.27],
	"泰兴":[120.01, 32.1],
	"泰州":[119.54, 32.3],
	"通州":[121.03, 32.05],
	"吴江":[120.39, 31.1],
	"无锡":[120.18, 31.34],
	"兴化":[119.5, 32.56],
	"新沂":[118.2, 34.22],
	"徐州":[117.11, 34.15],
	"盐在":[120.08, 33.22],
	"扬中":[119.49, 32.14],
	"扬州":[119.26, 32.23],
	"宜兴":[119.49, 31.21],
	"仪征":[119.1, 32.16],
	"张家港":[120.32, 31.52],
	"镇江":[119.27, 32.11],
	"南昌":[115.55, 28.4],
	"德兴":[117.35, 28.57],
	"丰城":[115.48, 28.12],
	"赣州":[114.56, 28.52],
	"高安":[115.22, 28.25],
	"吉安":[114.58, 27.07],
	"景德镇":[117.13, 29.17],
	"井冈山":[114.1, 26.34],
	"九江":[115.58, 29.43],
	"乐平":[117.08, 28.58],
	"临川":[116.21, 27.59],
	"萍乡":[113.5, 27.37],
	"瑞昌":[115.38, 29.4],
	"瑞金":[116.01, 25.53],
	"上饶":[117.58, 25.27],
	"新余":[114.56, 27.48],
	"宜春":[114.23, 27.47],
	"鹰潭":[117.03, 28.14],
	"樟树":[115.32, 28.03],
	"沈阳":[123.25, 41.48],
	"鞍山":[123, 41.07],
	"北票":[120.47, 41.48],
	"本溪":[123.46, 41.18],
	"朝阳":[120.27, 41.34],
	"大连":[121.36, 38.55],
	"丹东":[124.22, 40.08],
	"大石桥":[122.31, 40.37],
	"东港":[124.08, 39.53],
	"凤城":[124.02, 40.28],
	"抚顺":[123.54, 41.51],
	"阜新":[121.39, 42.01],
	"盖州":[122.21, 40.24],
	"海城":[122.43, 40.51],
	"葫芦岛":[120.51, 40.45],
	"锦州":[121.09, 41.07],
	"开原":[124.02, 42.32],
	"辽阳":[123.12, 41.16],
	"凌海":[121.21, 41.1],
	"凌源":[119.22, 41.14],
	"盘锦":[122.03, 41.07],
	"普兰店":[121.58, 39.23],
	"铁法":[123.32, 42.28],
	"铁岭":[123.51, 42.18],
	"瓦房店":[122, 39.37],
	"兴城":[120.41, 40.37],
	"新民":[122.49, 41.59],
	"营口":[122.13, 40.39],
	"庄河":[122.58, 39.41],
	"呼和浩特":[111.41, 40.48],
	"包头":[109.49, 40.39],
	"赤峰":[118.58, 42.17],
	"东胜":[109.59, 39.48],
	"二连浩特":[111.58, 43.38],
	"额尔古纳":[120.11, 50.13],
	"丰镇":[113.09, 40.27],
	"根河":[121.29, 50.48],
	"海拉尔":[119.39, 49.12],
	"霍林郭勒":[119.38, 45.32],
	"集宁":[113.06, 41.02],
	"临河":[107.22, 40.46],
	"满洲里":[117.23, 49.35],
	"通辽":[122.16, 43.37],
	"乌兰浩特":[122.03, 46.03],
	"乌海":[106.48, 39.4],
	"锡林浩特":[116.03, 43.57],
	"牙克石":[120.4, 49.17],
	"扎兰屯":[122.47, 48],
	"银川":[106.16, 38.27],
	"青铜峡":[105.59, 37.56],
	"石嘴山":[106.22, 39.02],
	"吴忠":[106.11, 37.59],
	"西宁":[101.48, 36.38],
	"德令哈":[97.23, 37.22],
	"格尔木":[94.55, 36.26],
	"济南":[117, 36.4],
	"安丘":[119.12, 36.25],
	"滨州":[118.02, 37.22],
	"昌邑":[119.24, 39.52],
	"德州":[116.17, 37.26],
	"东营":[118.3, 37.27],
	"肥城":[116.46, 36.14],
	"高密":[119.44, 36.22],
	"菏泽":[115.26, 35.14],
	"胶南":[119.58, 35.53],
	"胶州":[120, 36.17],
	"即墨":[120.28, 36.22],
	"济宁":[116.33, 35.23],
	"莱芜":[117.4, 36.12],
	"莱西":[120.31, 36.52],
	"莱阳":[120.42, 36.58],
	"莱州":[119.57, 37.1],
	"乐陵":[117.12, 37.44],
	"聊城":[115.57, 36.26],
	"临清":[115.42, 36.51],
	"临沂":[118.2, 35.03],
	"龙口":[120.21, 37.39],
	"蓬莱":[120.45, 37.48],
	"平度":[119.58, 36.47],
	"青岛":[120.18, 36.03],
	"青州":[118.28, 36.42],
	"曲阜":[116.58, 35.36],
	"日照":[119.32, 35.23],
	"荣成":[122.25, 37.1],
	"乳山":[121.31, 36.54],
	"寿光":[118.44, 36.53],
	"泰安":[117.08, 36.11],
	"滕州":[117.09, 35.06],
	"潍坊":[119.06, 36.43],
	"威海":[122.07, 37.31],
	"文登":[122.03, 37.12],
	"新泰":[117.45, 35.54],
	"烟台":[121.24, 37.32],
	"兖州":[116.49, 35.32],
	"禹城":[116.39, 36.56],
	"枣庄":[117.33, 34.52],
	"章丘":[117.32, 36.43],
	"招远":[120.23, 37.21],
	"诸城":[119.24, 35.59],
	"淄博":[118.03, 36.48],
	"邹城":[116.58, 35.24],
	"太原":[112.33, 37.54],
	"长治":[113.06, 36.11],
	"大同":[113.17, 40.06],
	"高平":[112.55, 35.48],
	"古交":[112.09, 37.54],
	"河津":[110.41, 35.35],
	"侯马":[111.21, 35.37],
	"霍州":[111.42, 36.34],
	"介休":[111.55, 37.02],
	"晋城":[112.51, 35.3],
	"临汾":[111.31, 36.05],
	"潞城":[113.14, 36.21],
	"朔州":[112.26, 39.19],
	"孝义":[111.48, 37.08],
	"忻州":[112.43, 38.24],
	"阳泉":[113.34, 37.51],
	"永济":[110.27, 34.52],
	"原平":[112.42, 38.43],
	"榆次":[112.43, 37.41],
	"运城":[110.59, 35.02],
	"西安":[108.57, 34.17],
	"安康":[109.01, 32.41],
	"宝鸡":[107.09, 34.22],
	"韩城":[110.27, 35.28],
	"汉中":[107.01, 33.04],
	"华阴":[110.05, 34.34],
	"商州":[109.57, 33.52],
	"铜川":[109.07, 35.06],
	"渭南":[109.3, 34.3],
	"咸阳":[108.43, 34.2],
	"兴平":[108.29, 34.18],
	"延安":[109.28, 36.35],
	"榆林":[109.47, 38.18],
	"上海":[121.29, 31.14],
	"成都":[104.04, 30.4],
	"巴中":[106.43, 31.51],
	"崇州":[103.4, 30.39],
	"达川":[107.29, 31.14],
	"德阳":[104.22, 31.09],
	"都江堰":[103.37, 31.01],
	"峨眉山":[103.29, 29.36],
	"涪陵":[107.22, 29.42],
	"广汉":[104.15, 30.58],
	"广元":[105.51, 32.28],
	"华蓥":[106.44, 30.26],
	"简阳":[104.32, 30.24],
	"江油":[104.42, 31.48],
	"阆中":[105.58, 31.36],
	"乐山":[103.44, 29.36],
	"泸州":[105.24, 28.54],
	"绵阳":[104.42, 31.3],
	"南充":[106.04, 30.49],
	"内江":[105.02, 29.36],
	"攀枝花":[101.43, 26.34],
	"彭州":[103.57, 30.59],
	"邛崃":[103.28, 30.26],
	"遂宁":[105.33, 30.31],
	"万县":[108.21, 30.5],
	"万源":[108.03, 32.03],
	"西昌":[102.16, 27.54],
	"雅安":[102.59, 29.59],
	"宜宾":[104.34, 28.47],
	"自贡":[104.46, 29.23],
	"资阳":[104.38, 30.09],
	"台北":[121.3, 25.03],
	"天津":[117.12, 39.02],
	"拉萨":[91.08, 29.39],
	"日喀则":[88.51, 29.16],
	"香港":[115.12, 21.23],
	"乌鲁木齐":[87.36, 43.45],
	"阿克苏":[80.19, 41.09],
	"阿勒泰":[88.12, 47.5],
	"阿图什":[76.08, 39.42],
	"博乐":[82.08, 44.57],
	"昌吉":[87.18, 44.02],
	"阜康":[87.58, 44.09],
	"哈密":[93.28, 42.5],
	"和田":[79.55, 37.09],
	"克拉玛依":[84.51, 45.36],
	"喀什":[75.59, 39.3],
	"库尔勒":[86.07, 41.46],
	"奎屯":[84.56, 44.27],
	"石河子":[86, 44.18],
	"塔城":[82.59, 46.46],
	"吐鲁番":[89.11, 42.54],
	"伊宁":[81.2, 43.55],
	"昆明":[102.42, 25.04],
	"保山":[99.1, 25.08],
	"楚雄":[101.32, 25.01],
	"大理":[100.13, 25.34],
	"东川":[103.12, 26.06],
	"个旧":[103.09, 23.21],
	"景洪":[100.48, 22.01],
	"开远":[103.13, 23.43],
	"曲靖":[103.48, 25.3],
	"瑞丽":[97.5, 24],
	"思茅":[100.58, 22.48],
	"畹町":[98.04, 24.06],
	"宣威":[104.06, 26.13],
	"玉溪":[102.32, 24.22],
	"昭通":[103.42, 27.2],
	"杭州":[120.1, 30.16],
	"慈溪":[121.15, 30.11],
	"东阳":[120.14, 29.16],
	"奉化":[121.24, 29.39],
	"富阳":[119.57, 30.03],
	"海宁":[120.42, 30.32],
	"湖州":[120.06, 30.52],
	"建德":[119.16, 29.29],
	"江山":[118.37, 28.45],
	"嘉兴":[120.45, 30.46],
	"金华":[119.39, 29.07],
	"兰溪":[119.28, 29.12],
	"临海":[121.08, 28.51],
	"丽水":[119.54, 28.27],
	"龙泉":[119.08, 28.04],
	"宁波":[121.33, 29.52],
	"平湖":[121.01, 30.42],
	"衢州":[118.52, 28.58],
	"瑞安":[120.38, 27.48],
	"上虞":[120.52, 30.01],
	"绍兴":[120.34, 30],
	"台州":[121.27, 28.41],
	"桐乡":[120.32, 30.38],
	"温岭":[121.21, 28.22],
	"温州":[120.39, 28.01],
	"萧山":[120.16, 30.09],
	"义乌":[120.04, 29.18],
	"乐清":[120.58, 28.08],
	"余杭":[120.18, 30.26],
	"余姚":[121.1, 30.02],
	"永康":[120.01, 29.54],
	"舟山":[122.06, 30.01],
	"诸暨":[120.14, 29.43],
	"重庆":[106.33, 29.35],
	"合川":[106.15, 30.02],
	"江津":[106.16, 29.18],
	"南川":[107.05, 29.1],
	"永川":[105.53, 29.23]
};