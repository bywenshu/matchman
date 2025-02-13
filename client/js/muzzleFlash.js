class MuzzleFlash {
    constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.color = color;
        this.size = 20;
        this.lifetime = 100; // 火光持续时间（毫秒）
        this.createTime = Date.now();
    }
    
    isExpired() {
        return Date.now() - this.createTime > this.lifetime;
    }
    
    draw(ctx) {
        const alpha = Math.max(0, 1 - (Date.now() - this.createTime) / this.lifetime);
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制火光
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 25,
            this.y + Math.sin(this.angle) * 25,
            Math.max(1, this.size * alpha),
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 绘制光晕
        const gradient = ctx.createRadialGradient(
            this.x + Math.cos(this.angle) * 25,
            this.y + Math.sin(this.angle) * 25,
            0,
            this.x + Math.cos(this.angle) * 25,
            this.y + Math.sin(this.angle) * 25,
            Math.max(1, this.size * 1.5)
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 25,
            this.y + Math.sin(this.angle) * 25,
            Math.max(1, this.size * 1.5),
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
} 