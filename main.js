const electron = require('electron');
const {app, nativeImage, Tray, BrowserWindow, Menu, ipcMain, dialog} = electron;
const os = require('os');
// const childProcess = require('child_process');
// const osVer = childProcess.execSync('ver').toString().trim();
const url = require('url');
const path = require('path');
const Store = require('./Store');

// =터미널에 콘솔 출력
// console.log('log text');
// process.stdout.write('log text');

// process.env : 애플리케이션 실행 환경
// process.version : Node.js 버전
// process.arch, process.platform : CPU와 플랫폼 정보
// process.argv : 실행 명령 파라미터

// =SET env
process.env.NODE_ENV = 'production';

// console.log('hostname: ', os.hostname()); // B-25 | upleat-PC
// console.log('type: ', os.type()); // Windows_NT | Windows_NT
// console.log('platform: ', os.platform()); // win32 | win32
// console.log('arch: ', os.arch()); // ia32 | x64
// console.log('release: ', os.release()); // 6.1.7601 | 6.1.7601
// console.log('uptime: ', os.uptime());
// console.log('loadavg: ', os.loadavg());
// console.log('totalmem: ', os.totalmem());
// console.log('freemem: ', os.freemem());
// console.log('cpus: ', os.cpus());
// console.log('getNetworkInterfaces: ', os.getNetworkInterfaces());
// console.log( process.platform );
// console.log( osVer );

/* [I] Windos OS Version Check
// console.log( os.release() );
// ex) result: 6.1.7601
//
// ${dwMajorVersion}.${dwMinorVersion}.${dwBuildNumber}
// Operating system      dwMajorVersion   dwMinorVersion
// ------------------------ ---------------- ----------------
// Windows 10                           10                0
// Windows Server 2016                  10                0
// Windows 8.1                           6                3
// Windows Server 2012 R2                6                3
// Windows 8                             6                2
// Windows Server 2012                   6                2
// Windows 7                             6                1
// Windows Server 2008 R2                6                1
// Windows Server 2008                   6                0
// Windows Vista                         6                0
// Windows Server 2003 R2                5                2
// Windows Server 2003                   5                2
// Windows XP                            5                1
// Windows 2000                          5                0
*/

// =시스템 정보
let systemInfo = '';
systemInfo += `Application version: ${app.getVersion()}\n`;
systemInfo += `Computer name: ${os.hostname()}\n`;
systemInfo += `Platform: ${os.platform()}\n`;
systemInfo += `Operating system: ${os.type()} ${os.arch()}\n`;
systemInfo += `Build version: ${os.release()}\n`;
systemInfo += `System architecture: ${os.cpus()[0].model}\n`;
systemInfo += `Physical processor count: ${os.cpus().length}\n`;
systemInfo += `Processor speed: ${os.cpus()[0].speed} MHz`;

// = 전역 변수로 데이터 연동
global.sharedObject = {
  appName: app.getName(),
  appVersion: app.getVersion(),
  systemInfo: systemInfo
};

// =First instantiate the class
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    dirItemData: null,
    config: {
      toolsBarChk: true,
      utilBarChk: true,
      dirBarChk: true,
      styleMemoEditorChk: true,
      language: 'en-US'
    }
  }
});

let mainWindow = null;
let settingsWindow = null;
let aboutWindow = null;
let systemInfoWindow = null;
let stickyNoteWindow = null;
let force_quit = false;

