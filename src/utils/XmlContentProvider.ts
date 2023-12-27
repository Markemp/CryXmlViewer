import * as vscode from "vscode";

export class XmlContentProvider implements vscode.TextDocumentContentProvider {
    private _xmlContent: string = '';

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this._xmlContent;
    }

    public update(xmlContent: string) {
        this._xmlContent = xmlContent;
    }
}
