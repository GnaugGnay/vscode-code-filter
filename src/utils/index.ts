import { DocumentLink, ExtensionContext, OutputChannel, Position, QuickPickItem, Range, TextDocument, window, workspace } from 'vscode';

import CurrentFilter from './CurrentFilter';
import { CONFIG, STATE_KET } from './constants';
import { InitialRes, LineRes } from '../types';

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
    };
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
        // 记录新添加的历史项
        const newHistories = [item.label, ...histories]
          .filter((el, i, arr) => arr.indexOf(el) == i)   // 去重
          .slice(0, 5);                                   // 最多保留5项

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
 * 对单个文档进行初步过滤
 */
const getInitialRes = (doc: TextDocument, key: string): InitialRes => {
  let matchs: LineRes[] = [];
  let indexWidth = 0;

  for (let i = 0; i < doc.lineCount; i++) {
    const lineText = doc.lineAt(i).text;

    if (lineText.includes(key)) {
      matchs.push({
        index: i + 1 + '',
        text: lineText.trim()
      });
    }
  }

  if (matchs.length) {
    const lastLine = [...matchs].pop() as LineRes;
    indexWidth = lastLine.index.length;
  }

  return {
    name: doc.fileName,
    fileUri: doc.uri,
    matchs,
    indexWidth
  }
}

const showChannel = (channel: OutputChannel, cotent: string) => {
  channel.clear();
  channel.append(cotent);
  channel.show();
}

/**
 * @param channel output面板
 * @param docs 需要检索的文档
 * @param key 用户输入的过滤字符串
 */
export function showResult(channel: OutputChannel, docs: TextDocument[], key: string) {
  let res: InitialRes[] = docs.map(doc => getInitialRes(doc, key));

  res = res.filter(el => el.matchs.length);

  // 空结果，返回提示
  if (res.length == 0) {
    CurrentFilter.set({ emptyResult: true, resultInfos: [] });

    showChannel(channel, 'No matched lines found.');
    return;
  }

  // 获取用户配置，是否显示纯净的过滤结果
  const pureResult = workspace.getConfiguration().get(CONFIG.pureResult);
  if (pureResult === true) {
    CurrentFilter.set({ emptyResult: false, resultInfos: [] });

    let content: string[] = [];

    res.forEach(el => {
      el.matchs.forEach(match => {
        content.push(match.text);
      });
    });

    showChannel(channel, content.join('\n'));
    return;
  }

  let content: string[] = [];

  res.forEach(el => {
    const { name, indexWidth, matchs } = el;
    
    content.push(name);

    matchs.forEach(match => {
      content.push(`${match.index.padStart(indexWidth, ' ')} ${match.text}`);
    });

    content.push('');   // 两个文件的搜索结果之间加个空行
  });

  CurrentFilter.set({ 
    emptyResult: false, 
    resultInfos: res.map(el => {
      return {
        fileUri: el.fileUri,
        indexWidth: el.indexWidth
      }
    })
  });

  showChannel(channel, content.join('\n'));
}

/**
 * 给输出面板的行序号提供文件定位寻回功能
 */
export function provideDocumentLinks(doc: TextDocument) {
  const { emptyResult, resultInfos } = CurrentFilter.get();

  if (emptyResult || !resultInfos.length) {
    return [];
  }

  let j = -1;       // 记录当前是第几个文件
  let res: DocumentLink[] = [];

  for (let i = 0; i < doc.lineCount; i++) {
    // 计算该行在源文件的实际行数，参考showFilteredDoc中的输出格式
    const lineText = doc.lineAt(i).text;
    const linNum = lineText.trim().split(' ')[0];

    // 到下一个文件的结果
    if (isNaN(Number(linNum))) {
      j += 1;
      continue;
    }

    const { indexWidth, fileUri } = resultInfos[j];
    // range代表可以点击的范围，仅使前面序号可以点击
    const start = new Position(i, 0);
    const end = new Position(i, indexWidth);
    const range = new Range(start, end);

    // 文件寻回地址, “L10,0”代表跳到该文件第10行，0列
    const jumpUri = fileUri.with({ fragment: `L${linNum},0` });

    res.push(new DocumentLink(range, jumpUri));
  }

  return res;
}