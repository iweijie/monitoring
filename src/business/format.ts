import type {
  StoreMapsType,
  FormatReqSuccessType,
  FormatReqSuccessDataType,
} from "./type";

export enum TimeRange {
  /** >= 0 && < 200  */
  a = 200,
  /** >= 200 && < 500  */
  b = 500,
  /** >= 500 && < 1000  */
  c = 1000,
  /** >= 1000 && < 2000  */
  d = 2000,
  /** >= 2000  */
  e = 2000,
}

const MaxLargeCount = 5;

export const getTimeRange = (n: number): TimeRange => {
  if (n < TimeRange.a) return TimeRange.a;
  if (n < TimeRange.b) return TimeRange.b;
  if (n < TimeRange.c) return TimeRange.c;
  if (n < TimeRange.d) return TimeRange.d;
  return TimeRange.e;
};

export const handleFormatReqSuccess = (data: StoreMapsType) => {
  const keys = Object.keys(data);
  const s: FormatReqSuccessType = {};
  try {
    if (keys.length <= 0) return s;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let d = data[key];
      if (d && d.length) {
        const c: FormatReqSuccessDataType = {
          max: "",
          count: 0,
          avg: 0,
          segment: {},
        };
        d = d.sort((a, b) => a - b);

        const largeIndex = d.findIndex((c) => c > 2000);

        if (largeIndex < d.length - MaxLargeCount) {
          // TODO
        }

        c.count = d.length;
        d.forEach((v) => {
          const time = getTimeRange(v);
          if (c.segment[time] === undefined) {
            c.segment[time] = 0;
          }
          c.segment[time] += 1;
        });
      }
    }
  } catch (err) {
    return s;
  }
};
