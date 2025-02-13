class Network {
    constructor(game) {
        this.game = game;
        this.ws = new WebSocket('ws://localhost:3000');
        this.setupListeners();
    }

    setupListeners() {
        this.ws.onopen = () => {
            console.log('连接到服务器');
            this.join();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            console.log('与服务器断开连接');
        };
    }

    join() {
        this.send({
            type: 'join',
            roomId: this.game.roomId,
            player: {
                x: this.game.player.x,
                y: this.game.player.y,
                nickname: this.game.player.nickname,
                color: this.game.player.color
            }
        });
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'gameState':
                this.game.addOtherPlayers(data.players);
                break;
            case 'playerJoin':
                this.game.addPlayer(data.player);
                break;
            case 'playerUpdate':
                this.game.updatePlayer(data.player);
                break;
            case 'playerLeave':
                this.game.removePlayer(data.playerId);
                break;
            case 'playerShoot':
                this.game.handleRemoteShot(data);
                break;
        }
    }

    updatePlayerPosition() {
        this.send({
            type: 'update',
            roomId: this.game.roomId,
            player: {
                x: this.game.player.x,
                y: this.game.player.y
            }
        });
    }

    sendShot(bullet) {
        this.send({
            type: 'shoot',
            roomId: this.game.roomId,
            bullet: {
                x: bullet.x,
                y: bullet.y,
                angle: bullet.angle,
                type: bullet.type
            }
        });
    }
} 