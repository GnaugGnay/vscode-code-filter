import { DocumentLink, OutputChannel, Position, Range, TextDocument, window } from 'vscode';

import CurrentFilter from './CurrentFilter';
import { FilterRes } from '../types';

/**
 * @param channel output面板
 * @param currentDoc 当前正在激活的文档
 * @param key 用户输入的过滤字符串
 */
export function showFilteredDoc(channel: OutputChannel, currentDoc: TextDocument, key: string): void {
  // 1. 先构造初步结果
  let res: FilterRes[] = [];
  for (let i = 0; i < currentDoc.lineCount; i++) {
    const lineText = currentDoc.lineAt(i).text;

    if (lineText.includes(key)) {
      res.push({
        index: i + 1 + '',
        text: lineText.trim()
      });
    }
  }

  // 2. 根据上一步骤结果显示信息
  channel.clear();

  if (res.length == 0) {
    channel.append('No matched lines found.');

    CurrentFilter.set({
      emptyResult: true
    });
  } else {
    // 把行序号对齐
    const lastLine = [...res].pop() as FilterRes;
    const indexWidth = lastLine.index.length;

    // 以`${序号} ${实际文本}`的形式输出至OutputChannel
    const strArr: string[] = res.map(el => {
      return `${el.index.padStart(indexWidth, ' ')} ${el.text}`;
    });

    // 记录当前的一些信息，供provideDocumentLinks使用
    CurrentFilter.set({
      fileUri: currentDoc.uri,
      indexWidth: indexWidth,
      emptyResult: false
    });

    channel.append(strArr.join('\n'));
  }

  channel.show();
}

/**
 * 给输出面板的行序号提供文件定位寻回功能
 */
export function provideDocumentLinks(doc: TextDocument) {
  const { emptyResult, fileUri, indexWidth } = CurrentFilter.get();

  if (emptyResult || fileUri == null) {
    return [];
  }

  let res = [];

  for (let i = 0; i < doc.lineCount; i++) {
    // range代表可以点击的范围，仅使前面序号可以点击
    const start = new Position(i, 0);
    const end = new Position(i, indexWidth);
    const range = new Range(start, end);

    // 计算该行在源文件的实际行数，参考showFilteredDoc中的输出格式
    const lineText = doc.lineAt(i).text;
    const linNum = lineText.trim().split(' ')[0];

    // 文件寻回地址, “L10,0”代表跳到该文件第10行，0列
    const jumpUri = fileUri.with({ fragment: `L${linNum},0` });

    res.push(new DocumentLink(range, jumpUri));
  }

  return res;
}