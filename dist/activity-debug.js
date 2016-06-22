/*! Leo  grunt @  2016-8-22 09:06:24 */
define("activity-debug", [ "vue-debug", "./base-debug", "./getQueryString-debug", "./countdown-debug", "./popup-debug", "./infinite-debug", "./bind_data-debug", "./date-debug", "./set_heart-debug", "./comment-debug" ], function(require, exports, module) {
    //http://m.sui.taobao.org/components
    //http://m.sui.taobao.org/demos/infinite-scroll
    //http://m.sui.taobao.org/assets/js/demos.js
    require("vue-debug");
    //--全局引用Vue.js
    var base = require("./base-debug");
    //所有全局配置信息
    var URL = require("./getQueryString-debug");
    //获取RUL参数
    var countdown = require("./countdown-debug");
    //倒计时
    var infinite = require("./infinite-debug");
    //上拉加载更多
    var bindData = require("./bind_data-debug");
    //绑定数据
    var setHeart = require("./set_heart-debug");
    //设置关注、点赞
    var comment = require("./comment-debug");
    //评论
    //var reward = require('./reward'); //打赏
    var pop = require("./popup-debug");
    //弹出层
    /*缓存公用方法*/
    var EventUtil = {
        addHandler: function(element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        }
    };
    EventUtil.addHandler(applicationCache, "updateready", function() {
        //缓存更新并已下载，要在下次进入页面生效
        applicationCache.update();
        //检查缓存manifest文件是否更新，ps:页面加载默认检查一次。
        applicationCache.swapCache();
        //交换到新的缓存项中，交换了要下次进入页面才生效
        location.reload();
    });
    $(function() {
        var ACTIVITY_ID = URL.getQueryString("ACTIVITY_ID");
        var MEMBER_ID = URL.getQueryString("MEMBER_ID");
        base.params.ACTIVITY_ID = ACTIVITY_ID;
        base.params.MEMBER_ID = MEMBER_ID;
        //设置手机类型
        if (base.browser.versions.android) {
            base.params.PHONE_TYPE = "android";
        } else if (base.browser.versions.iPhone) {
            base.params.PHONE_TYPE = "iPhone";
        } else if (base.browser.versions.iPad) {
            base.params.PHONE_TYPE = "iPad";
        } else {
            base.params.PHONE_TYPE = "other";
        }
        //页面初始化
        $(document).on("pageInit", ".page", function(e, id, page) {
            //初始化打赏
            //reward.init();
            //页面数据初始化
            bindData.initPageData();
            //上拉加载更多
            $(page).on("infinite", ".infinite-scroll", function() {
                infinite.set();
            });
            //下拉刷新列表
            $(page).on("refresh", ".pull-to-refresh-content", function(e) {
                bindData.getPageData();
                //页面数据初始化
                setTimeout(function() {
                    $.pullToRefreshDone(".pull-to-refresh-content");
                }, 1e3);
            });
            //页面滚动
            $(".content").scroll(function() {
                $(".jidan, .jinbi").remove();
                //滚动顶部设置页签头固定
                var scrollTop = $(this).scrollTop();
                if ($(".tabs").offset().top < 40) {
                    $(".buttons-tab").addClass("floating").appendTo("body");
                    $(".tabs").css("margin-top", "40px");
                } else {
                    $(".tv-info").after($(".buttons-tab").removeClass("floating"));
                    $(".tabs").css("margin-top", "0");
                }
            });
            //活动关注
            $("#activeHeart").on("click", function() {
                setHeart.setActiveHeart();
            });
            //评论
            comment.init();
            //评论点赞
            $("#tab1").one("click", ".item-after .fa", function() {
                setHeart.setCommentHeart($(this).closest(".item-content"));
            });
            //扔鸡蛋
            //var voteDown = 11;
            //var voteDownInterval = null;
            //$('.vote').on('click', '.vote-down', function() {
            ////if (voteDown <= 5) {
            ////	$.toast("打赏不要扔的太频繁喽，休息会吧");
            ////	return;
            ////}
            //	voteDownInterval = null;
            //	voteDown = 0;
            //	voteDownInterval = setInterval(function() {
            //		voteDown++;
            //	}, 1000);
            //	clickVoteDown();
            //});
            //function clickVoteDown() {
            //	$('.content').scrollTop(0);
            //	base.vars.zhaAudio.play();
            //	reward.setBreak();
            //	reward.setProgress(2, base.vars.PROPS_SCORE);
            //}
            //赏金币
            //var voteUp = 11;
            //var voteUpInterval = null;
            //$('.vote').on('click', '.vote-up', function() {
            ////if (voteUp <= 5) {
            ////	$.toast("打赏不要扔的太频繁喽，休息会吧");
            ////	return;
            ////}
            //	voteUpInterval = null;
            //	voteUp = 0;
            //	voteUpInterval = setInterval(function() {
            //		voteDown++;
            //	}, 1000);
            //	clickVoteUp();
            //});
            //function clickVoteUp() {
            //	$('.content').scrollTop(0);
            //	base.vars.shangAudio.play();
            //	reward.setOblige();
            //	reward.setProgress(1, base.vars.PROPS_SCORE);
            //}
            //弹出同款弹窗
            $("#tab2").on("click", ".item-link", function() {
                try {
                    var data = base.vModel.$get("goods")[parseInt($(this).data("index"))];
                    base.goToDetail({
                        POP_TYPE: 2,
                        ID: data.SIMILAR_ID
                    });
                } catch (e) {}
            });
            //关闭弹窗
            $(".pop>.content-block>.close").on("click", function() {
                pop.close();
            });
            //轮询更新数据
            bindData.autoData();
            //进入页面先获取一遍弹窗信息
            window.autoRefreshDataInterval = window.setInterval(function() {
                bindData.autoData();
            }, 1e4);
            //去详情页
            $(".page").on("click", ".on-top .article-detail", function() {
                base.goToDetail({
                    POP_TYPE: $(this).attr("data-type"),
                    ID: $(this).attr("id")
                });
            });
        });
        //SUI初始化，必须放在pageInit后面
        $.init();
    });
});

