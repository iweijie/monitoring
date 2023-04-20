import ErrorStackParser from "error-stack-parser";
import { jsonStringifySafe as stringify } from "../lib/util";
import { Monitor } from "../lib/monitor";
import type { IHttpOptions } from "../lib/monitor";
import { observer } from "./observer";
import { reportMergeKey } from "../types/index";
import { handle } from "./handle";

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

  // 切换模式
  // observer.on("changeMode", (mode: string) => {
  //   console.log(mode);
  // });
  // 设置参数
  observer.on("option", (options: IHttpOptions["ignoreRules"]) => {
    monitor.setIgnoreRules(options);
  });

  // 设置参数
  observer.on("error", (error: Error) => {
    const stackTrace =
      error instanceof Error ? ErrorStackParser.parse(error) : [];
    const errorObj = {
      msg: error.message || "",
      stackTrace: stackTrace,
    };
    observer.preEmit("monitor", [reportMergeKey.monitorCustomError, errorObj]);
  });

  monitor.on("event", (...res) => {
    handle(res);
  });
} catch (error) {
  const stackTrace =
    error instanceof Error ? ErrorStackParser.parse(error) : [];
  const errorObj = {
    msg: error instanceof Error ? error.message : "",
    stackTrace: stringify(stackTrace),
    errorType: "monitor-load-error",
  };

  observer.preEmit("monitor", [reportMergeKey.monitorLoadError, errorObj]);
}
