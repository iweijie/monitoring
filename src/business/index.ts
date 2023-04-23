import { Monitor } from "../lib/monitor";
import type { IHttpOptions } from "../lib/monitor";
import { observer } from "./observer";
import { reportMergeKey } from "../types/index";
import { handle, parseError } from "./handle";

/** 防止 monitor 错误导致主程序挂掉 */
try {
  const monitor = Monitor.init({
    report: {
      watch: true,
    },
    http: {
      fetch: true,
      ajax: true,
      ignoreRules: [],
    },
    error: {
      repeat: 3,
    },
    performance: true,
    isSpa: true,
  });

  if (window) {
    window.MonitorObserver = observer;
    window.Monitor = Monitor;
    window.MonitorInstance = monitor;
  }

  // 设置参数
  observer.on("ignoreRules", (options: IHttpOptions["ignoreRules"]) => {
    monitor.setIgnoreRules(options);
  });

  // 设置参数
  observer.on("error", (error: Error) => {
    observer.preEmit("monitor", [
      reportMergeKey.monitorCustomError,
      parseError(error),
    ]);
  });

  monitor.on("event", (...res) => {
    handle(res);
  });
} catch (error) {
  observer.preEmit("monitor", [
    reportMergeKey.monitorLoadError,
    parseError(error),
  ]);
}
