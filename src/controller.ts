import * as vscode from 'vscode';
import * as cellprovider from './languages/cellprovider';

import { EvalResult } from './languages/xquery-cell';

function output(execution: vscode.NotebookCellExecution, items: any[]) {
    execution.replaceOutput([new vscode.NotebookCellOutput(items)]);
}
// @todo
const mimeTypes: string[] = [];

export class XQueryKernel {
    private readonly _id = 'quobook-kernel';
    private readonly _label = 'quobook Kernel';
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
        // Setup cancellation handling
        execution.token.onCancellationRequested(() => {
            this._cleanup(execution);
            execution.end(false, Date.now());
        });

        const provider = cellprovider.getProvider(lang);
        let result: string[];
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const code = provider.getCode(cell);
            const result: EvalResult = await provider.eval(code);
            if(execution.token.isCancellationRequested) return; 
            
            const mimeType = result.serialization?.replace(/.*media-type=([+/a-z0-9]+).*/, "$1");
            if (mimeType) vscode.window.showInformationMessage("mimeType: " + mimeType);
            // eslint-disable-next-line prefer-const
            let text = asHtml(result.result);
            /*  result.forEach(element => { text+=element; }); */
            // eslint-disable-next-line prefer-const
            let outs = [];

            if (mimeType == "image/svg+xml") outs.push(
                vscode.NotebookCellOutputItem.text(result.result[0], "image/svg+xml")
            );

            outs.push(vscode.NotebookCellOutputItem.text(result.result[0], "text/x-xml"));
            outs.push(vscode.NotebookCellOutputItem.text(text, "text/html"));
            outs.push(
                vscode.NotebookCellOutputItem.json(
                    { "result": result }, 'application/quodatum-basex-renderer')
            );
            outs.push(
                vscode.NotebookCellOutputItem.json(result.result, "application/json")
            );

            output(execution, outs);

            execution.end(true, Date.now());
        } catch (err: any) {
            output(execution, [vscode.NotebookCellOutputItem.error(err)]);
            execution.end(false, Date.now());
        }
    }
    private _cleanup(execution: vscode.NotebookCellExecution): void {
        vscode.window.showInformationMessage("Execution cancelled");
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

import { XQueryContentSerializer } from './serializer';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer('xquery-notebook', new XQueryContentSerializer()),
        vscode.notebooks.createNotebookController(
            'xquery-kernel',
            'xquery-notebook',
            'XQuery Kernel'
        )
    );
}