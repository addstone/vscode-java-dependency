// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { commands, Extension, ExtensionContext, extensions } from "vscode";
import { dispose as disposeTelemetryWrapper, initializeFromJsonFile, instrumentOperation } from "vscode-extension-telemetry-wrapper";
import { Commands } from "./commands";
import { Context } from "./constants";
import { contextManager } from "./contextManager";
import { LibraryController } from "./controllers/libraryController";
import { ProjectController } from "./controllers/projectController";
import { Services } from "./services";
import { Settings } from "./settings";
import { DependencyExplorer } from "./views/dependencyExplorer";

export async function activate(context: ExtensionContext): Promise<any> {
    await initializeFromJsonFile(context.asAbsolutePath("./package.json"));
    return instrumentOperation("activation", activateExtension)(context);
}

function activateExtension(operationId: string, context: ExtensionContext) {
    Services.initialize(context);
    Settings.initialize(context);
    contextManager.initialize(context);

    setMavenEnabledContext();

    context.subscriptions.push(new ProjectController(context));
    context.subscriptions.push(new LibraryController(context));
    context.subscriptions.push(new DependencyExplorer(context));
    context.subscriptions.push(contextManager);
    contextManager.setContextValue(Context.EXTENSION_ACTIVATED, true);
}

// determine if the add dependency shortcut will show or not
function setMavenEnabledContext() {
    const mavenExt: Extension<any> | undefined = extensions.getExtension("vscjava.vscode-maven");
    contextManager.setContextValue(Context.MAVEN_ENABLED, !!mavenExt);
}

// this method is called when your extension is deactivated
export async function deactivate() {
    await disposeTelemetryWrapper();
}
