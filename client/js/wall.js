class Wall {
    constructor(x, y) {
        this.particles = [];
        this.generateWall(x, y);
    }
    
    generateWall(centerX, centerY) {
        const isHorizontal = Math.random() > 0.5;
        const length = Math.floor(Math.random() * 15) + 10; // 10-25个粒子长
        const thickness = Math.floor(Math.random() * 3) + 2; // 2-4个粒子厚
        
        for (let i = 0; i < (isHorizontal ? thickness : length); i++) {
            for (let j = 0; j < (isHorizontal ? length : thickness); j++) {
                if (Math.random() > 0.1) { // 减少空隙概率
                    const x = centerX + (i - (isHorizontal ? thickness : length)/2) * 10;
                    const y = centerY + (j - (isHorizontal ? length : thickness)/2) * 10;
                    this.particles.push(new WallParticle(x, y));
                }
            }
        }
    }
    
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
    
    checkBulletCollision(bullet) {
        let hitParticles = [];
        
        // 收集所有被击中的粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (particle.checkCollision(bullet)) {
                hitParticles.push(i);
            }
        }
        
        if (hitParticles.length > 0) {
            // 狙击枪子弹穿透整堵墙
            if (bullet.type.name === '狙击枪') {
                this.particles = [];
                return false;
            }
            // 霰弹枪子弹反弹
            else if (bullet.type.name === '霰弹枪' && !bullet.hasReflected) {
                bullet.angle = Math.PI - bullet.angle;
                bullet.hasReflected = true;
                return false;
            }
            // 步枪子弹可以穿透两个粒子
            else if (bullet.type.name === '步枪') {
                // 按索引从大到小排序，这样删除时不会影响其他索引
                hitParticles.sort((a, b) => b - a);
                
                // 删除被击中的粒子
                for (let i = 0; i < Math.min(hitParticles.length, 2); i++) {
                    this.particles.splice(hitParticles[i], 1);
                }
                
                // 如果击中的粒子数小于穿透值，子弹继续飞行
                return hitParticles.length >= bullet.penetration;
            }
            // 其他子弹击中后消除一个粒子
            else {
                this.particles.splice(hitParticles[0], 1);
                return true;
            }
        }
        return false;
    }
    
    checkPlayerCollision(player) {
        // 检查玩家的头部、身体和腿部是否与墙体碰撞
        const checkPoints = [
            {x: player.x, y: player.y - player.height/2 + 10}, // 头部
            {x: player.x, y: player.y},                        // 身体中心
            {x: player.x, y: player.y + player.height/4}       // 腿部
        ];
        
        // 增加容差值，让玩家移动更顺畅
        const collisionTolerance = 5;
        
        for (let particle of this.particles) {
            for (let point of checkPoints) {
                const dx = point.x - particle.x;
                const dy = point.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果任何一个点与墙体粒子发生碰撞
                if (distance < (player.width/2 + particle.size/2 - collisionTolerance)) {
                    return true;
                }
            }
        }
        return false;
    }
} 