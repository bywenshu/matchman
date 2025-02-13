class DamageNumber {
    constructor(x, y, content, color, isCritical) {
        this.x = x;
        this.y = y;
        this.content = content;
        this.color = color;
        this.isCritical = isCritical;
        this.lifetime = 1000;
        this.createTime = Date.now();
        this.startY = y;
    }
    
    isExpired() {
        return Date.now() - this.createTime > this.lifetime;
    }
    
    draw(ctx) {
        const age = Date.now() - this.createTime;
        const alpha = 1 - age / this.lifetime;
        const offsetY = -age / 40; // 向上飘动效果
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.font = `${this.isCritical ? 'bold ' : ''}16px Arial`;
        ctx.textAlign = 'center';
        
        // 判断content是数字还是字符串
        const text = typeof this.content === 'number' ? 
            `${this.content}${this.isCritical ? ' (暴击)' : ''}` : 
            this.content;
            
        ctx.fillText(text, this.x, this.startY + offsetY);
        ctx.restore();
    }
} 