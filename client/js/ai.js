class AI extends Player {
    constructor(x, y) {
        super(x, y);
        // 替换默认武器为AI专用武器
        this.weapon = new AIWeapon(this);
        
        this.nickname = 'AI敌人-' + Math.floor(Math.random() * 1000);
        this.targetX = x;
        this.targetY = y;
        this.decisionInterval = 1000;
        this.lastDecision = 0;
        this.state = 'wandering';
        
        // 修改 AI 的生命值设置
        this.maxHealth = 100;  // 确保基础生命值正确
        this.health = this.maxHealth;
        
        // AI基础速度和目标速度
        this.baseSpeed = 2.8;
        this.targetSpeed = this.baseSpeed;
        this.currentSpeed = this.baseSpeed;
        this.minDistanceToPlayer = 120;
        // 墙体检测
        this.wallStuckTime = 0;
        this.lastWallCheck = Date.now();
    }

    update() {
        // 如果AI移动被禁用，只更新武器
        if (!game.aiMovementEnabled) {
            this.weapon.update();
            return;
        }

        // 检查是否在墙内并更新时间
        let inWall = false;
        for (let wall of game.walls) {
            if (wall.checkPlayerCollision(this)) {
                inWall = true;
                break;
            }
        }

        if (inWall) {
            if (this.wallStuckTime === 0) {
                this.wallStuckTime = Date.now();
            } else if (Date.now() - this.wallStuckTime > 5000) {
                // 被卡住超过5秒，强制朝玩家方向移动
                const dx = game.player.x - this.x;
                const dy = game.player.y - this.y;
                const angle = Math.atan2(dy, dx);
                this.targetX = this.x + Math.cos(angle) * 100;
                this.targetY = this.y + Math.sin(angle) * 100;
                this.targetSpeed = this.baseSpeed * 1.5;
            }
        } else {
            this.wallStuckTime = 0;
            this.targetSpeed = this.baseSpeed;
        }

        // 平滑速度变化
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1;

        // AI决策更新
        if (Date.now() - this.lastDecision > this.decisionInterval) {
            this.makeDecision();
            this.lastDecision = Date.now();
        }

        // 根据状态执行行为
        switch (this.state) {
            case 'wandering':
                this.wander();
                break;
            case 'chasing':
                this.chase();
                break;
            case 'searching_weapon':
                this.searchWeapon();
                break;
        }

        // 如果有武器且看到玩家，尝试射击
        if (this.weapon.type && this.canSeePlayer() && this.ammo > 0) {
            this.aimAndShoot();
        }

        // 更新武器
        this.weapon.update();
    }

    makeDecision() {
        if (!this.weapon.type || this.ammo <= 0) {
            this.state = 'searching_weapon';
        } else if (this.canSeePlayer() && this.getDistanceToPlayer() < 400) {
            this.state = 'chasing';
        } else {
            this.state = 'wandering';
        }
    }

    wander() {
        if (Math.random() < 0.1) {
            this.targetX = Math.random() * game.canvas.width;
            this.targetY = Math.random() * game.canvas.height;
        }
        this.moveToTarget();
    }

    chase() {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        if (distToPlayer < this.minDistanceToPlayer) {
            // 远离玩家
            this.targetX = this.x - dx;
            this.targetY = this.y - dy;
        } else if (distToPlayer > this.minDistanceToPlayer + 50) {
            // 接近玩家
            this.targetX = game.player.x;
            this.targetY = game.player.y;
        } else {
            // 保持距离，在玩家周围移动
            const angle = Math.atan2(dy, dx) + Math.PI/2;
            this.targetX = game.player.x + Math.cos(angle) * this.minDistanceToPlayer;
            this.targetY = game.player.y + Math.sin(angle) * this.minDistanceToPlayer;
        }
        this.moveToTarget();
    }

    searchWeapon() {
        let nearestBox = null;
        let nearestDist = Infinity;

        for (let box of game.ammoBoxes) {
            const dist = this.getDistanceTo(box.x, box.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestBox = box;
            }
        }

        if (nearestBox) {
            this.targetX = nearestBox.x;
            this.targetY = nearestBox.y;
        } else {
            this.wander();
        }
        this.moveToTarget();
    }

    moveToTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
            this.x += (dx / dist) * this.currentSpeed;
            this.y += (dy / dist) * this.currentSpeed;
        }
    }

    canSeePlayer() {
        // 检查是否有墙体阻挡视线
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        for (let wall of game.walls) {
            for (let particle of wall.particles) {
                const t = ((particle.x - this.x) * dx + (particle.y - this.y) * dy) / (dx * dx + dy * dy);
                if (t < 0 || t > 1) continue;
                
                const px = this.x + t * dx;
                const py = this.y + t * dy;
                const pdx = px - particle.x;
                const pdy = py - particle.y;
                
                if (Math.sqrt(pdx * pdx + pdy * pdy) < particle.size/2) {
                    return false;
                }
            }
        }
        return true;
    }

    aimAndShoot() {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        this.weapon.angle = Math.atan2(dy, dx);
        
        if (this.weapon.canShoot()) {
            this.weapon.shoot();
        }
    }

    getDistanceToPlayer() {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getDistanceTo(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    randomColor() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw(ctx) {
        super.draw(ctx);
        
        // 如果AI移动被禁用，显示一个标记
        if (!game.aiMovementEnabled) {
            ctx.save();
            ctx.fillStyle = '#FF0000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('已静止', this.x, this.y - this.height/2 - 25);
            ctx.restore();
        }

        // 显示血量条
        const healthBarWidth = 40;
        const healthBarHeight = 4;
        const healthPercentage = this.health / this.maxHealth;
        
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            this.y - this.height/2 - 15,
            healthBarWidth,
            healthBarHeight
        );
        
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            this.y - this.height/2 - 15,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
} 