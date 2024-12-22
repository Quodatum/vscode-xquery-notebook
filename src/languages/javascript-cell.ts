import { NotebookCell } from 'vscode';
import { CellProvider } from './cellprovider';

export class JavascriptCell implements CellProvider {
    mimeType:string | undefined;
    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const result = eval?.(`"use strict";${code}`);

                return resolve({ "result": [JSON.stringify(result)] });
            } catch (err: any) {
                reject({ 'message': err.message });
            }
        });
    }
    getCode(cell: NotebookCell): string {
        const cellText = cell.document.getText();
        return `"use strict";${cellText}`;
    }
}