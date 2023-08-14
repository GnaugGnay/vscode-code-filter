import { window, commands, ExtensionContext, TextEditor, languages, OutputChannel } from 'vscode';

import { provideDocumentLinks, showFilteredDoc } from './utils/index';

const COMMAND = 'code-filter.simpleFilter';
const LANGUAGE = 'code_filter_unique_id';

let channel: null | OutputChannel = null;			// 结果输出面板

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// 初始化输出面板
	channel = window.createOutputChannel('Code Filter', LANGUAGE);

	// Filter弹窗以及结果显示
	const commandDisposable = commands.registerTextEditorCommand(COMMAND, async (textEditor: TextEditor) => {

		// 输入框弹窗
		const result = await window.showInputBox({
			value: '',
			placeHolder: 'Input your text to filter.'
		});

		if (result && result != '' && channel != null) {
			// 显示结果
			showFilteredDoc(channel, textEditor.document, result);
		}
	});

	// 对上面的Output的结果做路径寻回
	const documentLinkProviderDisposable = languages.registerDocumentLinkProvider(
		{ language: LANGUAGE },
		{ provideDocumentLinks: provideDocumentLinks }
	)

	context.subscriptions.push(commandDisposable);
	context.subscriptions.push(documentLinkProviderDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	channel != null && channel.dispose();
}
