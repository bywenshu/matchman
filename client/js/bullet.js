class Bullet {
    constructor(x, y, angle, weaponType, shooter) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.type = weaponType;
        this.speed = weaponType.bulletSpeed;
        this.size = weaponType.bulletSize;
        this.hasReflected = false; // 用于霰弹枪反弹逻辑
        this.distanceTraveled = 0; // 添加行进距离记录
        this.safeDistance = 80; // 增加到80像素
        this.penetration = this.type.name === '步枪' ? 2 : 1; // 步枪可以穿透2个粒子
        this.shooter = shooter;  // 记录发射者
    }
    
    update() {
        // 使用射线检测法，计算子弹当前位置和下一位置之间的线段
        const nextX = this.x + Math.cos(this.angle) * this.speed;
        const nextY = this.y + Math.sin(this.angle) * this.speed;
        
        // 在当前位置和下一位置之间进行多点采样
        const steps = 8; // 增加采样点数，提高碰撞检测频率
        
        for (let i = 0; i < steps; i++) {
            // 线性插值计算采样点位置
            const t = i / (steps - 1);
            this.x = this.x + (nextX - this.x) * t;
            this.y = this.y + (nextY - this.y) * t;
            
            if (i === 0) {
                game.bulletTrails.push(new BulletTrail(this.x, this.y, this.type.color));
            }
            
            const stepDistance = this.speed / steps;
            this.distanceTraveled += stepDistance;
            
            // 检查碰撞
            if (this.checkCollisions()) {
                return true;
            }
        }
        
        // 更新到最终位置
        this.x = nextX;
        this.y = nextY;
        
        return false;
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
    
    isOffScreen() {
        // 霰弹枪子弹碰到边界时反弹
        if (this.type.name === '霰弹枪' && !this.hasReflected) {
            if (this.x <= 0) {
                this.x = 0;
                this.angle = Math.PI - this.angle;
                this.hasReflected = true;
                return false;
            }
            if (this.x >= game.canvas.width) {
                this.x = game.canvas.width;
                this.angle = Math.PI - this.angle;
                this.hasReflected = true;
                return false;
            }
            if (this.y <= 0) {
                this.y = 0;
                this.angle = -this.angle;
                this.hasReflected = true;
                return false;
            }
            if (this.y >= game.canvas.height) {
                this.y = game.canvas.height;
                this.angle = -this.angle;
                this.hasReflected = true;
                return false;
            }
        }
        
        // 其他子弹正常检查是否出界
        return (
            this.x < 0 ||
            this.x > game.canvas.width ||
            this.y < 0 ||
            this.y > game.canvas.height
        );
    }
    
    canHitPlayer() {
        return this.distanceTraveled >= this.safeDistance;
    }
    
    checkCollisions() {
        if (game.isGameOver) {
            return false;
        }

        // 检查是否击中AI
        for (let i = game.ais.length - 1; i >= 0; i--) {
            const ai = game.ais[i];
            if (this.shooter === ai && this.distanceTraveled < this.safeDistance) {
                continue;
            }
            
            // 检查头部判定
            const headRadius = ai.width * 0.45;
            const headCenterY = ai.y - ai.height/2 + headRadius * 0.7; // 向上调整头部位置
            const headDx = this.x - ai.x;
            const headDy = this.y - headCenterY;
            const headDistance = Math.sqrt(headDx * headDx + headDy * headDy);
            
            // 头部命中判定
            if (headDistance < headRadius) {
                // 头部造成双倍伤害
                const damage = this.type.damage * 2;
                ai.health = Math.max(0, ai.health - damage);
                
                // 显示暴击伤害数字
                game.damageNumbers.push(new DamageNumber(
                    ai.x,
                    ai.y - 40,
                    damage,
                    this.type.color,
                    true // 标记为暴击
                ));
                
                // 检查是否击杀
                if (ai.health <= 0) {
                    if (this.shooter === game.player) {
                        game.playerKills++;
                    }
                    game.ais.splice(i, 1);
                }
                
                return true;
            }
            
            // 检查躯干判定
            const dx = this.x - ai.x;
            const dy = this.y - (ai.y + ai.height/3);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 使用矩形判定区域，更容易命中
            const hitboxWidth = ai.width * 0.8;
            const hitboxHeight = ai.height * 0.8;
            
            // 简化的矩形碰撞检测
            if (Math.abs(dx) < hitboxWidth/2 && Math.abs(dy) < hitboxHeight/2) {
                // 使用武器类型的伤害值
                const damage = this.type.damage;
                
                // 更新AI生命值
                ai.health = Math.max(0, ai.health - damage);
                
                // 显示伤害数字
                game.damageNumbers.push(new DamageNumber(
                    ai.x,
                    ai.y - 40,
                    damage,
                    this.type.color,
                    false
                ));
                
                // 检查是否击杀
                if (ai.health <= 0) {
                    if (this.shooter === game.player) {
                        game.playerKills++;
                    }
                    game.ais.splice(i, 1);
                }
                
                return true;
            }
        }
        
        // 检查是否击中玩家
        if (this.canHitPlayer()) {
            const dx = this.x - game.player.x;
            const dy = this.y - game.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < game.player.width/2) {
                game.player.takeDamage(this, false);
                return true;
            }
        }
        
        // 检查是否击中墙体
        for (let wall of game.walls) {
            if (wall.checkBulletCollision(this)) {
                return true;
            }
        }
        
        // 检查是否击中弹药箱
        for (let box of game.ammoBoxes) {
            const dx = box.x - this.x;
            const dy = box.y - this.y;
            if (Math.sqrt(dx * dx + dy * dy) < (box.size/2 + this.size/2)) {
                return true;
            }
        }
        
        return false;
    }
} 