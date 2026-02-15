import * as vscode from 'vscode';

export class MkDocsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'mkdocs-vscode-view';

    private _view?: vscode.WebviewView;

    public onDidResolve?: () => void;

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtml();

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'ready':
                    // Instead of the doorbell, we trigger the update here!
                    this.onDidResolve?.();
                    break;
                case 'start': {
                    vscode.commands.executeCommand('mkdocs-vscode.startPreview', { skipBrowser: true });
                    break;
                }
                case 'stop': {
                    vscode.commands.executeCommand('mkdocs-vscode.stopPreview');
                    break;
                }
            }
        });
    }

    public updateState(isRunning: boolean, port: number) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'updateState', isRunning, port });
        }
    }


    private getHtml() {
        return `
            <html>
                <head>
                    <style>
                        body { 
                            padding: 0; 
                            color: var(--vscode-foreground); 
                            font-family: var(--vscode-font-family); 
                            font-size: var(--vscode-font-size);
                            height: 100vh; 
                            display: flex; 
                            flex-direction: column; 
                            overflow: hidden; 
                        }
                        
                        .controls {
                            padding: 20px 15px;
                        }

                        h3 {
                            color: var(--vscode-descriptionForeground);
                            font-size: 10px;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            margin: 0 0 16px 0;
                            border: none;
                            padding: 0;
                        }

                        .btn {
                            background: var(--vscode-button-background);
                            color: var(--vscode-button-foreground);
                            border: none;
                            padding: 6px 14px;
                            width: 100%;
                            cursor: pointer;
                            border-radius: 2px;
                            margin-bottom: 8px;
                            font-size: 12px;
                            transition: background 0.1s ease;
                        }

                        .btn:hover { background: var(--vscode-button-hoverBackground); }

                        .btn-secondary {
                            background: var(--vscode-button-secondaryBackground);
                            color: var(--vscode-button-secondaryForeground);
                        }
                        .btn-secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }

                        .status {
                            font-size: 11px;
                            color: var(--vscode-descriptionForeground);
                            margin-top: 12px;
                        }

                        .status a {
                            color: var(--vscode-textLink-foreground);
                            text-decoration: none;
                        }
                        .status a:hover { text-decoration: underline; }

                        #preview-frame {
                            flex-grow: 1;
                            border: none;
                            width: 100%;
                            background: #ffffff;
                        }

                        .toolbar {
                            display: flex;
                            align-items: center;
                            padding: 4px 8px;
                            background: var(--vscode-sideBar-background);
                            border-bottom: 1px solid var(--vscode-panel-border);
                        }

                        .hidden { display: none; }
                    </style>
                </head>
                <body>
                    <!-- VIEW 1: The Control Panel -->
                    <div id="controls-view" class="controls">
                        <h3>MkDocs Control</h3>
                        <div id="start-container">
                            <button class="btn" onclick="start()">🚀 Start Preview</button>
                        </div>
                        <div id="stop-container" class="hidden">
                            <button class="btn" onclick="showPreview()">🖥️ View in Sidebar</button>
                            <button class="btn btn-secondary" onclick="stop()">🛑 Stop Server</button>
                            <div class="status">Running at <a id="port-link" href="#">http://127.0.0.1:8000</a></div>
                        </div>
                    </div>
                    
                    <!-- VIEW 2: The Integrated Browser -->
                    <div id="preview-view" class="hidden" style="height: 100%; flex-direction: column;">
                        <div class="toolbar">
                            <button class="btn btn-secondary" style="width: auto; margin:0;" onclick="showControls()">⬅ Back</button>
                        </div>
                        <iframe id="preview-frame" src=""></iframe>
                    </div>

                    <script>
                        const vscode = acquireVsCodeApi();
                        let currentPort = 8000;
                        
                        function start() { vscode.postMessage({command: 'start'}); }
                        function stop() { 
                            showControls();
                            vscode.postMessage({command: 'stop'}); 
                        }

                        function showPreview() {
                            document.getElementById('controls-view').classList.add('hidden');
                            const previewPanel = document.getElementById('preview-view');
                            previewPanel.classList.remove('hidden');
                            previewPanel.style.display = 'flex';
                            document.getElementById('preview-frame').src = 'http://127.0.0.1:' + currentPort;
                        }

                        function showControls() {
                            document.getElementById('preview-view').classList.add('hidden');
                            document.getElementById('preview-view').style.display = 'none';
                            const controlPanel = document.getElementById('controls-view');
                            controlPanel.classList.remove('hidden');
                            document.getElementById('preview-frame').src = '';
                        }

                        window.addEventListener('message', event => {
                            const message = event.data;
                            if (message.command === 'updateState') {
                                currentPort = message.port;
                                document.getElementById('start-container').classList.toggle('hidden', message.isRunning);
                                document.getElementById('stop-container').classList.toggle('hidden', !message.isRunning);
                                
                                if (message.isRunning) {
                                    // Update the port link in case it changed
                                    const portLink = document.getElementById('port-link');
                                    if (portLink) {
                                        portLink.innerText = 'http://127.0.0.1:' + message.port;
                                        portLink.href = 'http://127.0.0.1:' + message.port;
                                    }
                                } else {
                                    // If server stops, always revert to controls
                                    showControls();
                                }
                            }
                        });

                        vscode.postMessage({ command: 'ready' });
                    </script>
                </body>
            </html>
        `;
    }
}


