
import { NotebookCell, NotebookCellKind } from 'vscode';

//   1st XQuery cell before with special marker
export function findHeader(cell: NotebookCell): string | undefined {
    let ci = cell.index;
    let header: string | undefined;
    do {
        const c = cell.notebook.cellAt(ci--);
        header = getHeader(c);
        if (header) return header;
    }

    while (ci > 0);
}
// text of cell if "header" else undefined 
function getHeader(cell: NotebookCell): string | undefined {
    if (NotebookCellKind.Code === cell.kind
        && "xquery" === cell.document.languageId) {
        const line = cell.document.lineAt(0).text;
        if (line.startsWith("(:<:)")) return cell.document.getText();
    }
}