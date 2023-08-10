import { TextDocument, window } from 'vscode';

const channel = window.createOutputChannel('Code Filter');

/**
 * @param currentDoc current active document
 * @param key filter string
 */
export function showFilteredDoc(currentDoc: TextDocument, key: string): void {
  // 1. get lines according to enter string
  let res: FilterRes[] = [];
  for (let i = 0; i < currentDoc.lineCount; i++) {
    const lineText = currentDoc.lineAt(i).text;

    if (lineText.includes(key)) {
      res.push({
        line: i + 1 + '',
        text: lineText.trim()
      });
    }
  }

  // 2. show result
  channel.clear();

  if (res.length == 0) {
    channel.append('No matched lines found.');
  } else {
    // adjust line numbers to same column
    const lastLine = [...res].pop() as FilterRes;
    const lineNum = lastLine.line.length;
    const strArr: string[] = res.map(el => {
      return `${el.line.padStart(lineNum, ' ')} ${el.text}`;
    });

    channel.append(strArr.join('\n'));
  }

  channel.show();
}