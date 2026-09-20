// ============================================================
// KNIGHT'S QUEST
// Simple browser game - works with the Knight's Quest index.html
// ============================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
// --------------------
// Keyboard controls
// --------------------
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    // Prevent the browser from scrolling with Space/Arrow keys
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
// --------------------
// Game state
// --------------------
let gameOver = false;
let victory = false;
let score = 0;
let coins = 0;
// --------------------
// World
// --------------------
const gravity = 0.7;
const ground = {
    x: 0,
    y: 610,
    width: WIDTH,
    height: 110
};
// Platforms
const platforms = [
    { x: 150, y: 500, width: 180, height: 25 },
    { x: 430, y: 430, width: 190, height: 25 },
    { x: 750, y: 510, width: 190, height: 25 },
    { x: 1020, y: 400, width: 150, height: 25 }
];
// --------------------
// Player
// --------------------
const player = {
    x: 100,
    y: 500,
    width: 45,
    height: 70,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: 14,
    health: 100,
    maxHealth: 100,
    facing: 1,
    attacking: false,
    attackTimer: 0,
    attackCooldown: 0,
    onGround: false,
    invincibleTimer: 0
};
// --------------------
// Enemies
// --------------------
const enemies = [
    {
        x: 360,
        y: 545,
        width: 45,
        height: 65,
        vx: 1.5,
        health: 40,
        maxHealth: 40,
        alive: true
    },
    {
        x: 680,
        y: 545,
        width: 45,
        height: 65,
        vx: -1.5,
        health: 40,
        maxHealth: 40,
        alive: true
    },
    {
        x: 900,
        y: 445,
        width: 45,
        height: 65,
        vx: 1.2,
        health: 50,
        maxHealth: 50,
        alive: true
    }
];
// --------------------
// Boss
// --------------------
const boss = {
    x: 1090,
    y: 325,
    width: 70,
    height: 75,
    health: 250,
    maxHealth: 250,
    vx: 1.2,
    alive: true,
    attackTimer: 0
};
// --------------------
// Coins
// --------------------
const coinList = [
    { x: 220, y: 455, collected: false },
    { x: 510, y: 385, collected: false },
    { x: 820, y: 465, collected: false },
    { x: 1080, y: 355, collected: false }
];
// --------------------
// Utility
// --------------------
function rectangleCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
function damagePlayer(amount) {
    if (player.invincibleTimer > 0 || gameOver || victory) return;
    player.health -= amount;
    player.invincibleTimer = 60;
    if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
    }
}
// --------------------
// Player movement
// --------------------
function updatePlayer() {
    player.vx = 0;
    if (keys["a"] || keys["arrowleft"]) {
        player.vx = -player.speed;
        player.facing = -1;
    }
    if (keys["d"] || keys["arrowright"]) {
        player.vx = player.speed;
        player.facing = 1;
    }
    // Jump
    if ((keys["w"] || keys["arrowup"] || keys[" "]) && player.onGround) {
        player.vy = -player.jumpPower;
        player.onGround = false;
    }
    // Attack
    if ((keys["j"] || keys["k"]) && player.attackCooldown <= 0) {
        player.attacking = true;
        player.attackTimer = 15;
        player.attackCooldown = 25;
    }
    player.x += player.vx;
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;
    // Ground collision
    if (player.y + player.height >= ground.y) {
        player.y = ground.y - player.height;
        player.vy = 0;
        player.onGround = true;
    }
    // Platform collisions
    for (const platform of platforms) {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height <= platform.y + 15 &&
            player.y + player.height + player.vy >= platform.y
        ) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.onGround = true;
        }
    }
    // Keep player inside world
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > WIDTH) {
        player.x = WIDTH - player.width;
    }
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    if (player.attackTimer > 0) {
        player.attackTimer--;
    } else {
        player.attacking = false;
    }
    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
    }
}
// --------------------
// Sword attack
// --------------------
function getAttackBox() {
    return {
        x: player.facing === 1
            ? player.x + player.width
            : player.x - 60,
        y: player.y + 15,
        width: 60,
        height: 45
    };
}
function playerAttack() {
    if (!player.attacking) return;
    const attackBox = getAttackBox();
    // Attack enemies
    for (const enemy of enemies) {
        if (
            enemy.alive &&
            rectangleCollision(attackBox, enemy)
        ) {
            enemy.health -= 20;
            enemy.vx = player.facing * 4;
            // Prevent the same attack from doing damage every frame
            enemy.hitTimer = 10;
            if (enemy.health <= 0) {
                enemy.alive = false;
                score += 100;
                coins++;
            }
        }
    }
    // Attack boss
    if (
        boss.alive &&
        rectangleCollision(attackBox, boss)
    ) {
        if (!boss.hitTimer || boss.hitTimer <= 0) {
            boss.health -= 15;
            boss.hitTimer = 12;
            if (boss.health <= 0) {
                boss.health = 0;
                boss.alive = false;
                score += 1000;
                victory = true;
            }
        }
    }
}
// --------------------
// Enemy AI
// --------------------
function updateEnemies() {
    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (enemy.hitTimer && enemy.hitTimer > 0) {
            enemy.hitTimer--;
        }
        // Move toward player
        if (player.x < enemy.x) {
            enemy.vx = -1.2;
        } else {
            enemy.vx = 1.2;
        }
        enemy.x += enemy.vx;
        // Simple gravity
        enemy.y += gravity;
        // Ground
        if (enemy.y + enemy.height >= ground.y) {
            enemy.y = ground.y - enemy.height;
        }
        // Damage player when touching
        if (rectangleCollision(player, enemy)) {
            damagePlayer(10);
        }
    }
}
// --------------------
// Boss AI
// --------------------
function updateBoss() {
    if (!boss.alive) return;
    if (boss.hitTimer && boss.hitTimer > 0) {
        boss.hitTimer--;
    }
    // Follow player
    if (player.x < boss.x) {
        boss.x -= 1;
    } else {
        boss.x += 1;
    }
    boss.attackTimer++;
    // Boss attack
    if (boss.attackTimer > 90) {
        boss.attackTimer = 0;
        if (
            Math.abs(player.x - boss.x) < 180 &&
            Math.abs(player.y - boss.y) < 100
        ) {
            damagePlayer(20);
        }
    }
    // Keep boss roughly in arena
    boss.x = Math.max(1000, Math.min(WIDTH - boss.width, boss.x));
}
// --------------------
// Coins
// --------------------
function updateCoins() {
    for (const coin of coinList) {
        if (coin.collected) continue;
        const coinBox = {
            x: coin.x - 12,
            y: coin.y - 12,
            width: 24,
            height: 24
        };
        if (rectangleCollision(player, coinBox)) {
            coin.collected = true;
            coins++;
            score += 25;
        }
    }
}
// --------------------
// Drawing
// --------------------
function drawBackground() {
    // Sky
    ctx.fillStyle = "#17213b";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Moon
    ctx.fillStyle = "#eee8c9";
    ctx.beginPath();
    ctx.arc(1080, 100, 45, 0, Math.PI * 2);
    ctx.fill();
    // Distant mountains
    ctx.fillStyle = "#273452";
    ctx.beginPath();
    ctx.moveTo(0, 610);
    ctx.lineTo(180, 350);
    ctx.lineTo(330, 610);
    ctx.lineTo(500, 300);
    ctx.lineTo(700, 610);
    ctx.lineTo(850, 370);
    ctx.lineTo(1050, 610);
    ctx.lineTo(1200, 330);
    ctx.lineTo(1280, 610);
    ctx.closePath();
    ctx.fill();
    // Ground
    ctx.fillStyle = "#263d29";
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
    ctx.fillStyle = "#3c5b37";
    ctx.fillRect(0, ground.y, WIDTH, 15);
}
function drawPlatforms() {
    for (const platform of platforms) {
        ctx.fillStyle = "#654936";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
        ctx.fillStyle = "#3c5b37";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            7
        );
    }
}
function drawPlayer() {
    // Flash while invincible
    if (
        player.invincibleTimer > 0 &&
        Math.floor(player.invincibleTimer / 5) % 2 === 0
    ) {
        return;
    }
    // Cape
    ctx.fillStyle = "#8b1e2d";
    ctx.fillRect(
        player.x + 7,
        player.y + 25,
        15,
        38
    );
    // Body armor
    ctx.fillStyle = "#9da4ad";
    ctx.fillRect(
        player.x + 10,
        player.y + 25,
        28,
        35
    );
    // Helmet
    ctx.fillStyle = "#c4cad0";
    ctx.fillRect(
        player.x + 7,
        player.y + 5,
        35,
        27
    );
    // Helmet opening
    ctx.fillStyle = "#222";
    ctx.fillRect(
        player.x + (player.facing === 1 ? 25 : 5),
        player.y + 15,
        15,
        7
    );
    // Legs
    ctx.fillStyle = "#555";
    ctx.fillRect(player.x + 10, player.y + 58, 10, 12);
    ctx.fillRect(player.x + 27, player.y + 58, 10, 12);
    // Sword
    if (player.attacking) {
        const attackBox = getAttackBox();
        ctx.fillStyle = "#eee";
        ctx.fillRect(
            attackBox.x,
            attackBox.y + 15,
            attackBox.width,
            7
        );
        ctx.fillStyle = "#d6b45c";
        ctx.fillRect(
            player.facing === 1
                ? player.x + 38
                : player.x - 3,
            attackBox.y + 8,
            7,
            20
        );
    }
}
function drawEnemy(enemy) {
    if (!enemy.alive) return;
    // Body
    ctx.fillStyle = "#743c3c";
    ctx.fillRect(
        enemy.x,
        enemy.y + 20,
        enemy.width,
        enemy.height - 20
    );
    // Head
    ctx.fillStyle = "#b46a4a";
    ctx.fillRect(
        enemy.x + 5,
        enemy.y,
        enemy.width - 10,
        28
    );
    // Eyes
    ctx.fillStyle = "#ffdd55";
    ctx.fillRect(enemy.x + 10, enemy.y + 10, 5, 5);
    ctx.fillRect(enemy.x + 30, enemy.y + 10, 5, 5);
    drawHealthBar(
        enemy.x,
        enemy.y - 12,
        enemy.width,
        enemy.health,
        enemy.maxHealth
    );
}
function drawBoss() {
    if (!boss.alive) return;
    // Cape
    ctx.fillStyle = "#401b50";
    ctx.fillRect(
        boss.x - 5,
        boss.y + 25,
        boss.width + 10,
        50
    );
    // Armor
    ctx.fillStyle = "#777";
    ctx.fillRect(
        boss.x,
        boss.y + 20,
        boss.width,
        55
    );
    // Helmet
    ctx.fillStyle = "#aaa";
    ctx.fillRect(
        boss.x + 5,
        boss.y,
        boss.width - 10,
        30
    );
    // Visor
    ctx.fillStyle = "#181818";
    ctx.fillRect(
        boss.x + 10,
        boss.y + 12,
        boss.width - 20,
        8
    );
    // Eyes
    ctx.fillStyle = "#ff3333";
    ctx.fillRect(boss.x + 18, boss.y + 13, 6, 5);
    ctx.fillRect(boss.x + 46, boss.y + 13, 6, 5);
    drawHealthBar(
        boss.x - 20,
        boss.y - 25,
        boss.width + 40,
        boss.health,
        boss.maxHealth
    );
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("DARK KNIGHT", boss.x - 15, boss.y - 35);
}
function drawCoin(coin) {
    if (coin.collected) return;
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff2a3";
    ctx.beginPath();
    ctx.arc(coin.x - 3, coin.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}
function drawHealthBar(x, y, width, health, maxHealth) {
    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, width, 8);
    ctx.fillStyle = "#e33";
    ctx.fillRect(
        x,
        y,
        width * (health / maxHealth),
        8
    );
}
function drawUI() {
    // Player health
    ctx.fillStyle = "#111";
    ctx.fillRect(20, 20, 220, 30);
    ctx.fillStyle = "#e33";
    ctx.fillRect(
        25,
        25,
        210 * (player.health / player.maxHealth),
        20
    );
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(20, 20, 220, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText(
        `HP: ${player.health}/${player.maxHealth}`,
        35,
        44
    );
    // Score
    ctx.font = "20px Arial";
    ctx.fillText(`Coins: ${coins}`, 20, 80);
    ctx.fillText(`Score: ${score}`, 20, 108);
    // Controls
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ddd";
    ctx.fillText(
        "A/D or ←/→ = Move   W/↑/Space = Jump   J/K = Attack",
        330,
        695
    );
}
function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 40);
    ctx.font = "25px Arial";
    ctx.fillText(
        "Refresh the page to try again",
        WIDTH / 2,
        HEIGHT / 2 + 20
    );
    ctx.textAlign = "left";
}
function drawVictory() {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#ffd84d";
    ctx.textAlign = "center";
    ctx.font = "60px Arial";
    ctx.fillText("VICTORY!", WIDTH / 2, HEIGHT / 2 - 50);
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.fillText(
        `Final Score: ${score}`,
        WIDTH / 2,
        HEIGHT / 2 + 10
    );
    ctx.font = "20px Arial";
    ctx.fillText(
        "Refresh the page to play again",
        WIDTH / 2,
        HEIGHT / 2 + 55
    );
    ctx.textAlign = "left";
}
// --------------------
// Main game loop
// --------------------
function update() {
    if (!gameOver && !victory) {
        updatePlayer();
        playerAttack();
        updateEnemies();
        updateBoss();
        updateCoins();
    }
}
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBackground();
    drawPlatforms();
    for (const coin of coinList) {
        drawCoin(coin);
    }
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
    drawBoss();
    drawPlayer();
    drawUI();
    if (gameOver) {
        drawGameOver();
    }
    if (victory) {
        drawVictory();
    }
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// Start game
gameLoop();
