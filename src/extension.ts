import * as vscode from 'vscode';
import { exec } from 'child_process';


export function activate(context: vscode.ExtensionContext) {
    console.log("MkDocs preview extension activated");

    // Register start command
    const disposable = vscode.commands.registerCommand('mkdocs-vscode.startPreview', () => {

        // Run 'mkdocs --version' to see if it exists
        exec('mkdocs --version', (error, stdout, stderr) => {
            if (error) {
                // If there's an error, MkDocs probably isn't installed
                vscode.window.showErrorMessage('MkDocs not found! Please install it with: pip install mkdocs');
            } else {
                // If it works, we show the version we found
                vscode.window.showInformationMessage(`MkDocs found: ${stdout.trim()}`);
            }
        })
        vscode.window.showInformationMessage('Starting MkDocs Preview...');
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