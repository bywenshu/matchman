class AIWeapon extends Weapon {
    constructor(player) {
        super(player);
        this.angle = 0;
        this.shotsFired = 0;  // 记录发射的子弹数
        this.cooldownTime = 3000;  // 3秒冷却
        this.isCooling = false;  // 是否在冷却中
        this.cooldownStart = 0;  // 冷却开始时间
    }

    canShoot() {
        // 在冷却中或已经发射了5发子弹时，禁止射击
        if (this.isCooling || this.shotsFired >= 5) {
            return false;
        }
        // 检查基本射击条件（有武器类型、有弹药、射击延迟）
        return this.type && this.player.ammo > 0 && 
               Date.now() - this.lastShot > this.type.shootDelay;
    }

    shoot() {
        super.shoot();  // 调用父类的射击方法
        this.shotsFired++;
        
        // 达到5发子弹后进入冷却
        if (this.shotsFired >= 5) {
            this.isCooling = true;
            this.cooldownStart = Date.now();
        }
    }

    update() {
        // 检查冷却状态
        if (this.isCooling) {
            if (Date.now() - this.cooldownStart >= this.cooldownTime) {
                this.isCooling = false;
                this.shotsFired = 0;
            }
            return;  // 冷却中不执行其他更新
        }

        // AI的武器不使用鼠标输入
        if (this.player.canSeePlayer()) {
            const dx = game.player.x - this.player.x;
            const dy = game.player.y - this.player.y;
            this.angle = Math.atan2(dy, dx);
            
            if (this.canShoot()) {
                this.shoot();
            }
        }
    }
} 