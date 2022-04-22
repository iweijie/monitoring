export default class Observer {
  private store: any;
  private payload: any;

  constructor() {
    this.store = {};
    this.payload = {};
  }

  emit(type: string, payload: any) {
    if (!this.store[type]) return;
    this.store[type](payload);
  }

  // 前置触发，也即在注册之前触发，可以不用担心顺序问题
  preEmit(type: string, payload: any) {
    if (!this.store[type]) {
      if (!this.payload[type]) {
        this.payload[type] = [];
      }
      this.payload[type].push(payload);
      return;
    }

    this.emit(type, payload);
  }
  // 事件注册
  on(type: string, callback: any) {
    this.store[type] = callback;
    if (this.payload[type]) {
      const payload = this.payload[type];

      payload.forEach((i: any) => {
        this.emit(type, i);
      });

      this.payload[type] = null;
    }
  }
  // 移除事件
  remove(type: string) {
    if (!type || !this.store[type]) return;
    this.store[type] = undefined;
  }
  // 单次触发事件注册
  once(type: string, callback: any) {
    if (!type) return;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    const anonym = () => {
      function fn(payload: any) {
        callback(payload);
        _this.remove(type);
      }
      return fn;
    };

    this.store[type] = anonym();
  }
}

export const observer = new Observer();
