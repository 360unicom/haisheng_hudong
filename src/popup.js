define(function(require, exports, module) {

	var base = require('./base'); //所有全局配置信息

	/**
	 * 弹窗分发
	 * @param {Int} type = [1|2|3|4|5|6] - 弹窗类型,1-资讯；2-同款；3-问卷；4-红包；5-外链；6-游戏
	 * @description
	 * 	typeData：类型1-节目;2-活动;3.1-资讯;3.2-同款;3.3-问卷;3.4-红包;3.5-抽奖;3.6:外链
	 */
	exports.out = function(type, isAddAcceptRecord) {
		//		if(base.vPop.isPopup){
		//			return
		//		}
		base.vars.msgAudio.play(); //播放音效
		//$('.pop').find('.control a').removeClass('article-detail');
		base.vPop.POP_TYPE = type;
		base.vPop.ID = base.vPopTemp.ID;
		var typeData;
		switch (type) {
			case 1:
				typeData = 3.1;
				base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
				base.vPop.TITLE = base.vPopTemp.TITLE;
				base.vPop.SUBJECT = base.vPopTemp.SUBJECT;
				base.vPop.ABOUT = base.vPopTemp.ABOUT;
				base.vPop.LINK_ADDRESS = base.vPopTemp.LINK_ADDRESS;
				base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
				base.vPop.showImg = base.vPopTemp.showImg;
				base.vPop.showSubject = base.vPopTemp.showSubject;
				base.vPop.showAbout = base.vPopTemp.showAbout;
				base.vPop.showAnswer = base.vPopTemp.showAnswer;
				break;
			case 2:
				typeData = 3.2;
				base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
				base.vPop.TITLE = base.vPopTemp.TITLE;
				base.vPop.SUBJECT = base.vPopTemp.SUBJECT;
				base.vPop.ABOUT = base.vPopTemp.ABOUT;
				base.vPop.LINK_ADDRESS = base.vPopTemp.LINK_ADDRESS;
				base.vPop.PRICE = base.vPopTemp.PRICE;
				base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
				base.vPop.showPrice = base.vPopTemp.showPrice;
				base.vPop.showImg = base.vPopTemp.showImg;
				base.vPop.showSubject = base.vPopTemp.showSubject;
				base.vPop.showAbout = base.vPopTemp.showAbout;
				base.vPop.showAnswer = base.vPopTemp.showAnswer;
				break;
			case 3:
				typeData = 3.3;
				//base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
				base.vPop.TITLE = base.vPopTemp.TITLE;
				//base.vPop.SUBJECT = base.vPopTemp.SUBJECT;
				base.vPop.$set('answers', base.vPopTemp.answers);
				base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
				base.vPop.showImg = base.vPopTemp.showImg;
				base.vPop.showSubject = base.vPopTemp.showSubject;
				base.vPop.showPrice = base.vPopTemp.showPrice;
				base.vPop.showAbout = base.vPopTemp.showAbout;
				base.vPop.showAnswer = base.vPopTemp.showAnswer;
				break;
			case 4:
				typeData = 3.4;
				base.vPop.RED_COUNT = base.vPopTemp.RED_COUNT;
				base.vPop.RED_PER_AMOUNT_MAX = base.vPopTemp.RED_PER_AMOUNT_MAX;
				base.vPop.RED_TOTAL_AMOUNT = base.vPopTemp.RED_TOTAL_AMOUNT;
				break;
			case 5:
				typeData = 3.6;
				base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
				base.vPop.ABOUT = base.vPopTemp.ABOUT;
				base.vPop.LINK_ADDRESS = base.vPopTemp.LINK_ADDRESS;
				base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
				base.vPop.showSubject = base.vPopTemp.showSubject;
				base.vPop.showPrice = base.vPopTemp.showPrice;
				base.vPop.showPrice = base.vPopTemp.showPrice;
				base.vPop.showImg = base.vPopTemp.showImg;
				base.vPop.showSubject = base.vPopTemp.showSubject;
				base.vPop.showAbout = base.vPopTemp.showAbout;
				base.vPop.showAnswer = base.vPopTemp.showAnswer;
				break;
			case 6:
				break;
			default:
				break;
		}

		$.popup('.pop'); //弹出
		//base.vPop.isPopup = true;

		isAddAcceptRecord && type != 3 && addAcceptRecord(typeData); //保存接收记录

		//点击跳转事件监听
		if (base.vPop.$get('POP_TYPE') == 1 || base.vPop.$get('POP_TYPE') == 2) { //资讯、同款
			var go = function() {
				base.goToDetail({
					"POP_TYPE": base.vPop.$get('POP_TYPE'),
					"ID": base.vPop.$get('ID')
				});
			};
			$('.pop').one('click', '.control a', function() {
				if (!base.isLogin()) {
					$('.pop').one('click', '.control a', function() {
						go();
					});
					return;
				}
				go();
			});
		} else if (base.vPop.$get('POP_TYPE') == 3) { //问卷
			$('.pop').one('click', '.control a', function() {
				submitAnswer();
			});
		} else if (base.vPop.$get('POP_TYPE') == 5) { //外链
			window.location.href = base.vPop.$get('LINK_ADDRESS');
			$('.pop').one('click', '.control a', function() {
				window.location.href = base.vPop.$get('LINK_ADDRESS');
			});
		}
	};

	/**
	 * 保存接收记录
	 * @param {Object} typeData 接收记录类型
	 */
	function addAcceptRecord(typeData) {
		$.ajax({
			type: 'post',
			url: base.getUrl("addAcceptRecord"),
			data: {
				"MEMBER_ID": base.params.MEMBER_ID,
				"RELATED_ID": base.vPop.ID,
				"TYPE": typeData
			},
			success: function(data) {
				if (data.state == "000000") {
					$.toast("已为您保存到接收记录");
					console.log("[leo]保存接受记录");
				} else {
					$.toast("接收记录保存失败");
					console.log("[leo]接受记录保存失败");
				}
			}
		});
	}

	/**
	 * 提交问卷答案
	 */
	function submitAnswer() {
		var answer = $('#pop .goods-info-content input[type=radio]:checked').val();
		if (!!!answer) {
			$.toast("请选择答案");
			$('.pop').one('click', '.control a', function() {
				submitAnswer();
			});
		} else {
			$.ajax({
				type: "post",
				url: base.getUrl("submitAnswer"),
				data: {
					"MEMBER_ID": base.params.MEMBER_ID,
					"QUESTION_ID": base.vPop.ID,
					"ANSWERS": answer
				},
				success: function(rs) {
					$.toast("提交成功");
					exports.close2();
				},
				error: function(e) {
					$.toast("提交失败");
				}
			});
		}
	}

	/**
	 * 关闭弹窗并还原数据
	 */
	exports.close = function(isAddAcceptRecord) {
		isAddAcceptRecord && base.vPop.POP_TYPE == 3 && addAcceptRecord(3.3);
		base.initCloseData();
	}
	exports.close2 = function() {
		base.initCloseData();
	}
});