define("base-debug", [], function(require, exports, module) {
    module.exports = {
        uri: {
            base_data: "app/redis/activity/interaction",
            //基础数据，http://note.youdao.com/groupshare/?token=5D955D4B704E4C23B2C1BB9435F9D41F&gid=2801912
            ping_lun: "app/forum/listForumByActivity",
            //评论列表 资讯前三 分页,http://note.youdao.com/groupshare/?token=7FAAF61EE1D04032AE7E7256DF66F4D6&gid=2801912
            hosts_forum: "app/forum/hostsForum",
            //主持嘉宾评论列表
            tong_kuan: "app/similar/listByActivity",
            //同款,http://note.youdao.com/groupshare/?token=C99D85BA22424159B1F9FACA497DA4FF&gid=2801912
            is_support: "app/similar/is_support",
            //同款查询用户是否点赞,http://note.youdao.com/groupshare/?token=029409CC5D544BE9A617E3BF4178F557&gid=2801912
            autoData: "app/activity/activityData",
            //10秒自动获取数据,http://note.youdao.com/groupshare/?token=F9DB994E95154BDB8EE82FD957FB188D&gid=2801912
            comment: "app/forum/save",
            //发表、回复评论,http://note.youdao.com/groupshare/?token=06202BC14BA74099B24B09EACC15D5CA&gid=2801912
            activity_attention: "app/redis/activity/is_atten",
            //活动(取消)关注,http://note.youdao.com/groupshare/?token=372F4C10A0234DE6B968BCE0DB4C7369&gid=2801912
            comment_praise: "app/redis/forum/praiseForum",
            //评论(取消)点赞,http://note.youdao.com/groupshare/?token=F0FAB18D519445A983B357E27C786D81&gid=2801912
            praise_or_fine: "app/activity/PraiseOrFine",
            //活动 赏、砸,http://note.youdao.com/groupshare/?token=90F35CA3FF9D4D4C8CF9B155B2E775F1&gid=2801912
            submitAnswer: "app/questionnaire/submitAnswer",
            //提交问卷
            addAcceptRecord: "app/received_records/save",
            //保存接收记录
            //[Leo]修改接口Hosts
            //"host": "http://127.0.0.1:8080/t2o/"
            //"host": "http://192.168.0.125:8080/t2o/" //蒋丽坤
            //"host": "http://123.57.89.97:8080/t2o/" //测试服务器地址
            //"host": "http://123.57.172.249:8080/t2o/" //正式服务器地址
            host: "http://highsheng.com:8080/t2o/"
        },
        params: {
            ACTIVITY_ID: "",
            //活动ID
            MEMBER_ID: "",
            //用户ID
            ATTENTION_ID: "",
            //活动关注ID
            ONLINE_ID: "",
            //在线ID
            PHONE_TYPE: "iphone",
            //手机类型
            TV_SHOW_ID: "",
            //节目ID
            COMMENT_TYPE: 2,
            //评论类型
            COMMENT_PARENT: 0,
            //回复评论的ID，评论父级
            TO: "",
            //被回复人的ID
            AT: {},
            //被@人的ID
            INPUTMSG: "",
            //评论内容
            currentPageHosts: 0,
            //主持评论当前页
            currentPageComments: 0,
            //评论当前页
            currentPageGoods: 0,
            //同款当前页
            showCount: 10
        },
        vars: {
            $audios: $("#audios"),
            //音效
            msgAudio: $(".msg", this.$audios)[0],
            //消息音效
            shangAudio: $(".shang", this.$audios)[0],
            //砸鸡蛋音效
            zhaAudio: $(".zha", this.$audios)[0],
            //赏金币音效
            loading: false,
            //是否正在加载数据
            curTab: "tab1",
            //当前标签页
            autoRefreshDataAjax: null,
            //轮询Ajax
            countdownTimeInterval: null,
            //活动倒计时
            LASTDATE: "",
            //轮询的最后更新时间
            TOTAL_VALUE: 1e3,
            //打赏最高分
            OPPOSE_VALUE: 0,
            //打的总分
            SUPPORT_VALUE: 0,
            //赏的总分
            PROPS_SCORE: 10
        },
        initCloseData: function() {
            $.closeModal(".pop");
            this.vPop.IS_WHOLE = 0;
            this.vPop.POP_TYPE = 0;
            this.vPop.END_TIME = 0;
            this.vPop.ID = "";
            this.vPop.PUBLISH_IMG = "";
            this.vPop.TITLE = "";
            this.vPop.SUBJECT = "";
            this.vPop.PRICE = "";
            this.vPop.ABOUT = "";
            this.vPop.LINK_ADDRESS = "";
            this.vPop.BTN_NOTE = "查看详情";
            this.vPop.RED_TOTAL_AMOUNT = 0;
            this.vPop.RED_COUNT = 0;
            this.vPop.RED_PER_AMOUNT_MAX = 0;
            this.vPop.showImg = true;
            //弹窗图片显示
            this.vPop.showTitle = true;
            //弹窗标题
            this.vPop.showSubject = true;
            //弹窗主题显示
            this.vPop.showPrice = false;
            //弹窗价格
            this.vPop.showAbout = true;
            //弹窗简介
            this.vPop.showBtn = true;
            //弹窗按钮
            this.vPop.showAnswer = false;
            //问卷弹窗答案
            this.vPop.showRed = false;
            //红包
            this.vPop.autoClose = false;
            //是否自动关闭
            this.vPop.isPopup = false;
        },
        getUrl: function(uri_name) {
            //获取接口
            return this.uri.host + this.uri[uri_name];
        },
        goToDetail: function(params) {
            //进入详情页
            switch (parseInt(params.POP_TYPE)) {
              case 1:
                if (this.browser.versions.ios) {
                    window.location.href = this.uri.host + "tkorzx//:PushTongkuanOrZixun:/" + params.POP_TYPE + "/" + params.ID;
                } else {
                    //资讯
                    window.location.href = this.uri.host + "app/article/info?ARTICLE_ID=" + params.ID + "&MEMBER_ID=" + params.MEMBER_ID + "&PHONE_TYPE=" + params.PHONE_TYPE;
                }
                break;

              case 2:
                if (this.browser.versions.ios) {
                    window.location.href = this.uri.host + "tkorzx//:PushTongkuanOrZixun:/" + params.POP_TYPE + "/" + params.ID;
                } else {
                    //同款
                    window.location.href = this.uri.host + "app/similar/info?SIMILAR_ID=" + params.ID + "&MEMBER_ID=" + params.MEMBER_ID + "&PHONE_TYPE=" + params.PHONE_TYPE;
                }
                break;

              default:
                break;
            }
            this.initCloseData();
        },
        browser: {
            versions: function() {
                var u = navigator.userAgent, app = navigator.appVersion;
                return {
                    //移动终端浏览器版本信息
                    trident: u.indexOf("Trident") > -1,
                    //IE内核
                    presto: u.indexOf("Presto") > -1,
                    //opera内核
                    webKit: u.indexOf("AppleWebKit") > -1,
                    //苹果、谷歌内核
                    gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1,
                    //火狐内核
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/),
                    //是否为移动终端
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                    //ios终端
                    android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1,
                    //android终端或者uc浏览器
                    iPhone: u.indexOf("iPhone") > -1,
                    //是否为iPhone或者QQHD浏览器
                    iPad: u.indexOf("iPad") > -1,
                    //是否iPad
                    webApp: u.indexOf("Safari") == -1
                };
            }(),
            language: (navigator.browserLanguage || navigator.language).toLowerCase()
        },
        /**
         * 通过构建hash对象方式数组去重
         * @param {Object} arr
         * unique([ new String(1), new Number(1) ]);这种输入就无法判断
         */
        unique: function(arr) {
            //https://github.com/lifesinger/blog/issues/113
            var res = [];
            var hash = {};
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                var key = typeof item + item;
                if (!hash[key]) {
                    res.push(item);
                    hash[key] = 1;
                }
            }
            return res;
        },
        isLogin: function() {
            id = this.params.MEMBER_ID;
            if (id == "" || id == "(null)" || id == "null" || id == null || id == undefined) {
                if (this.browser.versions.ios) {
                    window.location.href = "Login://PushLogin/";
                } else {
                    Bridge.Login();
                }
                return false;
            }
            return true;
        },
        setMemberId: function(id) {
            //提供给APP调用登陆回调
            this.params.MEMBER_ID = id;
        },
        vModel: new Vue({
            el: "#activePage",
            data: {
                gameURI: "",
                //游戏外链
                countdownTitle: "暂无活动",
                //倒计时标题
                countdownTime: "",
                //倒计时时间
                //publishImg: "./default.750x500.jpg", //海报图
                publishImgs: [],
                //轮播海报图
                tvShowIcon: "./default.200x200.jpg",
                //节目Logo
                downProcess: "0%",
                //砸 百分比
                upProcess: "0%",
                //赏 百分比
                tvShowName: "",
                //节目名
                fans: "0",
                //粉丝数
                forums: "0",
                //评论数
                onlines: "0",
                //在线人数
                isHeartActive: "fa-heart-o",
                //是否关注互动
                placeholderMsg: "说两句吧",
                //输入框PlaceHolder
                inputMsg: "",
                //输入的评论信息
                onTops: [],
                //置顶
                comments: [],
                //评论
                hosts: [],
                //主持评论
                //replys: [], //回复
                searchKey: "",
                goods: []
            },
            // 在 `methods` 对象中定义方法
            methods: {
                openImgLink: function(event) {
                    var type = $("img", event.target).data("type");
                    var link = $("img", event.target).data("link");
                    switch (type) {
                      case "1":
                        window.location.href = "http://123.57.172.249:8080/t2o/t2o/activity.html?ACTIVITY_ID=" + link + "&MEMBER_ID=" + base.params.MEMBER_ID;
                        break;

                      case "2":
                        module.exports.goToDetail({
                            POP_TYPE: 2,
                            ID: link
                        });
                        break;

                      case "3":
                        module.exports.goToDetail({
                            POP_TYPE: 1,
                            ID: link
                        });
                        break;

                      case "4":
                        window.location.href = link;
                        break;

                      default:
                        break;
                    }
                    return false;
                }
            }
        }),
        vPopTemp: {
            showImg: true,
            //弹窗图片显示
            showTitle: true,
            //弹窗标题
            showSubject: true,
            //弹窗主题显示
            showPrice: false,
            //弹窗价格
            showAbout: true,
            //弹窗简介
            showBtn: true,
            //弹窗按钮
            showAnswer: false,
            //问卷弹窗答案
            showRed: false,
            //红包
            autoClose: false,
            //是否自动关闭
            isPopup: false,
            //是否已经弹出
            lastPoplayerID: null,
            //最后弹出的一个弹窗ID
            /**
             * 通用
             */
            IS_WHOLE: 0,
            //是否是全局 0;否 1：是
            POP_TYPE: 0,
            //弹出类型 1:资讯 2：同款  3：问卷  4：红包  5：外链 6：游戏
            END_TIME: 0,
            //弹窗持续时间
            ID: "",
            //弹窗对象的ID
            PUBLISH_IMG: "",
            //宣传图
            TITLE: "",
            //标题
            SUBJECT: "",
            //主题
            PRICE: "",
            //价钱
            ABOUT: "",
            //简介
            LINK_ADDRESS: "",
            //外链地址
            BTN_NOTE: "查看详情",
            //按钮文字
            /**
             * 红包
             */
            RED_TOTAL_AMOUNT: 0,
            //红包总金额
            RED_COUNT: 0,
            //红包份数
            RED_PER_AMOUNT_MAX: 0,
            //单个红包最大金额
            /**
             * 问卷
             */
            answers: []
        },
        vPop: new Vue({
            el: "#pop",
            data: {
                showImg: true,
                //弹窗图片显示
                showTitle: true,
                //弹窗标题
                showSubject: true,
                //弹窗主题显示
                showPrice: false,
                //弹窗价格
                showAbout: true,
                //弹窗简介
                showBtn: true,
                //弹窗按钮
                showAnswer: false,
                //问卷弹窗答案
                showRed: false,
                //红包
                autoClose: false,
                //是否自动关闭
                isPopup: false,
                //是否已经弹出
                lastPoplayerID: null,
                //最后弹出的一个弹窗ID
                /**
                 * 通用
                 */
                IS_WHOLE: 0,
                //是否是全局 0;否 1：是
                POP_TYPE: 0,
                //弹出类型 1:资讯 2：同款  3：问卷  4：红包  5：外链 6：游戏
                END_TIME: 0,
                //弹窗持续时间
                ID: "",
                //弹窗对象的ID
                PUBLISH_IMG: "",
                //宣传图
                TITLE: "",
                //标题
                SUBJECT: "",
                //主题
                PRICE: "",
                //价钱
                ABOUT: "",
                //简介
                LINK_ADDRESS: "",
                //外链地址
                BTN_NOTE: "查看详情",
                //按钮文字
                /**
                 * 红包
                 */
                RED_TOTAL_AMOUNT: 0,
                //红包总金额
                RED_COUNT: 0,
                //红包份数
                RED_PER_AMOUNT_MAX: 0,
                //单个红包最大金额
                /**
                 * 问卷
                 */
                answers: []
            }
        }),
        vMsgInfo: new Vue({
            el: "#msgInfo",
            data: {
                isShow: false,
                //show
                ID: "",
                TYPE: "",
                SUB_TYPE: "",
                LINK_ID: "",
                SUB_LINK_ID: "",
                CONTENT: "",
                MEMBER_ID: "",
                TITLE: "新消息"
            }
        })
    };
});

