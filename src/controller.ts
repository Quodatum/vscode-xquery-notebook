import * as vscode from 'vscode';
import * as basex from 'basex';

export class XQueryKernel {
	private readonly _id = 'quodatum-notebook-serializer-kernel';
	private readonly _label = 'XQuery Notebook Kernel';
	private readonly _supportedLanguages = ['javascript', 'xquery'];

	private _executionOrder = 0;
	private readonly _controller: vscode.NotebookController;
	private basexConnected = false;
	private client: any;

	constructor() {

		this._controller = vscode.notebooks.createNotebookController(this._id,
			'quodatum-notebook-serializer',
			this._label);

		this._controller.supportedLanguages = this._supportedLanguages;
		this._controller.supportsExecutionOrder = true;
		this._controller.executeHandler = this._executeAll.bind(this);
	}

	dispose(): void {
		this._controller.dispose();
	}

	private _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): void {
		for (const cell of cells) {
			this._doExecution(cell);
		}
	}

	private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
		const execution = this._controller.createNotebookCellExecution(cell);
		const lang = cell.document.languageId;
		if (lang == "xquery" && !this.basexConnected) {
			this.basexConnected = true;
			this.client = new basex.Session("localhost", 1984, "admin", "admin");
		}
		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now());

		try {
			const code = cell.document.getText();
			const result = (this as any)[lang](code);
			execution.replaceOutput([new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.json(result)
			])]);

			execution.end(true, Date.now());
		} catch (err) {
			execution.replaceOutput([new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.error(err as Error)
			])]);
			execution.end(false, Date.now());
		}
	}
	private javascript(code: string): string {
		return eval?.(`"use strict";(${code})`);
	}
	private xquery(code: string): string {
		const q=this.client.query(code);
		q.results(this.callback);
		return "@TODO";
	}
	private callback(err :any, reply:any) {
		if (err) {
			console.log("Error: " + err);
		} else {
			console.dir(reply);
		}
	}
}
