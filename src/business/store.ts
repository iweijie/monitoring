import type { StoreMapsType } from "./type";

const ExpireLevel =
  process.env.NODE_ENV === "development"
    ? {
        high: 0,
        middle: 1000 * 2,
        low: 1000 * 10,
        saltedFish: 1000 * 5,
      }
    : {
        high: 1000 * 60,
        middle: 1000 * 60 * 2,
        low: 1000 * 60 * 5,
        saltedFish: 1000 * 60 * 30,
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

  constructor() {
    this.t = this.test();
  }

  private test() {
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

  insert(key: string, value: any): boolean {
    if (!this.t) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  get<T>(key: string): T | null {
    if (!this.t) return null;
    try {
      return JSON.parse(window.localStorage.getItem(key) || "");
    } catch (err) {
      return null;
    }
  }

  has(key: string): boolean {
    if (!this.t) return false;
    try {
      if (this.get(key) !== null) {
        return true;
      }
    } catch (err) {
      return false;
    }

    return false;
  }

  delete(key: string): boolean {
    if (!this.t) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (err) {
      return true;
    }
  }
}

class LocalStore extends Store {
  public monitorKey: string;
  public monitorExpire: string;
  // 过期时间
  public expireTime: number;
  private _timer: any;
  private _fn: any;
  private isRun = false;

  constructor(options: StoreOptionsType) {
    super();
    this.monitorKey = options.monitorKey;
    this.monitorExpire = options.monitorExpire;
    this.expireTime = Math.max(options.expireTime, 0);
  }

  add(key: string, value: any): boolean {
    const { monitorKey } = this;
    try {
      const maps: StoreMapsType = this.get<StoreMapsType>(monitorKey) || {};

      if (!maps[key]) {
        maps[key] = [];
      }
      maps[key].push(value);
      this.insert(monitorKey, maps);
      // 插入数据后开始倒计时
      this.run();
      return true;
    } catch (err) {
      return false;
    }
  }

  private run() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    if (this.isRun) return;
    this.isRun = true;
    if (!this.has(this.monitorExpire)) {
      this.insert(this.monitorExpire, Date.now() + this.expireTime);
    }
    const expiresTime = this.get<number>(this.monitorExpire) || 0;

    const time = Math.max(expiresTime - Date.now(), 0);
    this._timer = setTimeout(() => {
      if (typeof that._fn !== "function") return;
      const data = this.get<StoreMapsType>(this.monitorKey);
      this.delete(this.monitorKey);
      if (data) {
        that._fn(data);
      }
      this.isRun = false;
      this.delete(this.monitorExpire);
    }, time);
  }

  subscribe(fn: (data: any) => void) {
    this._fn = fn;
  }

  unsubscribe() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._fn = null;
  }
}

export class RequestSuccessStore extends LocalStore {
  constructor() {
    super({
      // 本地存储Key
      monitorKey: "monitor_request_success_key",
      // 统计到期Key
      monitorExpire: "monitor_request_success_key_expire",

      expireTime: ExpireLevel.low,
    });
  }
}

export class RequestErrorStore extends LocalStore {
  constructor() {
    super({
      // 本地存储Key
      monitorKey: "monitor_request_key",
      // 统计到期Key
      monitorExpire: "monitor_request_key_expire",
      // 缓存1分钟的接口请求 一次性上报
      expireTime: ExpireLevel.high,
    });
  }
}

export class SourceErrorStore extends LocalStore {
  constructor() {
    super({
      // 本地存储Key
      monitorKey: "monitor_source_error_key",
      // 统计到期Key
      monitorExpire: "monitor_source_error_key_expire",
      // 缓存1分钟的接口请求 一次性上报
      expireTime: ExpireLevel.high,
    });
  }
}
