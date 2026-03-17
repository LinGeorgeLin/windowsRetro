/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Square, 
  Minus, 
  Monitor, 
  Folder, 
  FileText, 
  Youtube, 
  Gamepad2, 
  Calculator as CalcIcon,
  Maximize2,
  Minimize2,
  Clock,
  Search,
  Settings,
  Power,
  User,
  Home,
  RotateCcw,
  Volume2,
  AlertTriangle
} from 'lucide-react';

// --- Types ---

type AppId = 'youtube' | 'minesweeper' | 'notepad' | 'mycomputer' | 'calculator' | 'clock' | 'snake' | 'welcome' | 'recycle' | 'warning';

interface WindowState {
  id: AppId;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- Constants ---

const SOUNDS = {
  OPEN: 'https://win98icons.alexmeub.com/sounds/notify.wav',
  CLOSE: 'https://win98icons.alexmeub.com/sounds/recycle.wav',
  CLICK: 'https://win98icons.alexmeub.com/sounds/ding.wav',
  ERROR: 'https://win98icons.alexmeub.com/sounds/chord.wav',
  STARTUP: 'https://win98icons.alexmeub.com/sounds/start.wav',
};

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Ignore errors (usually due to user not interacting with the page yet)
  });
};

// --- Components ---

const Taskbar = ({ 
  openWindows, 
  activeWindowId, 
  onToggleWindow, 
  onStartMenuToggle,
  onOpenApp // 這裡一定要傳入 onOpenApp
}: { 
  openWindows: WindowState[], 
  activeWindowId: AppId | null,
  onToggleWindow: (id: AppId) => void,
  onStartMenuToggle: () => void,
  onOpenApp: (id: AppId) => void // 新增這行
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 win-outset bg-[#c0c0c0] z-[1000] select-none flex flex-row items-center px-1">
      
      {/* 1. Start 按鈕 - 使用 flex-none 固定寬度 */}
      <div className="flex-none">
        <button 
          onClick={() => {
            if (typeof playSound !== 'undefined') playSound(SOUNDS.CLICK);
            onStartMenuToggle();
          }}
          className="win-button h-8 px-1.5 flex items-center gap-1 font-bold w-[75px]"
        >
          <div className="flex flex-wrap w-3.5 h-3.5 gap-[1px]">
            <div className="w-[6px] h-[6px] bg-[#ff4b4b]" />
            <div className="w-[6px] h-[6px] bg-[#51ff51]" />
            <div className="w-[6px] h-[6px] bg-[#4b4bff]" />
            <div className="w-[5px] h-[5px] bg-[#ffff4b]" />
          </div>
          <span className="text-[13px]">Start</span>
        </button>
      </div>

      {/* 2. 中間 App 區 - flex-1 會佔滿中間空間，將左右兩邊推開 */}
      <div className="flex-1 flex flex-row items-center justify-start gap-1 px-2 overflow-hidden h-full min-w-0">
        {openWindows.filter(w => w.isOpen).map(win => (
          <button
            key={win.id}
            onClick={() => {
              if (typeof playSound !== 'undefined') playSound(SOUNDS.CLICK);
              onToggleWindow(win.id);
            }}
            className={`win-button h-8 px-2 flex items-center gap-2 text-[11px] min-w-[100px] max-w-[160px] truncate flex-none transition-none ${
              activeWindowId === win.id && !win.isMinimized ? 'win-inset font-bold bg-[#e6e6e6]' : ''
            }`}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
              {win.icon}
            </div>
            <span className="truncate">{win.title}</span>
          </button>
        ))}
      </div>

      {/* 3. 右側時鐘 - ml-auto 確保它絕對靠右 */}
      <div className="flex-none ml-auto">
        <button 
          onClick={() => {
            if (typeof playSound !== 'undefined') playSound(SOUNDS.CLICK);
            onOpenApp('clock'); // 改用 onOpenApp 才能確保視窗被建立
          }}
          className="win-inset h-8 px-2 flex items-center gap-2 bg-[#c0c0c0] hover:bg-[#dfdfdf] active:shadow-none min-w-[85px] justify-center cursor-pointer shadow-inner"
        >
          <Settings size={12} className="opacity-70" />
          <span className="font-mono text-[11px] whitespace-nowrap">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </button>
      </div>

    </div>
  );
};

const StartMenu = ({ 
  isOpen, 
  onClose, 
  onOpenApp, 
  isFullscreen, 
  onToggleFullscreen 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onOpenApp: (id: AppId) => void,
  isFullscreen: boolean,
  onToggleFullscreen: () => void
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const menuItems: { id: AppId | 'games', title: string, icon: React.ReactNode, hasSubmenu?: boolean }[] = [
    { id: 'mycomputer', title: 'My Computer', icon: <Monitor size={16} /> },
    { id: 'youtube', title: 'YouTube', icon: <Youtube size={16} className="text-red-600" /> },
    { id: 'games', title: 'Games', icon: <Gamepad2 size={16} className="text-blue-600" />, hasSubmenu: true },
    { id: 'notepad', title: 'Notepad', icon: <FileText size={16} /> },
    { id: 'calculator', title: 'Calculator', icon: <CalcIcon size={16} /> },
  ];

  const games: { id: AppId, title: string, icon: React.ReactNode }[] = [
    { id: 'minesweeper', title: 'Minesweeper', icon: <Gamepad2 size={16} className="text-blue-600" /> },
    { id: 'snake', title: 'Snake Retro', icon: <Gamepad2 size={16} className="text-green-600" /> },
  ];

  return (
    <div 
      className="fixed bottom-10 left-0 w-64 win-outset z-[1001] flex flex-col shadow-2xl" 
      onMouseLeave={() => setActiveSubmenu(null)}
    >
      {/* 側邊藍色標籤條 */}
      <div className="w-8 bg-gradient-to-t from-[#000080] to-[#1084d0] absolute left-0 top-0 bottom-0 flex items-end justify-center pb-4">
        <span className="rotate-[-90deg] text-white font-bold text-xl whitespace-nowrap origin-center translate-y-[-40px] select-none">
          Windows<span className="font-normal ml-1">98</span>
        </span>
      </div>

      <div className="ml-8 py-1 relative">
        {/* 主要選單項目 */}
        {menuItems.map(item => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => { 
                if (!item.hasSubmenu) {
                  playSound(SOUNDS.CLICK);
                  onOpenApp(item.id as AppId); 
                  onClose(); 
                }
              }}
              onMouseEnter={() => setActiveSubmenu(item.hasSubmenu ? item.id : null)}
              className="w-full text-left px-4 py-2 hover:bg-[#000080] hover:text-white flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.title}
              </div>
              {item.hasSubmenu && <span>▶</span>}
            </button>

            {/* 遊戲子選單 */}
            {item.id === 'games' && activeSubmenu === 'games' && (
              <div className="absolute left-full top-0 w-48 win-outset shadow-xl py-1 ml-[-2px]">
                {games.map(game => (
                  <button
                    key={game.id}
                    onClick={() => { 
                      playSound(SOUNDS.CLICK);
                      onOpenApp(game.id); 
                      onClose(); 
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#000080] hover:text-white flex items-center gap-3 text-sm"
                  >
                    {game.icon}
                    {game.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="h-[1px] bg-gray-400 my-1 mx-2" />

        {/* 全螢幕切換項目 */}
        <button 
          onClick={() => { 
            onToggleFullscreen(); 
            onClose(); 
          }}
          className="w-full text-left px-4 py-2 hover:bg-[#000080] hover:text-white flex items-center gap-3 text-sm"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode'}
        </button>

        {/* 關機按鈕 */}
        <button 
          onClick={() => {
            if(confirm("Are you sure you want to shut down your computer?")) {
              window.close();
              alert("It is now safe to turn off your computer.");
            }
            onClose();
          }}
          className="w-full text-left px-4 py-2 hover:bg-[#000080] hover:text-white flex items-center gap-3 text-sm"
        >
          <Power size={16} /> Shut Down...
        </button>
      </div>
    </div>
  );
};
interface WindowProps {
  key?: React.Key;
  window: WindowState;
  active: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragEnd: (id: AppId, info: any) => void;
  children: React.ReactNode;
}

const BSOD = () => (
  <div 
    className="fixed inset-0 bg-[#0000aa] text-white font-mono p-10 z-[9999] cursor-pointer select-none overflow-hidden"
    onClick={() => window.location.reload()}
  >
    <div className="max-w-3xl mx-auto">
      <div className="bg-white text-[#0000aa] px-2 inline-block mb-8">Windows</div>
      <p className="mb-6">A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36. The current application will be terminated.</p>
      <ul className="list-none space-y-4 mb-8">
        <li>* Press any key to terminate the current application.</li>
        <li>* Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.</li>
      </ul>
      <p className="text-center mt-20">Press any key to continue _</p>
    </div>
  </div>
);

const Window = ({ 
  window, 
  active, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus,
  onDragEnd,
  onResize,
  children 
}: WindowProps & { onResize: (id: AppId, width: number, height: number) => void }) => {
  if (!window.isOpen || window.isMinimized) return null;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = window.width;
    const startHeight = window.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
      onResize(window.id, newWidth, newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <motion.div
      drag={!window.isMaximized}
      dragMomentum={false}
      onPointerDown={onFocus}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: window.isMaximized ? 0 : window.x,
        y: window.isMaximized ? 0 : window.y,
        width: window.isMaximized ? '100%' : `${window.width}px`,
        height: window.isMaximized ? (window.id === 'taskbar' ? '40px' : `${window.height}px`) : `${window.height}px`,
      }}
      // 確保最大化時高度扣除工作列高度 (假設工作列 40px)
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
      onDragEnd={(_, info) => onDragEnd(window.id, info)}
      // 關鍵修正：加入 flex flex-col 讓內部 flex-1 生效
      className={`absolute top-0 left-0 win-outset overflow-hidden shadow-xl flex flex-col`}
      style={{ 
        zIndex: window.zIndex,
        minWidth: '200px',
        minHeight: '150px',
        // 如果最大化，高度設為 calc(100% - 40px) 避免擋住工作列
        height: window.isMaximized ? 'calc(100% - 40px)' : `${window.height}px`,
      }}
    >
      {/* Title Bar - 固定高度 */}
      <div 
        className={`h-6 flex-none flex items-center justify-between px-1 m-[1px] cursor-default select-none ${active ? 'win-title-bar' : 'win-title-bar-inactive'}`}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-1 px-1 overflow-hidden pointer-events-none">
          <span className="scale-75 flex-shrink-0">{window.icon}</span>
          <span className="text-white text-xs font-bold truncate tracking-wide">{window.title}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); if(typeof playSound !== 'undefined') playSound(SOUNDS.CLICK); onMinimize(); }} className="win-button w-4 h-4 flex items-center justify-center">
            <Minus size={10} strokeWidth={4} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if(typeof playSound !== 'undefined') playSound(SOUNDS.CLICK); onMaximize(); }} className="win-button w-4 h-4 flex items-center justify-center">
            <Square size={8} strokeWidth={4} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if(typeof playSound !== 'undefined') playSound(SOUNDS.CLOSE); onClose(); }} className="win-button w-4 h-4 flex items-center justify-center ml-0.5">
            <X size={10} strokeWidth={4} />
          </button>
        </div>
      </div>

      {/* Content Area - 自動撐開剩餘所有高度 */}
      <div className="flex-1 min-h-0 bg-[#c0c0c0] overflow-hidden m-1 win-inset relative flex flex-col">
        <div className="flex-1 overflow-auto bg-white">
          {children}
        </div>
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[60] flex items-end justify-end p-0.5"
          onMouseDown={handleResizeStart}
        >
          {/* 經典的三條斜線縮放標記 */}
          <div className="w-3 h-3 border-r-2 border-b-2 border-gray-600 opacity-50" style={{ borderStyle: 'double' }} />
        </div>
      )}
    </motion.div>
  );
};

