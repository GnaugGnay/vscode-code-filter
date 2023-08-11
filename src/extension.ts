import { window, commands, ExtensionContext, TextEditor, languages, OutputChannel } from 'vscode';

import { provideDocumentLinks, showFilteredDoc } from './utils/index';

// 初始化输出面板
const channel = window.createOutputChannel('Code Filter', 'code_filter_unique_id');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	console.log('Congratulations, your extension "code-filter" is now active!');

	// Filter弹窗以及结果显示
	const disposable = commands.registerTextEditorCommand('code-filter.simpleFilter', async (textEditor: TextEditor) => {

		// 输入框弹窗
		const result = await window.showInputBox({
			value: '',
			placeHolder: 'Input your text to filter.'
		});

		if (result && result != '') {
			// 显示结果
			showFilteredDoc(channel, textEditor.document, result);
		}
	});

	// 对上面的Output的结果做路径寻回
	const documentLinkProviderDisposable = languages.registerDocumentLinkProvider(
		{ language: 'code_filter_unique_id' },
		{ provideDocumentLinks: provideDocumentLinks }
	)

	context.subscriptions.push(disposable);
	context.subscriptions.push(documentLinkProviderDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	channel != null && channel.dispose();
}
