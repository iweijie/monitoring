import { TrackerEvents, reportMergeKey } from "../types/index";
import { Monitor } from "../lib/monitor";
import { observer } from "../lib/observer";
import { RequestSuccessStore } from "./store";
import { getURLPathname } from "./utils";

const requestSuccessStore = new RequestSuccessStore();

export const handle = (params: any[]): void => {
  console.log(params);
  const type: TrackerEvents = params[0];
  const data: any = params[1];

  // 请求完结
  if (type === TrackerEvents.reqEnd) {
    requestSuccessStore.add(getURLPathname(data?.requestUrl), data?.duration);
    const s = requestSuccessStore.getAll();

    if (s) {
      observer.preEmit("monitor", [reportMergeKey.reqStatistics, s]);
    }
    return;
  }

  // if(){

  // }

  observer.preEmit("monitor", params);
};
