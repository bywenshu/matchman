class BulletTrail {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.lifetime = 500; // 轨迹持续时间（毫秒）
        this.createTime = Date.now();
        this.size = 4;
        this.isFinal = false; // 添加标记是否为最终轨迹的属性
        this.finalAlpha = 0; // 保存最终的透明度
    }
    
    isExpired() {
        // 如果是最终轨迹，永不过期
        if (this.isFinal) return false;
        return Date.now() - this.createTime > this.lifetime;
    }
    
    draw(ctx) {
        let alpha;
        if (this.isFinal) {
            // 如果是第一次被标记为最终轨迹，保存当前的透明度
            if (this.finalAlpha === 0) {
                this.finalAlpha = Math.max(0, 1 - (Date.now() - this.createTime) / this.lifetime);
            }
            alpha = this.finalAlpha;
        } else {
            alpha = Math.max(0, 1 - (Date.now() - this.createTime) / this.lifetime);
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
} 