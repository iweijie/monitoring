export enum storeEnumKey {
  monitor_error_key = "monitor_error_key",
}

type RequestStoreMapsType = {
  [key in string]: Array<number>;
};

type StoreOptionsType = {
  // 本地存储Key
  monitorKey: string;
  // 统计到期Key
  monitorExpire: string;
  // 到期时间
  expireTime: number;
};

class Store {
  public t: boolean;
  public monitorKey = "monitor_request_key";
  public monitorExpire = "monitor_request_key_expire";
  /**
   * 值为零：自定义处理
   * 值>0 : 在存储的情况下会检测是否到期，到期一次性返回存储值（以数组的方式返回）
   * 
   * 可能存在的问题：
   *    1. 如果到期之后一直再次Add... 当前数据就会一直存在
   *  
   */
  public expireTime = 1000 * 60 * 5;

  constructor(options: StoreOptionsType) {
    this.t = this.test();
    this.monitorKey = options.monitorKey;
    this.monitorExpire = options.monitorExpire;
    this.expireTime = Math.max(options.expireTime, 0);
  }

  public test() {
    const key = `monitor_test_${Math.random()}`;
    if (typeof localStorage === "object") {
      try {
        localStorage.setItem(key, "1");
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  private hasExpire(): boolean {
    const { monitorExpire, expireTime } = this;
    if (!this.t) return false;
    try {
      const expireStr = window.localStorage.getItem(monitorExpire);
      let expire;
      if (!expireStr) {
        expire = Date.now() + expireTime;
        window.localStorage.setItem(monitorExpire, expire.toString());
      } else {
        expire = JSON.parse(expireStr);
      }

      if (expire > Date.now()) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  add(key: string, value: number): boolean {
    const { monitorKey } = this;
    if (!this.t) return false;
    try {
      const store = window.localStorage.getItem(monitorKey);
      const maps: RequestStoreMapsType = store ? JSON.parse(store) : {};

      if (!maps[key]) {
        maps[key] = [];
      }
      maps[key].push(value);
      window.localStorage.setItem(monitorKey, JSON.stringify(maps));
      return true;
    } catch (err) {
      return false;
    }
  }

  getAll(): RequestStoreMapsType | null {
    const { monitorKey } = this;
    if (!this.t) return null;
    if (this.hasExpire()) {
      try {
        const store = window.localStorage.getItem(monitorKey);
        this.remove();
        return store ? JSON.parse(store) : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  private remove(): boolean {
    const { monitorKey } = this;
    if (!this.t) return false;
    try {
      window.localStorage.removeItem(monitorKey);
      return true;
    } catch (err) {
      return false;
    }
  }
}

export class RequestSuccessStore extends Store {
  constructor() {
    super({
      // 本地存储Key
      monitorKey: "monitor_request_success_key",
      // 统计到期Key
      monitorExpire: "monitor_request_success_key_expire",
      // 缓存五分钟的接口请求 一次性上报
      expireTime: 1000 * 60 * 5,
    });
  }
}

export class RequestErrorStore extends Store {
  constructor() {
    super({
      // 本地存储Key
      monitorKey: "monitor_request_key",
      // 统计到期Key
      monitorExpire: "monitor_request_key_expire",
      // 缓存五分钟的接口请求 一次性上报
      expireTime: 1000 * 60 * 5,
    });
  }
}