define("getQueryString-debug", [], function(require, exports, module) {
    module.exports = {
        // 或者通过 module.exports 提供整个接口
        getQueryString: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }
    };
});

define("countdown-debug", [ "base-debug", "popup-debug" ], function(require, exports, module) {
    var base = require("base-debug");
    var pop = require("popup-debug");
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
            var nMS = endDate.getTime() - nowDate.getTime();
            //计算剩余的毫秒数
            var nH = Math.floor(nMS / (1e3 * 60 * 60)) % 24;
            //计算剩余的小时数
            var nM = Math.floor(nMS / (1e3 * 60)) % 60;
            //计算剩余的分钟数
            var nS = Math.floor(nMS / 1e3) % 60;
            //计算剩余的秒数
            nH = checkTime(nH);
            nM = checkTime(nM);
            nS = checkTime(nS);
            $("#countdownTime").html('<span class="h">' + nH + '</span>:<span class="m">' + nM + '</span>:<span class="s">' + nS + "</span>");
            //本轮倒计时结束
            //console.log('[剩余毫秒数]', nMS, nH + ":" + nM + ":" + nS);
            if (nMS <= 0 || nH == "00" && nM == "00" && nS == "00") {
                if (base.vars.countdownTimeInterval) window.clearInterval(base.vars.countdownTimeInterval);
                //清除定时器
                base.vModel.countdownTitle = "暂无活动";
                //清空活动标题
                base.vModel.countdownTime = "";
                //清空倒计时
                $("#countdownTime").html("");
                //base.vPop.isPopup = false;
                pop.out(parseInt(base.vPopTemp.POP_TYPE), 1);
                base.vPop.END_TIME && close(base.vPop.END_TIME / 1e3);
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
        }, sec * 1e3);
    }
    module.exports = {
        set: setCountdown,
        close: close
    };
});

