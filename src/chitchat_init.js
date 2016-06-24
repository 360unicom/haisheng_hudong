define(function(require, exports, module) {
	var base = require('./base'); //所有全局配置信息

	// 请将 AppId 改为你自己的 AppId，否则无法本地测试
	var appId = 'EcnsnVe2CFok2Db0vAEzbIy0-gzGzoHsz';
	var appKey = 'RiQvfY4Jgeo4AtaEqqYSqBFg';

	//初始化聊天群
	function init() {
		// 初始化存储 SDK
		AV.initialize(appId, appKey);
		// 创建实时通信实例
		this.attr.realtime = new AV.Realtime({
			appId: appId,
			appKey: appKey,
		});
		// 注册文件类型消息  
		this.attr.realtime.register(AV.FileMessage);

		// 注册需要用到的富媒体消息类型
		//	var ImageMessage = AV.ImageMessage;
		//	realtime.register([ImageMessage]);
	}
	

	module.exports = {
		'attr': {
			'realtime' : ''
		},
		'init': init
	}
});