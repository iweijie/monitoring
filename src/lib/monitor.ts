import merge from "deepmerge";
import { myEmitter } from "./event";
import { ErrorObserver } from "./errorObserver";
import { AjaxInterceptor } from "./ajaxInterceptor";
import { FetchInterceptor } from "./fetchInterceptor";
import { IPerformanceInfo, PerformanceObserver } from "./performance";
import { BehaviorCombine, BehaviorObserver } from "./behaviorObserver";
import { TrackerEvents, IHttpReqErrorRes } from "../types";
import { isObject, getNetworkType, getLocaleLanguage } from "./util";
import packageJson from "../../package.json";
import { SpaHandler } from "./spaHandler";
import { IError, IUnHandleRejectionError } from "./baseErrorObserver";

export type ErrorCombine = IError | IUnHandleRejectionError | IHttpReqErrorRes;

export enum Env {
  Dev = "dev",
  Sandbox = "sandbox",
  Production = "production",
}

export interface IErrorOptions {
  watch: boolean;
  random: number;
  repeat: number;
  delay: number;
}

export type URLItem = string | RegExp;

export interface IHttpOptions {
  fetch: boolean;
  ajax: boolean;
  ignoreRules: URLItem[];
}

export enum ConsoleType {
  log = "log",
  error = "error",
  warn = "warn",
  info = "info",
  debug = "debug",
}
export interface IBehaviorOption {
  watch: boolean;
  console: ConsoleType[];
  click: boolean;
  queueLimit: number;
  listenAttr: string;
}

export interface IHookBeforeSend {
  (data: ErrorCombine, eventName: ErrorCombine["errorType"]): ErrorCombine;
}
export interface ReportOptions {
  url: string;
  method: string;
  contentType: string;
  beforeSend: IHookBeforeSend;
}

export interface ITrackerOptions {
  env: Env;
  error: IErrorOptions;
  http: IHttpOptions;
  data: IData;
  report: ReportOptions;
  performance: boolean;
  isSpa: boolean;
  behavior: IBehaviorOption;
}

export type ITrackerOptionsKey = keyof ITrackerOptions;

export type Value = number | string | boolean | undefined;

export interface IConfigDataOptions {
  [key: string]: Value;
}

export type PlainObject = Record<string | number | symbol, unknown>;

export type IData = Record<string | number | symbol, unknown>;

export const defaultTrackerOptions = {
  env: Env.Dev,
  report: {
    url: "",
    method: "POST",
    contentType: "application/json",
    beforeSend: (data: ErrorCombine) => data,
  },
  data: {},
  error: {
    watch: true,
    random: 1,
    repeat: 5,
    delay: 1000,
  },
  performance: false,
  http: {
    fetch: true,
    ajax: true,
    ignoreRules: [],
  },
  behavior: {
    watch: false,
    console: [ConsoleType.error],
    click: true,
    queueLimit: 20,
    listenAttr: "data-report",
  },
  isSpa: true,
};

export type EventName = string | symbol;

export class Monitor {
  public static instance: Monitor;

  public errObserver: ErrorObserver;

  public ajaxInterceptor: AjaxInterceptor;

  public fetchInterceptor: FetchInterceptor;

  public performanceObserver: PerformanceObserver;

  public spaHandler: SpaHandler;

  public behaviorObserver: BehaviorObserver;

  public sdkVersion: string;

  public errorQueue: ErrorCombine[] = [];

  public behaviorQueue: BehaviorCombine[] = [];

  private readonly defaultOptions: ITrackerOptions = defaultTrackerOptions;

  public $data: IData = {};

  public $options: ITrackerOptions = this.defaultOptions;

  private errorQueueTimer: number | null;

  constructor(options: Partial<ITrackerOptions> | undefined) {
    this.initOptions(options);

    this.getNetworkType();
    this.getLocaleLanguage();
    this.getUserAgent();

    this.initGlobalData();
    this.initInstances();
  }

  /**
   * 初始化tracker实例，单例
   * @param options ITrackerOptions
   */
  static init(options: Partial<ITrackerOptions> | undefined = {}) {
    if (!this.instance) {
      this.instance = new Monitor(options);
    }

    return this.instance;
  }

  getNetworkType(): void {
    const networkType = getNetworkType();
    this.configData({
      _networkType: networkType,
    });
  }

