import * as vscode from 'vscode';
import * as cellprovider from './languages/cellprovider';
import { findHeader, getHeader } from './common';
import { EvalResult } from './languages/xquery-cell';
function output(execution: vscode.NotebookCellExecution, items: any[]) {
    execution.replaceOutput([new vscode.NotebookCellOutput(items)]);
}
// @todo
const mimeTypes: string[] = [];

export class XQueryKernel {
    private readonly _id = 'quobook-kernel';
    private readonly _label = 'XQuery Notebook Kernel';
    private readonly _supportedLanguages = cellprovider.languages();

    private _executionOrder = 0;
    private readonly _controller: vscode.NotebookController;

    constructor() {

        this._controller = vscode.notebooks.createNotebookController(this._id,
            'quobook',
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
        const provider = cellprovider.getProvider(lang);
        let result: string[];
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const code = getCode(cell);
            let result: EvalResult;
            if (getHeader(cell)) {
                result = {
                    serialization: "system",
                    result: ["This is XQuery header cell. It will be prefixed to following XQuery cells.", code]
                };
            } else {
                result = await provider.eval(code);
            }
            const mimeType = result.serialization.replace(/.*media-type=([+/a-z0-9]+).*/, "$1");
            if (mimeType) vscode.window.showInformationMessage("mimeType: " + mimeType);
            // eslint-disable-next-line prefer-const
            let text = asHtml(result.result);
            /*  result.forEach(element => { text+=element; }); */
            const outs = [
                vscode.NotebookCellOutputItem.text(result.result[0], "image/svg+xml"),
                vscode.NotebookCellOutputItem.text(result.result[0], "text/x-xml"),
                vscode.NotebookCellOutputItem.text(text, "text/html"),
                vscode.NotebookCellOutputItem.json(
                    { "result": result }, 'application/quodatum-basex-renderer'),
                vscode.NotebookCellOutputItem.json(result.result, "application/json")
            ];
            output(execution, outs);

            execution.end(true, Date.now());
        } catch (err: any) {
            output(execution, [vscode.NotebookCellOutputItem.error(err)]);
            execution.end(false, Date.now());
        }
    }
}

// cell with header (if found) and file based uri (if found and unset)
function getCode(cell: vscode.NotebookCell): string {
    const cellText = cell.document.getText();
    const header = findHeader(cell);
    const code = (header ? header : "") + cellText;
    const hasBase = code.includes('declare base-uri ');
    if (hasBase || !cell.document.fileName) {
        return code;
    } else {
        const base = `declare base-uri "${cell.document.fileName}";`;
        return base + code;
    }
}

function formatResult(item: string): string {
    return `<div class="s1">${htmlEntities(item)}</div>`;
}

function htmlEntities(str: string): string {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function asHtml(result: string[]): string {
    let text = `<style>.s1 {
                background-color: seashell;
                margin-bottom: 8px; 
              }</style>
        <div><h4>${result.length} ${result.length === 1 ? ' Result' : 'Results'}</h4>`;
    result.forEach(r => { text += formatResult(r); });
    text += "</div>";
    return text;
}