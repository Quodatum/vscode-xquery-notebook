import * as basex from '@quodatum/basex';
import * as vscode from 'vscode';
import { CellProvider } from './cellprovider';
import { Configuration } from '../common';
import { NotebookCell, NotebookCellKind} from 'vscode';
export type EvalResult = {
    serialization: string;
    result: string[]
}

export class XQueryCell implements CellProvider {
    private connected = false;
    private session: basex.Session | undefined;
    public mimeType: string | undefined;
    async eval(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let query: basex.Query | undefined;
            try {
                if (!this.connected) {
                    this.session = newSession();
                    this.connected = true;
                    this.session.on("socketError",
                        (e: any) => {
                            this.connected = false;
                            const msg = e.errors[0];
                            vscode.window.showInformationMessage("BaseX socket error: " + msg);
                            reject({ message: msg });
                        }
                    );
                }
                if (!this.session) reject("no sess");
                query = this.session?.query(code);

                query?.results(function (err: any, reply: any) {
                    if (err) return reject({ message: err});
                    const result = reply.result;
                    query?.options(function (err: any, reply: any) {
                        if (err) return reject({ message: err});
                        const serialization = reply.result;
                       
                        resolve({
                            serialization: serialization,
                            result: result
                        });

                        query?.close();
                    });
                });



            } catch (err) {
                reject(err);
            } finally {
                // query?.close();
            }
        });
    }
    getCode(cell: vscode.NotebookCell): string {
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
}

function newSession(): basex.Session {
    return new basex.Session(
        Configuration.hostname, Configuration.port,
        Configuration.user, Configuration.password
    );
}

const qresult = (query: { results: (arg0: (err: any, data: any) => void) => void; }) => {
    return new Promise((resolve, reject) => {
        query.results((err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
const qoptions = (query: { option: (arg0: (err: any, data: any) => void) => void; }) => {
    return new Promise((resolve, reject) => {
        query.option((err: any, data: unknown) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
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