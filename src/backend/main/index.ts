import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { electronApp, is, optimizer }                 from '@electron-toolkit/utils'
import { join }                                       from 'path'
import * as dotenv                                    from 'dotenv';
import * as fs                                        from "node:fs";
import { ConversationTopic }                          from 'llm';

// @ts-ignore
import icon                 from '../../../resources/icon.png'
import '../ai/AIHandlers'
import '../headless_injection/WhatsAppHeadlessAccessor'
import { AbstractResource } from "abstractions";

dotenv.config({ path: join(__dirname, '../../.env') });

export const appDirectory = app.getPath('userData');

const conversationDirectoryPath = join(appDirectory, 'conversations');
const resourceDirectoryPath     = join(appDirectory, 'resources');

export let mainWindow: BrowserWindow | null = null;

/**
 * Conversation topic cache.
 * This cache is used to store conversation topics in memory,
 * which will prevent excessive reads and writes to the conversation directory.
 * This map is updated whenever a conversation topic is saved or deleted.
 */
let conversationCache: Map<string, ConversationTopic>;

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow(
        {
            width: 1200,
            height: 800,
            minWidth: 600,
            minHeight: 400,
            transparent: process.platform === 'darwin',
            show: false,
            autoHideMenuBar: true,
            titleBarOverlay: false,
            titleBarStyle: 'hiddenInset',
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                contextIsolation: true,
                sandbox: false
            }
        });

    if ( process.platform === 'darwin' ) {
        mainWindow.setWindowButtonVisibility(true);
    }

    // Ensure that the conversation directory exists.
    if ( !fs.existsSync(conversationDirectoryPath) ) {
        fs.mkdirSync(conversationDirectoryPath);
        console.log("Created conversation directory at: " + conversationDirectoryPath);
    }

    const conversationFiles = fs.readdirSync(conversationDirectoryPath);
    conversationCache       = new Map(conversationFiles
                                          .filter(filePath => filePath.startsWith('conversation-') && filePath.endsWith('.json'))
                                          .map(file => {
                                              const filePath      = join(conversationDirectoryPath, file);
                                              const parsedContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                                              return [ parsedContent.uuid, parsedContent ];
                                          }));

    mainWindow.on('ready-to-show', () => {
        mainWindow!.show()
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if ( is.dev && process.env[ 'ELECTRON_RENDERER_URL' ] ) {
        mainWindow.loadURL(process.env[ 'ELECTRON_RENDERER_URL' ])
    }
    else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if ( BrowserWindow.getAllWindows().length === 0 ) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if ( process.platform !== 'darwin' ) {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('fs:select-file', async (_) => {
    return await dialog
        .showOpenDialog(
            {
                title: 'Select file to upload',
                properties: [ 'openFile', 'multiSelections' ],
                buttonLabel: 'Select',
                message: 'Select a file to upload',
                defaultPath: app.getPath('home')
            })
        .then(result =>
                  !result.canceled ? result.filePaths : [])
        .catch(() => [])
});

/**
 * Open a directory dialog.
 */
ipcMain.handle('fs:select-directory', async (_) => {
    return await dialog
        .showOpenDialog(
            {
                title: 'Select directory to upload',
                properties: [ 'openDirectory' ],
                buttonLabel: 'Select',
                message: 'Select a directory to upload',
                defaultPath: app.getPath('home')
            })
        .then(result => {
            if ( !result.canceled ) {
                return result.filePaths[ 0 ];
            }
            return null;
        })
        .catch(() => null)
});

/**
 * Open a file.
 * This function takes a file path and opens the file in the file explorer.
 */
ipcMain.handle('fs:open-file', async (_, path: string) => {
    shell.showItemInFolder(path);
});

/**
 * Get the conversation history from the conversation directory.
 * This function returns a promise that resolves to the topic history.
 * The topic history will be an array of conversation topics, in the form of:
 * ```
 * [
 *   {
 *      topic: string,
 *      date: string,
 *      uuid: string,
 *      messages: [ { role: string, content: string }, ... ]
 *   }, ...
 * ]
 * ```
 */
ipcMain.handle('list-conversations', async (_) => {
    // If the conversation cache is not empty, return the cached values.
    if ( conversationCache.size > 0 )
        return Array.from(conversationCache.values());

    const conversationFiles = fs.readdirSync(conversationDirectoryPath);
    return conversationFiles
        .filter(filePath => filePath.startsWith('conversation-') && filePath.endsWith('.json'))
        .map(file => {
            const filePath      = join(conversationDirectoryPath, file);
            const parsedContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            conversationCache.set(parsedContent.uuid, parsedContent);
            return parsedContent;
        })
});

/**
 * Delete a conversation topic from the conversation history.
 * This function takes a topic UUID and deletes the corresponding topic from the topic history.
 */
ipcMain.handle('delete-conversation', async (_, uuid: string) => {
    const targetFilePath = join(conversationDirectoryPath, `conversation-${uuid}.json`);
    if ( fs.existsSync(targetFilePath) ) {
        fs.rmSync(targetFilePath);
        conversationCache.delete(uuid);
    }
});

/**
 * Save a conversation topic to the conversation directory.
 * This function takes a conversation topic and saves it to the conversation directory.
 * Conversation topics are saved in their own file, with the name `conversation-<uuid>.json`.
 */
ipcMain.handle('save-conversation', async (_, conversation: ConversationTopic) => {
    const targetFilePath = join(conversationDirectoryPath, `conversation-${conversation.uuid}.json`);
    conversationCache.set(conversation.uuid, conversation);
    await fs.promises.writeFile(targetFilePath, JSON.stringify(conversation));
});

/**
 * Get all resources from the resources directory.
 * This function returns a list of resources, in the form of:
 * ```
 * [
 *   { name: string, data: string },
 *   ...
 * ]
 * ```
 */
ipcMain.handle('resources:list', (): AbstractResource[] => {
    if ( !fs.existsSync(resourceDirectoryPath) ) {
        fs.mkdirSync(resourceDirectoryPath);
        return [];
    }

    return fs.readdirSync(resourceDirectoryPath)
             .map(file => {
                 const stats = fs.statSync(join(resourceDirectoryPath, file));
                 return {
                     name: file,
                     data: fs.readFileSync(join(resourceDirectoryPath, file), 'utf-8'),
                     creationDate: stats.birthtime.getTime(),
                     path: join(resourceDirectoryPath, file)
                 }
             });
});

/**
 * Delete a resource from the `resources` directory.
 * This function takes a resource name and deletes the corresponding resource from the resources directory.
 */
ipcMain.handle('resources:delete', async (_, name: string) => {
    const targetFilePath = join(resourceDirectoryPath, name);
    if ( fs.existsSync(targetFilePath) )
        fs.rmSync(targetFilePath);
});

/**
 * Save a resource to the `resources` directory.
 * This function takes a resource and saves it to the resources directory.
 */
ipcMain.handle('resources:save', async (_, resource: AbstractResource) => {
    if ( !fs.existsSync(resourceDirectoryPath) ) {
        fs.mkdirSync(resourceDirectoryPath);
    }

    fs.writeFileSync(join(resourceDirectoryPath, resource.name), resource.data);
});

ipcMain.handle('resources:fetch-remote', async (_, url: string) => {
    return await fetch(url).then(async response => {
        return {
            name: url.split('/').pop()!,
            data: await response.text(),
            creationDate: Date.now(),
        } as AbstractResource;
    });
})
