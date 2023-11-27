import * as vscode from 'vscode';
import * as basex from 'basex';

import * as cellprovider from './languages/cellprovider';

function output(execution: vscode.NotebookCellExecution, items: any[]) {
    execution.replaceOutput([new vscode.NotebookCellOutput(items)]);
}


export class XQueryKernel {
    private readonly _id = 'quodatum-notebook-serializer-kernel';
    private readonly _label = 'XQuery Notebook Kernel';
    private readonly _supportedLanguages = cellprovider.languages();

    private _executionOrder = 0;
    private readonly _controller: vscode.NotebookController;

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
        const provider = cellprovider.getProvider(lang);

        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const code = cell.document.getText();
            const first = cell.notebook.getCells()[0];
           /*  if (cell.index !== first.index) {
                // prepend 1st
                code = first.document.getText() + code ;
            } */
            const result :string[] = await provider.eval(code);
            // eslint-disable-next-line prefer-const
            let text=`<style>
            .s1 {
                background-color: antiquewhite;
                margin-bottom: 20px; 
              }
                      </style>
            <div><h4>${ result.length } items</h4>`;
            result.forEach(r=>{text+=formatResult(r);});
            text+="</div>";
           /*  result.forEach(element => { text+=element; }); */
            output(execution, [
                vscode.NotebookCellOutputItem.text(text, 'text/html'),
                vscode.NotebookCellOutputItem.json(result)]);

            execution.end(true, Date.now());
        } catch (err: any) {
            output(execution, [vscode.NotebookCellOutputItem.json(err)]);
            execution.end(false, Date.now());
        }
    }
    

}
function formatResult(item: string ):string{
    return `<div class="s1">${ htmlEntities(item) }</div>`;
}

function htmlEntities(str:string):string {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}