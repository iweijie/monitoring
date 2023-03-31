import ErrorStackParser from "error-stack-parser";

import { jsonStringifySafe as stringify } from "../lib/util";

import { Monitor } from "../lib/monitor";

import { observer } from "../lib/observer";

const handle = (params: any[]): void => {
  observer.preEmit("monitor", params);
};

const handleChangeMode = (type: string): void => {
  console.log(type);
};

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
  observer.on("changeMode", (mode: string) => {
    console.log(mode);
  });

  monitor.on("event", (...res) => {
    console.debug(res);
    handle(res);
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
