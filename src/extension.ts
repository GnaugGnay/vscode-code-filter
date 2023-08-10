import { window, commands, workspace, ExtensionContext } from 'vscode';

import { showFilteredDoc } from './utils';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-filter" is now active!');

	let disposable = commands.registerCommand('code-filter.simpleFilter', async () => {

		const result = await window.showInputBox({
			value: '',
			placeHolder: 'Input your text to filter.'
		});

		// start filter
		if (result && result != '' && window.activeTextEditor != undefined) {
			showFilteredDoc(window.activeTextEditor.document, result);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
