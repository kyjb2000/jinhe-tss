[Data Mining platform](http://waitwind.github.io/dms.html)
====================

[DM](http://waitwind.github.io/dms.html)是一个在它山石（TSS）基础平台上开发的数据管理平台，专注于高效开发数据报表，降低数据分析及分发的成本。DMS使得企业管理者能够快速、准确地获取各类重要业务数据。各类分析完备的数据能够为企业管理者在第一时间做出市场决策提供强有力支持和保障。

1、用于通用报表查询展示，这一点类似PL/SQL的网络版，只需写好SQL，即能进行查询、展示、导出，每个报表可单独指定数据源。

2、结合各种图表控件，丰富数据的展示方式，目前支持echarts、highCharts、D3等诸多大数据展示控件。

3、集合portal机制，对各类数据内容进行有效聚合，生成数据门户。

4、支持扩展自定义数据服务，方便引入各类算法对初级数据进行再加工。


DMS的核心的设计思想简单至极：怎么样把一个SQL快速变成报表？这想法源自我亲身经历，曾经我担负管理生产数据库的工作，业务人员经常会找我要一些数据以供他们拿去分析后做成报表再汇报给领导或分发到一线部门。每当这样的需求来时，我就得打开PL/SQL，登录到生产库，写查询SQL，查询并导出数据，然后邮件发送给业务人员。整个过程费时费力，<b>而且当最终的数据分析结果到达需要它的人手里时，很长的时间已经过去，在如今这风云变幻的市场面前，数据能为决策提供强有力支持，而缓慢繁琐的获取、分析过程极有可能延误最佳的决策良机，过多的人工参与也使得数据的准确性缺乏保障。</b>基于这些，我设计了DMS，期望它能做到以下功能：

- 在网页上输入SQL-->执行查询-->获取数据-->生成表格展示-->下载，使业务人员只要会写SQL就能自己开发所需报表
- 能便捷为每个报表定义查询条件
- 要支持多数据源
- 报表自身可以作为单独的数据服务，供第三方程序调用
- 要能控制访问权限，可授权给不同级别的人员使用。权限还要进一步分解成报表权限和数据权限
- 提供丰富的图表展示模板，让数据变的生动起来
- 支持定时机制，可以自动定时执行查询并导出数据，然后发给指定人员
- 用户能自己订阅感兴趣的数据
- 允许用户把自己查询到的数据（图表）分享给其它人，并可加以评论，形成数据门户加数据社区
- 最后还要有一些辅助功能，能统计每个报表的执行效率、访问情况等，能对数据进行缓存提升性能


 
var title;

window.onload = function() {
	var globalValiable = window.parent.globalValiable;
	if(globalValiable && globalValiable.data) {
		title = globalValiable.title;
		show(globalValiable.data);
		return;
	}
	
	// 运行到这里说明是页面单独打开的情况
	title = "报表XXX";
	serviceUrl = "../data/1.json";
	$.ajax({
		url : serviceUrl,
		method : "GET",
		type : "json",
		waiting : true,
		ondata : function() {
			var data = this.getResponseJSON();
			show(data);
		}
	});	  
}

function show(data) {	
	......
}


[
  {'label':'金额一','code':'money1','type':'number','nullable':'false','width':'90'},
  {'label':'金额二','code':'money2','type':'number','nullable':'true','width':'90'},
  {'label':'金额三','code':'money3','type':'number','width':'90'},
  {'label':'总金额','code':'_money','type':'number','width':'90'},
  {'label':'默认日期','type':'date','defaultValue':'today-0','code':'defaultDay'},
  {'label':'季节','code':'season','options':{'codes':'春|夏|秋|冬','names':'春|夏|秋|冬'},'onchange':'f1'},
  {'label':'月份','code':'month','type':'string','options':{'codes':' ','names':' '}},
  {'label':'自定义一','code':'udf1'},
  {'label':'自定义二','code':'udf2'},
  {'label':'自定义三','code':'udf3'},
  {'label':'自定义四','code':'udf4'},
  {'label':'自定义五','code':'udf5'},
  {'label':'自定义六','code':'udf6'}
]


calculateSum("_money", ["money1", "money2", "money3"]);
forbid("defaultDay");
forbid("udf6", 100);
onlyOne(["udf1", "udf2", "udf3"]);
function f1() {
    nextLevel("season", "month", {"春":"三月|四月|五月", "夏":"六月|七月|八月", "秋":"九月|十月|十一月", "冬":"十二月|一月|二月"});
}
  