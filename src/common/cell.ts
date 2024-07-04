
import { NotebookCell, NotebookCellKind, Position } from 'vscode';

//   1st previous XQuery cell before with special marker
export function findHeader(cell: NotebookCell): string | undefined {
    let ci = cell.index;
    let header: string | undefined;
    while (ci>0) {
        const c = cell.notebook.cellAt(--ci);
        header = getHeader(c);
        if (header) return header;
    }
}
// text of cell if "header" else undefined 
export function getHeader(cell: NotebookCell): string | undefined {
    if (NotebookCellKind.Code === cell.kind
        && "xquery" === cell.document.languageId) {
        const line = cell.document.lineAt(0).text;
        if (line.startsWith("(:<:)")) return cell.document.getText();
    }
}