// Listen for app to be ready
app.once('ready', () => {
  // app.getLocale();

  if (!store.get('dirItemData')) {
    store.set('dirItemData', [
      {
        dirName: '메모',
        modify: false,
        memoList: [
          {
            title: '새로운 메모',
            year: 'YYYYMMDD',
            date: 'h:mm:ss a',
            addtext: '추가 텍스트 없음',
            context: '',
            active: true,
            lock: false,
            sticky: false
          }
        ],
        count: 1,
        childs: null,
        actived: true
      }
    ]);
  } else {
    store.set('dirItemData', store.get('dirItemData'));
  }

  store.set('config', store.get('config'));

  // Create new window
  mainWindow = new BrowserWindow({
    title: app.getName(),
    minWidth: 760,
    minHeight: (store.get('config').toolsBarChk)? 480 : 460,
    width: 760,
    height: (store.get('config').toolsBarChk)? 480 : 460,
    // skipTaskbar: true,
    // darkTheme: true,
    // modal: true,
    // frame: false, // window
    // transparent: true,
    // titleBarStyle: 'hidden', // mac
    // titleBarStyle : 'hidden-inset', // mac
    icon: path.join(__dirname, 'assets/icons/png/icon.png')
  });

  // Load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'public/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // 설정 > 툴바 체크박스 활성화
  if (store.get('config').toolsBarChk) {
    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
  } else {
    mainWindow.setMenu(null);
  }

  // Uncomment to use Chrome developer tools
  mainWindow.webContents.openDevTools({detach:true});

  mainWindow.on('close', (e) => {
    console.log('close');
    if (!force_quit) {
      e.preventDefault();

      mainWindow.hide();
    }
  });

  // Cleanup when window is closed
  mainWindow.on('closed', () => {
    console.log('closed');

    // 스티커 메모
    if (BrowserWindow.getAllWindows().length > 0) {
      // stickyNoteWindow.webContents.send('stickyNote:testReq');
      // console.log( BrowserWindow.fromBrowserView() );
      console.log( BrowserWindow.getAllWindows()[0].show() );
      // console.log( BrowserWindow.getAllWindows()[0].devToolsWebContents );
      // console.log( BrowserWindow.getAllWindows()[0].getPosition()[0] ); // xpos
      // console.log( BrowserWindow.getAllWindows()[0].getPosition()[1] ); // ypos
    }

    mainWindow = null;
    stickyNoteWindow = null;
    app.quit();
  });

  /** 트레이 아이콘 */
  // empty image as transparent icon: it can click
  // see: https://electron.atom.io/docs/api/tray/
  //mainWindow.tray = new Tray(nativeImage.createEmpty());
  mainWindow.tray = new Tray(path.join(__dirname, 'assets/ico_tary.png'));

  const trayMenu = Menu.buildFromTemplate([
    // {
    //   label: 'Actions',
    //   submenu: [
    //     {
    //       label: 'Open JMemo',
    //       click: (item, window, event) => {
    //         // console.log(item, event);
    //         mainWindow.show();
    //       }
    //     }
    //   ]
    // },
    {
      label: '메인 윈도우 보기',
      click() {
        mainWindow.show();
      }
    },
    {
      label: '설정',
      click() {
        createSettingsWindow();
      }
    },
    {type: 'separator'},
    {
      label: '시스템 정보 확인...',
      click() {
        createSystemInfoWindow();
      }
    },
    {
      label: '빌드 버전 확인...',
      click() {
        createAboutWindow();
      }
    },
    {type: 'separator'},
    {
      label: '앱 데이터 초기화',
      click() {
        dialog.showMessageBox(
          {
            type: 'none',
            buttons: ['확인', '취소'],
            title: '앱 데이터 초기화',
            message: 'JMemo의 앱 데이터를 초기화 하시겠습니까?',
            detail: '모든 폴더 및 메모가 삭제 됩니다.',
            noLink: true
          },
          (buttonIndex) => {
            //updateFooter("Exit: " + buttons[buttonIndex]);
            if (buttonIndex === 0) {
              store.set('dirItemData', [
                {
                  dirName: '메모',
                  modify: false,
                  memoList: [
                    {
                      title: '새로운 메모',
                      year: 'YYYYMMDD',
                      date: 'h:mm:ss a',
                      addtext: '추가 텍스트 없음',
                      context: '',
                      active: true,
                      lock: false,
                      sticky: false
                    }
                  ],
                  count: 1,
                  childs: null,
                  actived: true
                }
              ]);
              store.set('config', {
                toolsBarChk: true,
                utilBarChk: true,
                dirBarChk: true,
                styleMemoEditorChk: true,
                language: 'en'
              });

              force_quit = true;
              app.relaunch();
              app.quit();
            }
          }
        );
      }
    },
    {type: 'separator'},
    // {role: 'quit'}, // "role": system prepared action menu
    {
      label: '종료',
      click() {
        force_quit = true;
        app.quit();
      }
    }
  ]);

  mainWindow.tray.setToolTip('JMemo');
  //m ainWindow.tray.setTitle('Tray Example'); // macOS only
  mainWindow.tray.setContextMenu(trayMenu);

  // Option: some animated web site to tray icon image
  // see: https://electron.atom.io/docs/tutorial/offscreen-rendering/
  // mainWindow.icons = new BrowserWindow({show: false, webPreferences: {offscreen: true}});
  // mainWindow.icons.loadURL('https://trends.google.com/trends/hottrends/visualize');

  // mainWindow.icons.webContents.on('paint', (event, dirty, image) => {
  //   if (mainWindow.tray) mainWindow.tray.setImage(image.resize({width: 16, height: 16}));
  // });
  mainWindow.tray.on('click', () => {
    mainWindow.show();
  });
});

