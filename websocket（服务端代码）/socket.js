// 加载ws模块
var WebSocketServer = require('ws').Server;

// 开启一个websocket的服务器
var wss = new WebSocketServer({port: 8181})

// 声明一个用户数组
var clients = []

// sendMsg 助手函数
function mySend(ws, params = {}) {
    ws.send(JSON.stringify(params))
}

// 通过ws获取uid的助手函数
function myWs2Uid(ws) {
    var uid = null
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].ws === ws) {
            uid = clients[i].uid
        }
    }
    return uid
}

// 通过uid获取ws的助手函数
function myUid2Ws(uid) {
    var ws = null
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].uid === uid) {
            ws = clients[i].ws
        }
    }
    return ws
}

// 判断用户是否已经存在
function isSet(uid, ws) {
    // 如果不存在该用户，
    // 则进行存储一份该用户信息
    if (!myUid2Ws(uid)) {
        clients.push({
            uid: uid,
            ws: ws
        })
        console.log(`用户: ${uid} 连接进来`)
        mySend(ws, {
            code: 101,
            msg: '登陆成功'
        })
        // 上线广播
        onlineSend2All()
    }
}

// 断开连接时，清除该断开用户的数据
function clearUser(ws) {
    // 保存被删除的用户uid
    var uid = null
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].ws === ws) {
            uid = clients[i].uid
            console.log(`用户: ${clients[i].uid} 断开连接...`)
            clients.splice(i, 1)
        }
    }
    return uid
}

// 根据命令返回结果
function cmdResult(message, ws) {
    console.log(message)
    if (message.cmd === 'query') {
        var temp = []
        for (var i = 0; i < clients.length; i++) {
            temp.push(clients[i].uid)
        }
        mySend(ws, {
            code: 1101,
            data: temp,
            cmd: 'query',
            msg: '当前用户列表'
        })
    } else if (message.cmd === 'call') {
        var uid = myWs2Uid(ws)
        var cws = myUid2Ws(message.cid)
        var status = false // 被呼叫用户的状态
        if (cws) {
            status = true
            mySend(cws, {
                code: 1200,
                data: null,
                cid: uid,
                msg: `用户 ${uid} 正在呼叫您`
            })
        }
        mySend(ws, {
            code: 1102,
            data: null,
            cmd: 'call',
            cid: message.cid,
            msg: `正在呼叫${message.cid}...`,
            status: status // 对方的状态：true表示在线，false表示离线
        })
    } else if (message.cmd === 'answer') {
        var uid = myWs2Uid(ws)
        var cws = myUid2Ws(message.cid)
        if (cws) {
            mySend(ws, {
                code: 1111,
                data: null,
                cid: message.cid,
                msg: `您接听了 ${message.cid} 的呼叫`
            })
            mySend(cws, {
                code: 1221,
                data: null,
                cid: uid,
                msg: `您的呼叫被接听了`
            })
        }
    } else if (message.cmd === 'reject') {
        var uid = myWs2Uid(ws)
        var cws = myUid2Ws(message.cid)
        if (cws) {
            mySend(ws, {
                code: 1112,
                data: null,
                cid: message.cid,
                msg: `您拒绝了 ${message.cid} 的呼叫`
            })
            mySend(cws, {
                code: 1222,
                data: null,
                cid: uid,
                msg: `您的呼叫被拒绝了`
            })
        }
    } else if (message.cmd === 'closed') {
        var uid = myWs2Uid(ws)
        var cws = myUid2Ws(message.cid)
        if (cws) {
            mySend(ws, {
                code: 1115,
                data: null,
                cid: message.cid,
                msg: `您取消了了呼叫`
            })
            mySend(cws, {
                code: 1225,
                data: null,
                cid: uid,
                msg: `对方取消了呼叫`
            })
        }
    }
}

// 用户离线广播
function offlineSend2All(uid) {
    var temp = []
    for (var i = 0; i < clients.length; i++) {
        temp.push(clients[i].uid)
    }
    for (var i = 0; i < clients.length; i++) {
        mySend(clients[i].ws, {
            code: 2102,
            data: temp,
            msg: '有用户离线'
        })
    }
}

// 用户上线广播
function onlineSend2All() {
    var temp = []
    for (var i = 0; i < clients.length; i++) {
        temp.push(clients[i].uid)
    }
    for (var i = 0; i < clients.length; i++) {
        var result = {
            code: 2101,
            data: temp,
            msg: '有用户上线'
        }
        clients[i].ws.send(JSON.stringify(result))
    }
}

// 监听用户的连接
wss.on('connection', function (ws) {
    ws.on('open', function (code) {
        console.log('connected')
        ws.send(Date.now())
    })
    ws.on('close', function (code) {
        var uid = clearUser(ws)
        offlineSend2All(uid)
    })

    // websocket底层有数据包的封包协议，所以，绝对不会出现粘包的情况。
    // 每解一个数据包，就会触发一个message事件;
    // 不会出现粘包的情况，send一次，就会把send的数据独立封包。
    // 如果我们是直接基于TCP，我们要自己实现类似于websocket封包协议就可以完全达到一样的效果；
    ws.on('message', function (message) {
        var message = JSON.parse(message)
        isSet(message.uid, ws)
        if (message.text) {
            ws.send(`发送成功：${message.text}`)
        } else if (message.cmd) {
            cmdResult(message, ws)
        }
    })
});
