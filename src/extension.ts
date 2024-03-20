import { window, commands, ExtensionContext, TextEditor, languages, OutputChannel, workspace, TabInputText, Uri } from 'vscode';

import { COMMANDS, LANGUAGE } from './utils/constants';
import { provideDocumentLinks, showQuickPick, showResult } from './utils/index';

let channel: null | OutputChannel = null;			// 结果输出面板

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// 初始化输出面板
	channel = window.createOutputChannel('Code Filter', LANGUAGE);

	// 对当前active的页面进行过滤
	const simpleFilterComand = commands.registerTextEditorCommand(COMMANDS.SIMPLE_FILETER, async (textEditor: TextEditor) => {
		if (textEditor.document.languageId == LANGUAGE) return;		// 避免套娃使用

		const result = await showQuickPick(context);							// 用户输入

		if (!result || result == '' || channel == null) return;

		showResult(channel, [textEditor.document], result);
	});

	// 对所有打开了的tab页面进行过滤
	const openedDocFilterCommand = commands.registerCommand(COMMANDS.OPENED_DOC_FILTER, async () => {
		const result = await showQuickPick(context);							// 用户输入

		if (!result || result == '' || channel == null) return;

		// 获取所有tab的文件uri
		let tabUris: Uri[] = [];
		window.tabGroups.all.forEach(group => {
			group.tabs.forEach(tab => {
				if (tab.input instanceof TabInputText) {
					tabUris.push(tab.input.uri);
				}
			});
		});
		const docs = await Promise.all(tabUris.map(tab => {
			return workspace.openTextDocument(tab);
		}));

		showResult(channel, docs, result);
	});

	// 对上面的Output的结果做路径寻回
	const documentLinkProviderDisposable = languages.registerDocumentLinkProvider(
		{ language: LANGUAGE },
		{ provideDocumentLinks: provideDocumentLinks }
	)

	context.subscriptions.push(simpleFilterComand);
	context.subscriptions.push(openedDocFilterCommand);
	context.subscriptions.push(documentLinkProviderDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	channel != null && channel.dispose();
}