ipcMain.on('stickyNote:testRes', (e, item) => {
  console.log('asdasdasd');
  console.log(item);
});

// Handle create add window
function createAboutWindow() {
  if (aboutWindow !== null) { return false; }

  // let display = electron.screen.getPrimaryDisplay();
  // let width = display.bounds.width;

  //console.log( parent );
  //console.log( width );

  // Create new window
  aboutWindow = new BrowserWindow({
    title: 'About',
    width: 360,
    height: 240,
    modal: true,
    parent: mainWindow,
    //x: width - 360,
    //y: '50%',
    //frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets/icons/png/icon2.png')
  });

  // default Toolbar hide
  aboutWindow.setMenu(null);
  // aboutWindow.setAlwaysOnTop(true);

  // Load html into window
  aboutWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'toolmenu/aboutWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Garbage collection Handle
  aboutWindow.on('close', () => { aboutWindow = null; });
}

// Handle create add window
function createSystemInfoWindow() {
  if (systemInfoWindow !== null) { return false; }

  // Create new window
  systemInfoWindow = new BrowserWindow({
    title: 'System Info',
    width: 460,
    height: 240,
    modal: true,
    parent: mainWindow,
    //x: width - 360,
    //y: '50%',
    //frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets/icons/png/icon2.png')
  });

  // default Toolbar hide
  systemInfoWindow.setMenu(null);
  // systemInfoWindow.setAlwaysOnTop(true);

  // Load html into window
  systemInfoWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'toolmenu/systemInfoWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Garbage collection Handle
  systemInfoWindow.on('close', () => { systemInfoWindow = null; });
}

// Handle create add window
function createSettingsWindow() {
  if (settingsWindow !== null) { return false; }

  // Create new window
  settingsWindow = new BrowserWindow({
    title: 'Core Settings',
    width: 360,
    height: 490,
    modal: true,
    parent: mainWindow,
    //x: width - 360,
    //y: '50%',
    //frame: false,
    resizable: false,
    icon: path.join(__dirname, 'assets/icons/png/icon2.png')
  });

  // default Toolbar hide
  settingsWindow.setMenu(null);
  // settingsWindow.setAlwaysOnTop(true);

  // Load html into window
  settingsWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'toolmenu/settingsWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Garbage collection Handle
  settingsWindow.on('close', () => { settingsWindow = null; });
}

// Handle create add window
function createStickyNoteWindow(stickyData) {
  stickyNoteWindow = new BrowserWindow({
    title: 'Sticky Note',
    titleBarStyle: 'customButtonsOnHover',
    minWidth: 180,
    minHeight: 120,
    width: 240,
    height: 300,
    backgroundColor: '#fdfdc3',
    // x: 0,
    // y: 0,
    frame: false,
    //transparent: true,
    //resizable: false,
    // parent: mainWindow,
    icon: path.join(__dirname, 'assets/icons/png/icon2.png')
  });

  // default Toolbar hide
  stickyNoteWindow.setMenu(null);
  // stickyNoteWindow.setAlwaysOnTop(false);

  // Load html into window
  stickyNoteWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'toolmenu/stickyNoteWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  stickyNoteWindow.webContents.openDevTools({detach:true});

  stickyNoteWindow.webContents.on('did-finish-load', () => {
    stickyNoteWindow.webContents.send('stickyNote:data', stickyData);
  });

  // stickyNoteWindow.on('close', (e) => {
  //   e.preventDefault();
  // //
  // //   console.log('a');
  // //   //stickyNoteWindow = null;
  // // });
  // //
  // // stickyNoteWindow.on('closed', (e) => {
  // //   //e.preventDefault();
  // //
  // //   console.log('b');
  // //   //stickyNoteWindow = null;
  // });

  // stickyNoteWindow.on('move', () => {
  //   const xpos = stickyNoteWindow.getPosition()[0];
  //   const ypos = stickyNoteWindow.getPosition()[1];
  //
  //   console.log( xpos, ypos );
  // });
}

