import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import logo from "../../renderer/assets/images/logo.svg"; // You can change logo

// import installExtension, {
//   REACT_DEVELOPER_TOOLS, // You can use another library (Vue, Angular, etc.)
// } from "electron-devtools-installer";

const isDev = process.env.DEV === "true" || false;
const inCurrentDir = (dir: string) => join(__dirname, dir);

export default class ApplicationWindow {
  private mainWindow?: BrowserWindow;

  /**
   * Application initialization
   */
  constructor() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.whenReady().then(() => {
      this.mainWindow = this.createMainWindow();
      // if (isDev) {
      //   installExtension(REACT_DEVELOPER_TOOLS, {
      //     loadExtensionOptions: { allowFileAccess: true },
      //   })
      //     .then((name: any) => console.log(`Added Extension: ${name}`))
      //     .catch((err: any) => console.log("An error occurred: ", err));
      // }

      app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
          this.mainWindow = this.createMainWindow();
      });
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") app.quit();
    });

    // hide the main window when the minimize button is pressed
    ipcMain.on("window-hide", () => {
      this.mainWindow?.minimize();
    });

    // close the main window when the close button is pressed
    ipcMain.on("window-close", () => {
      this.mainWindow?.close();
    });
  }

  /**
   * Create Application window
   */
  private createMainWindow(): BrowserWindow {
    // creating and configuring a window
    const mainWindow = new BrowserWindow({
      show: false, // Use 'ready-to-show' event to show window
      width: 900,
      height: 550,
      // frame: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      title: "My Application",
      icon: inCurrentDir(logo), // TODO Check no img (maybe use mainWindow.setIcon())
      webPreferences: {
        preload: inCurrentDir("../preload/index.js"),
        // sandbox: true, // uncomment if you are not using shell
      },
    });
    mainWindow.setMenuBarVisibility(false);

    // loading renderer code (runtime)
    if (isDev) mainWindow.loadURL("http://localhost:5173");
    else mainWindow.loadFile(inCurrentDir("../renderer/index.html"));

    mainWindow.on("closed", () => {
      this.mainWindow = undefined;
    });

    /**
     * If you install `show: true` then it can cause issues when trying to close the window.
     * Use `show: false` and listener events `ready-to-show` to fix these issues.
     *
     * @see https://github.com/electron/electron/issues/25012
     */
    mainWindow.on("ready-to-show", () => {
      mainWindow?.show();

      // open developer tools when using development mode
      if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
    });

    return mainWindow;
  }

  public sendEvent(channel: string, ...args: any[]): void {
    this.mainWindow?.webContents.send(channel, ...args);
  }
}
