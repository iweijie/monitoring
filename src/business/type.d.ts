export type StoreMapsType = {
  [key in string]: Array<any>;
};

// export type FormatReqSuccessDataType = {
//   // 当前记录的数量
//   count: number;
//   // 且大于 设定的值（默认2s）
//   max: string;
//   // 平局值
//   avg: number;
//   // 分区记录值
//   segment: {
//     [key in string]: number;
//   };
// };


export type FormatReqSuccessType = {
  /**
   * 以分号（;）分割：count;avg;segment;max
   * 
   * count: number; 前记录的数量
   * avg: number;  平局值
   * segment: [key in string]: number; (逗号分割);  分区记录值
   * max: string; 且大于 设定的值（默认2s）
   */
  [key in string]: string;
};
