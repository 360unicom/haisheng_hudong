define(function(require, exports, module) {
	//http://m.sui.taobao.org/components
	//http://m.sui.taobao.org/demos/infinite-scroll
	//http://m.sui.taobao.org/assets/js/demos.js

	require("vue"); //--全局引用Vue.js
	var base = require('./base'); //所有全局配置信息
	var URL = require('./getQueryString'); //获取RUL参数
	var countdown = require('./countdown'); //倒计时
	var infinite = require('./infinite'); //上拉加载更多
	var bindData = require('./bind_data'); //绑定数据
	var setHeart = require('./set_heart'); //设置关注、点赞
	var comment = require('./comment'); //评论
	//var reward = require('./reward'); //打赏
	var pop = require('./popup'); //弹出层

	/*缓存公用方法*/
	var EventUtil = {
	    addHandler: function(element, type, handler) {
	        if (element.addEventListener) {
	            element.addEventListener(type, handler, false);
	        } else if (element.attachEvent) {
	            element.attachEvent("on" + type, handler);
	        } else {
	            element["on" + type] = handler;
	        }
	    }
	};
	EventUtil.addHandler(applicationCache, "updateready", function() { //缓存更新并已下载，要在下次进入页面生效
	    applicationCache.update();  	//检查缓存manifest文件是否更新，ps:页面加载默认检查一次。
	    applicationCache.swapCache();   //交换到新的缓存项中，交换了要下次进入页面才生效
	    location.reload();              //重新载入页面
	});

	$(function() {
		var ACTIVITY_ID = URL.getQueryString("ACTIVITY_ID");
		var MEMBER_ID = URL.getQueryString("MEMBER_ID");
		base.params.ACTIVITY_ID = ACTIVITY_ID;
		base.params.MEMBER_ID = MEMBER_ID;
		//设置手机类型
		if (base.browser.versions.android) {
			base.params.PHONE_TYPE = "android";
		} else if (base.browser.versions.iPhone) {
			base.params.PHONE_TYPE = "iPhone";
		} else if (base.browser.versions.iPad) {
			base.params.PHONE_TYPE = "iPad";
		} else {
			base.params.PHONE_TYPE = "other";
		}
		//页面初始化
		$(document).on("pageInit", ".page", function(e, id, page) {
			//初始化打赏
			//reward.init();

			//页面数据初始化
			bindData.initPageData();

			//上拉加载更多
			$(page).on('infinite', ".infinite-scroll", function() {
				infinite.set();
			});

			//下拉刷新列表
			$(page).on('refresh', '.pull-to-refresh-content', function(e) {
				bindData.getPageData(); //页面数据初始化
				setTimeout(function(){
					$.pullToRefreshDone('.pull-to-refresh-content'); //重置下拉刷新状态
				},1000);
			});

			//页面滚动
			$('.content').scroll(function() {
				$('.jidan, .jinbi').remove();

				//滚动顶部设置页签头固定
				var scrollTop = $(this).scrollTop();
				if ($('.tabs').offset().top < 40) {
					$('.buttons-tab').addClass('floating').appendTo("body");
					$('.tabs').css('margin-top', '40px');
				} else {
					$('.tv-info').after($('.buttons-tab').removeClass('floating'));
					$('.tabs').css('margin-top', '0');
				}
			});

			//活动关注
			$('#activeHeart').on('click', function() {
				setHeart.setActiveHeart();
			});

			//评论
			comment.init();

			//评论点赞
			$('#tab1').one('click', '.item-after .fa', function() {
				setHeart.setCommentHeart($(this).closest('.item-content'));
			});

			//扔鸡蛋
			//var voteDown = 11;
			//var voteDownInterval = null;
			//$('.vote').on('click', '.vote-down', function() {
			////if (voteDown <= 5) {
			////	$.toast("打赏不要扔的太频繁喽，休息会吧");
			////	return;
			////}
			//	voteDownInterval = null;
			//	voteDown = 0;
			//	voteDownInterval = setInterval(function() {
			//		voteDown++;
			//	}, 1000);
			//	clickVoteDown();
			//});

			//function clickVoteDown() {
			//	$('.content').scrollTop(0);
			//	base.vars.zhaAudio.play();
			//	reward.setBreak();
			//	reward.setProgress(2, base.vars.PROPS_SCORE);
			//}

			//赏金币
			//var voteUp = 11;
			//var voteUpInterval = null;
			//$('.vote').on('click', '.vote-up', function() {
			////if (voteUp <= 5) {
			////	$.toast("打赏不要扔的太频繁喽，休息会吧");
			////	return;
			////}
			//	voteUpInterval = null;
			//	voteUp = 0;
			//	voteUpInterval = setInterval(function() {
			//		voteDown++;
			//	}, 1000);
			//	clickVoteUp();
			//});

			//function clickVoteUp() {
			//	$('.content').scrollTop(0);
			//	base.vars.shangAudio.play();
			//	reward.setOblige();
			//	reward.setProgress(1, base.vars.PROPS_SCORE);
			//}

			//弹出同款弹窗
			$('#tab2').on('click', '.item-link', function() {
				try {
					var data = base.vModel.$get('goods')[parseInt($(this).data("index"))];
					base.goToDetail({
						"POP_TYPE": 2,
						"ID": data.SIMILAR_ID
					});
					//base.vPop.lastPoplayerID = '';
					//base.vPopTemp.POP_TYPE = 2;
					//base.vPopTemp.ID = data.SIMILAR_ID;
					//base.vPopTemp.PUBLISH_IMG = data.PUBLISH_IMG ? base.uri.host + data.PUBLISH_IMG : "./default.750x500.jpg";
					//base.vPopTemp.TITLE = data.TITLE;
					//base.vPopTemp.SUBJECT = data.SUBJECT;
					//base.vPopTemp.PRICE = data.IS_PROMOTE == '1' ? data.NEW_PRICE : data.OLD_PRICE;
					//base.vPopTemp.ABOUT = data.ABOUT;
					//base.vPopTemp.LINK_ADDRESS = data.LINK_ADDRESS;
					//base.vPopTemp.BTN_NOTE = "立即购买";
					//base.vPop.isPopup = false;
					//pop.out(2);
				} catch (e) {}
			});

			//关闭弹窗
			$('.pop>.content-block>.close').on('click', function() {
				pop.close();
			});

			//轮询更新数据
			bindData.autoData(); //进入页面先获取一遍弹窗信息
			window.autoRefreshDataInterval = window.setInterval(function() {
				bindData.autoData();
			}, 10000);

			//去详情页
			$('.page').on('click', '.on-top .article-detail', function() {
				base.goToDetail({
					"POP_TYPE": $(this).attr('data-type'),
					"ID": $(this).attr('id')
				});
			});

			////轮播图
			//$('.swiper-wrapper').on('click', '.swiper-slide', function() {
			//	var type = $(this).data('type');
			//	var link = $(this).data('link');
			//	switch (type) {
			//		case 1:
			//			window.location.href = 'http://123.57.172.249:8080/t2o/t2o/activity.html?ACTIVITY_ID=' + link + '&MEMBER_ID=' + base.params.MEMBER_ID;
			//			break;
			//		case 2:
			//			base.goToDetail({
			//				"POP_TYPE": 2,
			//				"ID": link
			//			});
			//			break;
			//		case 3:
			//			base.goToDetail({
			//				"POP_TYPE": 1,
			//				"ID": link
			//			});
			//			break;
			//		case 4:
			//			window.location.href = link;
			//			break;
			//		default:
			//			break;
			//	}
			//	return false;
			//});
		});

		//SUI初始化，必须放在pageInit后面
		$.init();
	});

});