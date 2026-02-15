import * as vscode from 'vscode';

export class MkDocsServer {
    private terminal: vscode.Terminal | undefined;
    private MKDOCS_TERMINAL_NAME = 'MkDocs Preview';

    constructor() {
    }

    public isRunning(): boolean {
        return !!this.terminal;
    }

    public start(port: number) {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal(this.MKDOCS_TERMINAL_NAME);
        }
        this.terminal.show();
        this.terminal.sendText(`mkdocs serve -a 127.0.0.1:${port}`);
    }

    public stop() {
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = undefined; // Clear the reference
        }

    }

    public handleTerminalClose(terminal: vscode.Terminal): boolean {
        if (terminal === this.terminal) {
            this.terminal = undefined;
            return true;
        }
        return false;
    }

}
