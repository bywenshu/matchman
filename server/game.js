class ServerGame {
    constructor() {
        this.rooms = new Map(); // 房间号 -> {players: Map<WebSocket, PlayerData>}
    }

    handleMessage(ws, data) {
        switch (data.type) {
            case 'join':
                this.handleJoin(ws, data);
                break;
            case 'update':
                this.handleUpdate(ws, data);
                break;
            case 'shoot':
                this.handleShoot(ws, data);
                break;
        }
    }

    handleJoin(ws, data) {
        const { roomId, player } = data;
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                players: new Map()
            });
        }

        const room = this.rooms.get(roomId);
        room.players.set(ws, {
            id: Math.random().toString(36).substr(2, 9),
            ...player
        });

        // 通知房间内其他玩家
        this.broadcastRoom(roomId, {
            type: 'playerJoin',
            player: room.players.get(ws)
        }, ws);

        // 发送房间内现有玩家信息给新玩家
        const existingPlayers = Array.from(room.players.entries())
            .filter(([socket]) => socket !== ws)
            .map(([_, data]) => data);
        
        ws.send(JSON.stringify({
            type: 'gameState',
            players: existingPlayers
        }));
    }

    handleUpdate(ws, data) {
        const { roomId, player } = data;
        const room = this.rooms.get(roomId);
        if (!room) return;

        const playerData = room.players.get(ws);
        if (!playerData) return;

        Object.assign(playerData, player);
        this.broadcastRoom(roomId, {
            type: 'playerUpdate',
            player: playerData
        }, ws);
    }

    handleShoot(ws, data) {
        const { roomId, bullet } = data;
        this.broadcastRoom(roomId, {
            type: 'playerShoot',
            bullet,
            playerId: this.rooms.get(roomId)?.players.get(ws)?.id
        }, ws);
    }

    broadcastRoom(roomId, data, exclude = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.players.forEach((_, socket) => {
            if (socket !== exclude && socket.readyState === 1) {
                socket.send(JSON.stringify(data));
            }
        });
    }

    removePlayer(ws) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.players.has(ws)) {
                const playerData = room.players.get(ws);
                room.players.delete(ws);
                
                this.broadcastRoom(roomId, {
                    type: 'playerLeave',
                    playerId: playerData.id
                });

                if (room.players.size === 0) {
                    this.rooms.delete(roomId);
                }
                break;
            }
        }
    }
}

module.exports = ServerGame; 