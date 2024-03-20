import { Uri } from 'vscode';

export interface ResultInfo {
  indexWidth: number;
  fileUri: Uri;
}
export interface CurrentFilterData {
  resultInfos: ResultInfo[];
  emptyResult: boolean;   // 结果是否为空
}

export interface LineRes {
  index: string;    // 行号
  text: string;     // 行内容
}

export interface InitialRes {
  name: string;
  fileUri: Uri;
  matchs: LineRes[];
  indexWidth: number;
}