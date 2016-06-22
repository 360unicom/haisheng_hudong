define(function(require, exports, module) {
	var base = require('./base'); //所有全局配置信息

	/**
	 * 设置/取消活动关注
	 */
	function setActiveHeart() {
		if (!base.isLogin())
			return;
		var $activeHeart = $('#activeHeart');
		var $heartIcon = $activeHeart.find('.fa');
		var postData = {};
		if ($heartIcon.hasClass('fa-heart')) {
			postData = {
				"ATTENTION_ID": base.params.ATTENTION_ID,
				"IS_DELETE": 1
			};
		} else {
			postData = {
				"TV_SHOW_ID": base.params.TV_SHOW_ID,
				"RELEVANT_ID": base.params.ACTIVITY_ID,
				"MEMBER_ID": base.params.MEMBER_ID,
				"TYPE": 5,
				"PARENT": 0,
				"IS_DELETE": 0
			};
		}
        base.vModel.isHeartActive = postData.IS_DELETE ? "fa-heart-o" : "fa-heart";
		$.ajax({
			type: "post",
			url: base.getUrl("activity_attention"),
			data: postData,
			async: true,
			success: function(res) {
				base.params.ATTENTION_ID = res.ATTENTION_ID;
			}
		});
	}

	/**
	 * 评论点赞 
	 * @param {Object} $elm 点赞按钮父级元素
	 */
	function setCommentHeart($elm) {
		if (!base.isLogin())
			return;
		var $heartIcon = $elm.find('.item-after .fa');

		var postData = {
			"FORUM_ID": $elm.data('forumid')
		};
		if ($heartIcon.hasClass('fa-heart')) {
			postData["IS_DELETE"] = 1;
			postData["SUPPORT_ID"] = $heartIcon.data("supportid");
		} else {
			postData["TYPE"] = 3;
			postData["PARENT"] = 0;
			postData["IS_DELETE"] = 0;
			postData["MEMBER_ID"] = base.params.MEMBER_ID;
		}
        var heartNum = parseInt($heartIcon.html());
        if (postData["IS_DELETE"] == 0) {
            $heartIcon.removeClass('fa-heart-o').addClass('fa-heart');
            $heartIcon.html(isNaN(heartNum) ? $heartIcon.html() : ++heartNum);
        } else {
            $heartIcon.removeClass('fa-heart').addClass('fa-heart-o');
            $heartIcon.html(isNaN(heartNum) ? $heartIcon.html() : --heartNum);
        }
		$.ajax({
			type: "post",
			url: base.getUrl("comment_praise"),
			data: postData,
			async: true,
			success: function(res) {
				$('#tab1').one('click', '.item-after .fa', function() {
					setCommentHeart($(this).closest('.item-content'));
				});
				if (/eo?rror/i.test(res.status)) {
					res.msg ? $.toast(res.msg) : $.toast("参数错误");
					return;
				}
				res.SUPPORT_ID && $heartIcon.data("supportid", res.SUPPORT_ID);
			}
		});
	}

	module.exports = {
		"setActiveHeart": setActiveHeart,
		"setCommentHeart": setCommentHeart
	}
});