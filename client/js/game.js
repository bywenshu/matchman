class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布实际尺寸
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 初始化所有数组和变量
        this.bullets = [];
        this.ammoBoxes = [];
        this.walls = [];
        this.muzzleFlashes = [];
        this.bulletTrails = [];
        this.damageNumbers = [];
        
        this.lastAmmoSpawn = 0;
        this.lastWallSpawn = 0;
        this.ammoSpawnInterval = 4000;
        this.wallSpawnInterval = 4000;
        
        // 创建玩家在屏幕左边区域的中间
        this.player = new Player(
            this.canvas.width * 0.25, // x坐标在屏幕宽度的1/4处
            this.canvas.height/2      // y坐标在屏幕高度的一半处
        );
        
        // 生成初始中央墙体
        this.generateInitialWall();
        
        // 初始化其他玩家集合
        this.otherPlayers = new Map();
        
        // 设置全局游戏实例引用（在其他事件监听器之前）
        window.game = this;
        
        window.addEventListener('resize', () => this.handleResize());
        
        // 在现有属性后添加
        this.ais = [];
        this.lastAISpawn = 0;
        this.aiSpawnInterval = 3000;
        this.maxAIs = 4; // 最大AI数量
        
        // 添加游戏状态
        this.isGameOver = false;
        
        // 添加永久子弹轨迹数组
        this.permanentBulletTrails = [];
        
        // 添加伤害记录
        this.damageHistory = [];
        this.finalBullets = [];
        this.finalBulletTrails = [];
        
        // 添加击杀统计
        this.playerKills = 0;
        
        // 添加调试开关
        this.hitboxDebugMode = false;  // 改名以更明确功能
        this.aiMovementEnabled = true;
        
        // 添加调试模式快捷键监听
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F4') {  // 使用 F4 键切换受击范围显示
                this.hitboxDebugMode = !this.hitboxDebugMode;
                // 添加状态提示
                this.damageNumbers.push(new DamageNumber(
                    this.canvas.width / 2,
                    50,
                    `受击范围显示已${this.hitboxDebugMode ? '开启' : '关闭'}`,
                    this.hitboxDebugMode ? '#00FF00' : '#FF0000',
                    false
                ));
            }
            if (e.key === 'F2') {  // 使用 F2 键切换AI移动
                this.aiMovementEnabled = !this.aiMovementEnabled;
                // 添加状态提示
                this.damageNumbers.push(new DamageNumber(
                    this.canvas.width / 2,
                    50,
                    `AI移动已${this.aiMovementEnabled ? '开启' : '关闭'}`,
                    this.aiMovementEnabled ? '#00FF00' : '#FF0000',
                    false
                ));
            }
        });
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    generateInitialWall() {
        const centerX = this.canvas.width / 2;
        const wallHeight = 25; // 墙的高度（粒子数）
        const wallThickness = 4; // 墙的厚度（粒子数）
        
        // 在屏幕中央垂直生成墙
        for (let i = 0; i < wallThickness; i++) {
            for (let j = 0; j < wallHeight; j++) {
                const x = centerX + (i - wallThickness/2) * 10;
                const y = (this.canvas.height/2) + (j - wallHeight/2) * 10;
                this.walls.push(new Wall(x, y));
            }
        }
    }
    
    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    spawnAmmoBox() {
        if (this.ammoBoxes.length < 3 && 
            Date.now() - this.lastAmmoSpawn > this.ammoSpawnInterval) {
            const types = Object.values(WeaponTypes);
            const type = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            
            this.ammoBoxes.push(new AmmoBox(x, y, type));
            this.lastAmmoSpawn = Date.now();
        }
    }
    
    spawnWall() {
        if (Date.now() - this.lastWallSpawn > this.wallSpawnInterval) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            this.walls.push(new Wall(x, y));
            this.lastWallSpawn = Date.now();
        }
    }
    
    update() {
        if (this.isGameOver) {
            // 游戏结束后仍然需要更新子弹轨迹
            this.finalBulletTrails.forEach(trail => trail.draw(this.ctx));
            return;
        }
        
        // 始终更新玩家
        this.player.update();
        
        // 检查玩家是否死亡
        if (this.player.health <= 0) {
            this.isGameOver = true;
            this.player.health = 0;
            
            // 获取最后的伤害来源
            const lastDamage = this.damageHistory[this.damageHistory.length - 1];
            const killerName = lastDamage ? lastDamage.source : "未知";
            
            // 保存当前状态
            // 将所有现有轨迹标记为最终轨迹并复制
            this.bulletTrails.forEach(trail => {
                trail.isFinal = true;
                trail.finalAlpha = Math.max(0, 1 - (Date.now() - trail.createTime) / trail.lifetime);
            });
            this.finalBulletTrails = [...this.bulletTrails];
            this.finalBullets = [...this.bullets];
            
            this.damageNumbers.push(new DamageNumber(
                this.player.x,
                this.player.y - 60,
                `被 ${killerName} 击杀`,
                "#FF0000",
                true
            ));
            return;
        }
        
        // 检查弹药箱拾取
        for (let i = this.ammoBoxes.length - 1; i >= 0; i--) {
            const box = this.ammoBoxes[i];
            // 检查玩家拾取
            if (box.checkCollision(this.player)) {
                this.player.weapon.setType(box.type);
                this.player.ammo += box.ammoAmount;
                this.ammoBoxes.splice(i, 1);
                
                this.damageNumbers.push(new DamageNumber(
                    this.player.x,
                    this.player.y - 60,
                    `获得 ${box.type.name}`,
                    box.type.color,
                    false
                ));
            }
            // 检查AI拾取
            for (let ai of this.ais) {
                if (box.checkCollision(ai)) {
                    ai.weapon.setType(box.type);
                    ai.ammo += box.ammoAmount;
                    this.ammoBoxes.splice(i, 1);
                    break;
                }
            }
        }
        
        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const hasCollided = bullet.update();
            
            if (hasCollided || bullet.isOffScreen()) {
                this.bullets.splice(i, 1);
            }
        }
        
        this.spawnWall();
        this.spawnAmmoBox();
        
        // 修改子弹轨迹更新逻辑
        if (!this.isGameOver) {
            this.bulletTrails = this.bulletTrails.filter(trail => !trail.isExpired());
        }
        this.damageNumbers = this.damageNumbers.filter(num => !num.isExpired());
        
        // 更新其他玩家
        this.otherPlayers.forEach(player => player.update());
        
        // 在现有update方法中添加
        this.spawnAI();
        this.ais = this.ais.filter(ai => {
            if (ai.health <= 0) {
                // 检查最后一击是否来自玩家
                const lastDamage = this.damageHistory[this.damageHistory.length - 1];
                if (lastDamage && lastDamage.source === this.player.nickname) {
                    this.playerKills++;
                }
                return false;
            }
            return true;
        });
        // AI移动状态由AI类内部控制，这里只负责调用update
        this.ais.forEach(ai => ai.update());
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制墙体
        this.walls.forEach(wall => wall.draw(this.ctx));
        
        // 如果开启受击范围显示，绘制玩家的受击范围
        if (this.hitboxDebugMode) {
            this.drawHitbox(this.player);
        }
        
        // 绘制玩家
        this.player.draw(this.ctx);
        
        // 绘制其他玩家
        this.otherPlayers.forEach(player => player.draw(this.ctx));
        
        // 如果开启受击范围显示，绘制AI的受击范围
        if (this.hitboxDebugMode) {
            this.ais.forEach(ai => this.drawHitbox(ai));
        }
        
        // 绘制AI
        this.ais.forEach(ai => ai.draw(this.ctx));
        
        // 绘制子弹和轨迹
        if (this.isGameOver) {
            this.finalBullets.forEach(bullet => bullet.draw(this.ctx));
            this.finalBulletTrails.forEach(trail => trail.draw(this.ctx));
        } else {
            this.bullets.forEach(bullet => bullet.draw(this.ctx));
            this.bulletTrails.forEach(trail => trail.draw(this.ctx));
        }
        
        // 绘制弹药箱
        this.ammoBoxes.forEach(box => box.draw(this.ctx));
        
        // 绘制火光效果
        this.muzzleFlashes.forEach(flash => flash.draw(this.ctx));
        
        // 绘制伤害数字（只显示在玩家头顶的伤害提示）
        this.damageNumbers.forEach(number => number.draw(this.ctx));
        
        // 绘制玩家状态
        this.drawPlayerStatus();
    }
    
    drawPlayerStatus() {
        // 右下角显示武器和生命值
        const padding = 20;
        const lineHeight = 30;
        const bottomLine = this.canvas.height - padding;
        
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        
        // 第二行：生命值（保持白色）
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(
            `生命值: ${this.player.health}`, 
            this.canvas.width - padding, 
            bottomLine
        );
        
        // 第一行：武器信息和弹药
        if (this.player.weapon.type) {
            this.ctx.fillStyle = this.player.weapon.type.color;
            this.ctx.fillText(
                `${this.player.weapon.type.name} | 弹药: ${this.player.ammo}`, 
                this.canvas.width - padding, 
                bottomLine - lineHeight
            );
        } else {
            this.ctx.fillStyle = '#888888';
            this.ctx.fillText(
                `无武器 | 弹药: 0`, 
                this.canvas.width - padding, 
                bottomLine - lineHeight
            );
        }
        
        // 左上角显示击杀数
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#ff4444'; // 使用红色显示击杀数
        this.ctx.fillText(
            `击杀: ${this.playerKills}`, 
            padding, 
            padding + 20
        );
        
        // 重置文本对齐
        this.ctx.textAlign = 'left';
    }
    
    handlePlayerDamage(damage, source) {
        this.damageHistory.push({
            damage,
            source,
            time: Date.now()
        });
        
        if (this.player.health <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            // 保存当前所有子弹和轨迹
            this.finalBullets = [...this.bullets];
            // 将当前所有轨迹标记为最终轨迹
            this.bulletTrails.forEach(trail => trail.isFinal = true);
            this.finalBulletTrails = [...this.bulletTrails];
        }
    }
    
    gameLoop() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新游戏状态（只有在游戏未结束时）
        if (!this.isGameOver) {
            this.update();
        }
        
        // 绘制所有内容（即使游戏结束也继续绘制）
        this.draw();
        
        // 继续游戏循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    spawnAI() {
        // 当 AI 数量少于 4 个且达到生成间隔时生成新的 AI
        if (this.ais.length < this.maxAIs && 
            Date.now() - this.lastAISpawn > this.aiSpawnInterval) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            
            this.ais.push(new AI(x, y));
            this.lastAISpawn = Date.now();
        }
    }
    
    // 添加绘制受击范围的方法
    drawHitbox(entity) {
        this.ctx.save();
        this.ctx.strokeStyle = entity instanceof AI ? '#FF0000' : '#00FF00';
        this.ctx.lineWidth = 1;
        
        // 绘制头部判定圆形
        const headRadius = entity.width * 0.45;
        const headCenterY = entity.y - entity.height/2 + headRadius * 0.7; // 向上调整头部位置
        
        // 绘制头部判定区域
        this.ctx.beginPath();
        this.ctx.arc(entity.x, headCenterY, 
            headRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 添加头部判定范围的视觉提示（半透明填充）
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = entity instanceof AI ? '#FF0000' : '#00FF00';
        this.ctx.fill();
        this.ctx.restore();
        
        // 绘制躯干判定区域（矩形）
        const hitboxWidth = entity.width * 0.8;
        const hitboxHeight = entity.height * 0.8;
        const centerY = entity.y + entity.height/3;
        
        // 绘制躯干判定区域边框
        this.ctx.strokeRect(
            entity.x - hitboxWidth/2,
            centerY - hitboxHeight/2,
            hitboxWidth,
            hitboxHeight
        );
        
        // 添加躯干判定范围的视觉提示（半透明填充）
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = entity instanceof AI ? '#FF0000' : '#00FF00';
        this.ctx.fillRect(
            entity.x - hitboxWidth/2,
            centerY - hitboxHeight/2,
            hitboxWidth,
            hitboxHeight
        );
        this.ctx.restore();
        
        // 绘制判定中心点
        // 头部中心点
        this.ctx.beginPath();
        this.ctx.arc(entity.x, headCenterY, 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 躯干中心点
        this.ctx.beginPath();
        this.ctx.arc(entity.x, centerY, 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 绘制连接线
        this.ctx.beginPath();
        this.ctx.moveTo(entity.x, entity.y);
        this.ctx.lineTo(entity.x, headCenterY);
        this.ctx.lineTo(entity.x, centerY);
        this.ctx.stroke();
        
        // 添加文字说明
        this.ctx.fillStyle = entity instanceof AI ? '#FF0000' : '#00FF00';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('头部(2倍伤害)', entity.x, headCenterY - headRadius - 5);
        this.ctx.fillText('躯干', entity.x, centerY - hitboxHeight/2 - 5);
        
        this.ctx.restore();
    }
}

// 确保在 DOM 加载完成后再创建游戏实例
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
}); 