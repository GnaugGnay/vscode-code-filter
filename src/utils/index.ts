import { DocumentLink, ExtensionContext, OutputChannel, Position, QuickPickItem, Range, TextDocument, window } from 'vscode';

import CurrentFilter from './CurrentFilter';
import { STATE_KET } from './constants';
import { FilterRes } from '../types';

/**
 * 显示一个选择框给用户
 * @param context 扩展的上下文，主要用到里面的全局存储对象
 */
export function showQuickPick(context: ExtensionContext) {
  // 先获取历史搜索的项，并构建成选择框要的结构
  const histories: string[] = context.globalState.get(STATE_KET) || [];
  const historyItems: QuickPickItem[] = histories.map(el => {
    return {
      label: el,
      alwaysShow: true,
      description: 'History'
    }
  });

  return new Promise<string>((resolve, _reject) => {
    // 初始化选择框
    const qp = window.createQuickPick();
		qp.placeholder = 'Input or select a text to start filter';
		qp.items = historyItems;

    // 选择框输入的文本变化
		qp.onDidChangeValue(text => {
			let items = [...historyItems];
			text != '' &&	items.unshift({ label: text });

			qp.items = items;
		});

    // 用户最终选择了某项
		qp.onDidChangeSelection(selection => {
      const item = selection[0];
      let res = '';
			if (item) {
        // 记录新添加的历史项，最多5项
				const newHistories = [item, ...historyItems].map(el => el.label).slice(0, 5);
				context.globalState.update(STATE_KET, newHistories);

        res = item.label;
			}

      resolve(res);
		});

    // 选择框隐藏时销毁
		qp.onDidHide(qp.dispose);

		qp.show();
  });
}

/**
 * @param channel output面板
 * @param currentDoc 当前正在激活的文档
 * @param key 用户输入的过滤字符串
 */
export function showFilteredDoc(channel: OutputChannel, currentDoc: TextDocument, key: string) {
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