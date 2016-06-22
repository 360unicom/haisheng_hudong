define(function(require, exports, module) {
	var base = require('./base'); //所有全局配置信息
	var bindData = require('./bind_data'); //绑定数据
	var time = require('./date'); //时间格式转换

	/**
	 * 绑定评论数据
	 * @param {Object} res 评论AJAX的返回数据
	 */
	function commentRes(res) {
		//bindData.getPageData();
		//base.vars.LASTDATE = time.DateFormat(res.CREATE_DATE, "yyyy-MM-dd hh:mm:ss");//设置最后更新时间
		var data = {
			"COMMENTTIME": time.DateFormat(res.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + res.PHONE_TYPE,
			"CONTENT": res.CONTENT,
			"CREATE_DATE": res.CREATE_DATE,
			"FORUM_ID": res.FORUM_ID,
			"MEMBER_ID": res.MEMBER_ID,
			"MEMBER_NAME": res.MEMBER_NAME,
			"NICKNAME": res.NICKNAME ? res.NICKNAME : res.MEMBER_NAME,
			"PARENT": res.PARENT,
			"PHONE_TYPE": res.PHONE_TYPE,
			"PHOTO": res.PHOTO ? (/^http.*/.test(res.PHOTO) ? res.PHOTO : base.uri.host + res.PHOTO) : "./default.200x200.jpg",
			"SIGN": res.SIGN,
			"SUPPORT": 0,
			"SUPPORT_ID": "",
			"TV_SHOW_ID": res.TV_SHOW_ID
		};
		if (res.PARENT != "0") {
			base.vModel.comments.forEach(function(item) {
				if (item.FORUM_ID == res.PARENT) {
					//item.childs.push(data);
					item.childs ? item.childs.push(data) : item.childs = [data];
				}
			});
		} else {
			data.childs = [];
			base.vModel.comments.unshift(data);
		}
		//隐藏/关闭指示器 modal
		$.hideIndicator();
		//重置评论框数据
		initCommentInfo();
		//重新绑定评论事件
		$('.page').one('click', '.searchbar-cancel', function() {
			sendComment();
		});
	}

	/**
	 * 发送评论数据
	 */
	function sendComment() {
		if (!base.isLogin())
			return;
		if (/^\s*$/.test(base.vModel.inputMsg)) {
			$.toast("您是不是忘记输入评论内容了");
			$('.page').one('click', '.searchbar-cancel', function() {
				sendComment();
			});
			return;
		}
		$.showIndicator(); //显示指示器 modal
		$.ajax({
			type: "post",
			url: base.getUrl("comment"),
			data: {
				"TYPE": base.params.COMMENT_TYPE,
				"PARENT": base.params.COMMENT_PARENT,
				"MEMBER_ID": base.params.MEMBER_ID,
				"PHONE_TYPE": base.params.PHONE_TYPE,
				"TV_SHOW_ID": base.params.ACTIVITY_ID,
				"TO": base.params.TO,
				"CONTENT": resetCommentMSG(base.params.AT),//base.vModel.inputMsg,//
				"AT": getAtList(base.params.AT)
			},
			async: true,
			success: function(res) {
				if (res.state != "000000") {
					$.toast(res.msg || "评论失败");
					return;
				}
				commentRes(res);
			}
		});
	}

	/**
	 *	重新组装评论内容
	 * @param {Object} json
	 */
	function resetCommentMSG(json) {
		$.each(json, function(key, value) {
			var reg = new RegExp("(@" + value + "\\s)", "gm");
			if(reg.test(base.vModel.inputMsg)){
				base.params.INPUTMSG = base.vModel.inputMsg.replace(reg, '<a href=\"javascript:void(0);\" data-type=\"at\" data-memberid=\"' + key + '\" class=\"external\">$1</a>');
			}else{
				delete base.params.AT[key];
			}
		});
		return Object.keys(json).length ? base.params.INPUTMSG : base.vModel.inputMsg;
	}

	/**
	 *	获取被@的列表字符串
	 * @param {Object} json
	 */
	function getAtList(json) {
		var ids = '';
		$.each(json, function(key, value) {
			ids += key;
		});
		return ids;
	}

	/**
	 * 初始化评论相关数据
	 */
	function initCommentInfo() {
		base.params.COMMENT_TYPE = 2;
		base.params.COMMENT_PARENT = 0;
		base.vModel.placeholderMsg = "";
		base.params.INPUTMSG = base.vModel.inputMsg = "";
		base.params.TO = "";
		base.params.AT = {};
	}

	var $search = $('#search');

	module.exports = {
		"init": function() {
			//绑定评论事件
			$('.page').one('click', '.searchbar-cancel', function() {
				sendComment();
			});

			//回复评论 - 设置回复人
			$('#tab1').on('click', '.item-after span', function() {
				var $wrapLi = $(this).closest('.item-content');
				var userName = $wrapLi.find('.item-title h3').html();
				base.params.COMMENT_TYPE = 0;
				base.params.COMMENT_PARENT = $wrapLi.data("forumid");
				base.params.TO = $wrapLi.data("memberid");
				base.vModel.placeholderMsg = "回复 " + userName + ":";
				$('#search').focus();
			});

			//@好友
			$('#tab1').on('click', '.item-title h3,.from', function() {
				var $wrap = $(this).closest('li');
				base.params.AT[$wrap.data('memberid')] = $(this).html();

				base.vModel.inputMsg += " @" + $(this).html() + " ";
				$search.focus();
			});

			//没有输入任何信息的，离开输入框清空关联的回复信息
			$search.on('blur', function() {
				if (/^\s*$/.test(base.vModel.inputMsg)) {
					initCommentInfo();
				}
			});
		}
	};

});