class RemotePlayer {
    constructor(data) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.width = 30;
        this.height = 50;
        this.color = data.color;
        this.nickname = data.nickname;
    }
    
    updateFromServer(data) {
        this.x = data.x;
        this.y = data.y;
    }
    
    update() {
        // 可以添加插值平滑移动
    }
    
    draw(ctx) {
        // 与 Player 类相同的绘制代码
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 20, 10, 0, Math.PI * 2);
        ctx.moveTo(this.x, this.y - 10);
        ctx.lineTo(this.x, this.y + 20);
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x + 15, this.y);
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x - 10, this.y + 40);
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x + 10, this.y + 40);
        ctx.stroke();
        
        ctx.fillStyle = this.color;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.nickname, this.x, this.y - 40);
    }
} 