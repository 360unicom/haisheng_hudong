define(function(require, exports, module) {
	var base = require('./base'); //所有全局配置信息
	var bindData = require('./bind_data'); //绑定数据
	var time = require('./date'); //时间格式转换
	var chatInit = require('./chitchat_init'); //聊天初始化
	
	// 请换成你自己的一个房间的 conversation id（这是服务器端生成的）
	//var roomId = '576a3213a341310064fa979a';
	// 每个客户端自定义的 id
	var clientId = 'highsheng';
	var msgTime;
	
	var client;
	var messageIterator;
	var common_messageIterator;
	var host_messageIterator;

	// 用来存储创建好的 roomObject
	var hostRoom;
	var commonRoom;

	// 监听是否服务器连接成功
	var firstFlag = false;

	// 用来标记历史消息获取状态
	var logFlag = false;
	var common_logFlag = false;
	var host_logFlag = false;

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
	function loginChat(id,roomId,is_power) {
		
		var realtime = base.vars.realtime;
		
		var map={
			'nick' : base.params.NICKNAME,
			'photo': base.params.PHOTO,
			'memeberName' : base.params.MEMBER_NAME
		};
		if (id) {
			clientId = id;
		}
//		if (!firstFlag) {
//			client.close();
//			showLog('服务器无法连接！');
//			return false;
//		}

		// 创建聊天客户端  
		realtime.createIMClient(clientId)
			.then(function(c) {
				//showLog('服务器连接成功！');
//				firstFlag = false;
				if(is_power == '0'){
					base.vars.common_flag = true;
				}else{
					base.vars.host_flag = true;
				}
				client = c;
				client.on('disconnect', function() {
					showLog('服务器正在重连，请耐心等待。。。');
				});
				client.on('unreadmessages', function unreadMessagesEventHandler(payload, conversation) {
    				console.log('收到未读消息: ', payload);
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
							id: base.params.ACTIVITY_ID,
							title : base.vars.activityTitle
						}
					}).then(function(conversation) {
						//showLog('创建新 Room 成功，id 是：', conversation.id);
						console.log(conversation.id);
						//roomId = conversation.id;
						createRoomId(conversation.id,is_power);
						return conversation;
					});
				}
			})
			.then(function(conversation) {
				conversation.count().then(function(count){
					console.log('在线人数：'+ count);
					//base.vModel.onlines = parseInt(base.vModel.onlines) + parseInt(count); 
				}).catch(console.error.bind(console));
				console.log('当前 Conversation 的成员列表：', conversation.members);
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
				if(is_power == '0'){
					commonRoom = conversation;
					common_messageIterator = commonRoom.createMessagesIterator({ limit: 30 });
					// 房间接受消息
					commonRoom.on('message', function(message) {
						if (!msgTime) {
							// 存储下最早的一个消息时间戳
							msgTime = message.timestamp;
						}
						sendCallBack(message,'0');
					});
				}else{
					hostRoom = conversation;
					host_messageIterator = hostRoom.createMessagesIterator({ limit: 30 });
					// 房间接受消息
					hostRoom.on('message', function(message) {
						if (!msgTime) {
							// 存储下最早的一个消息时间戳
							msgTime = message.timestamp;
						}
						sendCallBack(message,'1');
					});
				}
				
				getLog(is_power);
				
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
		var msg = new AV.TextMessage(resetCommentMSG(base.params.AT))
		.setAttributes({
		        	NICKNAME : base.params.NICKNAME,
					PHOTO : base.params.PHOTO,
					MEMBER_NAME : base.params.MEMBER_NAME,
					SIGN : base.params.SIGN,
					AT : base.vars.str_at
		});
		base.vars.curTab = $('.buttons-tab').find('.active').attr('data-tab-id');
		switch (base.vars.curTab) {
            case 'tab1':
            	commonRoom.send(msg)
				.then(function(message) {
					// 发送成功之后的回调
					$inputSend.val('');
					base.vModel.inputMsg = '';
					base.vars.str_at = '';
					sendCallBack(message,'0');
				});
                break;
            case 'tab3':
            	hostRoom.send(msg)
				.then(function(message) {
					// 发送成功之后的回调
					$inputSend.val('');
					base.vModel.inputMsg = '';
					base.vars.str_at = '';
					sendCallBack(message,'1');
				});
                break;
        }
		//隐藏/关闭指示器 modal
		$.hideIndicator();
		
	}
	
	$('.page').on('click', '.searchbar-cancel', function() {
		sendMsg();
	});
	
	//@好友
	$('#tab1').on('click', '.item-title h3', function() {
		var $wrap = $(this).closest('li');
		base.params.AT[$wrap.data('memberid')] = $(this).html();
		if(base.vars.str_at == ''){
			base.vars.str_at =$wrap.data('memberid');
		}else{
			base.vars.str_at +=","+$wrap.data('memberid');
		}
		base.vModel.inputMsg += " @" + $(this).html() + " ";
		$('#search').focus();
	});
	/**
     * 创建活动房间id
     */
    function createRoomId(id,is_power) {
        $.ajax({
            type: "post",
            url: base.getUrl("creatRoomId"),
            data: {
            	"LINK_ID": base.params.ACTIVITY_ID, //活动ID
                "CHAT_ID": id,
                "IS_POWER" : is_power
            },
            async: false,
            success: function (res) {
                
            }
        });
    }
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
                obj['MEMBER_ID'] = message.from;
                obj['FORUM_ID'] = message.id;
                if(message.cid == base.vModel.hostRoomId){
                	base.vModel.hosts.push(obj);
                }else{
                	base.vModel.comments.push(obj);
                }
                
            }
        }
    }
    
    /**
	 * 绑定
	 * @param {Object} res 发送聊天的返回数据
	 */
	function sendCallBack(res,index) {
		var data = {
			"COMMENTTIME": time.DateFormat2(res.timestamp, "yyyy/MM/dd hh:mm"),
			"CONTENT": res.text,
			"NICKNAME": res.attributes.NICKNAME ? res.attributes.NICKNAME : res.attributes.MEMBER_NAME,
			"PHOTO": res.attributes.PHOTO ? (/^http.*/.test(res.attributes.PHOTO) ? res.attributes.PHOTO : base.uri.host + res.attributes.PHOTO) : "./default.200x200.jpg",
			"SIGN" : res.attributes.SIGN,
			"MEMBER_ID" :res.from,
			"FORUM_ID" : res.id
		};
		if(index == '0'){
        	base.vModel.comments.unshift(data);
        }else{
        	base.vModel.hosts.unshift(data);
        }
        
        if(res.attributes.AT  != ""){
        	var str =  res.attributes.AT;
			var ids = str.split(',');
			$.each(ids, function(i,item) {
				if(item == base.params.MEMBER_ID){
					showMsgInfo(item,res)
					return false;
				}
			});
        }
        
	}
	
	/**
     * 消息提醒
     * @param {Object} message
     */
    function showMsgInfo(id,msg) {
        try {
                base.vMsgInfo.isShow = true;
                base.vMsgInfo.CONTENT = msg.text;
                base.vMsgInfo.MEMBER_ID = id;
                base.vMsgInfo.TITLE = "有人@您";
                //点击提醒跳转
                $('#msgInfo').one('click', 'em,span', function () {
                    var scrollTop = 40;
                    var $callMeElem = null;
                    $callMeElem = $('li[data-forumid="' + msg.id + '"]');
                    if (!!$callMeElem && $callMeElem.length) {
                        scrollTop = $callMeElem.offset().top;
                        $('.content').scrollTop(scrollTop);
                        $callMeElem.removeClass('warning').addClass('warning');
                    } else {
                        $('.content').scrollTop($('.content').height());
                    }
                    base.vMsgInfo.isShow = false;
                });
                //关闭提醒
                $('#msgInfo').one('click', '.fa', function () {
                    base.vMsgInfo.isShow = false;
                    return;
                });
            } catch (e) {
          	}
    }
	
	/**
	 * 加载消息
	 */
    function loadMsg(tab){
//  	messageIterator = room.createMessagesIterator({ limit: 50 });
		if(tab == 'tab1'){
			if(commonRoom){
				getLog('0');
			}else{
				return;
			}
		}else{
			if(hostRoom){
				getLog('1');
			}else{
				return;
			}
		}
		
		
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
	function getLog(is_power) {
		//var height = printWall.scrollHeight;
		if(is_power == '0'){
			if (common_logFlag) {
				return;
			} else {
				// 标记正在拉取
				common_logFlag = true;
			}
		}else{
			if (host_logFlag) {
				return;
			} else {
				// 标记正在拉取
				host_logFlag = true;
			}
		}
		
		if(is_power == '0'){
			messageIterator = common_messageIterator;
		}else{
			messageIterator = host_messageIterator;
		}
		messageIterator.next().then(function(result) {
			var data = result.value;
			console.log(data);
			if(data == ""){
				if(is_power == '0'){
					$('#tab1 .infinite-scroll-preloader').remove();
				}else{
					$('#tab3 .infinite-scroll-preloader').remove();
				}
				return;
			}
			host_logFlag = false;
			common_logFlag = false;
			// 存储下最早一条的消息时间戳
			var l = data.length;
			if (l) {
				msgTime = data[0].timestamp;
			}
			addItemsToTab1(data);
			
//			if (callback) {
//				callback();
//			}
			console.log(time.DateFormat2(msgTime, "yyyy/MM/dd hh:mm"));
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
		"loginChat" : loginChat,
		"loadMsg" : loadMsg
	};

});