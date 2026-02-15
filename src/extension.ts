import * as vscode from 'vscode';
import { exec } from 'child_process';

const MKDOCS_TERMINAL_NAME = 'MkDocs Preview';

export function activate(context: vscode.ExtensionContext) {
    console.log("MkDocs preview extension activated");

    // Register start command
    const disposable = vscode.commands.registerCommand('mkdocs-vscode.startPreview', () => {

        // Run 'mkdocs --version' to see if it exists
        exec('mkdocs --version', (error, stdout, stderr) => {
            if (error) {
                // If there's an error, MkDocs probably isn't installed
                vscode.window.showErrorMessage('MkDocs not found! Please install it with: pip install mkdocs');
                return;
            }

            let terminal = vscode.window.terminals.find(t => t.name == MKDOCS_TERMINAL_NAME);
            if (!terminal) {
                terminal = vscode.window.createTerminal(MKDOCS_TERMINAL_NAME);
            }
            terminal.show();
            terminal.sendText('mkdocs serve');

            vscode.window.showInformationMessage('MkDocs server starting...');

            // NEW: Wait 2 seconds for the server to warm up, then open the browser
            setTimeout(() => {
                vscode.commands.executeCommand('simpleBrowser.show', 'http://127.0.0.1:8000');
            }, 2000);

        })
    })

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

    // Status Bar Configuration
    statusBarItem.command = 'mkdocs-vscode.startPreview';
    statusBarItem.text = `$(book) MkDocs`;
    statusBarItem.tooltip = 'Click to start MkDocs Preview';

    statusBarItem.show();
    console.log("Status Bar Item .show() called!"); // Add this log

    // Cleanup the command when the extension is deactivated
    context.subscriptions.push(disposable);
    context.subscriptions.push(statusBarItem);


}


export function deactivate() {
    console.log("MkDocs preview extension deactivated");
}