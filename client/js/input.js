const input = {
    keys: {},
    mouseX: 0,
    mouseY: 0,
    mouseDown: false
};

window.addEventListener('DOMContentLoaded', () => {
    // 等待游戏实例创建完成
    const waitForGame = setInterval(() => {
        if (window.game) {
            clearInterval(waitForGame);
            setupInputHandlers();
        }
    }, 100);
});

function setupInputHandlers() {
    const game = window.game;
    
    window.addEventListener('mousemove', (e) => {
        const rect = game.canvas.getBoundingClientRect();
        input.mouseX = e.clientX - rect.left;
        input.mouseY = e.clientY - rect.top;
    });
    
    window.addEventListener('keydown', (e) => {
        input.keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        input.keys[e.key] = false;
    });
    
    window.addEventListener('mousedown', () => {
        input.mouseDown = true;
    });
    
    window.addEventListener('mouseup', () => {
        input.mouseDown = false;
    });
} 