const WeaponTypes = {
    SHOTGUN: {
        name: '霰弹枪',
        color: '#FFD700',
        bulletCount: 15,
        spread: 0.5,
        bulletSpeed: 12,
        shootDelay: 600,
        bulletSize: 6,
        damage: 15
    },
    SNIPER: {
        name: '狙击枪',
        color: '#00FF00',
        bulletCount: 1,
        spread: 0.04,
        bulletSpeed: 40,
        shootDelay: 1000,
        bulletSize: 8,
        damage: 50
    },
    SMG: {
        name: '冲锋枪',
        color: '#0000FF',
        bulletCount: 2,
        spread: 0.2,
        bulletSpeed: 12,
        shootDelay: 50,
        bulletSize: 5,
        damage: 15
    },
    RIFLE: {
        name: '步枪',
        color: '#FF0000',
        bulletCount: 1,
        spread: 0.1,
        bulletSpeed: 20,
        shootDelay: 200,
        bulletSize: 7,
        damage: 20
    },
    SWEET_TALKER: {
        name: '花言巧语',
        color: '#800080',
        bulletCount: 1,
        spread: 0.08,
        bulletSpeed: 60,
        shootDelay: 30,
        bulletSize: 3,
        damage: 10
    },
    SPREAD_2PI: {
        name: '散布 2π',
        color: '#FFA500', // 橙色
        bulletCount: 30,
        spread: 6.28,
        bulletSpeed: 10,
        shootDelay: 600,
        bulletSize: 6,
        damage: 16
    },
    PRECISE_SHOTGUN: {
        name: '精准霰弹枪',
        color: '#00FFFF', // 青色
        bulletCount: 16,
        spread: 0.05,
        bulletSpeed: 15,
        shootDelay: 600,
        bulletSize: 6,
        damage: 15
    },
    ABSOLUTE_SNIPER: {
        name: '绝对精准狙击枪',
        color: '#000000', // 黑色
        bulletCount: 1,
        spread: 0,
        bulletSpeed: 50,
        shootDelay: 1000,
        bulletSize: 9,
        damage: 60
    },
    BUBBLE: {
        name: '毒泡泡',
        color: '#2E4A29',
        bulletCount: 18,
        spread: 2,
        bulletSpeed: 3,
        shootDelay: 1000,
        bulletSize: 10,
        damage: 20
    },
    LAZER: {
        name: '短促激光',
        color: '#FCFCFC',
        bulletCount: 40,
        spread: 0,
        bulletSpeed: 100,
        shootDelay: 2000,
        bulletSize: 10,
        damage: 20
    }
}; 