// --- Apps ---

const Notepad = () => (
  <textarea 
    className="w-full h-full p-2 outline-none resize-none font-mono text-sm"
    defaultValue="Welcome back to WinRetro OS!&#13;&#10;&#13;&#10;The system is now fully functional.&#13;&#10;&#13;&#10;- Notepad is working.&#13;&#10;- Calculator is working.&#13;&#10;- Minesweeper is working.&#13;&#10;- YouTube is working.&#13;&#10;&#13;&#10;Enjoy the authentic 90s experience!"
  />
);

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  
  const handleClick = (btn: string) => {
    playSound(SOUNDS.CLICK);
    if (btn === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (btn === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(equation || display);
        setDisplay(String(result));
        setEquation(String(result));
      } catch {
        setDisplay('Error');
        setEquation('');
      }
    } else {
      setDisplay(prev => (prev === '0' || equation === display) ? btn : prev + btn);
      setEquation(prev => prev + btn);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
    'C'
  ];

  return (
    <div className="p-4 bg-[#c0c0c0] h-full flex flex-col gap-4">
      <div className="win-inset bg-white h-12 flex items-center justify-end px-3 text-2xl font-mono shadow-inner overflow-hidden">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.map(btn => (
          <button 
            key={btn} 
            onClick={() => handleClick(btn)}
            className={`win-button font-bold text-sm ${btn === 'C' ? 'col-span-4 mt-2' : ''}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

const Minesweeper = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const size = 10;
  const minesCount = 15;

  const initGame = () => {
    const newGrid = Array(size).fill(0).map(() => Array(size).fill(0));
    const newRevealed = Array(size).fill(0).map(() => Array(size).fill(false));
    
    let placed = 0;
    while (placed < minesCount) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (newGrid[r][c] !== -1) {
        newGrid[r][c] = -1;
        placed++;
      }
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c] === -1) continue;
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (newGrid[r+i]?.[c+j] === -1) count++;
          }
        }
        newGrid[r][c] = count;
      }
    }
    setGrid(newGrid);
    setRevealed(newRevealed);
    setGameOver(false);
  };

  useEffect(() => initGame(), []);

  const reveal = (r: number, c: number) => {
    if (gameOver || revealed[r][c]) return;
    playSound(SOUNDS.CLICK);
    const newRevealed = [...revealed.map(row => [...row])];
    
    if (grid[r][c] === -1) {
      setGameOver(true);
      setRevealed(grid.map(row => row.map(() => true)));
      return;
    }

    const floodFill = (row: number, col: number) => {
      if (row < 0 || row >= size || col < 0 || col >= size || newRevealed[row][col]) return;
      newRevealed[row][col] = true;
      if (grid[row][col] === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            floodFill(row + i, col + j);
          }
        }
      }
    };

    floodFill(r, c);
    setRevealed(newRevealed);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4 bg-[#c0c0c0] h-full">
      <div className="win-inset p-1 bg-[#c0c0c0]">
        <div className="grid grid-cols-10 gap-0">
          {grid.map((row, r) => row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${revealed[r][c] ? 'win-inset bg-gray-200' : 'win-outset'}`}
            >
              {revealed[r][c] && (cell === -1 ? '💣' : cell > 0 ? cell : '')}
            </button>
          )))}
        </div>
      </div>
      <button onClick={initGame} className="win-button px-4 py-1 text-sm font-bold">
        {gameOver ? '☹️ Reset' : '🙂 Reset'}
      </button>
    </div>
  );
};

