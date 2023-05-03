import * as vscode from 'vscode';
import * as basex from 'basex';
import util = require('util');
import  * as cellprovider from './languages/cellprovider';



export class XQueryKernel {
    private readonly _id = 'quodatum-notebook-serializer-kernel';
    private readonly _label = 'XQuery Notebook Kernel';
    private readonly _supportedLanguages =cellprovider.languages();

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
        const provider=cellprovider.getProvider(lang);
       
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const code = cell.document.getText();
            const result = await provider.eval(code);
               execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(result)
            ])]);

            execution.end(true, Date.now());
        } catch (err) {
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(err)
            ])]);
            execution.end(false, Date.now());
        }
    }

  
}
