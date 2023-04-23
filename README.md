## monitor

## 启动

- 启动调试服务
  npm run server
- 启动 Monitor 的实时编译
  npm run watch

## Export

属性直接挂载到 window 上

```
window.MonitorObserver = observer;
window.Monitor = Monitor;
window.MonitorInstance = monitor;
```

### Monitor

- ajax/fetch 请求监听
- console 拦截
- click 点击监听
- widnow.onerror  window.addEventListener("error") 监听

### MonitorInstance

Monitor 的实例， observer 使用的是监听的动作

### observer

主要的使用方式，一个简单的订阅发布类，主要用于与 MonitorInstance 交互

已知的几种方式：

```typescript
    // 设置忽略上报接口连接
    observer.emit("ignoreRules", (String | RegExp)[])

    /**
     * 设置自定义错误上报，使用上如 try/catch react的DidCache 等
     * 最终还是会通知到 observer的monitor事件
     */
    observer.emit("error",  Error)

    // 订阅监听事件
    observer.on("monitor", ([type:String , data: any])=>{})
```
