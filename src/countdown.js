define(function(require, exports, module) {

	var base = require('./base');
	var pop = require('./popup');

	/**
	 * 设置倒计时补零
	 * @param {Object} i 时间刻度
	 */
	function checkTime(i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}

	/**
	 * 设置倒计时
	 * @param {Object} time 时间
	 */
	function setCountdown(time) {
		var times = (time + "").split(":");
		var nowDate = new Date();
		var endDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), parseInt(times[0]), parseInt(times[1]), parseInt(times[2]));
		if (times.length < 3) {
			$("#countdownTime").html("");
		} else {
			var nMS = endDate.getTime() - nowDate.getTime(); //计算剩余的毫秒数
			var nH = Math.floor(nMS / (1000 * 60 * 60)) % 24; //计算剩余的小时数
			var nM = Math.floor(nMS / (1000 * 60)) % 60; //计算剩余的分钟数
			var nS = Math.floor(nMS / 1000) % 60; //计算剩余的秒数
			nH = checkTime(nH);
			nM = checkTime(nM);
			nS = checkTime(nS);

			$("#countdownTime").html('<span class="h">' + nH + '</span>:<span class="m">' + nM + '</span>:<span class="s">' + nS + '</span>');

			//本轮倒计时结束
			//console.log('[剩余毫秒数]', nMS, nH + ":" + nM + ":" + nS);
			if ((nMS <= 0) || (nH == "00" && nM == "00" && nS == "00")) {
				if (base.vars.countdownTimeInterval) window.clearInterval(base.vars.countdownTimeInterval); //清除定时器
				base.vModel.countdownTitle = "暂无活动"; //清空活动标题
				base.vModel.countdownTime = ""; //清空倒计时
				$("#countdownTime").html("");
				//base.vPop.isPopup = false;
				pop.out(parseInt(base.vPopTemp.POP_TYPE), 1);
				base.vPop.END_TIME && close(base.vPop.END_TIME / 1000); //自动关闭弹窗
			}
		}
	}

	/**
	 * 倒计时 sec 秒后关闭
	 * @param {Integer} sec
	 */
	function close(sec) {
		setTimeout(function() {
			if (base.vPop.autoClose) {
				pop.close();
			}
		}, sec * 1000);
	}

	module.exports = {
		"set": setCountdown,
		"close": close
	};
});