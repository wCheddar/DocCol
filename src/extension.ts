import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let collapseDocs = vscode.commands.registerCommand('doccol.collapseDocs', () => {
		const docLines = findDocs();
		const docStarts = getStartOfGroups(docLines);
		collapseAll(docStarts, 0);
	});

	let expandDocs = vscode.commands.registerCommand('doccol.expandDocs', () => {
		const docLines = findDocs();
		const docStarts = getStartOfGroups(docLines);
		expandAll(docStarts, 0);
	});

	context.subscriptions.push(collapseDocs);
	context.subscriptions.push(expandDocs);
}

function findDocs(): Array<number> {
	var lineNumbers = Array();
	const textEditor = vscode.window.activeTextEditor;
	if (textEditor !== undefined) {
		for (const lineNumber of Array.from(Array(textEditor.document.lineCount).keys())) {
			const line = textEditor.document.lineAt(lineNumber);

			if (line.text.trimLeft().startsWith("///") || line.text.startsWith("//!")) {
				lineNumbers.push(lineNumber + 1);
			}
		}
	}
	return lineNumbers;
}

function getStartOfGroups(lines: Array<number>): Array<number> {
	var lineNumbers = Array();

	lineNumbers.push(lines[0]);

	for (let i = 0; i < lines.length - 1; i++) {
		let current: number = lines[i];
		let next: number = lines[i + 1];

		if (current + 1 !== next) {
			lineNumbers.push(next);
		}
	}
	return lineNumbers;
}

function collapseAll(lines: Array<number>, index: number) {
	const textEditor = vscode.window.activeTextEditor;
	if (textEditor !== undefined) {
		const lineNumber = lines[index];
		textEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
		vscode.commands.executeCommand('editor.unfold').then(() => {
			vscode.commands.executeCommand('editor.fold').then(() => {
				if (index < lines.length - 1) {
					collapseAll(lines, index + 1);
				}
			});
		});
	}
}

function expandAll(lines: Array<number>, index: number) {
	const textEditor = vscode.window.activeTextEditor;
	if (textEditor !== undefined) {
		const lineNumber = lines[index];
		textEditor.selection = new vscode.Selection(lineNumber, 0, lineNumber, 0);
		vscode.commands.executeCommand('editor.unfold').then(() => {
			if (index < lines.length - 1) {
				expandAll(lines, index + 1);
			}
		});
	}
}

export function deactivate() {}
