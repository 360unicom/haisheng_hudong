define(function (require, exports, module) {
    var base = require('./base'); //所有全局配置信息
    var countdown = require('./countdown'); //倒计时
    //var reward = require('./reward'); //打赏
    var time = require('./date'); //时间格式转换
    var chitchat = require('./chitchat'); //聊天初始化

    /**
     * 停止轮询
     */
    function stopAutoRefreshData() {
        window.clearInterval(window.autoRefreshDataInterval); //停止轮询
        base.vars.autoRefreshDataAjax.abort(); //停止轮询ajax
        //console.log("[leo]已停止轮询和ajax");
    }

    /**
     * 绑定普通用户评论
     * @param res 轮询请求的数据
     */
    function autoBindForum(res) {
        if (!!res.forum) {
            for (var i = res.forum.length - 1; i >= 0; i--) {
                var obj = res.forum[i];
                if (obj) {
                    obj.PHOTO = obj.PHOTO ? (/^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO) : "./default.200x200.jpg";
                    obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                    obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                    //base.vars.LASTDATE = time.DateFormat(obj.CREATE_DATE, "yyyy-MM-dd hh:mm:ss");//设置最后更新时间
                    //base.vModel.comments.$set(0, obj);
                    if (obj.PARENT != "0") {
                        base.vModel.comments.forEach(function (item) {
                            if (item.FORUM_ID == obj.PARENT) {
                                item.childs ? item.childs.push(obj) : item.childs = [obj];
                                //回复评论去重
                                for (var a = 0; a < item.childs.length; a++) {
                                    for (var b = a + 1; b < item.childs.length;) {
                                        if (item.childs[a].FORUM_ID == item.childs[b].FORUM_ID) {
                                            item.childs.splice(b, 1);
                                        }
                                        else b++;
                                        //console.log('[leo]childe=>', a, b);
                                    }
                                }
                            }
                        });
                    } else {
                        base.vModel.comments.unshift(obj);
                        //评论去重
                        for (var c = 0; c < base.vModel.comments.length; c++) {
                            for (var d = c + 1; d < base.vModel.comments.length;) {
                                if (base.vModel.comments[c].FORUM_ID == base.vModel.comments[d].FORUM_ID) {
                                    base.vModel.comments.splice(d, 1);
                                }
                                else d++;
                                //console.log('[leo]comments=>', c, d);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 绑定主持人评论列表
     * @param res 轮询接口数据
     */
    function autoBindHosts(res) {
        if (!!res.hosts) {
            for (var i = res.hosts.length - 1; i >= 0; i--) {
                var obj = res.hosts[i];
                if (obj) {
                    obj.PHOTO = obj.PHOTO ? (/^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO) : "./default.200x200.jpg";
                    obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                    obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                    base.vModel.hosts.unshift(obj);
                    //评论去重
                    for (var e = 0; e < base.vModel.hosts.length; e++) {
                        for (var f = e + 1; f < base.vModel.hosts.length;) {
                            if (base.vModel.hosts[e].FORUM_ID == base.vModel.hosts[f].FORUM_ID) {
                                base.vModel.hosts.splice(f, 1);
                            }
                            else f++;
                            //console.log('[leo]hosts hosts=>', e, f);
                        }
                    }
                }
            }
        }
    }

    /**
     * 轮询刷新数据
     */
    function autoRefreshData() {
        var data = {};
        data.ACTIVITY_ID = base.params.ACTIVITY_ID;
        data.MEMBER_ID = base.params.MEMBER_ID;
        data.ONLINE_ID = base.params.ONLINE_ID;

        //设置最后更新时间
        var now = new Date();
        !!base.vars.LASTDATE ? data.LASTDATE = base.vars.LASTDATE : data.LASTDATE = base.vars.LASTDATE = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

        base.vars.autoRefreshDataAjax = $.ajax({
            type: "get",
            url: base.getUrl("autoData"),
            data: data,
            async: true,
            success: function (res) {
                //设置最后更新时间
                base.vars.LASTDATE = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
                if (res.result && res.result == "idEmpty") {
                    $.toast("参数错误");
                    return;
                }

                /*//获取并设置打赏比分
                if (base.vars.SUPPORT_VALUE != res.value.SUPPORT_VALUE || base.vars.OPPOSE_VALUE != res.value.OPPOSE_VALUE) {
                	try {
                		if (base.vars.SUPPORT_VALUE < parseInt(res.value.SUPPORT_VALUE)) {
                			reward.setOblige();
                		}
                		if (base.vars.OPPOSE_VALUE < parseInt(res.value.OPPOSE_VALUE)) {
                			reward.setBreak();
                		}
                		base.vars.TOTAL_VALUE = res.value.TOTAL_VALUE;
                		base.vars.SUPPORT_VALUE = res.value.SUPPORT_VALUE;
                		base.vars.OPPOSE_VALUE = res.value.OPPOSE_VALUE;
                		reward.setProgressVal();
                	} catch (e) {}
                }*/

                autoBindForum(res);//获取并绑定普通用户最新评论
                autoBindHosts(res);//获取并绑定主持人评论

                //评论排序
//              base.vModel.comments.sort(function (a, b) {
//                  var d1 = new Date(a['CREATE_DATE'].replace(/\-/g, "\/"));
//                  var d2 = new Date(b['CREATE_DATE'].replace(/\-/g, "\/"));
//                  return d1 < d2 ? 1 : d1 == d2 ? 0 : -1;
//              });

                //设置倒计时弹窗数据绑定
                if (!!res.poplayer) {
                    operatePopData(res.poplayer);
                }

                //设置消息提醒
                if (!!res.message && !!res.message.length) {
                    showMsgInfo(res.message);
                }
            }
        });
    }

    /**
     * 保存弹出层数据到vue model
     * @param poplayer
     */
    function operatePopData(poplayer) {
        if (!!poplayer) {
            //已经弹出过
            if (base.vPop.lastPoplayerID == poplayer.POPLAYER_ID) {
                return;
            }
            base.vPop.isPopup = false;
            base.vPopTemp.POP_TYPE = parseInt(poplayer.POP_TYPE); //弹窗类型
            base.vPop.lastPoplayerID = poplayer.POPLAYER_ID; //弹窗ID
            base.vPop.IS_WHOLE = poplayer.IS_WHOLE; //是否全局
            poplayer.END_TIME && (base.vPop.END_TIME = ~~poplayer.END_TIME, base.vPop.autoClose = true); //弹窗持续时间

            //绑定不同类型的弹窗数据
            switch (base.vPopTemp.POP_TYPE) {
                case 1: //资讯
                    base.vPopTemp.ID = poplayer.article.ARTICLE_ID;
                    base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.article.PUBLISH_IMG;
                    base.vPopTemp.TITLE = poplayer.article.TITLE;
                    base.vPopTemp.SUBJECT = poplayer.article.SUBJECT;
                    base.vPopTemp.ABOUT = poplayer.article.ABOUT;
                    base.vPopTemp.LINK_ADDRESS = poplayer.article.LINK_ADDRESS;
                    base.vPopTemp.answers = '';
                    base.vPopTemp.BTN_NOTE = "查看详情";
                    base.vPopTemp.showImg = true;
                    base.vPopTemp.showSubject = true;
                    base.vPopTemp.showAbout = true;
                    base.vPopTemp.showAnswer = false;
                    break;
                case 2: //同款
                    base.vPopTemp.ID = poplayer.similar.SIMILAR_ID;
                    base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.similar.PUBLISH_IMG;
                    base.vPopTemp.TITLE = poplayer.similar.TITLE;
                    base.vPopTemp.SUBJECT = poplayer.similar.SUBJECT;
                    base.vPopTemp.ABOUT = poplayer.similar.ABOUT;
                    base.vPopTemp.LINK_ADDRESS = poplayer.similar.LINK_ADDRESS;
                    base.vPopTemp.PRICE = poplayer.similar.IS_PROMOTE == '1' ? poplayer.similar.NEW_PRICE : poplayer.similar.OLD_PRICE;
                    base.vPopTemp.BTN_NOTE = "立即购买";
                    base.vPopTemp.answers = '';
                    base.vPopTemp.showPrice = true;
                    base.vPopTemp.showImg = true;
                    base.vPopTemp.showSubject = true;
                    base.vPopTemp.showAbout = true;
                    base.vPopTemp.showAnswer = false;
                    break;
                case 3: //问卷
                    base.vPopTemp.ID = poplayer.question.QUESTIONNAIRE_ID;
                    //base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.question.IMG_PATH;
                    base.vPopTemp.TITLE = poplayer.question.QUESTION;
                    //base.vPopTemp.SUBJECT = poplayer.question.QUESTION;
                    base.vPopTemp.answers = poplayer.question.answers;
                    base.vPopTemp.BTN_NOTE = "提交";
                    base.vPopTemp.showImg = false;
                    base.vPopTemp.showSubject = false;
                    base.vPopTemp.showPrice = false;
                    base.vPopTemp.showAbout = false;
                    base.vPopTemp.showAnswer = true;
                    break;
                case 4: //红包
                    base.vPopTemp.ID = poplayer.POPLAYER_ID;
                    base.vPopTemp.RED_COUNT = poplayer.RED_COUNT;
                    base.vPopTemp.RED_PER_AMOUNT_MAX = poplayer.RED_PER_AMOUNT_MAX;
                    base.vPopTemp.RED_TOTAL_AMOUNT = poplayer.RED_TOTAL_AMOUNT;
                    base.vPopTemp.answers = '';
                    break;
                case 5: //外链
                    base.vPopTemp.ID = poplayer.POPLAYER_ID;
                    base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.LINK_IMG;
                    base.vPopTemp.ABOUT = poplayer.LINK_DESCRIPTION;
                    base.vPopTemp.LINK_ADDRESS = poplayer.LINK;
                    base.vPopTemp.BTN_NOTE = "查看详情";
                    base.vPopTemp.answers = '';
                    base.vPopTemp.showSubject = false;
                    base.vPopTemp.showPrice = false;
                    base.vPopTemp.showImg = true;
                    base.vPopTemp.showAbout = true;
                    base.vPopTemp.showAnswer = false;
                    break;
                case 6:
                    break;
                default:
                    break;
            }
            base.vModel.countdownTime = poplayer.TIME_POINT; //弹窗时间点
            base.vModel.countdownTitle = "下一个活动时间";
            //重置倒计时
            if (base.vars.countdownTimeInterval)
                window.clearInterval(base.vars.countdownTimeInterval);
            base.vars.countdownTimeInterval = setInterval(function () {
                countdown.set(poplayer.TIME_POINT);
            }, 1000);

        }
    }

    /**
     * 消息提醒
     * @param {Object} message
     */
    function showMsgInfo(message) {
        if (!!message && message.length) {
            try {
                base.vMsgInfo.isShow = true;
                base.vMsgInfo.ID = message[0].HS_MESSAGE_ID;
                base.vMsgInfo.TYPE = message[0].TYPE;
                base.vMsgInfo.SUB_TYPE = message[0].SUB_TYPE;
                base.vMsgInfo.LINK_ID = message[0].LINK_ID;
                base.vMsgInfo.SUB_LINK_ID = message[0].SUB_LINK_ID;
                base.vMsgInfo.CONTENT = message[0].CONTENT;
                base.vMsgInfo.MEMBER_ID = message[0].MEMBER_ID;
                if (message[0].TYPE == 0) {
                    base.vMsgInfo.TITLE = "系统消息";
                } else if (message[0].TYPE == 1 && message[0].SUB_TYPE == "reply") {
                    base.vMsgInfo.TITLE = "有人回复您";
                } else if (message[0].TYPE == 1 && message[0].SUB_TYPE == "at") {
                    base.vMsgInfo.TITLE = "有人@您";
                }
                //点击提醒跳转
                $('#msgInfo').one('click', 'em,span', function () {
                    var scrollTop = 40;
                    var $callMeElem = null;
                    if (!!base.vMsgInfo.SUB_LINK_ID) {
                        $callMeElem = $('li[data-forumid="' + base.vMsgInfo.SUB_LINK_ID + '"]');
                    } else {
                        $callMeElem = $('li[data-forumid="' + base.vMsgInfo.LINK_ID + '"]');
                    }
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
    }

    /**
     * 绑定同款列表
     * @param {Object} res 同款数据源
     */
    function addItemsToTab2(res) {
        if (!res.similar) {
            return;
        }
        for (var i = 0, len = res.similar.length; i < len; i++) {
            var obj = res.similar[i];
            obj.LIST_IMG = obj.LIST_IMG ? base.uri.host + obj.LIST_IMG : "./default.200x200.jpg";
            obj.NEW_PRICE = '￥' + obj.NEW_PRICE;
            obj.OLD_PRICE = '￥' + obj.OLD_PRICE;
            base.vModel.goods.push(obj);
        }
        for (var i = 0; i < base.vModel.goods.length; i++) {
            for (var j = i + 1; j < base.vModel.goods.length;) {
                if (base.vModel.goods[i].SIMILAR_ID == base.vModel.goods[j].SIMILAR_ID) {
                    base.vModel.goods.splice(j, 1);
                }
                else j++;
                //console.log('[leo]同款=>', i, j);
            }
        }
    }

    /**
     * 绑定评论列表
     * @param {Object} data 列表数据源
     */
    function addItemsToTab1(data) {
        if (data.forum) {
            data.forum.sort(function (a, b) {
                var d1 = new Date(a['CREATE_DATE'].replace(/\-/g, "\/"));
                var d2 = new Date(b['CREATE_DATE'].replace(/\-/g, "\/"));
                return d1 < d2 ? 1 : d1 == d2 ? 0 : -1;
            });
            for (var i = 0, len = data.forum.length; i < len; i++) {
                var obj = data.forum[i];
                obj.PHOTO = obj.PHOTO ? (/^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO) : "./default.200x200.jpg";
                obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                if (obj.childs) {
                    for (var c = 0, cLen = obj.childs.length; c < cLen; c++) {
                        obj.childs[c].PHOTO = obj.childs[c].PHOTO ? (/^http.*/.test(obj.childs[c].PHOTO) ? obj.childs[c].PHOTO : base.uri.host + obj.childs[c].PHOTO) : "./default.200x200.jpg";
                        obj.childs[c].NICKNAME = obj.childs[c].NICKNAME ? obj.childs[c].NICKNAME : obj.childs[c].MEMBER_NAME;
                        obj.childs[c].COMMENTTIME = time.DateFormat(obj.childs[c].CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.childs[c].PHONE_TYPE;
                        //base.vModel.replys.push(obj.childs[c]); //添加评论数据
                    }
                }
                base.vModel.comments.push(obj);
            }
        }
    }

    /**
     * 绑定主持、嘉宾评论列表
     * @param {Object} data 列表数据源
     */
    function addItemsToTab3(data) {
        //console.log("[leo]主持=>",data);
        if (data.forum) {
            data.forum.sort(function (a, b) {
                var d1 = new Date(a['CREATE_DATE'].replace(/\-/g, "\/"));
                var d2 = new Date(b['CREATE_DATE'].replace(/\-/g, "\/"));
                return d1 < d2 ? 1 : d1 == d2 ? 0 : -1;
            });
            for (var i = 0, len = data.forum.length; i < len; i++) {
                var obj = data.forum[i];
                obj.PHOTO = obj.PHOTO ? (/^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO) : "./default.200x200.jpg";
                obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                base.vModel.hosts.push(obj);
            }
        }
    }

    /**
     * 获取同款列表数据
     */
    function getTab2Items() {
        $.ajax({
            type: "post",
            url: base.getUrl("tong_kuan"),
            data: {
                "TV_SHOW_ID": base.params.TV_SHOW_ID,
                "showCount": base.params.showCount,
                "currentPage": ++base.params.currentPageGoods,
                "KEY": base.vModel.searchKey
            },
            async: true,
            success: function (res) {
                //参数错误
                if (res.status == "error") {
                    $.toast(res.msg);
                    return;
                }
                addItemsToTab2(res);
                //所有数据加载完成
                //[Leo] 加载完所有页的数据应该接口没有返回数据
                /*if (base.params.currentPageGoods >= res.TotalPage) {
                 base.params.currentPageGoods = res.TotalPage;
                 $.toast("没有更多同款啦");
                 // 加载完毕，则注销无限加载事件，以防不必要的加载
                 //$.detachInfiniteScroll($('.infinite-scroll'));
                 // 删除加载提示符
                 $('#tab2 .infinite-scroll-preloader').remove();
                 return;
                 }*/
                if (res.similar.length < parseInt(res.showCount)) {
                    //$.toast("没有更多同款啦");
                    base.params.currentPageGoods = res.TotalPage;
                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                    //$.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $('#tab2 .infinite-scroll-preloader').remove();
                    return;
                }

                base.vars.loading = false; // 重置加载flag
                $.refreshScroller(); //刷新列表滚动状态
                $.pullToRefreshDone('.pull-to-refresh-content'); //重置下拉刷新状态
            }
        });
    }

    /**
     * 获取评论列表
     */
    function getTab1Items() {
    	//登入
	    if (!base.isLogin()) {
			return false;
		}
		$.showIndicator(); //显示指示器 modal
    	if(base.params.MEMBER_NAME == '' && base.params.NICKNAME == '' && base.params.PHOTO == ''){
    		base.memberInfo();
    	}
    	chitchat.loginChat(base.params.MEMBER_ID);
    	$('#activePage nav').css('display','block');
		$('.bar-tab~.content').css('bottom','2.5rem');
		
    	//隐藏/关闭指示器 modal
		$.hideIndicator();
		
		
    	
//      $.ajax({
//          type: "get",
//          url: base.getUrl("ping_lun"),
//          data: {
//              "ACTIVITY_ID": base.params.ACTIVITY_ID,
//              "MEMBER_ID": base.params.MEMBER_ID,
//              "TYPE": 2,
//              "showCount": base.params.showCount,
//              "currentPage": ++base.params.currentPageComments
//          },
//          async: true,
//          success: function (res) {
//              //参数错误
//              if (res.status == "error") {
//                  $.toast(res.msg);
//                  return;
//              }
//              //article
//              if (res.article) {
//                  /*for (var i = 0, len = res.article.length; i < len; i++) {
//                   base.vModel.onTops.push(res.article[i]);
//                   }*/
//                  base.vModel.$set("onTops", res.article);
//              }
//              //所有数据加载完成
//              //[Leo] 加载完所有页的数据应该接口没有返回数据
//              if (base.params.currentPageComments > res.totalPage) {
//                  //$.toast("没有更多评论啦");
//                  // 加载完毕，则注销无限加载事件，以防不必要的加载
//                  //$.detachInfiniteScroll($('.infinite-scroll'));
//                  // 删除加载提示符
//                  $('#tab1 .infinite-scroll-preloader').remove();
//                  return;
//              }
//              //forum
//              addItemsToTab1(res);
//
//              base.vars.loading = false; // 重置加载flag
//              $.refreshScroller(); //刷新列表滚动状态
//              $.pullToRefreshDone('.pull-to-refresh-content'); //重置下拉刷新状态
//          }
//      });
    }

    /**
     * 获取主持、嘉宾评论列表
     */
    function getTab3Items() {
        //console.log("[leo]=>进入主持评论列表")
        $.ajax({
            type: "get",
            url: base.getUrl("hosts_forum"),
            data: {
                "ACTIVITY_ID": base.params.ACTIVITY_ID,
                "MEMBER_ID": base.params.MEMBER_ID,
                "TYPE": 2,
                "showCount": base.params.showCount,
                "currentPage": ++base.params.currentPageHosts
            },
            async: true,
            success: function (res) {
                //参数错误
                if (res.status == "error") {
                    $.toast(res.msg);
                    return;
                }
                //所有数据加载完成
                //[Leo] 加载完所有页的数据应该接口没有返回数据
                if (base.params.currentPageHosts > res.totalPage) {
                    //$.toast("没有更多评论啦");
                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                    //$.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $('#tab3 .infinite-scroll-preloader').remove();
                    return;
                }
                //forum
                addItemsToTab3(res);

                base.vars.loading = false; // 重置加载flag
                $.refreshScroller(); //刷新列表滚动状态
                $.pullToRefreshDone('.pull-to-refresh-content'); //重置下拉刷新状态
            }
        });
    }

    /**
     * 添加列表项
     */
    function addItems() {
        base.vars.curTab = $('.buttons-tab').find('.active').attr('data-tab-id');
        console.log('[leo]当前标签页=>',base.vars.curTab)
        switch (base.vars.curTab) {
            case 'tab1':
            	if(!base.isLogin()){
            		break;
            	}
                getTab1Items();
                break;
            case 'tab2':
                getTab2Items();
                break;
            case 'tab3':
            	if(!base.isLogin()){
            		break;
            	}
                getTab3Items();
                break;
        }
    }

    /**
     * 获取活动页基础数据
     */
    function getBaseData() {
        $.ajax({
            type: "get",
            url: base.getUrl("base_data"),
            data: {
                "ACTIVITY_ID": base.params.ACTIVITY_ID, //活动ID
                "MEMBER_ID": base.params.MEMBER_ID, //用户ID
                "PHONE_TYPE": base.params.PHONE_TYPE //手机类型
            },
            async: false,
            success: function (res) {
                if (res.result) {
                    switch (res.result) {
                        case "idEmpty":
                            $.toast("获取活动信息失败");
                            break;
                        case "mIdEmpty":
                            $.toast("获取用户信息失败");
                            break;
                    }
                    return;
                }
                setBaseData(res);
            }
        });
    }

    /**
     * 设置页面基础数据
     * @param {JSON} data 基础数据
     */
    function setBaseData(data) {
        try {
            $('body')
                .data('ACTIVITY_ID', data.ACTIVITY_ID) //活动ID
                .data('MEMBER_ID', data.MEMBER_ID) //用户ID
                .data('ATTENTION_ID', data.ATTENTION_ID) //有关注则有关注ID
                .data('TV_SHOW_ID', data.TV_SHOW_ID) //节目ID
                .data('END_TIME', data.END_TIME) //活动结束时间
            ;
            $('title').html(data.TITLE);

            base.vars.TOTAL_VALUE = data.TOTAL_VALUE;
            base.vars.OPPOSE_VALUE = data.OPPOSE_VALUE;
            base.vars.SUPPORT_VALUE = data.SUPPORT_VALUE;

            base.params.ATTENTION_ID = data.ATTENTION_ID;
            base.params.TV_SHOW_ID = data.TV_SHOW_ID;
            base.params.ONLINE_ID = data.ONLINE_ID;

            base.vModel.$set('publishImgs', []); //清空轮播图列表
            if (data.imgList) { //有轮播图数据
                for (var i = 0, len = data.imgList.length; i < len; i++) { //轮播图
                    base.vModel.publishImgs.push({
                        "FILE_PATH": data.imgList[i].MAKE_TYPE == 1 && base.uri.host + data.imgList[i].FILE_PATH, //轮播图路径
                        "TYPE": data.imgList[i].TYPE, //轮播图类型 1：活动2：同款3：资讯 4：外链
                        "LINK": data.imgList[i].LINK, //轮播图链接ID 后外链地址
                        "MAKE_TYPE": data.imgList[i].MAKE_TYPE //1:图片; 2:视频
                    });
                }
            } else { //没有轮播图数据则使用大的宣传图
                //base.vModel.publishImg = base.uri.host + data.PUBLISH_IMG;
                base.vModel.publishImgs.push({
                    "FILE_PATH": base.uri.host + data.PUBLISH_IMG, //轮播图路径
                    "TYPE": "", //轮播图类型 1：活动2：同款3：资讯 4：外链
                    "LINK": "", //轮播图链接ID 后外链地址
                    "MAKE_TYPE": 1
                });
            }
            Vue.nextTick(function () { //任务：轮播图渲染完成执行
                //$(".swiper-container").swiper({
                //	"autoplay": 3000,
                //	"loop": true,
                //	"lazyLoading" : true,
                //	"updateOnImagesReady" : true
                //});
                new Swiper('.my-swiper', {
                    //autoplay: 5000,
                    //autoplayDisableOnInteraction: false,
                    speed: 500,
                    loop: true,
                    lazyLoading: true,
                    updateOnImagesReady: true,
                    pagination: '.swiper-pagination',
                    prevButton: '.swiper-button-prev',
                    nextButton: '.swiper-button-next',
                    effect: 'cube',
                    cube: {
                        slideShadows: false,
                        shadow: false
                    }
                });
            });

            base.vModel.tvShowIcon = base.uri.host + data.TV_LOGO;
            //base.vModel.downProcess = parseInt((parseInt(data.OPPOSE_VALUE) / parseInt(data.TOTAL_VALUE)) * 100) + '%';
            //base.vModel.upProcess = parseInt((parseInt(data.SUPPORT_VALUE) / parseInt(data.TOTAL_VALUE)) * 100) + '%';
            //var progress = parseInt(data.OPPOSE_VALUE) / (parseInt(data.OPPOSE_VALUE) + parseInt(data.SUPPORT_VALUE));
            //base.vars.gauge.set(isNaN(progress) ? 0.5 * base.vars.gauge.maxValue : progress * base.vars.gauge.maxValue);
            base.vModel.tvShowName = data.TV_NAME;
            base.vModel.fans = data.fansCount;
            base.vModel.forums = data.forums;
            base.vModel.onlines = data.onlines;
            base.vModel.isHeartActive = data.ATTENTION_ID ? "fa-heart" : "fa-heart-o";
            if (/^javascript/.test(data.URI)) {
                base.vModel.gameURI = data.URI;
            } else {
                base.vModel.gameURI = data.URI == "" ? "" : data.URI + "?MEMBER_ID=" + data.MEMBER_ID + "&LINK_ID=" + data.ACTIVITY_ID;
            }
        } catch (e) {
        }
    }

    /**
     * 获取页面初始化数据
     */
    function getPageData(data) {
        //设置即将开始的活动名称、并开始倒计时
        //$('#countdownTime').prev('span').html("有奖问答即将开始");
        //重置评论列表
        base.params.currentPageComments = 0;
        base.vModel.$set('onTops', []);
        base.vModel.$set('comments', []);
        base.params.currentPageHosts = 0;
        base.vModel.$set('hosts', []);
        //base.vModel.$set('replys', []);
        //重置同款列表
        base.params.currentPageGoods = 0;
        base.vModel.$set('goods', []);
        //绑定数据
        //getBaseData();
        //getTab1Items();
        getTab2Items();
       // getTab3Items();
        $('#tab2').on('blur', '#search', function () {
            base.vModel.$set('goods', []);
            getTab2Items();
        });
        $('#tab2').on('keypress', '#search', function () {
            base.vModel.$set('goods', []);
            getTab2Items();
        });
    }

    /**
     * 初始化页面
     */
    function initPageData() {
        getBaseData();
        getPageData();
    }

    module.exports = {
        'autoData': autoRefreshData,
        'initPageData': initPageData,
        'getPageData': getPageData,
        'addItems': addItems,
        'stop': stopAutoRefreshData
    }
});