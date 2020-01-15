# WebSocket实时聊天交互核心功能封装

### 介绍
- 用ws封装的一个实时通信交互工具

### 软件架构
- 软件架构说明

### 使用截图

![软件运行截图](https://nunini-dataset-public.oss-cn-beijing.aliyuncs.com/p2.nunini.com/images/p2_example_snapshot.png "演示二维码")


### 演示
- [演示地址（戳我）](https://p2.nunini.com "在线演示地址")

### 服务端运行

1. npm install
2. node socket.js

### 使用说明

- 环境的准备
    1. 服务端必须要在nodejs环境下进行操作，客户端无限制
    2. 可以直接在socket.js文件中修改返回码

- 从客户端调用

    1. 实例化工具对象
    
    ```
    // 实例化socket对象
    // 参数1: 当前用户id
    // 参数2: socket服务器地址
    var ws = webSocket({
        uid: uid,
        server: "ws://47.93.42.98:8181"
    })
    
    // - ws方法说明：
    // - cmd
    //     1. 查询类命令只需要传入cmd即可；
    //     2. 与另一个用户进行交互，则需要传入地方的uid即clientid->cid
    // 
    // - watching
    //     1. 监听服务端的所有响应，并通过返回值作出对应响应
      

    ```
    
    2. 调用对象中的cmd方法，用于发送操作指令
    
    ```
    // 参数1: 命令名称
    // -> 拨打的命令为call;
    // -> 查询在线用户的命令为query(注意：所有查询，都不需要传入cid)
    // -> 接听电话的命令为answer
    // -> 拒接电话的命令为reject
    // 参数2: clientid。对方用户的uid
    // 注意：uid可以为字符串
    ws.cmd({cmd: 'query'}) // 查询所有用户
    ws.cmd({{cmd: 'call', cid: 2002}})
    ```
    
    3. 监听服务端返回的所有事件结果
    
    ```
    // 监听服务器返回的事件（包括广播事件）
    ws.watching(function (res) {
        if (res.code == 1101) {
            console.log(res.msg, res.data)
        }
    })
    ```

### 工具运行截图


### 返回码说明

- 101: 登陆成功
- 2xxx表示系统广播
- 2101: 有用户上线
- 2102: 有用户离线
- 1xxx表示命令请求
- 11xx表示主动请求
- 12xx 或者 1x2x 表示被动
- 1101: 用户列表查询结果
- 1111: 接听了
- 1112: 拒绝了接听
- 1221: 被接听
- 1222: 被拒接
- 1102: 正在呼叫
- 1200: 正在被呼叫
- 1115: 主动挂断
- 1225: 被挂断了（也可能是对方掉线了）