  getLocaleLanguage(): void {
    const localeLanguage = getLocaleLanguage();
    this.configData({
      _locale: localeLanguage,
    });
  }

  getUserAgent(): void {
    this.configData({
      _userAgent: navigator.userAgent,
    });
  }

  /**
   * 初始化配置项
   */
  private initOptions(options: Partial<ITrackerOptions> | undefined): void {
    if (!options) options = {};

    this.$options = merge(this.$options, options);
  }

  private initGlobalData(): void {
    this.configData({
      _sdkVersion: packageJson.version,
      _env: this.$options.env,
      ...this.$options.data,
    });
  }

  /**
   * Inject instances and init
   */
  initInstances(): void {
    if (this.$options.error.watch) {
      this.errObserver = new ErrorObserver(this.$options);
      this.errObserver.init();
    }

    if (this.$options.performance) {
      this.listenPerformanceInfo();
      this.performanceObserver = new PerformanceObserver();
      this.performanceObserver.init();
    }

    if (this.$options.http.fetch) {
      this.fetchInterceptor = new FetchInterceptor(this.$options);
      this.fetchInterceptor.init();
    }

    if (this.$options.http.ajax) {
      this.ajaxInterceptor = new AjaxInterceptor(this.$options);
      this.ajaxInterceptor.init();
    }

    if (this.$options.behavior.watch) {
      this.behaviorObserver = new BehaviorObserver(this.$options);
      this.behaviorObserver.init();
    }

    if (this.$options.isSpa) {
      this.spaHandler = SpaHandler.init();
      myEmitter.on("_spaHashChange", (...rest) => {
        const [, , url] = rest;
        this.configData({
          _spaUrl: url,
        });
      });
    }
  }

  private listenPerformanceInfo() {
    myEmitter.on(
      TrackerEvents.performanceInfoReady,
      (performanceInfo: IPerformanceInfo) => {
        this.configData("_performance", performanceInfo, false);
      }
    );
  }

  /**
   * 设置全局数据
   */
  configData(key: string, value: unknown, deepmerge?: boolean): Monitor;
  configData(options: PlainObject, deepmerge?: boolean): Monitor;
  configData(
    key: PlainObject | string,
    value: unknown,
    deepmerge = true
  ): Monitor {
    if (typeof key === "string") {
      if (isObject(value) && deepmerge) {
        this.$data = merge(this.$data, value as PlainObject);
      } else {
        this.$data[key as string] = value;
      }
    } else if (isObject(key)) {
      if (typeof value === "boolean") {
        deepmerge = value;
      }
      value = key;

      if (deepmerge) {
        this.$data = merge(this.$data, value as PlainObject);
      } else {
        this.$data = {
          ...this.$data,
          ...(value as PlainObject),
        };
      }
    }

    myEmitter.emit(TrackerEvents._globalDataChange, this.$data);

    return this;
  }

  public changeOptions(
    key: keyof ITrackerOptions,
    value: ITrackerOptions[keyof ITrackerOptions]
  ): void {
    this.$options = merge(this.$options, {
      [key]: value,
    });
  }

  private _on(
    eventName: EventName,
    listener: (...args: any[]) => void,
    withEventName = false
  ) {
    myEmitter.on(eventName, async (...args) => {
      if (withEventName) {
        args.unshift(eventName);
      }

      myEmitter.emit(TrackerEvents._offConsoleTrack);

      await listener(...args);

      myEmitter.emit(TrackerEvents._onConsoleTrack);
    });

    return this;
  }

  on(
    event: EventName | Array<EventName>,
    listener: (...args: any[]) => void
  ): Monitor {
    if (event instanceof Array) {
      event.forEach((eventName) => {
        this._on(eventName, listener, true);
      });

      return this;
    }

    return this._on(event, listener);
  }

  once(event: EventName, listener: (...args: any[]) => void): Monitor {
    myEmitter.once(event, listener);

    return this;
  }

  off(event: EventName, listener: (...args: any[]) => void): Monitor {
    myEmitter.off(event, listener);

    return this;
  }

  removeAllListeners(event?: EventName | undefined): Monitor {
    myEmitter.removeAllListeners(event);

    return this;
  }

  emit(event: EventName, ...args: any[]): boolean {
    return myEmitter.emitWithGlobalData(event, ...args);
  }
}
