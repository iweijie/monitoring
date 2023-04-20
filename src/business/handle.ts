import { TrackerEvents, reportMergeKey } from "../types/index";
import { observer } from "./observer";
import {
  RequestSuccessStore,
  RequestErrorStore,
  SourceErrorStore,
} from "./store";
import { getURLPathname, getURLQuery } from "../lib/util";
import { handleFormatReqSuccess } from "./format";

const requestSuccessStore = new RequestSuccessStore();

requestSuccessStore.subscribe((data) => {
  observer.preEmit("monitor", [
    reportMergeKey.reqSucStatistics,
    handleFormatReqSuccess(data),
  ]);
});

const requestErrorStore = new RequestErrorStore();

requestErrorStore.subscribe((data) => {
  observer.preEmit("monitor", [reportMergeKey.reqErrorStatistics, data]);
});

const sourceErrorStore = new SourceErrorStore();

sourceErrorStore.subscribe((data) => {
  observer.preEmit("monitor", [reportMergeKey.sourceErrorStatistics, data]);
});

export const handle = (params: any[]): void => {
  const type: TrackerEvents = params[0];
  const data: any = params[1];

  // 请求完结
  if (type === TrackerEvents.reqEnd) {
    requestSuccessStore.add(getURLPathname(data?.requestUrl), data?.duration);
  }
  // 请求失败完结
  if (type === TrackerEvents.reqError) {
    const d = {
      s: data?.status,
      p:
        (data?.requestMethod || "").toUpperCase === "GET"
          ? getURLQuery(data?.requestUrl)
          : data.requestData,
    };

    requestErrorStore.add(getURLPathname(data?.requestUrl), d);
  }

  // 资源加载错误统计
  if (type === TrackerEvents.resourceError) {
    requestErrorStore.add(getURLPathname(data?.url), data?.url);
  }

  observer.preEmit("monitor", params);
};
