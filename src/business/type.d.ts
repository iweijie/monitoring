export type StoreMapsType = {
  [key in string]: Array<any>;
};

export type FormatReqSuccessDataType = {
  count: number;
  // 取前5个 且大于 2s
  max: string;
  avg: number;
  segment: {
    [key in string]: number;
  };
};

export type FormatReqSuccessType = {
  [key in string]: FormatReqSuccessDataType;
};