const YouTubeApp = () => {
  const [url, setUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [searchQuery, setSearchQuery] = useState('');
  const [videoId, setVideoId] = useState('');
  
  // 進度條相關狀態
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // 模擬讀取邏輯的函數
  const simulateLoading = (targetUrl: string) => {
    setIsLoading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 12) { // 總共 12 格
          clearInterval(timer);
          setTimeout(() => {
            setIsLoading(false);
            setUrl(targetUrl);
          }, 300); // 跑完後稍微停頓，更有感覺
          return 12;
        }
        return prev + 1;
      });
    }, 100); // 每格速度 (12 * 100 = 1.2s)
  };

  // 初始化讀取 (第一次打開 App)
  useEffect(() => {
    simulateLoading('https://www.youtube.com/embed/dQw4w9WgXcQ');
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      simulateLoading(`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleVideoId = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && videoId.trim()) {
      simulateLoading(`https://www.youtube.com/embed/${videoId}`);
    }
  };

  const goHome = () => {
    setSearchQuery('');
    setVideoId('');
    simulateLoading('https://www.youtube.com/embed/dQw4w9WgXcQ');
  };

  const refresh = () => {
    simulateLoading(url);
  };

  return (
    <div className="h-full flex flex-col bg-[#c0c0c0] select-none">
      {/* Toolbar (IE 風格) */}
      <div className="flex flex-col gap-1 px-1 py-1 border-b border-gray-400 bg-[#c0c0c0]">
        <div className="flex items-center gap-1">
          <button onClick={goHome} className="win-button p-1" title="Home">
            <Home size={14} />
          </button>
          <button onClick={refresh} className="win-button p-1" title="Refresh">
            <RotateCcw size={14} />
          </button>
          <div className="h-4 w-[1px] bg-gray-500 mx-1" />
          <div className="win-inset bg-white flex-1 px-2 py-0.5 text-[10px] truncate font-mono">
            {isLoading ? "Connecting..." : url}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-[9px] font-bold">ID:</span>
            <input 
              className="win-inset bg-white flex-1 px-2 py-0.5 text-[10px] outline-none" 
              placeholder="Video ID..."
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              onKeyDown={handleVideoId}
            />
          </div>
          <div className="flex items-center gap-1 flex-[2]">
            <span className="text-[9px] font-bold">Search:</span>
            <div className="relative flex-1">
              <input 
                className="win-inset bg-white w-full px-2 py-0.5 text-[10px] outline-none pr-5" 
                placeholder="Search YouTube..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Search size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main View Area */}
      <div className="flex-1 bg-black relative overflow-hidden">
        {isLoading ? (
          /* 經典 Win98 讀取畫面 */
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#c0c0c0]">
            <Monitor size={48} className="mb-4 text-gray-700 opacity-80" />
            <div className="text-[11px] mb-3 font-bold tracking-tight">Requesting Data from YouTube...</div>
            
            {/* 進度條容器 */}
            <div className="w-[204px] h-[22px] bg-[#c0c0c0] border-t-gray-800 border-l-gray-800 border-b-white border-r-white border-[2px] p-[2px] flex gap-[2px]">
              {[...Array(progress)].map((_, i) => (
                <div key={i} className="w-[14px] h-full bg-[#000080]" />
              ))}
            </div>
            
            <div className="text-[9px] mt-6 text-gray-500 font-mono text-center">
              Protocol: HTTP/1.1<br/>
              Status: 200 OK (Awaiting Stream)
            </div>
          </div>
        ) : (
          <iframe 
            src={url} 
            className="w-full h-full border-none" 
            allowFullScreen 
            title="YouTube Browser"
          />
        )}
      </div>

      {/* 視窗底部狀態列 */}
      <div className="h-5 border-t border-gray-400 flex items-center px-2 gap-4 text-[10px] bg-[#c0c0c0]">
        <div className="flex-1 truncate">Done</div>
        <div className="w-[1px] h-3 bg-gray-400" />
        <div className="flex items-center gap-1">
           <Monitor size={10} />
           <span>Internet</span>
        </div>
      </div>
    </div>
  );
};

