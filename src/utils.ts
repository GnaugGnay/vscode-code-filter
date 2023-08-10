import { TextDocument, window } from 'vscode';

const channel = window.createOutputChannel('Code Filter');

/**
 * @param currentDoc current active document
 * @param key filter string
 */
export function showFilteredDoc(currentDoc: TextDocument, key: string): void {
  // 1. build regExp
  const reg = new RegExp(key, 'g');

  // 2. get lines according to enter string
  let res = [];
  for (let i = 0; i < currentDoc.lineCount; i++) {
    const lineText = currentDoc.lineAt(i).text;
    reg.test(lineText) && res.push(`${i + 1}. ${lineText.trim()}`);
  }

  // 3. show result
  if (!res.length) {
    res.push('No matched lines found.');
  }

  channel.clear();
  channel.append(res.join('\n'));
  channel.show();
}