// ipcRenderer Process 업데이트 데이터 받기
ipcMain.on('storeData:update', (e, item) => {
  store.set('dirItemData', item);
});

// ipcRenderer Process 업데이트 설정 받기
ipcMain.on('config:update', (e, item) => {
  item = JSON.parse(item);

  store.set('config', {
    toolsBarChk: (item.inptToolsBar !== 'null')? true : false,
    utilBarChk: (item.inptUtilBar !== 'null')? true : false,
    dirBarChk: (item.inptDirBar !== 'null')? true : false,
    styleMemoEditorChk: (item.inptStyleMemoEditor !== 'null')? true : false,
    language: item.language
  });

  mainWindow.webContents.send('menu:settings', store.get('config'));

  // tools menu [view] > [Toggle Util Bar] or [Toggle Folder Bar] 활성화 || 비활성화
  mainMenuTemplate[2].submenu[4].enabled = store.get('config').utilBarChk;
  mainMenuTemplate[2].submenu[5].enabled = store.get('config').dirBarChk;
  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Menu.setApplicationMenu(mainMenu);
  force_quit = true;
  app.relaunch();
  app.quit();
});

// ipcRenderer Process 설정 받기
ipcMain.on('util:settings', createSettingsWindow);

// ipcRenderer Process 메모 에디터 추가
ipcMain.on('stickyNote:add', (e, item) => {
  createStickyNoteWindow(item);
});

// ipcRenderer Process 메모 에디터 종료
ipcMain.on('stickyNote:close', (e, item) => {
  mainWindow.send('stickyNote:hide', item);
});

// Create menu template
const mainMenuTemplate = [
  {
    label: 'App',
    submenu: [
      {
        label: 'New Folder...',
        accelerator: process.platform === 'drawin' ? 'Command+Shift+N' : 'Ctrl+Shift+N',
        click () {
          mainWindow.webContents.send('menu:nFolder');
        }
      },
      {
        label: 'New Memo...',
        accelerator: process.platform === 'drawin' ? 'Command+N' : 'Ctrl+N',
        click () {
          mainWindow.webContents.send('menu:nMemo');
        }
      },
      {type: 'separator'},
      {
        label: 'Rename',
        accelerator: process.platform === 'drawin' ? 'F2' : 'F2',
        click () {
          mainWindow.webContents.send('menu:rFolder');
        }
      },
      {
        label: 'Delete Folder',
        accelerator: process.platform === 'drawin' ? 'Command+Shift+D' : 'Ctrl+Shift+D',
        click () {
          mainWindow.webContents.send('menu:dFolder');
        }
      },
      {
        label: 'Delete Memo',
        accelerator: process.platform === 'drawin' ? 'Command+D' : 'Ctrl+D',
        click () {
          mainWindow.webContents.send('menu:dMemo');
        }
      },
      {type: 'separator'},
      {
        label: 'Settings',
        accelerator: (process.platform === 'drawin')? 'Command+,' : 'Ctrl+,',
        click() {
          createSettingsWindow();
        }
      },
      {type: 'separator'},
      {
        label: 'Exit',
        accelerator: (process.platform === 'drawin')? 'Command+Q' : 'Ctrl+Q',
        click() {
          force_quit = true;
          app.quit();
        }
      },
      {role: 'close'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      // {role: 'toggledevtools'},
      // {type: 'separator'},
      // {role: 'reload'},
      // {role: 'forcereload'},
      {role: 'minimize'},
      {role: 'togglefullscreen'},
      {type: 'separator'},
      {
        label: 'Toggle Util Bar',
        click () {
          if (store.get('config').utilBarChk) {
            mainWindow.webContents.send('menu:toggleUtilBar');
          }
        },
        enabled: store.get('config').utilBarChk
      },
      {
        label: 'Toggle Folder Bar',
        click () {
          if (store.get('config').dirBarChk) {
            mainWindow.webContents.send('menu:toggleDirBar');
          }
        },
        enabled: store.get('config').dirBarChk
      },
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'}
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'System Info',
        click() {
          createSystemInfoWindow();
        }
      },
      {type: 'separator'},
      {
        label: 'About',
        click () {
          //electron.shell.openExternal('https://electron.atom.io');
          createAboutWindow();
        }
      }
    ]
  }
];

// If mac, add empty object to menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'drawin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
