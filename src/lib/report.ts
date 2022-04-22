import { ITrackerOptions } from "./monitor";
import { myEmitter } from "./event";
import { TrackerEvents } from "../types";

export interface IClickBehavior {
  type: "click";
  eleClass: string;
  screenX: number;
  screenY: number;
  target: HTMLElement;
  data: any;
}

export class ReportObserver {
  private _options;

  constructor(options: ITrackerOptions) {
    this._options = options;
  }

  init(): void {
    this.listenClickEvent();
  }

  private _reportClickHandler(e: MouseEvent) {
    const { report } = this._options;
    let node = e.target as HTMLElement | null;
    if (!report?.listenAttr) return;
    while (node) {
      const d = node.getAttribute(report.listenAttr);
      if (d) {
        break;
      }
      node = node.parentElement;
    }

    if (node) {
      let data;
      try {
        data = JSON.parse(node.getAttribute(report.listenAttr) || "");
      } catch (err) {
        // ----
      }
      const eleClass = node.className;
      const clickBehavior: IClickBehavior = {
        type: "click",
        eleClass,
        screenX: e.screenX,
        screenY: e.screenY,
        target: node,
        data,
      };
      myEmitter.emitWithGlobalData(TrackerEvents.reportClick, clickBehavior);
    }
  }

  listenClickEvent() {
    window.addEventListener(
      "click",
      this._reportClickHandler.bind(this),
      false
    );
  }
}
