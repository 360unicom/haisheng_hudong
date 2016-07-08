define(function (require, exports, module) {
    module.exports = {
        "uri": {
            "base_data": "app/activity/interaction", //基础数据，http://note.youdao.com/groupshare/?token=5D955D4B704E4C23B2C1BB9435F9D41F&gid=2801912
            "ping_lun": "app/forum/listForumByActivity", //评论列表 资讯前三 分页,http://note.youdao.com/groupshare/?token=7FAAF61EE1D04032AE7E7256DF66F4D6&gid=2801912
            "hosts_forum":"app/forum/hostsForum",//主持嘉宾评论列表
            "tong_kuan": "app/similar/listByActivity", //同款,http://note.youdao.com/groupshare/?token=C99D85BA22424159B1F9FACA497DA4FF&gid=2801912
            "is_support": "app/similar/is_support", //同款查询用户是否点赞,http://note.youdao.com/groupshare/?token=029409CC5D544BE9A617E3BF4178F557&gid=2801912
            "autoData": "app/activity/activityData", //10秒自动获取数据,http://note.youdao.com/groupshare/?token=F9DB994E95154BDB8EE82FD957FB188D&gid=2801912
            "comment": "app/forum/save", //发表、回复评论,http://note.youdao.com/groupshare/?token=06202BC14BA74099B24B09EACC15D5CA&gid=2801912
            "activity_attention": "app/redis/activity/is_atten", //活动(取消)关注,http://note.youdao.com/groupshare/?token=372F4C10A0234DE6B968BCE0DB4C7369&gid=2801912
            "comment_praise": "app/redis/forum/praiseForum", //评论(取消)点赞,http://note.youdao.com/groupshare/?token=F0FAB18D519445A983B357E27C786D81&gid=2801912
            "praise_or_fine": "app/activity/PraiseOrFine", //活动 赏、砸,http://note.youdao.com/groupshare/?token=90F35CA3FF9D4D4C8CF9B155B2E775F1&gid=2801912
            "submitAnswer": "app/questionnaire/submitAnswer", //提交问卷
            "addAcceptRecord": "app/received_records/save", //保存接收记录
            "memberInfo": "app/member/findById", //用户信息
            "creatRoomId": "app/activity/createChat", //用户信息
            //[Leo]修改接口Hosts
            //"host": "http://127.0.0.1:8080/t2o/"
            //"host": "http://192.168.0.125:8080/t2o/" //蒋丽坤
            //"host": "http://123.57.89.97:8080/t2o/" //测试服务器地址
            //"host": "http://123.57.172.249:8080/t2o/" //正式服务器地址
            "host": "http://highsheng.com:8080/t2o/" //正式服务器地址

            /**
             * http://leo/haisheng_hudong_min_v1.1.3/dist/activity.html?ACTIVITY_ID=67dcd7880d1a4a95a2caa35e4a256a93&MEMBER_ID=9e4214c271694660a068b9c6faf6747c&PHONE_TYPE=BlackBerry
             * http://leo/haisheng_hudong_min_v1.1.3/src/activity.html?ACTIVITY_ID=67dcd7880d1a4a95a2caa35e4a256a93&MEMBER_ID=9e4214c271694660a068b9c6faf6747c&PHONE_TYPE=BlackBerry
             */
        },
        "params": {
            "ACTIVITY_ID": "", //活动ID
            "MEMBER_ID": "", //用户ID
            "ATTENTION_ID": "", //活动关注ID

            "ONLINE_ID": "", //在线ID

            "PHONE_TYPE": "iphone", //手机类型

            "TV_SHOW_ID": "", //节目ID
            "COMMENT_TYPE": 2, //评论类型
            "COMMENT_PARENT": 0, //回复评论的ID，评论父级
            "TO": "", //被回复人的ID
            "AT": {}, //被@人的ID
            "INPUTMSG": "", //评论内容

            "currentPageHosts": 0, //主持评论当前页
            "currentPageComments": 0, //评论当前页
            "currentPageGoods": 0, //同款当前页
            "showCount": 10 ,//分页条数
            
            "PHOTO" : "", //头像
            "NICKNAME" : "",//昵称
            "MEMBER_NAME" : "",//用户名
            "SIGN":"" //用户身份
        },
        "vars": {
        	"activityTitle" : '',//活动名
            "$audios": $('#audios'), //音效
            "msgAudio": $('.msg', this.$audios)[0], //消息音效
            "shangAudio": $('.shang', this.$audios)[0], //砸鸡蛋音效
            "zhaAudio": $('.zha', this.$audios)[0], //赏金币音效
            "loading": false, //是否正在加载数据
            "curTab": 'tab1', //当前标签页
            "autoRefreshDataAjax": null, //轮询Ajax
            "countdownTimeInterval": null, //活动倒计时
            "LASTDATE": "", //轮询的最后更新时间
            "TOTAL_VALUE": 1000, //打赏最高分
            "OPPOSE_VALUE": 0, //打的总分
            "SUPPORT_VALUE": 0, //赏的总分
            "PROPS_SCORE": 10, //打赏道具的分值
            "realtime" : null, //聊天初始化
            "common_flag" : false, //嗨吧服务器连接
            "host_flag" : false, //主持服务器连接
            "str_at" : '' //at用户id
        },
        "initCloseData": function () {
            $.closeModal('.pop');

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

            this.vPop.showImg = true; //弹窗图片显示
            this.vPop.showTitle = true; //弹窗标题
            this.vPop.showSubject = true; //弹窗主题显示
            this.vPop.showPrice = false; //弹窗价格
            this.vPop.showAbout = true; //弹窗简介
            this.vPop.showBtn = true; //弹窗按钮
            this.vPop.showAnswer = false; //问卷弹窗答案
            this.vPop.showRed = false; //红包
            this.vPop.autoClose = false; //是否自动关闭
            this.vPop.isPopup = false; //是否已经弹出
        },
        "getUrl": function (uri_name) { //获取接口
            return this.uri.host + this.uri[uri_name];
        },
        "goToDetail": function (params) { //进入详情页
            switch (parseInt(params.POP_TYPE)) {
                case 1:
                    if (this.browser.versions.ios) {
                        window.location.href = this.uri.host + 'tkorzx//:PushTongkuanOrZixun:/' + params.POP_TYPE + "/" + params.ID;
                    } else {
                        //资讯
                        window.location.href = this.uri.host + "app/article/info?ARTICLE_ID=" + params.ID + "&MEMBER_ID=" + params.MEMBER_ID + "&PHONE_TYPE=" + params.PHONE_TYPE;
                    }
                    break;
                case 2:
                    if (this.browser.versions.ios) {
                        window.location.href = this.uri.host + 'tkorzx//:PushTongkuanOrZixun:/' + params.POP_TYPE + "/" + params.ID;
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
        "browser": {
            versions: function () {
                var u = navigator.userAgent,
                    app = navigator.appVersion;
                return { //移动终端浏览器版本信息
                    trident: u.indexOf('Trident') > -1, //IE内核
                    presto: u.indexOf('Presto') > -1, //opera内核
                    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                    iPad: u.indexOf('iPad') > -1, //是否iPad
                    webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                };

            }(),
            language: (navigator.browserLanguage || navigator.language).toLowerCase()
        },
        /**
         * 通过构建hash对象方式数组去重
         * @param {Object} arr
         * unique([ new String(1), new Number(1) ]);这种输入就无法判断
         */
        "unique": function (arr) { //https://github.com/lifesinger/blog/issues/113
            var res = []
            var hash = {}
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i]
                var key = typeof(item) + item
                if (!hash[key]) {
                    res.push(item)
                    hash[key] = 1
                }
            }
            return res;
        },
        "isLogin": function () {
            id = this.params.MEMBER_ID;
            if (id == '' || id == "(null)" || id == "null" || id == null || id == undefined) {
                if (this.browser.versions.ios) {
                    window.location.href = 'Login://PushLogin/';
                } else {
                    Bridge.Login();
                }
                return false;
            }
            return true;
        },
        "memberInfo": function () {
            var mId = this.params.MEMBER_ID;
            var $this = this;
            if (mId != '' && mId != "(null)" && mId != "null" && mId != null && mId != undefined) {
                $.ajax({
                	type:"post",
                	url:this.getUrl('memberInfo'),
                	async:false,
                	data:{MEMBER_ID : mId},
                	dataType: 'json',
                	success : function (data){
                		console.log(data.PHOTO);
                		if(data.result == 'success'){
                			$this.params.PHOTO = data.PHOTO;
                			$this.params.NICKNAME = data.NICKNAME;
                			$this.params.MEMBER_NAME = data.MEMBER_NAME;
                			$this.params.SIGN = data.SIGN;
                		}
                	}
                });
                return true;
            }
            return false;
        },
        "setMemberId": function (id) { //提供给APP调用登陆回调
            this.params.MEMBER_ID = id;
        },
        "vModel": new Vue({
            el: "#activePage",
            data: {
            	hostRoomId : '',//主持房间id
            	commonRoomId : '',//嗨吧房间id
                gameURI: "", //游戏外链
                countdownTitle: "暂无活动", //倒计时标题
                countdownTime: "", //倒计时时间
                //publishImg: "./default.750x500.jpg", //海报图
                publishImgs: [], //轮播海报图
                tvShowIcon: "./default.200x200.jpg", //节目Logo
                downProcess: "0%", //砸 百分比
                upProcess: "0%", //赏 百分比
                tvShowName: "", //节目名
                fans: "0", //粉丝数
                forums: "0", //评论数
                onlines: "0", //在线人数
                isHeartActive: "fa-heart-o", //是否关注互动
                placeholderMsg: "说两句吧", //输入框PlaceHolder
                inputMsg: "", //输入的评论信息
                onTops: [], //置顶
                comments: [], //评论
                hosts: [], //主持评论
                //replys: [], //回复
                searchKey: "",
                goods: [] //同款
            },
            // 在 `methods` 对象中定义方法
            methods: {
                openImgLink: function (event) {
                    var type = $('img', event.target).data('type');
                    var link = $('img', event.target).data('link');
                    switch (type) {
                        case "1":
                            window.location.href = 'http://123.57.172.249:8080/t2o/t2o/activity.html?ACTIVITY_ID=' + link + '&MEMBER_ID=' + base.params.MEMBER_ID;
                            break;
                        case "2":
                            module.exports.goToDetail({
                                "POP_TYPE": 2,
                                "ID": link
                            });
                            break;
                        case "3":
                            module.exports.goToDetail({
                                "POP_TYPE": 1,
                                "ID": link
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
        "vPopTemp": {
            showImg: true, //弹窗图片显示
            showTitle: true, //弹窗标题
            showSubject: true, //弹窗主题显示
            showPrice: false, //弹窗价格
            showAbout: true, //弹窗简介
            showBtn: true, //弹窗按钮
            showAnswer: false, //问卷弹窗答案
            showRed: false, //红包
            autoClose: false, //是否自动关闭
            isPopup: false, //是否已经弹出
            lastPoplayerID: null, //最后弹出的一个弹窗ID
            /**
             * 通用
             */
            IS_WHOLE: 0, //是否是全局 0;否 1：是
            POP_TYPE: 0, //弹出类型 1:资讯 2：同款  3：问卷  4：红包  5：外链 6：游戏
            END_TIME: 0, //弹窗持续时间

            ID: "", //弹窗对象的ID
            PUBLISH_IMG: "", //宣传图
            TITLE: "", //标题
            SUBJECT: "", //主题
            PRICE: "", //价钱
            ABOUT: "", //简介
            LINK_ADDRESS: "", //外链地址
            BTN_NOTE: "查看详情", //按钮文字
            /**
             * 红包
             */
            RED_TOTAL_AMOUNT: 0, //红包总金额
            RED_COUNT: 0, //红包份数
            RED_PER_AMOUNT_MAX: 0, //单个红包最大金额
            /**
             * 问卷
             */
            answers: []
        },
        "vPop": new Vue({
            el: "#pop",
            data: {
                showImg: true, //弹窗图片显示
                showTitle: true, //弹窗标题
                showSubject: true, //弹窗主题显示
                showPrice: false, //弹窗价格
                showAbout: true, //弹窗简介
                showBtn: true, //弹窗按钮
                showAnswer: false, //问卷弹窗答案
                showRed: false, //红包
                autoClose: false, //是否自动关闭
                isPopup: false, //是否已经弹出
                lastPoplayerID: null, //最后弹出的一个弹窗ID
                /**
                 * 通用
                 */
                IS_WHOLE: 0, //是否是全局 0;否 1：是
                POP_TYPE: 0, //弹出类型 1:资讯 2：同款  3：问卷  4：红包  5：外链 6：游戏
                END_TIME: 0, //弹窗持续时间

                ID: "", //弹窗对象的ID
                PUBLISH_IMG: "", //宣传图
                TITLE: "", //标题
                SUBJECT: "", //主题
                PRICE: "", //价钱
                ABOUT: "", //简介
                LINK_ADDRESS: "", //外链地址
                BTN_NOTE: "查看详情", //按钮文字
                /**
                 * 红包
                 */
                RED_TOTAL_AMOUNT: 0, //红包总金额
                RED_COUNT: 0, //红包份数
                RED_PER_AMOUNT_MAX: 0, //单个红包最大金额
                /**
                 * 问卷
                 */
                answers: []
            }
        }),
        "vMsgInfo": new Vue({
            el: "#msgInfo",
            data: {
                isShow: false, //show
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
    }
});