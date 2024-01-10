/* eslint-disable @typescript-eslint/no-namespace */
import * as vscode from 'vscode';
import { Configuration } from './common';
import { commandNames, NOTEBOOK_TYPE } from './constants';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(create());
    context.subscriptions.push(connectionLoad());
    context.subscriptions.push(connectionSave());
}

function create() {
    return vscode.commands.registerCommand(commandNames.quoNew, async () => {
        const language = 'xquery';
        const defaultValue = ` db:system() `;
        const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, defaultValue, language);
        const data = new vscode.NotebookData([cell]);
        data.metadata = {
            custom: {
                cells: [],
                metadata: {
                    orig_nbformat: 4
                },
                nbformat: 4,
                nbformat_minor: 2
            }
        };
        const doc = await vscode.workspace.openNotebookDocument(NOTEBOOK_TYPE, data);
        await vscode.window.showNotebookDocument(doc);
    });
}
export function connectionSave() {
    return vscode.commands.registerCommand(commandNames.quoSave, async () => {
        const input = await vscode.window.showInputBox();
        if (input) {
            const a = Configuration.connections;
            const b = Configuration.connection;
            // @todo deduplicate
            const u = a.push({ ...b, 'name': input });
            Configuration.connections = a;
            vscode.window.showInformationMessage("TODO connectionSave: " + input);
        }
    });
}

export function connectionLoad() {
    return vscode.commands.registerCommand(commandNames.quoLoad, async () => {
        const a = Configuration.connections;
        const items = a.map(a => ({ 'label': a.name, 'target': a.name, 'description': "something" }));
        const target = await vscode.window.showQuickPick(
            items as vscode.QuickPickItem[],
            { placeHolder: 'Set server configuration.' });
        if (target) {
           // vscode.window.showInformationMessage("TODO connectionLoad:" + target);
            const pick = a.find(a => a.name == target.label);
            if (pick) {
                Configuration.connection = pick;
            }
        }
    });
}
