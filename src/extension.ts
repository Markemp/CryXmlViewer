import * as vscode from "vscode";
import { CryXmlSerializer } from "./utils/CryXmlSerializer";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
      "cryxmlviewer.openBinaryXml",
      async (uri: vscode.Uri) => {
          try {
              const fileBuffer = fs.readFileSync(uri.fsPath);
              if (CryXmlSerializer.isBinaryXml(fileBuffer)) {
                  const xmlContent = await CryXmlSerializer.readFile(fileBuffer);

                  const xmlDocument = await vscode.workspace.openTextDocument({
                      language: "xml",
                      content: xmlContent
                  });
                  await vscode.window.showTextDocument(xmlDocument, { preview: false });
              } else {
                  vscode.window.showErrorMessage("File is not a recognized binary XML format.");
              }
          } catch (error) {
              if (error instanceof Error) {
                  vscode.window.showErrorMessage(`Error processing file: ${error.message}`);
              } else {
                  vscode.window.showErrorMessage("Error processing file: An unknown error occurred");
              }
          }
      }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
