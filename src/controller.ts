import * as vscode from 'vscode';
import * as cellprovider from './languages/cellprovider';
import { findHeader } from './common';

function output(execution: vscode.NotebookCellExecution, items: any[]) {
    execution.replaceOutput([new vscode.NotebookCellOutput(items)]);
}


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

        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const code = getCode(cell);
            const result: string[] = await provider.eval(code);
            // eslint-disable-next-line prefer-const
            let text = asHtml(result);
            /*  result.forEach(element => { text+=element; }); */
            output(execution, [
                vscode.NotebookCellOutputItem.json(result)
                , vscode.NotebookCellOutputItem.text(text, 'text/html')
            ]);

            execution.end(true, Date.now());
        } catch (err: any) {
            output(execution, [vscode.NotebookCellOutputItem.json(err)]);
            execution.end(false, Date.now());
        }
    }


}

function getCode(cell: vscode.NotebookCell): string {
    const base = `declare base-uri "${cell.document.fileName}";`;
    const cellText = cell.document.getText();
    const header = findHeader(cell);
    if (header) {
        const hasBase = header.includes('declare base-uri ');
        return (hasBase ? "" : base) + header + cellText;
    } else {
        const hasBase = cellText.includes('declare base-uri ');
        return (hasBase ? "" : base) + cellText; + cellText;
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