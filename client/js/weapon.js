class Weapon {
    constructor(player) {
        this.player = player;
        this.angle = 0;
        this.lastShot = 0;
        this.type = null;
    }
    
    setType(type) {
        this.type = type;
    }
    
    update() {
        const dx = input.mouseX - this.player.x;
        const dy = input.mouseY - this.player.y;
        this.angle = Math.atan2(dy, dx);
        
        if (input.mouseDown && this.canShoot()) {
            this.shoot();
        }
    }
    
    canShoot() {
        return this.type && this.player.ammo > 0 && 
               Date.now() - this.lastShot > this.type.shootDelay;
    }
    
    shoot() {
        this.player.ammo--;
        this.lastShot = Date.now();
        
        // 添加火光效果
        game.muzzleFlashes.push(new MuzzleFlash(
            this.player.x,
            this.player.y,
            this.angle,
            this.type.color
        ));
        
        for (let i = 0; i < this.type.bulletCount; i++) {
            const spread = (Math.random() - 0.5) * this.type.spread;
            const bulletAngle = this.angle + spread;
            
            game.bullets.push(new Bullet(
                this.player.x,
                this.player.y,
                bulletAngle,
                this.type,
                this.player
            ));
        }
    }
    
    draw(ctx) {
        if (!this.type) return;
        
        ctx.strokeStyle = this.type.color;
        ctx.beginPath();
        ctx.moveTo(this.player.x, this.player.y);
        ctx.lineTo(
            this.player.x + Math.cos(this.angle) * 20,
            this.player.y + Math.sin(this.angle) * 20
        );
        ctx.stroke();
    }
} 