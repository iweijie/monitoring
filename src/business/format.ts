import type { StoreMapsType, FormatReqSuccessType } from "./type";

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
  e = Number.MAX_SAFE_INTEGER,
}

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
        const c = [
          d.length,
          Math.round((d.reduce((a, b) => a + b) / d.length) * 100) / 100,
          "",
          "",
        ];

        const segment: any = {};

        d = d.sort((a, b) => a - b);

        const largeIndex = d.findIndex((c) => c > TimeRange.d);

        if (largeIndex >= 0) {
          c[2] = d.slice(largeIndex, d.length).join(",");
        }

        d.forEach((v) => {
          const time = getTimeRange(v);
          if (segment[time] === undefined) {
            segment[time] = 0;
          }
          segment[time] += 1;
        });

        if (Object.keys(segment)?.length) {
          c[3] = JSON.stringify(segment);
        }

        s[key] = c.join(";");
      }
    }
  } catch (err) {
    console.log(err);
    // TODO: 是否需要上报？？
  }

  return s;
};
