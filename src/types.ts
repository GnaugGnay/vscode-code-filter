import { Uri } from 'vscode';

export interface CurrentFilterData {
  fileUri: Uri | null;    // 当前过滤的文件
  indexWidth: number;     // 结果的行序号一共有几位
  emptyResult: boolean;   // 结果是否为空
}

export interface FilterRes {
  index: string;    // 行号
  text: string;     // 行内容
}