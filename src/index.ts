import ErrorStackParser from "error-stack-parser";

import { jsonStringifySafe as stringify } from "./lib/util";

import { observer } from "./lib/observer";

import { Monitor } from "./lib/monitor";

export default Monitor;

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
    performance: true,
    isSpa: true,
  });

  if (window) {
    window.DJObserver = observer;
    window.DJMonitor = Monitor;
  }

  monitor.on("event", (...res) => {
    observer.preEmit("monitor", res);
  });
} catch (error) {
  const stackTrace =
    error instanceof Error ? ErrorStackParser.parse(error) : [];
  const errorObj = {
    msg: "monitor加载失败",
    url: "",
    line: "",
    column: "",
    stackTrace: stringify(stackTrace),
    errorType: "monitor-load-error",
  };

  observer.preEmit("monitor", errorObj);
}