const ClockApp = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4 h-full bg-[#c0c0c0] text-xs">
      <div className="flex gap-4 flex-1">
        <div className="flex-1 flex flex-col gap-2">
          <p className="font-bold">Date</p>
          <div className="win-inset bg-white p-2 flex-1 flex flex-col items-center justify-center">
            <p className="text-lg font-bold">{time.toLocaleDateString([], { month: 'long' })}</p>
            <p className="text-4xl font-bold">{time.getDate()}</p>
            <p className="mt-2">{time.getFullYear()}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <p className="font-bold">Time</p>
          <div className="win-inset bg-white p-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-black relative flex items-center justify-center">
              {/* Simple Analog Clock Mockup */}
              <div className="absolute w-1 h-8 bg-black origin-bottom bottom-1/2" style={{ transform: `rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg)` }} />
              <div className="absolute w-0.5 h-10 bg-black origin-bottom bottom-1/2" style={{ transform: `rotate(${time.getMinutes() * 6}deg)` }} />
              <div className="absolute w-[1px] h-10 bg-red-600 origin-bottom bottom-1/2" style={{ transform: `rotate(${time.getSeconds() * 6}deg)` }} />
              <div className="w-1.5 h-1.5 bg-black rounded-full z-10" />
            </div>
            <p className="mt-2 font-mono font-bold">{time.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="win-button px-4 py-1">OK</button>
        <button className="win-button px-4 py-1">Cancel</button>
      </div>
    </div>
  );
};

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const canvasSize = 20;

  useEffect(() => {
    if (gameOver) return;
    const move = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * canvasSize), y: Math.floor(Math.random() * canvasSize) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(move);
  }, [dir, food, gameOver]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (dir.y === 0) setDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (dir.y === 0) setDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (dir.x === 0) setDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (dir.x === 0) setDir({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  return (
    <div className="p-4 flex flex-col items-center gap-4 bg-[#c0c0c0] h-full">
      <div className="flex justify-between w-full px-4 font-bold text-xs">
        <span>Score: {score}</span>
        {gameOver && <span className="text-red-600">GAME OVER</span>}
      </div>
      <div className="win-inset bg-black p-1">
        <div className="grid grid-cols-20 grid-rows-20 w-64 h-64 relative">
          {snake.map((s, i) => (
            <div key={i} className="absolute bg-green-500 border border-black" style={{ width: '5%', height: '5%', left: `${s.x * 5}%`, top: `${s.y * 5}%` }} />
          ))}
          <div className="absolute bg-red-500 rounded-full" style={{ width: '5%', height: '5%', left: `${food.x * 5}%`, top: `${food.y * 5}%` }} />
        </div>
      </div>
      <button onClick={() => { setSnake([{ x: 10, y: 10 }]); setGameOver(false); setScore(0); setDir({ x: 0, y: -1 }); }} className="win-button px-4 py-1 text-xs font-bold">
        Reset Game
      </button>
    </div>
  );
};

const RecycleBin = () => (
  <div className="p-8 flex flex-col items-center justify-center h-full bg-[#c0c0c0] text-gray-500 italic">
    <Folder size={64} className="mb-4 opacity-20" />
    <p>The Recycle Bin is empty.</p>
  </div>
);

const WelcomeApp = ({ onClose }: { onClose: () => void }) => (
  <div className="p-8 flex flex-col items-center justify-center h-full bg-[#c0c0c0] text-center">
    <div className="mb-6">
      <h1 className="text-3xl font-bold italic text-[#000080] mb-2">Welcome to Windows 98</h1>
      <div className="h-1 bg-gradient-to-r from-[#000080] to-transparent w-full" />
    </div>
    <div className="win-inset bg-white p-6 max-w-md shadow-inner">
      <p className="text-sm leading-relaxed mb-4">
        Congratulations! You are now using the most advanced operating system simulator on the web.
      </p>
      <ul className="text-left text-xs space-y-2 list-disc pl-4">
        <li>Explore the <b>Start Menu</b> for programs and games.</li>
        <li>Check out the <b>Snake Retro</b> in the Games folder.</li>
        <li>Watch videos via the <b>YouTube</b> app.</li>
        <li>Click desktop icons to launch applications.</li>
      </ul>
    </div>
    <div className="mt-8 flex gap-4">
      <button className="win-button px-8 py-2 font-bold" onClick={() => alert('Registration is currently unavailable in the trial version.')}>Register Now</button>
      <button className="win-button px-8 py-2 font-bold" onClick={onClose}>Close</button>
    </div>
  </div>
);

const MyComputer = () => (
  <div className="p-4 flex flex-wrap gap-6">
    {[
      { name: 'Hard Drive (C:)', icon: <Monitor size={32} /> },
      { name: 'Floppy (A:)', icon: <Square size={32} className="text-gray-400" /> },
      { name: 'CD-ROM (D:)', icon: <Square size={32} className="text-blue-400" /> },
      { name: 'Control Panel', icon: <Settings size={32} /> },
    ].map(item => (
      <div key={item.name} className="flex flex-col items-center gap-1 w-20 group cursor-pointer">
        <div className="p-2 group-hover:bg-blue-100 rounded">
          {item.icon}
        </div>
        <span className="text-[10px] text-center leading-tight">{item.name}</span>
      </div>
    ))}
  </div>
);

// --- Main App ---

export default function App() {
  const [isBSOD, setIsBSOD] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'mycomputer', title: 'My Computer', icon: <Monitor size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 50, y: 50, width: 600, height: 400 },
    { id: 'recycle', title: 'Recycle Bin', icon: <Folder size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 80, y: 80, width: 400, height: 300 },
    { id: 'youtube', title: 'YouTube', icon: <Youtube size={16} className="text-red-600" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 100, y: 100, width: 800, height: 500 },
    { id: 'minesweeper', title: 'Minesweeper', icon: <Gamepad2 size={16} className="text-blue-600" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 150, y: 150, width: 350, height: 450 },
    { id: 'notepad', title: 'Notepad', icon: <FileText size={16} />, isOpen: true, isMinimized: false, isMaximized: false, zIndex: 10, x: 200, y: 200, width: 500, height: 350 },
    { id: 'calculator', title: 'Calculator', icon: <CalcIcon size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 250, y: 250, width: 300, height: 400 },
    { id: 'clock', title: 'Date/Time Properties', icon: <Clock size={16} />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 300, y: 100, width: 450, height: 350 },
    { id: 'snake', title: 'Snake Retro', icon: <Gamepad2 size={16} className="text-green-600" />, isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 350, y: 150, width: 350, height: 450 },
    { id: 'welcome', title: 'Welcome', icon: <Monitor size={16} />, isOpen: true, isMinimized: false, isMaximized: false, zIndex: 100, x: 100, y: 50, width: 600, height: 450 },
  ]);
  const [activeWindowId, setActiveWindowId] = useState<AppId | null>('welcome');
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 確保點擊時 z-index 絕對領先
  const focusWindow = (id: AppId) => {
    setWindows(prev => {
      const maxZ = Math.max(10, ...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w);
    });
    setActiveWindowId(id);
  };

  const openApp = (id: AppId | 'warning') => {
    if (id === 'warning') {
      playSound(SOUNDS.ERROR);
      setIsBSOD(true);
      return;
    }
    playSound(SOUNDS.OPEN);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false } : w));
    // 延遲一點點確保 DOM 已渲染後再聚焦
    setTimeout(() => focusWindow(id), 10);
  };

  const closeWindow = (id: AppId) => {
    playSound(SOUNDS.CLOSE);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const toggleMinimize = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const toggleMaximize = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleResize = (id: AppId, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  // 紀錄拖拽後的最後位置，防止重繪時跳回原點
  const handleDragEnd = (id: AppId, info: any) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x: w.x + info.offset.x, y: w.y + info.offset.y } : w));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    // Play startup sound on mount
    const timer = setTimeout(() => {
      playSound(SOUNDS.STARTUP);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isBSOD) return <BSOD />;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#008080] font-sans">
      {/* CRT Effects */}
      <div className="crt-overlay" />
      <div className="crt-grain" />
      <div className="scanline" />

      {/* Desktop Container */}
      <div id="desktop" className="relative w-full h-[calc(100vh-40px)] z-0">
        {/* Desktop Icons */}
        <div className="p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,minmax(80px,1fr))] gap-4 w-fit h-full">
          {[
            { id: 'mycomputer', title: 'My Computer', icon: <Monitor size={32} className="text-white" /> },
            { id: 'recycle', title: 'Recycle Bin', icon: <Folder size={32} className="text-white opacity-80" /> },
            { id: 'youtube', title: 'YouTube', icon: <Youtube size={32} className="text-white" /> },
            { id: 'minesweeper', title: 'Minesweeper', icon: <Gamepad2 size={32} className="text-white" /> },
            { id: 'notepad', title: 'Notepad', icon: <FileText size={32} className="text-white" /> },
            { id: 'calculator', title: 'Calculator', icon: <CalcIcon size={32} className="text-white" /> },
            { id: 'warning', title: 'System Warning', icon: <AlertTriangle size={32} className="text-yellow-400" /> },
          ].map(app => (
            <div 
              key={app.id}
              onClick={() => {
                playSound(SOUNDS.CLICK);
                openApp(app.id as AppId);
              }}
              className="flex flex-col items-center gap-1 w-20 group cursor-pointer z-10"
            >
              <div className="p-1 group-hover:bg-blue-500/30 rounded">
                {app.icon}
              </div>
              <span className="text-white text-[10px] text-center leading-tight drop-shadow-md shadow-black select-none">
                {app.title}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Windows Rendering */}
        <AnimatePresence>
          {windows.filter(w => w.isOpen && !w.isMinimized).map(win => (
            <Window
              key={win.id}
              window={win}
              active={activeWindowId === win.id}
              onFocus={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              onResize={handleResize}
              onDragEnd={handleDragEnd}
            >
              {win.id === 'youtube' && <YouTubeApp />}
              {win.id === 'minesweeper' && <Minesweeper />}
              {win.id === 'notepad' && <Notepad />}
              {win.id === 'calculator' && <Calculator />}
              {win.id === 'mycomputer' && <MyComputer />}
              {win.id === 'clock' && <ClockApp />}
              {win.id === 'snake' && <SnakeGame />}
              {win.id === 'welcome' && <WelcomeApp onClose={() => closeWindow('welcome')} />}
              {win.id === 'recycle' && <RecycleBin />}
            </Window>
          ))}
        </AnimatePresence>
      </div>

      {/* Start Menu & Taskbar */}
      <StartMenu 
        isOpen={isStartMenuOpen} 
        onClose={() => setIsStartMenuOpen(false)} 
        onOpenApp={openApp}
        isFullscreen={isFullscreen} 
  onToggleFullscreen={toggleFullscreen}
      />
      <Taskbar 
        openWindows={windows} 
        activeWindowId={activeWindowId}
        onToggleWindow={(id) => {
          const win = windows.find(w => w.id === id);
          if (!win?.isOpen) {
            openApp(id);
          } else if (win?.isMinimized || activeWindowId !== id) {
            focusWindow(id);
          } else {
            toggleMinimize(id);
          }
        }}
        onStartMenuToggle={() => setIsStartMenuOpen(!isStartMenuOpen)}
        onOpenApp={openApp}
      />
    </div>
  );
}
