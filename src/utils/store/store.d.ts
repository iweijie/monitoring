export type Add = (key: string, value: any) => boolean;

export type GetSize = (key: string) => number;

export type GetListAndRemove = (keyOrId: string) => any[];

// export interface IStore {
//   add: add;
//   getSize: getSize;
//   getListAndRemove: getListAndRemove;
// }