define("popup-debug", [ "base-debug" ], function(require, exports, module) {
    var base = require("base-debug");
    //所有全局配置信息
    /**
	 * 弹窗分发
	 * @param {Int} type = [1|2|3|4|5|6] - 弹窗类型,1-资讯；2-同款；3-问卷；4-红包；5-外链；6-游戏
	 * @description
	 * 	typeData：类型1-节目;2-活动;3.1-资讯;3.2-同款;3.3-问卷;3.4-红包;3.5-抽奖;3.6:外链
	 */
    exports.out = function(type, isAddAcceptRecord) {
        //		if(base.vPop.isPopup){
        //			return
        //		}
        base.vars.msgAudio.play();
        //播放音效
        //$('.pop').find('.control a').removeClass('article-detail');
        base.vPop.POP_TYPE = type;
        base.vPop.ID = base.vPopTemp.ID;
        var typeData;
        switch (type) {
          case 1:
            typeData = 3.1;
            base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
            base.vPop.TITLE = base.vPopTemp.TITLE;
            base.vPop.SUBJECT = base.vPopTemp.SUBJECT;
            base.vPop.ABOUT = base.vPopTemp.ABOUT;
            base.vPop.LINK_ADDRESS = base.vPopTemp.LINK_ADDRESS;
            base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
            base.vPop.showImg = base.vPopTemp.showImg;
            base.vPop.showSubject = base.vPopTemp.showSubject;
            base.vPop.showAbout = base.vPopTemp.showAbout;
            base.vPop.showAnswer = base.vPopTemp.showAnswer;
            break;

          case 2:
            typeData = 3.2;
            base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
            base.vPop.TITLE = base.vPopTemp.TITLE;
            base.vPop.SUBJECT = base.vPopTemp.SUBJECT;
            base.vPop.ABOUT = base.vPopTemp.ABOUT;
            base.vPop.LINK_ADDRESS = base.vPopTemp.LINK_ADDRESS;
            base.vPop.PRICE = base.vPopTemp.PRICE;
            base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
            base.vPop.showPrice = base.vPopTemp.showPrice;
            base.vPop.showImg = base.vPopTemp.showImg;
            base.vPop.showSubject = base.vPopTemp.showSubject;
            base.vPop.showAbout = base.vPopTemp.showAbout;
            base.vPop.showAnswer = base.vPopTemp.showAnswer;
            break;

          case 3:
            typeData = 3.3;
            //base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
            base.vPop.TITLE = base.vPopTemp.TITLE;
            //base.vPop.SUBJECT = base.vPopTemp.SUBJECT;
            base.vPop.$set("answers", base.vPopTemp.answers);
            base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
            base.vPop.showImg = base.vPopTemp.showImg;
            base.vPop.showSubject = base.vPopTemp.showSubject;
            base.vPop.showPrice = base.vPopTemp.showPrice;
            base.vPop.showAbout = base.vPopTemp.showAbout;
            base.vPop.showAnswer = base.vPopTemp.showAnswer;
            break;

          case 4:
            typeData = 3.4;
            base.vPop.RED_COUNT = base.vPopTemp.RED_COUNT;
            base.vPop.RED_PER_AMOUNT_MAX = base.vPopTemp.RED_PER_AMOUNT_MAX;
            base.vPop.RED_TOTAL_AMOUNT = base.vPopTemp.RED_TOTAL_AMOUNT;
            break;

          case 5:
            typeData = 3.6;
            base.vPop.PUBLISH_IMG = base.vPopTemp.PUBLISH_IMG;
            base.vPop.ABOUT = base.vPopTemp.ABOUT;
            base.vPop.LINK_ADDRESS = base.vPopTemp.LINK_ADDRESS;
            base.vPop.BTN_NOTE = base.vPopTemp.BTN_NOTE;
            base.vPop.showSubject = base.vPopTemp.showSubject;
            base.vPop.showPrice = base.vPopTemp.showPrice;
            base.vPop.showPrice = base.vPopTemp.showPrice;
            base.vPop.showImg = base.vPopTemp.showImg;
            base.vPop.showSubject = base.vPopTemp.showSubject;
            base.vPop.showAbout = base.vPopTemp.showAbout;
            base.vPop.showAnswer = base.vPopTemp.showAnswer;
            break;

          case 6:
            break;

          default:
            break;
        }
        $.popup(".pop");
        //弹出
        //base.vPop.isPopup = true;
        isAddAcceptRecord && type != 3 && addAcceptRecord(typeData);
        //保存接收记录
        //点击跳转事件监听
        if (base.vPop.$get("POP_TYPE") == 1 || base.vPop.$get("POP_TYPE") == 2) {
            //资讯、同款
            var go = function() {
                base.goToDetail({
                    POP_TYPE: base.vPop.$get("POP_TYPE"),
                    ID: base.vPop.$get("ID")
                });
            };
            $(".pop").one("click", ".control a", function() {
                if (!base.isLogin()) {
                    $(".pop").one("click", ".control a", function() {
                        go();
                    });
                    return;
                }
                go();
            });
        } else if (base.vPop.$get("POP_TYPE") == 3) {
            //问卷
            $(".pop").one("click", ".control a", function() {
                submitAnswer();
            });
        } else if (base.vPop.$get("POP_TYPE") == 5) {
            //外链
            window.location.href = base.vPop.$get("LINK_ADDRESS");
            $(".pop").one("click", ".control a", function() {
                window.location.href = base.vPop.$get("LINK_ADDRESS");
            });
        }
    };
    /**
	 * 保存接收记录
	 * @param {Object} typeData 接收记录类型
	 */
    function addAcceptRecord(typeData) {
        $.ajax({
            type: "post",
            url: base.getUrl("addAcceptRecord"),
            data: {
                MEMBER_ID: base.params.MEMBER_ID,
                RELATED_ID: base.vPop.ID,
                TYPE: typeData
            },
            success: function(data) {
                if (data.state == "000000") {
                    $.toast("已为您保存到接收记录");
                    console.log("[leo]保存接受记录");
                } else {
                    $.toast("接收记录保存失败");
                    console.log("[leo]接受记录保存失败");
                }
            }
        });
    }
    /**
	 * 提交问卷答案
	 */
    function submitAnswer() {
        var answer = $("#pop .goods-info-content input[type=radio]:checked").val();
        if (!!!answer) {
            $.toast("请选择答案");
            $(".pop").one("click", ".control a", function() {
                submitAnswer();
            });
        } else {
            $.ajax({
                type: "post",
                url: base.getUrl("submitAnswer"),
                data: {
                    MEMBER_ID: base.params.MEMBER_ID,
                    QUESTION_ID: base.vPop.ID,
                    ANSWERS: answer
                },
                success: function(rs) {
                    $.toast("提交成功");
                    exports.close2();
                },
                error: function(e) {
                    $.toast("提交失败");
                }
            });
        }
    }
    /**
	 * 关闭弹窗并还原数据
	 */
    exports.close = function(isAddAcceptRecord) {
        isAddAcceptRecord && base.vPop.POP_TYPE == 3 && addAcceptRecord(3.3);
        base.initCloseData();
    };
    exports.close2 = function() {
        base.initCloseData();
    };
});

