import { ITrackerOptions } from "./monitor";
import {
  TrackerEvents,
  IReqEndRes,
  ErrorType,
  IHttpReqErrorRes,
} from "../types/index";
import { myEmitter } from "./event";
import { BaseObserver } from "./baseErrorObserver";

export interface IFetchReqStartRes {
  url: string;
  options: any;
  context?: any;
}

export class FetchInterceptor extends BaseObserver {
  public _options;

  constructor(options: ITrackerOptions) {
    super(options);
    this._options = options;
  }

  init(): void {
    const self = this;
    const originFetch = fetch;

    // fetch(input: RequestInfo, init?: RequestInit | undefined): Promise<Response>
    window.fetch = function (
      url: RequestInfo,
      options?: RequestInit | undefined
    ) {
      options = options || {};
      // debugger;
      const reqUrl = url instanceof Request ? url.url : url;
      const method = options.method || "get";
      const data = options.body;

      let isUrlInIgnoreList = false;
      if (typeof url === "string") {
        isUrlInIgnoreList = self.isUrlInIgnoreList(url);
      }

      const startTime: number = Date.now();

      const reqStartRes: IFetchReqStartRes = {
        url: reqUrl,
        options,
      };

      if (!isUrlInIgnoreList) {
        myEmitter.emitWithGlobalData(TrackerEvents.reqStart, reqStartRes);
      }

      return originFetch(url, options)
        .then((res: Response) => {
          const status = res.status;
          const reqEndRes: IReqEndRes = {
            requestUrl: res.url,
            requestMethod: method,
            requestData: data,
            response: res,
            duration: Date.now() - startTime,
            context: this,
            status,
          };

          const errorType = ErrorType.httpRequestError;

          const reqErrorRes: IHttpReqErrorRes = {
            requestMethod: method,
            requestUrl: reqUrl,
            requestData: data,
            errorMsg: res.statusText,
            errorType,
          };

          if (!isUrlInIgnoreList) {
            if (status >= 200 && status < 300) {
              myEmitter.emitWithGlobalData(TrackerEvents.reqEnd, reqEndRes);
            } else {
              self.safeEmitError(
                `${errorType}: ${reqUrl}`,
                TrackerEvents.reqError,
                reqErrorRes
              );
            }
          }

          return res;
        })
        .catch((e: Error) => {
          const errorType = ErrorType.httpRequestError;
          const reqErrorRes: IHttpReqErrorRes = {
            requestMethod: method,
            requestUrl: reqUrl,
            requestData: data,
            errorMsg: e.message,
            errorType,
          };
          if (!isUrlInIgnoreList) {
            self.safeEmitError(
              `${errorType}: ${reqUrl}`,
              TrackerEvents.reqError,
              reqErrorRes
            );
          }

          throw e;
        });
    };

    // Object.defineProperty(window, "fetch", {
    //   configurable: true,
    //   enumerable: true,
    //   value:
    // });
  }
}
