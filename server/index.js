const WebSocket = require('ws');
const ServerGame = require('./game');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });
const game = new ServerGame();

wss.on('connection', (ws) => {
    console.log('新玩家连接');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            game.handleMessage(ws, data);
        } catch (e) {
            console.error('消息处理错误:', e);
        }
    });

    ws.on('close', () => {
        console.log('玩家断开连接');
        game.removePlayer(ws);
    });
});

console.log(`游戏服务器运行在端口 ${PORT}`); 