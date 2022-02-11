// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray } = require("electron");
const path = require("path");
let mainWindow = null,
  tray = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 1000,
    webPreferences: {
      // preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadFile("index.html");
  mainWindow.loadURL(path.join("file://", __dirname, "ant/index.html"));

  // 触发关闭时触发
  mainWindow.on('close', (event) => {
    // 截获 close 默认行为
    event.preventDefault();
    // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
  });

  // 新建托盘
  tray = new Tray(path.join(__dirname, 'ant/icons/icon.ico'));
  // 托盘名称
  tray.setToolTip('Mint数据采集系统');
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([{
    label: '显示',
    click: () => { mainWindow.show() }
  },
  {
    label: '退出',
    click: () => {
      tray.destroy()
      mainWindow.destroy()
    }
  }
  ]);
  // 载入托盘菜单
  tray.setContextMenu(contextMenu);
  // 双击触发
  tray.on('double-click', () => {
    // 双击通知区图标实现应用的显示或隐藏
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true);
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // 修改窗体顶部菜单
  const template = [
    {
      label: "视图",
      submenu: [
        {
          label: "刷新",
          role: "reload",
        },
        {
          label: "强制刷新",
          role: "forcereload",
        },
        {
          label: "打开调试",
          role: "toggledevtools",
        },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "联系我们",
          click() {
            require("electron").shell.openExternal(
              "https://www.njgn.com/aboutGn/contactus"
            );
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
    }
  })
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", function () {
    runExec("start.bat"); // 生效啦，可以做些什么执行一种相对的同步状态，例如判断输出内容到什么了
    createWindow();
  });
  // Quit when all windows are closed.
  app.on("window-all-closed", function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      let stopProcess;
      // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
      stopProcess = exec("stop.bat", {});
      // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
      // 打印正常的后台可执行程序输出
      stopProcess.stdout.on("data", function (data) {
        console.log("stdout: " + data);
      });

      // 打印错误的后台可执行程序输出
      stopProcess.stderr.on("data", function (data) {
        console.log("stderr: " + data);
      });

      // 退出之后的输出
      stopProcess.on("close", function (code) {
        //在bat执行完毕后再执行quit()
        console.log("out code：" + code);
        app.quit();
      });
    }
  });
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const exec = require("child_process").exec;

// 任何你期望执行的cmd命令，ls都可以
// let cmdStr = 'aa.bat'
// 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
// let cmdPath = '执行cmd命令的目录'
// 子进程名称
let workerProcess;

function runExec(cmdStr) {
  // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
  workerProcess = exec(cmdStr, {});
  // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
  // 打印正常的后台可执行程序输出
  workerProcess.stdout.on("data", function (data) {
    console.log("stdout: " + data);
  });

  // 打印错误的后台可执行程序输出
  workerProcess.stderr.on("data", function (data) {
    console.log("stderr: " + data);
  });

  // 退出之后的输出
  workerProcess.on("close", function (code) {
    console.log("out code：" + code);
  });
}
