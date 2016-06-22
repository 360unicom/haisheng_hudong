define(function(require, exports, module) {

	var base = require('./base');
	var bindData = require('./bind_data');

	/**
	 * 上拉加载更多
	 */
	function infinite() {
		if (base.vars.loading) return; // 如果正在加载，则退出
		base.vars.loading = true; // 设置正在加载flag
		bindData.addItems();
	}

	exports.set = infinite;
});