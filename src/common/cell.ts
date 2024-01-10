import { match } from 'assert';
import * as vscode from 'vscode';
import { NotebookCell, NotebookCellKind } from 'vscode';

//   1st XQuery cell with special marker
export function prologCell(cell: NotebookCell) :string {
    for (const c of cell.notebook.getCells()) {
        if (c.index !== cell.index
            && NotebookCellKind.Code === c.kind
            && "xquery" === c.document.languageId) {
            const line=  c.document.lineAt(0).text;
            if(line.startsWith("(:<:)"))  return c.document.getText();
        }
    }
    return "";
}