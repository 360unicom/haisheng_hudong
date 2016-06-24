define(function(require, exports, module) {
	var base = require('./base'); //所有全局配置信息
	var bindData = require('./bind_data'); //绑定数据
	var time = require('./date'); //时间格式转换
	var chatInit = require('./chitchat_init'); //聊天初始化
	
	// 请换成你自己的一个房间的 conversation id（这是服务器端生成的）
	var roomId = '576a3213a341310064fa979a';
	// 每个客户端自定义的 id
	var clientId = 'highsheng';
	
	var client;
	var messageIterator;

	// 用来存储创建好的 roomObject
	var room;

	// 监听是否服务器连接成功
	var firstFlag = true;

	// 用来标记历史消息获取状态
	var logFlag = false;

	//	var openBtn = document.getElementById('open-btn');
	//	var sendBtnAsFile = document.getElementById('send-btn-as-file');
	//	var sendBtn = document.getElementById('send-btn');
	//	var inputName = document.getElementById('input-name');
	//	var inputSend = document.getElementById('input-send');
	var printWall = $('.print-wall');
	
	var $inputSend = $('#comment');
	var $nav = $('#activePage nav');
	var $bar_con = $('.bar-tab~.content');

	//加入聊天群
	function loginChat(id) {
		
		var realtime = chatInit.attr.realtime;
		
		var map={
			'nick' : base.params.NICKNAME,
			'photo': base.params.PHOTO,
			'memeberName' : base.params.MEMBER_NAME
		};
		if (id) {
			clientId = id;
		}
		if (!firstFlag) {
			client.close();
			showLog('服务器无法连接！');
			return false;
		}

		// 创建聊天客户端  
		realtime.createIMClient(clientId)
			.then(function(c) {
				//showLog('服务器连接成功！');
				firstFlag = false;
				client = c;
				client.on('disconnect', function() {
					showLog('服务器正在重连，请耐心等待。。。');
				});
				// 获取对话
				return c.getConversation(roomId);
			})
			.then(function(conversation) {
				if (conversation) {
					return conversation;
				} else {
					// 如果服务器端不存在这个 conversation
					showLog('服务器不存在这个 conversation，创建一个。');
					return client.createConversation({
						name: 'LeanCloud-Conversation',
						members: [
							// 默认包含当前用户
							'Wallace'
						],
						// 创建暂态的聊天室（暂态聊天室支持无限人员聊天，但是不支持存储历史）
						// transient: true,
						// 默认的数据，可以放 conversation 属性等
						attributes: {
							test: 'demo2'
						}
					}).then(function(conversation) {
						//showLog('创建新 Room 成功，id 是：', conversation.id);
						console.log(conversation.id);
						roomId = conversation.id;
						return conversation;
					});
				}
			})
			.then(function(conversation) {
				//showLog('当前 Conversation 的成员列表：', conversation.members);
				if (conversation.members.length > 490) {
					return conversation.remove(conversation.members[30]).then(function(conversation) {
						showLog('人数过多，踢掉： ', conversation.members[30]);
						return conversation;
					});
				}
				return conversation;
			})
			.then(function(conversation) {
				return conversation.join();
			})			
			.then(function(conversation) {
				// 获取聊天历史
				room = conversation;
				messageIterator = conversation.createMessagesIterator({ limit: 50 });
				getLog();
				// 房间接受消息
				conversation.on('message', function(message) {
					if (!msgTime) {
						// 存储下最早的一个消息时间戳
						msgTime = message.timestamp;
					}
					sendCallBack(message);
				});
			})
			.catch(function(err) {
				console.error(err);
			})
	}
	
//	function formatTime(time) {
//		var date = new Date(time);
//		var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
//		var currentDate = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
//		var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
//		var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
//		var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
//		return date.getFullYear() + '-' + month + '-' + currentDate + ' ' + hh + ':' + mm + ':' + ss;
//	}

//	function bindEvent(dom, eventName, fun) {
//		if (window.addEventListener) {
//			dom.addEventListener(eventName, fun);
//		} else {
//			dom.attachEvent('on' + eventName, fun);
//		}
//	}
	
	/**
	 * 发送消息 
	 */
	function sendMsg() {
		if (!base.isLogin()) {
			return false;
		}
		var val = $inputSend.val();
	
		if (/^\s*$/.test(base.vModel.inputMsg)) {
			$.toast("您是不是忘记输入评论内容了");
			$('.page').one('click', '.searchbar-cancel', function() {
				sendMsg();
			});
			return;
		}
		$.showIndicator(); //显示指示器 modal
		// 向这个房间发送消息，这段代码是兼容多终端格式的，包括 iOS、Android、Window Phone
		var msg = new AV.TextMessage(val)
		.setAttributes({
		        	NICKNAME : base.params.NICKNAME,
					PHOTO : base.params.PHOTO,
					MEMBER_NAME : base.params.MEMBER_NAME
		});
		room.send(msg)
		.then(function(message) {
			// 发送成功之后的回调
			$inputSend.val('');
			sendCallBack(message);
		});
		//隐藏/关闭指示器 modal
		$.hideIndicator();
		
		//重新绑定评论事件
		$('.page').one('click', '.searchbar-cancel', function() {
			sendMsg();
		});
	}
	
	$('.page').one('click', '.searchbar-cancel', function() {
		sendMsg();
	});
	
	/**
     * 绑定评论列表
     * @param {Object} data 列表数据源
     */
    function addItemsToTab1(data) {
        if (data) {
        	var len = data.length;
            for (var i = len-1; i >= 0 ; i--) {
                var message = data[i];
                var obj = new Object;
                if(message.attributes != undefined){
                	obj = message.attributes;
                	obj.PHOTO = obj.PHOTO ? (/^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO) : "./default.200x200.jpg";
	                obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : (obj.MEMBER_NAME ? obj.MEMBER_NAME  : '游客');
	                obj.COMMENTTIME = time.DateFormat2(message.timestamp,"yyyy/MM/dd hh:mm") ;
                }else{
                	obj['PHOTO'] = "./default.200x200.jpg";
                	obj['NICKNAME'] = "游客";
                	obj['COMMENTTIME'] = time.DateFormat2(message.timestamp,"yyyy/MM/dd hh:mm");
                }
                obj['CONTENT'] = message.text;
                base.vModel.comments.push(obj);
            }
        }
    }
    
    /**
	 * 绑定
	 * @param {Object} res 发送聊天的返回数据
	 */
	function sendCallBack(res) {
		var data = {
			"COMMENTTIME": time.DateFormat2(res.timestamp, "yyyy/MM/dd hh:mm"),
			"CONTENT": res.text,
			"NICKNAME": res.attributes.NICKNAME ? res.attributes.NICKNAME : res.attributes.MEMBER_NAME,
			"PHOTO": res.attributes.PHOTO ? (/^http.*/.test(res.attributes.PHOTO) ? res.attributes.PHOTO : base.uri.host + res.attributes.PHOTO) : "./default.200x200.jpg",
		};
		base.vModel.comments.unshift(data);
		//重新绑定评论事件
		$('.page').one('click', '.searchbar-cancel', function() {
			sendMsg();
		});
	
	}
    
    
	// 显示接收到的信息
	function showMsg(message, isBefore) {
		var text = message.text;
		var from = message.from;
		if (message.from === clientId) {
			from = '自己';
		}
		if (message instanceof AV.TextMessage) {
			if (String(text).replace(/^\s+/, '').replace(/\s+$/, '')) {
				showLog('（' + formatTime(message.timestamp) + '）  ' + encodeHTML(from) + '： ', encodeHTML(message.text), isBefore);
			}
		} else if (message instanceof AV.FileMessage) {
			showLog('（' + formatTime(message.timestamp) + '）  ' + encodeHTML(from) + '： ', createLink(message.getFile().url()), isBefore);
		}
	}

	// 获取消息历史
	function getLog(callback) {
		var height = printWall.scrollHeight;
		if (logFlag) {
			return;
		} else {
			// 标记正在拉取
			logFlag = true;
		}
		messageIterator.next().then(function(result) {
			var data = result.value;
			console.log(data);
			logFlag = false;
			// 存储下最早一条的消息时间戳
			var l = data.length;
			if (l) {
				msgTime = data[0].timestamp;
			}
			addItemsToTab1(data);
			
			if (callback) {
				callback();
			}
		}).catch(function(err) {
			console.error(err);
		});
	}

	function b64EncodeUnicode(str) {
	    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
	        return String.fromCharCode('0x' + p1);
	    }));
	}
	
	function createLink(url) {
		return '<a target="_blank" href="' + encodeHTML(url) + '">' + encodeHTML(url) + '</a>';
	}
	
	// demo 中输出代码
	function showLog(msg, data, isBefore) {
		if (data) {
			// console.log(msg, data);
			msg = msg + '<span class="strong">' + data + '</span>';
		}
		var li = document.createElement('li');
		li.innerHTML = msg;
		if (isBefore) {
			printWall.prepend(li);
		} else {
			printWall.append(li);
		}
	}
	
	
	function encodeHTML(source) {
		return String(source)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\\/g, '&#92;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}
	
	

	
	module.exports = {
		"init": function() {
			$nav.css('display','none');
			$bar_con.css('bottom','0px');
		},
		"loginChat" : loginChat
	};

});