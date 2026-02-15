import * as vscode from 'vscode';
import { exec } from 'child_process';
import { MkDocsServer } from './server';
import { MkDocsViewProvider } from './viewProvider';

const MKDOCS_TERMINAL_NAME = 'MkDocs Preview';

export function activate(context: vscode.ExtensionContext) {
    console.log("MkDocs preview extension activated");

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    const server = new MkDocsServer();
    const viewProvider = new MkDocsViewProvider();

    // The "Doorbell" handler: Sync state whenever the sidebar is opened
    viewProvider.onDidResolve = () => {
        updateUI(server, statusBarItem, viewProvider);
    };

    // Listen for server state changes (e.g. if the process crashes or is killed)
    server.onStateChange = () => {
        updateUI(server, statusBarItem, viewProvider);
    };

    // Register start command
    const startDisposable = vscode.commands.registerCommand('mkdocs-vscode.startPreview', (options?: { skipBrowser?: boolean }) => {
        const config = vscode.workspace.getConfiguration('mkdocs-vscode');
        const port = config.get<number>('port') || 8000;
        const mkdocsPath = config.get<string>('mkdocsPath') || 'mkdocs';

        // Run 'mkdocs --version' to see if it exists
        exec(`${mkdocsPath} --version`, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`MkDocs not found at "${mkdocsPath}"! Please check your settings or install it with: pip install mkdocs`);
                return;
            }

            const shouldOpen = !options?.skipBrowser;

            if (server.isRunning()) {
                if (shouldOpen) {
                    vscode.window.showInformationMessage(`MkDocs server is already running at 127.0.0.1:${port}`);
                    openBrowser(port);
                }
            } else {
                server.start(port, mkdocsPath);
                vscode.window.showInformationMessage(`MkDocs server started at 127.0.0.1:${port}`);
                if (shouldOpen) {
                    setTimeout(() => openBrowser(port), 2000);
                }
            }

            updateUI(server, statusBarItem, viewProvider);
        });
    });

    const stopDisposable = vscode.commands.registerCommand('mkdocs-vscode.stopPreview', () => {
        if (!server.isRunning()) {
            vscode.window.showInformationMessage(`MkDocs server is not running`);
            updateUI(server, statusBarItem, viewProvider);
            return;
        }
        server.stop();
        vscode.window.showInformationMessage(`MkDocs server stopped.`);
        updateUI(server, statusBarItem, viewProvider);
    });

    // Initial status bar setup
    updateUI(server, statusBarItem, viewProvider);
    statusBarItem.show();


    // Listen for configuration changes
    const configListener = vscode.workspace.onDidChangeConfiguration(async e => {
        if (e.affectsConfiguration('mkdocs-vscode.port') && server.isRunning()) {
            const selection = await vscode.window.showInformationMessage(
                'MkDocs port configuration has changed. Would you like to restart the server?',
                'Restart Now'
            );

            if (selection === 'Restart Now') {
                server.stop();
                const config = vscode.workspace.getConfiguration('mkdocs-vscode');
                const port = config.get<number>('port') || 8000;
                const mkdocsPath = config.get<string>('mkdocsPath') || 'mkdocs';
                server.start(port, mkdocsPath);
                updateUI(server, statusBarItem, viewProvider);

                vscode.window.showInformationMessage(`Server restarted on port ${port}`);
            }
        }
    });

    // Sidebar View
    const webviewDisposable = vscode.window.registerWebviewViewProvider(MkDocsViewProvider.viewType, viewProvider);

    // Cleanup when the extension is deactivated
    context.subscriptions.push(startDisposable, stopDisposable, statusBarItem, configListener, webviewDisposable);
}

export function deactivate() {
    console.log("MkDocs preview extension deactivated");
}

function openBrowser(port: number) {
    vscode.commands.executeCommand('simpleBrowser.show', `http://127.0.0.1:${port}`);
}

function updateUI(server: MkDocsServer, statusBar: vscode.StatusBarItem, viewProvider: MkDocsViewProvider) {
    const config = vscode.workspace.getConfiguration('mkdocs-vscode');
    const port = config.get<number>('port') || 8000;
    const isRunning = server.isRunning();

    // 1. Update Status Bar
    if (isRunning === false) {
        statusBar.text = `$(book) MkDocs`;
        statusBar.command = 'mkdocs-vscode.startPreview';
        statusBar.backgroundColor = undefined;
    } else {
        statusBar.text = `$(primitive-square) Stop MkDocs`;
        statusBar.command = 'mkdocs-vscode.stopPreview';
        statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }

    // 2. Update Sidebar View
    viewProvider.updateState(isRunning, port);
}
