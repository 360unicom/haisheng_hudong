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
		base.vars.realtime = new AV.Realtime({
			appId: appId,
			appKey: appKey,
			pushOfflineMessages: true,
		});
		// 注册文件类型消息  
		base.vars.realtime.register(AV.FileMessage);

		// 注册需要用到的富媒体消息类型
		//	var ImageMessage = AV.ImageMessage;
		//	realtime.register([ImageMessage]);
		
		
		base.vars.realtime.on('disconnect', function() {
			console.log('网络连接已断开');
		});
		base.vars.realtime.on('schedule', function(attempt, delay) {
			console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
		});
		base.vars.realtime.on('retry', function(attempt) {
			console.log('正在进行第' + attempt + '次重连');
		});
		base.vars.realtime.on('reconnect', function() {
			console.log('网络连接已恢复');
		});
		
	}
	

	module.exports = {
		'init': init
	}
});