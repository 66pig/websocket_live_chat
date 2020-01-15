function webSocket(params) {
    function nWS(params = {}) {
        if (!params.uid) {
            console.error('请传入uid再进行初始化');
        }
        if (!params.server) {
            console.error('请传入服务器地址再进行初始化');
        }
        this.server = params.server;
        this.uid = params.uid.toString();
        this.ws = null;
        this.init();
    }

    nWS.prototype = {
        constructor: nWS,
        init: function () {
            var _this = this;
            this.ws = new WebSocket(this.server);
            this.ws.onopen = function (e) {
                console.log('%c连接到服务器成功，正在通过uid进行登陆...', 'color: #E38302');
                _this.ws.send(JSON.stringify({uid: _this.uid}));
            };

            this.ws.onclose = function (e) {
                console.log("服务端连接关闭了");
            };
        },
        cmd: function (params = {}, next) {
            var _this = this;
            params['uid'] = this.uid;
            if (params['cid']) params['cid'] = params['cid'].toString();
            this.ws.send(JSON.stringify(params));
        },
        watching: function (next) {
            var _this = this;
            this.ws.onmessage = function (e) {
                // 系统消息
                var res = JSON.parse(e.data);
                if (res.code > 1000 && res.code < 1200) {
                    console.log("请求: %c" + res.msg, 'color: #012BED');
                } else {
                    console.log("服务端反馈: %c" + res.msg, 'color: #ED2301');
                }
                next && next(res);
            }
        }
    };
    return new nWS(params);
}
