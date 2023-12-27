import * as vscode from "vscode";
import { CryXmlSerializer } from "./utils/CryXmlSerializer";
import * as fs from "fs";
import { XmlContentProvider } from "./utils/XmlContentProvider";

export function activate(context: vscode.ExtensionContext) {
  const xmlProvider = new XmlContentProvider();
  const registration = vscode.workspace.registerTextDocumentContentProvider(
    "cryxmlviewer",
    xmlProvider
  );

  let disposable = vscode.commands.registerCommand(
    "cryxmlviewer.openBinaryXml",
    async (uri: vscode.Uri) => {
      try {
        const fileBuffer = fs.readFileSync(uri.fsPath);

        if (CryXmlSerializer.isBinaryXml(fileBuffer)) {
          const xmlContent = await CryXmlSerializer.readFile(fileBuffer);
          xmlProvider.update(xmlContent);

          const virtualUri = uri.with({
            scheme: "cryxmlviewer",
            path: uri.path + ".xml",
          });
          const xmlDocument = await vscode.workspace.openTextDocument(
            virtualUri
          );
          await vscode.window.showTextDocument(xmlDocument, { preview: false });
        }
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
  );

  context.subscriptions.push(disposable, registration);
}

export function deactivate() {}
