import * as vscode from "vscode";
import { CryXmlSerializer } from "./utils/CryXmlSerializer";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "cryxmlviewer.openBinaryXml",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const document = editor.document;
        try {
          const xmlContent = await CryXmlSerializer.readFile(
            document.uri.fsPath
          );
          // Open the XML content in a new text editor
          const xmlDocument = await vscode.workspace.openTextDocument({
            language: "xml",
            content: xmlContent,
          });
          await vscode.window.showTextDocument(xmlDocument, { preview: false });
        } catch (error) {
          if (error instanceof Error) {
            vscode.window.showErrorMessage(
              `Error processing file: ${error.message}`
            );
          } else {
            vscode.window.showErrorMessage(
              "Error processing file: An unknown error occurred"
            );
          }
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
