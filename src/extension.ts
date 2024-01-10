import * as vscode from 'vscode';
import { XQueryKernel } from './controller';
import { XQueryContentSerializer } from './serializer';
import * as commands from'./commands';
import * as statusbar from './statusbar';

import {NOTEBOOK_TYPE} from './constants';


export function activate(context: vscode.ExtensionContext) {
	commands.activate(context);
    statusbar.activate(context);
	
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(
			NOTEBOOK_TYPE, new XQueryContentSerializer(), { transientOutputs: true }
		),
		new XQueryKernel()
	);
}
