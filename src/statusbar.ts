//  statusbar: show profile when xq active
import * as vscode from 'vscode';
import {commandNames, NOTEBOOK_TYPE} from './constants';
import { Configuration, affectsConfiguration} from "./common";


let myStatusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext,
) {
    // create a new status bar item that we can now manage
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = commandNames.quoLoad;

    subscriptions.push(myStatusBarItem);
    const onDidActive = vscode.window.onDidChangeActiveNotebookEditor(updateStatusBarItem);
    updateStatusBarItem(vscode.window.activeNotebookEditor);
    // register some listener that make sure the status bar always up-to-date
    subscriptions.push(onDidActive);

    vscode.workspace.onDidChangeConfiguration(event => {
        //@todo scope?
        if (affectsConfiguration(event,'server')) {
            updateStatusBarItem(vscode.window.activeNotebookEditor);
         }
    });
}

function updateStatusBarItem(active?: vscode.NotebookEditor): void {
    if (isNoteBook(active)) {
        const profile = Configuration.summary;
        myStatusBarItem.text = `$(remote-explorer) ${profile}`;
        myStatusBarItem.tooltip = "BaseX server, click to change";
        myStatusBarItem.show();
    } else {
        myStatusBarItem.hide();
    }
}
function isNoteBook(active?: vscode.NotebookEditor):boolean{
if(!active) return false;
return active.notebook.notebookType===NOTEBOOK_TYPE;
}