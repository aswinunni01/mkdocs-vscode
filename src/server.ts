import * as vscode from 'vscode';
import { ChildProcess, spawn } from 'child_process'; // New imports

export class MkDocsServer {
    private process: ChildProcess | undefined;
    private outputChannel: vscode.OutputChannel;

    public onStateChange?: () => void;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('MkDocs Preview Logs');
    }


    public isRunning(): boolean {
        return !!this.process;
    }

    public start(port: number, mkdocsPath: string = 'mkdocs') {
        if (this.process) return;
        this.outputChannel.clear();
        this.outputChannel.show();
        this.outputChannel.appendLine(`[Info] Starting MkDocs on port ${port} using ${mkdocsPath}...`);

        // SPAWN: This is the production-grade way
        this.process = spawn(mkdocsPath, ['serve', '-a', `127.0.0.1:${port}`], {
            shell: true, // Required for Windows
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        });

        // Listen to the logs
        this.process.stdout?.on('data', (data) => this.outputChannel.append(data.toString()));
        this.process.stderr?.on('data', (data) => this.outputChannel.append(data.toString()));
        // ERROR HANDLING (The "Option 2" benefit)
        this.process.on('error', (err) => {
            vscode.window.showErrorMessage(`Process failed: ${err.message}`);
            this.stop();
        });
        this.process.on('exit', (code) => {
            this.outputChannel.appendLine(`\n[Info] MkDocs exited with code ${code}`);
            this.process = undefined;
            this.onStateChange?.(); // Tell the UI to flip back to "Start"
        });
    }

    public stop() {
        if (this.process) {
            this.process.kill(); // Kill the process directly
            this.process = undefined;
            this.onStateChange?.();
        }
    }

}
