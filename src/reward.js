define(function(require, exports, module) {
	var base = require("./base");

	/**
	 * 初始化仪表盘
	 * http://bernii.github.io/gauge.js/#?currval=1675&animationSpeed=32&angle=0&lineWidth=20&pointer.length=82&pointer.color=000000&pointer.strokeWidth=35&fontSize=31&colorStart=6FADCF&colorStop=8FC0DA&strokeColor=E0E0E0
	 */
	function init() {
		var opts = {
			lines: 12,
			angle: 0,
			lineWidth: 0.20,
			pointer: {
				length: 0.82,
				strokeWidth: 0.035,
				color: '#000000'
			},
			limitMax: 'false',
			colorStart: "#69ca8d",
			colorStop: "#69ca8d",
			strokeColor: '#ff7800',
			generateGradient: true
		};
		var $foo = $("#foo");
		base.vars.gauge = new Gauge($foo[0]).setOptions(opts);
		var fooW = $('.process-container').width();
		$foo.css({
			"width": fooW + "px",
			"height": (fooW / 2) + "px"
		});
		$foo.prev('.process-bg').css({
			"width": fooW + "px",
			"height": fooW + "px"
		});
		base.vars.gauge.animationSpeed = 32;
		base.vars.gauge.maxValue = 1000; //罗盘最大值
		base.vars.gauge.set(500); //设置罗盘当前值
	}

	/**
	 * 设置显示的百分比
	 * @param {Object} t 设置比分类型（1-赏；2-砸）
	 * @param {Object} s 分值
	 */
	function setProgress(t, s) {
		if (!base.isLogin())
			return;
		this.s = s;
		if (!s) this.s = base.vars.PROPS_SCORE;
		var progress = 50;
		switch (t) {
			case 1:
				base.vars.SUPPORT_VALUE += this.s;
				break;
			case 2:
				base.vars.OPPOSE_VALUE += this.s;
				break;
		}

		$.ajax({
			type: "post",
			url: base.getUrl("praise_or_fine"),
			data: {
				"ACTIVITY_ID": base.params.ACTIVITY_ID,
				"MEMBER_ID": base.params.MEMBER_ID,
				"PARENT": t,
				"MONEY_NUM": base.vars.PROPS_SCORE
			},
			async: true,
			success: function() {
				setProgressVal();
			}
		});
	}

	function setProgressVal() {
		var progress = base.vars.OPPOSE_VALUE / (base.vars.OPPOSE_VALUE + base.vars.SUPPORT_VALUE);
		base.vars.gauge.set(isNaN(progress) ? 0.5 * base.vars.gauge.maxValue : progress * base.vars.gauge.maxValue);
		base.vModel.downProcess = parseInt((base.vars.OPPOSE_VALUE / base.vars.TOTAL_VALUE) * 100) + "%";
		base.vModel.upProcess = parseInt((base.vars.SUPPORT_VALUE / base.vars.TOTAL_VALUE) * 100) + "%";
		if (base.vars.OPPOSE_VALUE >= base.vars.TOTAL_VALUE) {
			$.toast("鸡蛋已砸满,砸鸡蛋的各位各获得10积分");
			//location.reload();
		} else if (base.vars.SUPPORT_VALUE >= base.vars.TOTAL_VALUE) {
			$.toast("金币已赏满,赏金币的各位各获得10积分");
			//location.reload();
		}
	}

	function setBreak() {
		var $newHaojidan = $('<img src="./haojidan.png" class="jidan" />');
		var startOffset = $('.vote-down').offset();
		$newHaojidan.css({
			"position": "absolute",
			"top": startOffset.top + "px",
			"left": startOffset.left + "px",
			"width": "10px",
			"z-index": 9999980
		});
		$("body").append($newHaojidan);

		var t = Math.floor(Math.random() * ($('.banner-img').height() - 40) + 10); //top
		var l = Math.floor(Math.random() * ($('.banner-img').width() - 20) + 10); //left

		$newHaojidan.animate({
			"top": t + "px",
			"left": l + "px",
			"width": '40px',
			"opacity": 1,
			"rotateZ": '720deg'
		}, 500, 'ease', function() {
			$newHaojidan.attr("src", "./dantang.png");
			setTimeout(function() {
				$newHaojidan.remove();
			}, 10000);
		});
	}

	function setOblige() {
		var $newJinBi = $('<img src="./jinbi.png" class="jinbi" />');
		var startOffset = $('.vote-up').offset();
		$newJinBi.css({
			"position": "absolute",
			"top": startOffset.top,
			"left": startOffset.left + "px",
			"width": "30px",
			"z-index": 9999980
		});
		$("body").append($newJinBi);

		var t = Math.floor(Math.random() * $('.banner-img').height() + 10); //top
		var l = Math.floor(Math.random() * $('.banner-img').width() + 10); //left

		$newJinBi.animate({
			"top": t + "px",
			"left": l + "px",
			"rotateZ": '3000deg'
		}, "slow", "easy-out", function() {
			$newJinBi.remove();
		});
	}
	module.exports = {
		'init': init,
		'setBreak': setBreak,
		'setOblige': setOblige,
		'setProgress': setProgress,
		'setProgressVal': setProgressVal
	}
});