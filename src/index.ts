import { Monitor } from "./lib/monitor";

import { observer } from "./lib/observer";

export * from "./lib/monitor";
export * from "./lib/ajaxInterceptor";
export * from "./lib/fetchInterceptor";
export * from "./lib/errorObserver";
export * from "./lib/performance";
export * from "./types/index";

export default Monitor;

const monitor = Monitor.init({
  report: {
    watch: true,
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
