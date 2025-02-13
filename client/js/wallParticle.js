class WallParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.color = '#555';
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    
    checkCollision(bullet) {
        const dx = this.x - bullet.x;
        const dy = this.y - bullet.y;
        return Math.sqrt(dx * dx + dy * dy) < (this.size/2 + bullet.size/2);
    }
} 