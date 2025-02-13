class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.baseSpeed = 5;
        this.currentSpeed = this.baseSpeed;
        this.weapon = new Weapon(this);
        this.color = this.randomColor();
        this.nickname = this.constructor === Player ? 
            (prompt('请输入你的昵称：') || '玩家') : 
            '未命名';
        this.ammo = 5;
        this.lastAmmoRegen = Date.now();
    }
    
    randomColor() {
        const colors = ['#1E90FF', '#8B0000', '#006400', '#4B0082', '#800000', '#000080'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    takeDamage(bullet, isHeadshot) {
        // 直接使用武器类型中定义的伤害值
        const damage = bullet.type.damage * (isHeadshot ? 2 : 1);
        
        // 记录伤害来源
        game.damageHistory.push({
            damage: damage,
            source: bullet.shooter ? bullet.shooter.nickname : "AI敌人",
            time: Date.now()
        });
        
        // 确保生命值不会变成负数或 NaN
        this.health = Math.max(0, this.health - damage);
        
        game.damageNumbers.push(new DamageNumber(
            this.x,
            this.y - 40,
            damage,
            bullet.type.color,
            isHeadshot
        ));
    }
    
    update() {
        // WASD 移动
        const moveX = input.keys['d'] ? 1 : (input.keys['a'] ? -1 : 0);
        const moveY = input.keys['s'] ? 1 : (input.keys['w'] ? -1 : 0);
        
        // 检查是否在墙内
        this.currentSpeed = this.baseSpeed;
        if (game && game.walls) {  // 添加安全检查
            for (let wall of game.walls) {
                if (wall.checkPlayerCollision(this)) {
                    this.currentSpeed = this.baseSpeed * 0.3;
                    break;
                }
            }
        }
        
        if (moveX) this.x = Math.min(Math.max(this.width/2, this.x + moveX * this.currentSpeed), game.canvas.width - this.width/2);
        if (moveY) this.y = Math.min(Math.max(this.height/2, this.y + moveY * this.currentSpeed), game.canvas.height - this.height/2);
        
        this.weapon.update();

        // 添加子弹自动恢复逻辑
        if (Date.now() - this.lastAmmoRegen >= 1000) {
            this.ammo++;
            this.lastAmmoRegen = Date.now();
        }
    }
    
    draw(ctx) {
        // 画火柴人身体
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // 头
        ctx.arc(this.x, this.y - 20, 10, 0, Math.PI * 2);
        // 身体
        ctx.moveTo(this.x, this.y - 10);
        ctx.lineTo(this.x, this.y + 20);
        // 手
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x + 15, this.y);
        // 腿
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x - 10, this.y + 40);
        ctx.moveTo(this.x, this.y + 20);
        ctx.lineTo(this.x + 10, this.y + 40);
        ctx.stroke();
        
        // 绘制昵称
        ctx.fillStyle = this.color;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.nickname, this.x, this.y - 40);
        
        this.weapon.draw(ctx);
    }
} 