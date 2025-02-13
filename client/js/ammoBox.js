class AmmoBox {
    constructor(x, y, weaponType) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.type = weaponType;
        this.ammoAmount = Math.floor(Math.random() * 10) + 12;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.type.color;
        ctx.fillRect(
            this.x - this.size/2,
            this.y - this.size/2,
            this.size,
            this.size
        );
    }
    
    checkCollision(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + player.width) / 2;
    }
} 