define("infinite-debug", [ "base-debug", "bind_data-debug", "countdown-debug", "popup-debug", "date-debug" ], function(require, exports, module) {
    var base = require("base-debug");
    var bindData = require("bind_data-debug");
    /**
	 * 上拉加载更多
	 */
    function infinite() {
        if (base.vars.loading) return;
        // 如果正在加载，则退出
        base.vars.loading = true;
        // 设置正在加载flag
        bindData.addItems();
    }
    exports.set = infinite;
});

define("bind_data-debug", [ "base-debug", "countdown-debug", "popup-debug", "date-debug" ], function(require, exports, module) {
    var base = require("base-debug");
    //所有全局配置信息
    var countdown = require("countdown-debug");
    //倒计时
    //var reward = require('./reward'); //打赏
    var time = require("date-debug");
    //时间格式转换
    /**
     * 停止轮询
     */
    function stopAutoRefreshData() {
        window.clearInterval(window.autoRefreshDataInterval);
        //停止轮询
        base.vars.autoRefreshDataAjax.abort();
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
                    obj.PHOTO = obj.PHOTO ? /^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO : "./default.200x200.jpg";
                    obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                    obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                    //base.vars.LASTDATE = time.DateFormat(obj.CREATE_DATE, "yyyy-MM-dd hh:mm:ss");//设置最后更新时间
                    //base.vModel.comments.$set(0, obj);
                    if (obj.PARENT != "0") {
                        base.vModel.comments.forEach(function(item) {
                            if (item.FORUM_ID == obj.PARENT) {
                                item.childs ? item.childs.push(obj) : item.childs = [ obj ];
                                //回复评论去重
                                for (var a = 0; a < item.childs.length; a++) {
                                    for (var b = a + 1; b < item.childs.length; ) {
                                        if (item.childs[a].FORUM_ID == item.childs[b].FORUM_ID) {
                                            item.childs.splice(b, 1);
                                        } else b++;
                                    }
                                }
                            }
                        });
                    } else {
                        base.vModel.comments.unshift(obj);
                        //评论去重
                        for (var c = 0; c < base.vModel.comments.length; c++) {
                            for (var d = c + 1; d < base.vModel.comments.length; ) {
                                if (base.vModel.comments[c].FORUM_ID == base.vModel.comments[d].FORUM_ID) {
                                    base.vModel.comments.splice(d, 1);
                                } else d++;
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
                    obj.PHOTO = obj.PHOTO ? /^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO : "./default.200x200.jpg";
                    obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                    obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                    base.vModel.hosts.unshift(obj);
                    //评论去重
                    for (var e = 0; e < base.vModel.hosts.length; e++) {
                        for (var f = e + 1; f < base.vModel.hosts.length; ) {
                            if (base.vModel.hosts[e].FORUM_ID == base.vModel.hosts[f].FORUM_ID) {
                                base.vModel.hosts.splice(f, 1);
                            } else f++;
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
        !!base.vars.LASTDATE ? data.LASTDATE = base.vars.LASTDATE : data.LASTDATE = base.vars.LASTDATE = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        base.vars.autoRefreshDataAjax = $.ajax({
            type: "get",
            url: base.getUrl("autoData"),
            data: data,
            async: true,
            success: function(res) {
                //设置最后更新时间
                base.vars.LASTDATE = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
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
                autoBindForum(res);
                //获取并绑定普通用户最新评论
                autoBindHosts(res);
                //获取并绑定主持人评论
                //评论排序
                base.vModel.comments.sort(function(a, b) {
                    var d1 = new Date(a["CREATE_DATE"].replace(/\-/g, "/"));
                    var d2 = new Date(b["CREATE_DATE"].replace(/\-/g, "/"));
                    return d1 < d2 ? 1 : d1 == d2 ? 0 : -1;
                });
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
            base.vPopTemp.POP_TYPE = parseInt(poplayer.POP_TYPE);
            //弹窗类型
            base.vPop.lastPoplayerID = poplayer.POPLAYER_ID;
            //弹窗ID
            base.vPop.IS_WHOLE = poplayer.IS_WHOLE;
            //是否全局
            poplayer.END_TIME && (base.vPop.END_TIME = ~~poplayer.END_TIME, base.vPop.autoClose = true);
            //弹窗持续时间
            //绑定不同类型的弹窗数据
            switch (base.vPopTemp.POP_TYPE) {
              case 1:
                //资讯
                base.vPopTemp.ID = poplayer.article.ARTICLE_ID;
                base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.article.PUBLISH_IMG;
                base.vPopTemp.TITLE = poplayer.article.TITLE;
                base.vPopTemp.SUBJECT = poplayer.article.SUBJECT;
                base.vPopTemp.ABOUT = poplayer.article.ABOUT;
                base.vPopTemp.LINK_ADDRESS = poplayer.article.LINK_ADDRESS;
                base.vPopTemp.answers = "";
                base.vPopTemp.BTN_NOTE = "查看详情";
                base.vPopTemp.showImg = true;
                base.vPopTemp.showSubject = true;
                base.vPopTemp.showAbout = true;
                base.vPopTemp.showAnswer = false;
                break;

              case 2:
                //同款
                base.vPopTemp.ID = poplayer.similar.SIMILAR_ID;
                base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.similar.PUBLISH_IMG;
                base.vPopTemp.TITLE = poplayer.similar.TITLE;
                base.vPopTemp.SUBJECT = poplayer.similar.SUBJECT;
                base.vPopTemp.ABOUT = poplayer.similar.ABOUT;
                base.vPopTemp.LINK_ADDRESS = poplayer.similar.LINK_ADDRESS;
                base.vPopTemp.PRICE = poplayer.similar.IS_PROMOTE == "1" ? poplayer.similar.NEW_PRICE : poplayer.similar.OLD_PRICE;
                base.vPopTemp.BTN_NOTE = "立即购买";
                base.vPopTemp.answers = "";
                base.vPopTemp.showPrice = true;
                base.vPopTemp.showImg = true;
                base.vPopTemp.showSubject = true;
                base.vPopTemp.showAbout = true;
                base.vPopTemp.showAnswer = false;
                break;

              case 3:
                //问卷
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

              case 4:
                //红包
                base.vPopTemp.ID = poplayer.POPLAYER_ID;
                base.vPopTemp.RED_COUNT = poplayer.RED_COUNT;
                base.vPopTemp.RED_PER_AMOUNT_MAX = poplayer.RED_PER_AMOUNT_MAX;
                base.vPopTemp.RED_TOTAL_AMOUNT = poplayer.RED_TOTAL_AMOUNT;
                base.vPopTemp.answers = "";
                break;

              case 5:
                //外链
                base.vPopTemp.ID = poplayer.POPLAYER_ID;
                base.vPopTemp.PUBLISH_IMG = base.uri.host + poplayer.LINK_IMG;
                base.vPopTemp.ABOUT = poplayer.LINK_DESCRIPTION;
                base.vPopTemp.LINK_ADDRESS = poplayer.LINK;
                base.vPopTemp.BTN_NOTE = "查看详情";
                base.vPopTemp.answers = "";
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
            base.vModel.countdownTime = poplayer.TIME_POINT;
            //弹窗时间点
            base.vModel.countdownTitle = "下一个活动时间";
            //重置倒计时
            if (base.vars.countdownTimeInterval) window.clearInterval(base.vars.countdownTimeInterval);
            base.vars.countdownTimeInterval = setInterval(function() {
                countdown.set(poplayer.TIME_POINT);
            }, 1e3);
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
                $("#msgInfo").one("click", "em,span", function() {
                    var scrollTop = 40;
                    var $callMeElem = null;
                    if (!!base.vMsgInfo.SUB_LINK_ID) {
                        $callMeElem = $('li[data-forumid="' + base.vMsgInfo.SUB_LINK_ID + '"]');
                    } else {
                        $callMeElem = $('li[data-forumid="' + base.vMsgInfo.LINK_ID + '"]');
                    }
                    if (!!$callMeElem && $callMeElem.length) {
                        scrollTop = $callMeElem.offset().top;
                        $(".content").scrollTop(scrollTop);
                        $callMeElem.removeClass("warning").addClass("warning");
                    } else {
                        $(".content").scrollTop($(".content").height());
                    }
                    base.vMsgInfo.isShow = false;
                });
                //关闭提醒
                $("#msgInfo").one("click", ".fa", function() {
                    base.vMsgInfo.isShow = false;
                    return;
                });
            } catch (e) {}
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
            obj.NEW_PRICE = "￥" + obj.NEW_PRICE;
            obj.OLD_PRICE = "￥" + obj.OLD_PRICE;
            base.vModel.goods.push(obj);
        }
        for (var i = 0; i < base.vModel.goods.length; i++) {
            for (var j = i + 1; j < base.vModel.goods.length; ) {
                if (base.vModel.goods[i].SIMILAR_ID == base.vModel.goods[j].SIMILAR_ID) {
                    base.vModel.goods.splice(j, 1);
                } else j++;
            }
        }
    }
    /**
     * 绑定评论列表
     * @param {Object} data 列表数据源
     */
    function addItemsToTab1(data) {
        if (data.forum) {
            data.forum.sort(function(a, b) {
                var d1 = new Date(a["CREATE_DATE"].replace(/\-/g, "/"));
                var d2 = new Date(b["CREATE_DATE"].replace(/\-/g, "/"));
                return d1 < d2 ? 1 : d1 == d2 ? 0 : -1;
            });
            for (var i = 0, len = data.forum.length; i < len; i++) {
                var obj = data.forum[i];
                obj.PHOTO = obj.PHOTO ? /^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO : "./default.200x200.jpg";
                obj.NICKNAME = obj.NICKNAME ? obj.NICKNAME : obj.MEMBER_NAME;
                obj.COMMENTTIME = time.DateFormat(obj.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.PHONE_TYPE;
                if (obj.childs) {
                    for (var c = 0, cLen = obj.childs.length; c < cLen; c++) {
                        obj.childs[c].PHOTO = obj.childs[c].PHOTO ? /^http.*/.test(obj.childs[c].PHOTO) ? obj.childs[c].PHOTO : base.uri.host + obj.childs[c].PHOTO : "./default.200x200.jpg";
                        obj.childs[c].NICKNAME = obj.childs[c].NICKNAME ? obj.childs[c].NICKNAME : obj.childs[c].MEMBER_NAME;
                        obj.childs[c].COMMENTTIME = time.DateFormat(obj.childs[c].CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + obj.childs[c].PHONE_TYPE;
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
            data.forum.sort(function(a, b) {
                var d1 = new Date(a["CREATE_DATE"].replace(/\-/g, "/"));
                var d2 = new Date(b["CREATE_DATE"].replace(/\-/g, "/"));
                return d1 < d2 ? 1 : d1 == d2 ? 0 : -1;
            });
            for (var i = 0, len = data.forum.length; i < len; i++) {
                var obj = data.forum[i];
                obj.PHOTO = obj.PHOTO ? /^http.*/.test(obj.PHOTO) ? obj.PHOTO : base.uri.host + obj.PHOTO : "./default.200x200.jpg";
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
                TV_SHOW_ID: base.params.TV_SHOW_ID,
                showCount: base.params.showCount,
                currentPage: ++base.params.currentPageGoods,
                KEY: base.vModel.searchKey
            },
            async: true,
            success: function(res) {
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
                    $("#tab2 .infinite-scroll-preloader").remove();
                    return;
                }
                base.vars.loading = false;
                // 重置加载flag
                $.refreshScroller();
                //刷新列表滚动状态
                $.pullToRefreshDone(".pull-to-refresh-content");
            }
        });
    }
    /**
     * 获取评论列表
     */
    function getTab1Items() {
        $.ajax({
            type: "get",
            url: base.getUrl("ping_lun"),
            data: {
                ACTIVITY_ID: base.params.ACTIVITY_ID,
                MEMBER_ID: base.params.MEMBER_ID,
                TYPE: 2,
                showCount: base.params.showCount,
                currentPage: ++base.params.currentPageComments
            },
            async: true,
            success: function(res) {
                //参数错误
                if (res.status == "error") {
                    $.toast(res.msg);
                    return;
                }
                //article
                if (res.article) {
                    /*for (var i = 0, len = res.article.length; i < len; i++) {
                     base.vModel.onTops.push(res.article[i]);
                     }*/
                    base.vModel.$set("onTops", res.article);
                }
                //所有数据加载完成
                //[Leo] 加载完所有页的数据应该接口没有返回数据
                if (base.params.currentPageComments > res.totalPage) {
                    //$.toast("没有更多评论啦");
                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                    //$.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $("#tab1 .infinite-scroll-preloader").remove();
                    return;
                }
                //forum
                addItemsToTab1(res);
                base.vars.loading = false;
                // 重置加载flag
                $.refreshScroller();
                //刷新列表滚动状态
                $.pullToRefreshDone(".pull-to-refresh-content");
            }
        });
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
                ACTIVITY_ID: base.params.ACTIVITY_ID,
                MEMBER_ID: base.params.MEMBER_ID,
                TYPE: 2,
                showCount: base.params.showCount,
                currentPage: ++base.params.currentPageHosts
            },
            async: true,
            success: function(res) {
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
                    $("#tab3 .infinite-scroll-preloader").remove();
                    return;
                }
                //forum
                addItemsToTab3(res);
                base.vars.loading = false;
                // 重置加载flag
                $.refreshScroller();
                //刷新列表滚动状态
                $.pullToRefreshDone(".pull-to-refresh-content");
            }
        });
    }
    /**
     * 添加、刷新列表项
     */
    function addItems() {
        base.vars.curTab = $(".buttons-tab").find(".active").attr("data-tab-id");
        console.log("[leo]当前标签页=>", base.vars.curTab);
        switch (base.vars.curTab) {
          case "tab1":
            getTab1Items();
            break;

          case "tab2":
            getTab2Items();
            break;

          case "tab3":
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
                ACTIVITY_ID: base.params.ACTIVITY_ID,
                //活动ID
                MEMBER_ID: base.params.MEMBER_ID,
                //用户ID
                PHONE_TYPE: base.params.PHONE_TYPE
            },
            async: false,
            success: function(res) {
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
            $("body").data("ACTIVITY_ID", data.ACTIVITY_ID).data("MEMBER_ID", data.MEMBER_ID).data("ATTENTION_ID", data.ATTENTION_ID).data("TV_SHOW_ID", data.TV_SHOW_ID).data("END_TIME", data.END_TIME);
            $("title").html(data.TITLE);
            base.vars.TOTAL_VALUE = data.TOTAL_VALUE;
            base.vars.OPPOSE_VALUE = data.OPPOSE_VALUE;
            base.vars.SUPPORT_VALUE = data.SUPPORT_VALUE;
            base.params.ATTENTION_ID = data.ATTENTION_ID;
            base.params.TV_SHOW_ID = data.TV_SHOW_ID;
            base.params.ONLINE_ID = data.ONLINE_ID;
            base.vModel.$set("publishImgs", []);
            //清空轮播图列表
            if (data.imgList) {
                //有轮播图数据
                for (var i = 0, len = data.imgList.length; i < len; i++) {
                    //轮播图
                    base.vModel.publishImgs.push({
                        FILE_PATH: data.imgList[i].MAKE_TYPE == 1 && base.uri.host + data.imgList[i].FILE_PATH,
                        //轮播图路径
                        TYPE: data.imgList[i].TYPE,
                        //轮播图类型 1：活动2：同款3：资讯 4：外链
                        LINK: data.imgList[i].LINK,
                        //轮播图链接ID 后外链地址
                        MAKE_TYPE: data.imgList[i].MAKE_TYPE
                    });
                }
            } else {
                //没有轮播图数据则使用大的宣传图
                //base.vModel.publishImg = base.uri.host + data.PUBLISH_IMG;
                base.vModel.publishImgs.push({
                    FILE_PATH: base.uri.host + data.PUBLISH_IMG,
                    //轮播图路径
                    TYPE: "",
                    //轮播图类型 1：活动2：同款3：资讯 4：外链
                    LINK: "",
                    //轮播图链接ID 后外链地址
                    MAKE_TYPE: 1
                });
            }
            Vue.nextTick(function() {
                //任务：轮播图渲染完成执行
                //$(".swiper-container").swiper({
                //	"autoplay": 3000,
                //	"loop": true,
                //	"lazyLoading" : true,
                //	"updateOnImagesReady" : true
                //});
                new Swiper(".my-swiper", {
                    //autoplay: 5000,
                    //autoplayDisableOnInteraction: false,
                    speed: 500,
                    loop: true,
                    lazyLoading: true,
                    updateOnImagesReady: true,
                    pagination: ".swiper-pagination",
                    prevButton: ".swiper-button-prev",
                    nextButton: ".swiper-button-next",
                    effect: "cube",
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
        } catch (e) {}
    }
    /**
     * 获取页面初始化数据
     */
    function getPageData(data) {
        //设置即将开始的活动名称、并开始倒计时
        //$('#countdownTime').prev('span').html("有奖问答即将开始");
        //重置评论列表
        base.params.currentPageComments = 0;
        base.vModel.$set("onTops", []);
        base.vModel.$set("comments", []);
        base.params.currentPageHosts = 0;
        base.vModel.$set("hosts", []);
        //base.vModel.$set('replys', []);
        //重置同款列表
        base.params.currentPageGoods = 0;
        base.vModel.$set("goods", []);
        //绑定数据
        //getBaseData();
        getTab1Items();
        getTab2Items();
        getTab3Items();
        $("#tab2").on("blur", "#search", function() {
            base.vModel.$set("goods", []);
            getTab2Items();
        });
        $("#tab2").on("keypress", "#search", function() {
            base.vModel.$set("goods", []);
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
        autoData: autoRefreshData,
        initPageData: initPageData,
        getPageData: getPageData,
        addItems: addItems,
        stop: stopAutoRefreshData
    };
});

define("date-debug", [], function(require, exports, module) {
    /**
	 * ---- 日期格式化 ----
	 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
	 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
	 * @param {DateString} date 被格式化的日期
	 * @param {String} fmt 转换格式，eg.yyyy-MM-dd
	 * @return {DateString} fmt 转换后的日期
	 */
    exports.DateFormat = function(date, fmt) {
        date = date.replace(/-/g, "/");
        var d = new Date(date);
        var o = {
            "M+": d.getMonth() + 1,
            //月份
            "d+": d.getDate(),
            //日
            "h+": d.getHours(),
            //小时
            "m+": d.getMinutes(),
            //分
            "s+": d.getSeconds(),
            //秒
            "q+": Math.floor((d.getMonth() + 3) / 3),
            //季度
            S: d.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        //console.log(d, date, o, fmt);
        return fmt;
    };
    /**
	 * ---- 时间戳转换日期 ----
	 * http://www.cnblogs.com/yjf512/p/3796229.html
	 * @param {Int} timestamp 被格式化的时间戳
	 * @example getLocalTime(1439136000000);
	 */
    exports.getLocalTime = function(timestamp) {
        return new Date(parseInt(timestamp)).toLocaleString().replace(/:\d{1,2}$/, " ");
    };
    /**
	 * ---- 日期转时间戳 ----
	 * http://www.cnblogs.com/yjf512/p/3796229.html
	 * @param {Object} date 日期字符串
	 */
    exports.getTimestamp = function(date) {
        if (!/^\d{4}[-|\/|年]\d{1,2}[-|\/|月]\d{1,2}日?\s\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(dateStr)) {
            return 0;
        }
        var dateStrArr = dateStr.replace(/[\/|年|月]/, "-").replace(/日/, "").split(/-|\:|\ /);
        var date = new Date(dateStrArr[0], dateStrArr[1] - 1, dateStrArr[2], dateStrArr[3], dateStrArr[4], dateStrArr[5]);
        return Date.parse(date);
    };
    /**
     * 获取上一个月
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    exports.getPreMonth = function(date) {
        var arr = date.split("-");
        var year = arr[0];
        //获取当前日期的年份
        var month = arr[1];
        //获取当前日期的月份
        var day = arr[2];
        //获取当前日期的日
        var days = new Date(year, month, 0);
        days = days.getDate();
        //获取当前日期中月的天数
        var year2 = year;
        var month2 = parseInt(month) - 1;
        if (month2 == 0) {
            year2 = parseInt(year2) - 1;
            month2 = 12;
        }
        var day2 = day;
        var days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();
        if (day2 > days2) {
            day2 = days2;
        }
        if (month2 < 10) {
            month2 = "0" + month2;
        }
        var t2 = year2 + "-" + month2 + "-" + day2;
        return t2;
    };
    /**
     * 获取下一个月
     * @date 格式为yyyy-mm-dd的日期，如：2014-01-25
     */
    exports.getNextMonth = function(date) {
        var arr = date.split("-");
        var year = arr[0];
        //获取当前日期的年份
        var month = arr[1];
        //获取当前日期的月份
        var day = arr[2];
        //获取当前日期的日
        var days = new Date(year, month, 0);
        days = days.getDate();
        //获取当前日期中的月的天数
        var year2 = year;
        var month2 = parseInt(month) + 1;
        if (month2 == 13) {
            year2 = parseInt(year2) + 1;
            month2 = 1;
        }
        var day2 = day;
        var days2 = new Date(year2, month2, 0);
        days2 = days2.getDate();
        if (day2 > days2) {
            day2 = days2;
        }
        if (month2 < 10) {
            month2 = "0" + month2;
        }
        var t2 = year2 + "-" + month2 + "-" + day2;
        return t2;
    };
});

define("set_heart-debug", [ "base-debug" ], function(require, exports, module) {
    var base = require("base-debug");
    //所有全局配置信息
    /**
	 * 设置/取消活动关注
	 */
    function setActiveHeart() {
        if (!base.isLogin()) return;
        var $activeHeart = $("#activeHeart");
        var $heartIcon = $activeHeart.find(".fa");
        var postData = {};
        if ($heartIcon.hasClass("fa-heart")) {
            postData = {
                ATTENTION_ID: base.params.ATTENTION_ID,
                IS_DELETE: 1
            };
        } else {
            postData = {
                TV_SHOW_ID: base.params.TV_SHOW_ID,
                RELEVANT_ID: base.params.ACTIVITY_ID,
                MEMBER_ID: base.params.MEMBER_ID,
                TYPE: 5,
                PARENT: 0,
                IS_DELETE: 0
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
        if (!base.isLogin()) return;
        var $heartIcon = $elm.find(".item-after .fa");
        var postData = {
            FORUM_ID: $elm.data("forumid")
        };
        if ($heartIcon.hasClass("fa-heart")) {
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
            $heartIcon.removeClass("fa-heart-o").addClass("fa-heart");
            $heartIcon.html(isNaN(heartNum) ? $heartIcon.html() : ++heartNum);
        } else {
            $heartIcon.removeClass("fa-heart").addClass("fa-heart-o");
            $heartIcon.html(isNaN(heartNum) ? $heartIcon.html() : --heartNum);
        }
        $.ajax({
            type: "post",
            url: base.getUrl("comment_praise"),
            data: postData,
            async: true,
            success: function(res) {
                $("#tab1").one("click", ".item-after .fa", function() {
                    setCommentHeart($(this).closest(".item-content"));
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
        setActiveHeart: setActiveHeart,
        setCommentHeart: setCommentHeart
    };
});

define("comment-debug", [ "base-debug", "bind_data-debug", "countdown-debug", "popup-debug", "date-debug" ], function(require, exports, module) {
    var base = require("base-debug");
    //所有全局配置信息
    var bindData = require("bind_data-debug");
    //绑定数据
    var time = require("date-debug");
    //时间格式转换
    /**
	 * 绑定评论数据
	 * @param {Object} res 评论AJAX的返回数据
	 */
    function commentRes(res) {
        //bindData.getPageData();
        //base.vars.LASTDATE = time.DateFormat(res.CREATE_DATE, "yyyy-MM-dd hh:mm:ss");//设置最后更新时间
        var data = {
            COMMENTTIME: time.DateFormat(res.CREATE_DATE, "yyyy/MM/dd hh:mm") + " - " + res.PHONE_TYPE,
            CONTENT: res.CONTENT,
            CREATE_DATE: res.CREATE_DATE,
            FORUM_ID: res.FORUM_ID,
            MEMBER_ID: res.MEMBER_ID,
            MEMBER_NAME: res.MEMBER_NAME,
            NICKNAME: res.NICKNAME ? res.NICKNAME : res.MEMBER_NAME,
            PARENT: res.PARENT,
            PHONE_TYPE: res.PHONE_TYPE,
            PHOTO: res.PHOTO ? /^http.*/.test(res.PHOTO) ? res.PHOTO : base.uri.host + res.PHOTO : "./default.200x200.jpg",
            SIGN: res.SIGN,
            SUPPORT: 0,
            SUPPORT_ID: "",
            TV_SHOW_ID: res.TV_SHOW_ID
        };
        if (res.PARENT != "0") {
            base.vModel.comments.forEach(function(item) {
                if (item.FORUM_ID == res.PARENT) {
                    //item.childs.push(data);
                    item.childs ? item.childs.push(data) : item.childs = [ data ];
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
        $(".page").one("click", ".searchbar-cancel", function() {
            sendComment();
        });
    }
    /**
	 * 发送评论数据
	 */
    function sendComment() {
        if (!base.isLogin()) return;
        if (/^\s*$/.test(base.vModel.inputMsg)) {
            $.toast("您是不是忘记输入评论内容了");
            $(".page").one("click", ".searchbar-cancel", function() {
                sendComment();
            });
            return;
        }
        $.showIndicator();
        //显示指示器 modal
        $.ajax({
            type: "post",
            url: base.getUrl("comment"),
            data: {
                TYPE: base.params.COMMENT_TYPE,
                PARENT: base.params.COMMENT_PARENT,
                MEMBER_ID: base.params.MEMBER_ID,
                PHONE_TYPE: base.params.PHONE_TYPE,
                TV_SHOW_ID: base.params.ACTIVITY_ID,
                TO: base.params.TO,
                CONTENT: resetCommentMSG(base.params.AT),
                //base.vModel.inputMsg,//
                AT: getAtList(base.params.AT)
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
            if (reg.test(base.vModel.inputMsg)) {
                base.params.INPUTMSG = base.vModel.inputMsg.replace(reg, '<a href="javascript:void(0);" data-type="at" data-memberid="' + key + '" class="external">$1</a>');
            } else {
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
        var ids = "";
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
    var $search = $("#search");
    module.exports = {
        init: function() {
            //绑定评论事件
            $(".page").one("click", ".searchbar-cancel", function() {
                sendComment();
            });
            //回复评论 - 设置回复人
            $("#tab1").on("click", ".item-after span", function() {
                var $wrapLi = $(this).closest(".item-content");
                var userName = $wrapLi.find(".item-title h3").html();
                base.params.COMMENT_TYPE = 0;
                base.params.COMMENT_PARENT = $wrapLi.data("forumid");
                base.params.TO = $wrapLi.data("memberid");
                base.vModel.placeholderMsg = "回复 " + userName + ":";
                $("#search").focus();
            });
            //@好友
            $("#tab1").on("click", ".item-title h3,.from", function() {
                var $wrap = $(this).closest("li");
                base.params.AT[$wrap.data("memberid")] = $(this).html();
                base.vModel.inputMsg += " @" + $(this).html() + " ";
                $search.focus();
            });
            //没有输入任何信息的，离开输入框清空关联的回复信息
            $search.on("blur", function() {
                if (/^\s*$/.test(base.vModel.inputMsg)) {
                    initCommentInfo();
                }
            });
        }
    };
});
