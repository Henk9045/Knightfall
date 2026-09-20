// ============================================================
// KNIGHT'S QUEST - EXPANDED EDITION
// 5 Levels + Collectible Gear + Equipment + Bosses
//
// Controls:
// A/D or Arrow Keys = Move
// W / Up / Space = Jump
// J / K = Attack
// Enter / N = Next Level
// ============================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const gravity = 0.7;
// ------------------------------------------------------------
// Keyboard
// ------------------------------------------------------------
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (
        [" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(
            e.key.toLowerCase()
        )
    ) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
// ------------------------------------------------------------
// Game State
// ------------------------------------------------------------
let level = 1;
let score = 0;
let coins = 0;
let gameOver = false;
let victory = false;
let levelComplete = false;
let levelMessageTimer = 120;
let gearMessage = "";
let gearMessageTimer = 0;
// ------------------------------------------------------------
// Player
// ------------------------------------------------------------
const player = {
    x: 70,
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
// ------------------------------------------------------------
// Equipment
// ------------------------------------------------------------
const equipment = {
    weapon: {
        name: "Iron Sword",
        damage: 20,
        icon: "⚔"
    },
    armor: {
        name: "Knight Armor",
        hp: 0,
        icon: "🛡"
    },
    boots: {
        name: "Traveler Boots",
        speed: 0,
        jump: 0,
        icon: "👢"
    }
};
// ------------------------------------------------------------
// Gear Database
// ------------------------------------------------------------
const gearPool = [
    // WEAPONS
    {
        type: "weapon",
        name: "Steel Sword",
        damage: 28,
        icon: "⚔",
        rarity: "Common"
    },
    {
        type: "weapon",
        name: "Flame Blade",
        damage: 38,
        icon: "🔥",
        rarity: "Rare"
    },
    {
        type: "weapon",
        name: "Shadow Greatsword",
        damage: 50,
        icon: "⚔",
        rarity: "Epic"
    },
    // ARMOR
    {
        type: "armor",
        name: "Chainmail",
        hp: 25,
        icon: "🛡",
        rarity: "Common"
    },
    {
        type: "armor",
        name: "Knight Plate",
        hp: 50,
        icon: "🛡",
        rarity: "Rare"
    },
    {
        type: "armor",
        name: "Dragon Armor",
        hp: 80,
        icon: "🐉",
        rarity: "Epic"
    },
    // BOOTS
    {
        type: "boots",
        name: "Swift Boots",
        speed: 1.2,
        jump: 0,
        icon: "👢",
        rarity: "Common"
    },
    {
        type: "boots",
        name: "Highland Boots",
        speed: 0.6,
        jump: 2,
        icon: "👢",
        rarity: "Rare"
    }
];
// ------------------------------------------------------------
// Current Level Objects
// ------------------------------------------------------------
let platforms = [];
let enemies = [];
let coinsList = [];
let gearDrops = [];
let boss = null;
// ------------------------------------------------------------
// Level Data
// ------------------------------------------------------------
const levelData = [
    // ========================================================
    // LEVEL 1
    // ========================================================
    {
        name: "The Forgotten Fields",
        background: "#17213b",
        platforms: [
            { x: 150, y: 500, width: 180, height: 25 },
            { x: 430, y: 430, width: 190, height: 25 },
            { x: 750, y: 510, width: 190, height: 25 },
            { x: 1020, y: 400, width: 150, height: 25 }
        ],
        enemies: [
            {
                x: 360,
                y: 545,
                width: 45,
                height: 65,
                health: 40,
                speed: 1.2
            },
            {
                x: 680,
                y: 545,
                width: 45,
                height: 65,
                health: 45,
                speed: 1.3
            },
            {
                x: 900,
                y: 445,
                width: 45,
                height: 65,
                health: 55,
                speed: 1.1
            }
        ],
        coins: [
            { x: 220, y: 455 },
            { x: 510, y: 385 },
            { x: 820, y: 465 },
            { x: 1080, y: 355 }
        ],
        gear: [
            { x: 560, y: 350, index: 0 }
        ],
        boss: null
    },
    // ========================================================
    // LEVEL 2
    // ========================================================
    {
        name: "The Dark Forest",
        background: "#10251c",
        platforms: [
            { x: 110, y: 520, width: 170, height: 25 },
            { x: 350, y: 445, width: 140, height: 25 },
            { x: 570, y: 360, width: 170, height: 25 },
            { x: 820, y: 470, width: 150, height: 25 },
            { x: 1030, y: 380, width: 150, height: 25 }
        ],
        enemies: [
            {
                x: 290,
                y: 545,
                width: 45,
                height: 65,
                health: 55,
                speed: 1.5
            },
            {
                x: 500,
                y: 545,
                width: 45,
                height: 65,
                health: 65,
                speed: 1.4
            },
            {
                x: 760,
                y: 545,
                width: 45,
                height: 65,
                health: 70,
                speed: 1.6
            },
            {
                x: 980,
                y: 545,
                width: 45,
                height: 65,
                health: 75,
                speed: 1.5
            }
        ],
        coins: [
            { x: 190, y: 475 },
            { x: 420, y: 400 },
            { x: 650, y: 315 },
            { x: 880, y: 425 },
            { x: 1090, y: 325 }
        ],
        gear: [
            { x: 650, y: 315, index: 3 },
            { x: 900, y: 425, index: 6 }
        ],
        boss: null
    },
    // ========================================================
    // LEVEL 3
    // ========================================================
    {
        name: "The Ancient Ruins",
        background: "#29233b",
        platforms: [
            { x: 120, y: 470, width: 150, height: 25 },
            { x: 330, y: 350, width: 140, height: 25 },
            { x: 540, y: 480, width: 150, height: 25 },
            { x: 760, y: 330, width: 150, height: 25 },
            { x: 1000, y: 450, width: 170, height: 25 }
        ],
        enemies: [
            {
                x: 280,
                y: 545,
                width: 45,
                height: 65,
                health: 70,
                speed: 1.6
            },
            {
                x: 480,
                y: 545,
                width: 45,
                height: 65,
                health: 80,
                speed: 1.7
            },
            {
                x: 700,
                y: 545,
                width: 45,
                height: 65,
                health: 85,
                speed: 1.6
            },
            {
                x: 930,
                y: 545,
                width: 45,
                height: 65,
                health: 90,
                speed: 1.8
            }
        ],
        coins: [
            { x: 190, y: 425 },
            { x: 400, y: 305 },
            { x: 615, y: 435 },
            { x: 835, y: 285 },
            { x: 1080, y: 405 }
        ],
        gear: [
            { x: 400, y: 305, index: 1 },
            { x: 835, y: 285, index: 7 }
        ],
        boss: {
            x: 1060,
            y: 370,
            width: 70,
            height: 75,
            health: 180,
            speed: 1.1,
            name: "RUIN GUARDIAN"
        }
    },
    // ========================================================
    // LEVEL 4
    // ========================================================
    {
        name: "The Frozen Keep",
        background: "#172b3b",
        platforms: [
            { x: 100, y: 520, width: 160, height: 25 },
            { x: 300, y: 410, width: 150, height: 25 },
            { x: 520, y: 300, width: 160, height: 25 },
            { x: 750, y: 440, width: 150, height: 25 },
            { x: 970, y: 330, width: 180, height: 25 }
        ],
        enemies: [
            {
                x: 270,
                y: 545,
                width: 45,
                height: 65,
                health: 85,
                speed: 1.8
            },
            {
                x: 470,
                y: 545,
                width: 45,
                height: 65,
                health: 95,
                speed: 1.9
            },
            {
                x: 700,
                y: 545,
                width: 45,
                height: 65,
                health: 100,
                speed: 1.8
            },
            {
                x: 920,
                y: 545,
                width: 45,
                height: 65,
                health: 105,
                speed: 2
            }
        ],
        coins: [
            { x: 180, y: 475 },
            { x: 375, y: 365 },
            { x: 600, y: 255 },
            { x: 825, y: 395 },
            { x: 1060, y: 285 }
        ],
        gear: [
            { x: 600, y: 255, index: 2 },
            { x: 825, y: 395, index: 4 }
        ],
        boss: {
            x: 1060,
            y: 255,
            width: 70,
            height: 75,
            health: 250,
            speed: 1.3,
            name: "ICE WARLORD"
        }
    },
    // ========================================================
    // LEVEL 5
    // ========================================================
    {
        name: "The Shadow Castle",
        background: "#160f1d",
        platforms: [
            { x: 100, y: 500, width: 160, height: 25 },
            { x: 310, y: 390, width: 140, height: 25 },
            { x: 500, y: 500, width: 140, height: 25 },
            { x: 690, y: 350, width: 150, height: 25 },
            { x: 900, y: 460, width: 140, height: 25 },
            { x: 1080, y: 320, width: 100, height: 25 }
        ],
        enemies: [
            {
                x: 270,
                y: 545,
                width: 45,
                height: 65,
                health: 110,
                speed: 2
            },
            {
                x: 460,
                y: 545,
                width: 45,
                height: 65,
                health: 115,
                speed: 2.1
            },
            {
                x: 650,
                y: 545,
                width: 45,
                height: 65,
                health: 120,
                speed: 2
            },
            {
                x: 850,
                y: 545,
                width: 45,
                height: 65,
                health: 130,
                speed: 2.2
            }
        ],
        coins: [
            { x: 180, y: 455 },
            { x: 380, y: 345 },
            { x: 570, y: 455 },
            { x: 765, y: 305 },
            { x: 960, y: 415 },
            { x: 1120, y: 275 }
        ],
        gear: [
            { x: 380, y: 345, index: 5 }
        ],
        boss: {
            x: 1060,
            y: 245,
            width: 85,
            height: 85,
            health: 400,
            speed: 1.5,
            name: "SHADOW KING"
        }
    }
];
// ------------------------------------------------------------
// Collision
// ------------------------------------------------------------
function rectangleCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
// ------------------------------------------------------------
// Gear
// ------------------------------------------------------------
function showGearMessage(text) {
    gearMessage = text;
    gearMessageTimer = 180;
}
function recalculateStats() {
    player.maxHealth =
        100 + (equipment.armor.hp || 0);
    player.speed =
        5 + (equipment.boots.speed || 0);
    player.jumpPower =
        14 + (equipment.boots.jump || 0);
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
}
function equipGear(item) {
    equipment[item.type] = { ...item };
    recalculateStats();
    if (item.type === "weapon") {
        showGearMessage(
            `${item.icon} Equipped ${item.name}! Damage: ${item.damage}`
        );
    } else if (item.type === "armor") {
        showGearMessage(
            `${item.icon} Equipped ${item.name}! +${item.hp} Max HP`
        );
    } else {
        showGearMessage(
            `${item.icon} Equipped ${item.name}! Speed +${item.speed}`
        );
    }
    score += 150;
}
// ------------------------------------------------------------
// Setup Level
// ------------------------------------------------------------
function setupLevel() {
    const data = levelData[level - 1];
    platforms = data.platforms.map(p => ({ ...p }));
    enemies = data.enemies.map(e => ({
        ...e,
        maxHealth: e.health,
        alive: true,
        vy: 0,
        hitTimer: 0
    }));
    coinsList = data.coins.map(c => ({
        ...c,
        collected: false
    }));
    gearDrops = data.gear.map(g => ({
        x: g.x,
        y: g.y,
        item: { ...gearPool[g.index] },
        collected: false
    }));
    boss = data.boss
        ? {
            ...data.boss,
            maxHealth: data.boss.health,
            alive: true,
            hitTimer: 0,
            attackTimer: 0
        }
        : null;
    player.x = 60;
    player.y = 450;
    player.vx = 0;
    player.vy = 0;
    player.health = player.maxHealth;
    player.invincibleTimer = 60;
    levelComplete = false;
    levelMessageTimer = 150;
}
// ------------------------------------------------------------
// Player Damage
// ------------------------------------------------------------
function damagePlayer(amount) {
    if (
        player.invincibleTimer > 0 ||
        gameOver ||
        victory ||
        levelComplete
    ) {
        return;
    }
    player.health -= amount;
    player.invincibleTimer = 60;
    if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
    }
}
// ------------------------------------------------------------
// Player Movement
// ------------------------------------------------------------
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
    if (
        (keys["w"] ||
            keys["arrowup"] ||
            keys[" "]) &&
        player.onGround
    ) {
        player.vy = -player.jumpPower;
        player.onGround = false;
    }
    // Attack
    if (
        (keys["j"] || keys["k"]) &&
        player.attackCooldown <= 0
    ) {
        player.attacking = true;
        player.attackTimer = 15;
        player.attackCooldown = 25;
    }
    player.x += player.vx;
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;
    // Ground
    if (player.y + player.height >= 610) {
        player.y = 610 - player.height;
        player.vy = 0;
        player.onGround = true;
    }
    // Platforms
    for (const platform of platforms) {
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height <=
                platform.y + 18 &&
            player.y +
                player.height +
                player.vy >=
                platform.y
        ) {
            player.y =
                platform.y -
                player.height;
            player.vy = 0;
            player.onGround = true;
        }
    }
    // World bounds
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > WIDTH) {
        player.x =
            WIDTH - player.width;
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
// ------------------------------------------------------------
// Attack
// ------------------------------------------------------------
function getAttackBox() {
    return {
        x:
            player.facing === 1
                ? player.x + player.width
                : player.x - 65,
        y: player.y + 12,
        width: 65,
        height: 48
    };
}
function playerAttack() {
    if (!player.attacking) {
        return;
    }
    const attackBox =
        getAttackBox();
    const damage =
        equipment.weapon.damage;
    // Enemies
    for (const enemy of enemies) {
        if (
            enemy.alive &&
            rectangleCollision(
                attackBox,
                enemy
            ) &&
            enemy.hitTimer <= 0
        ) {
            enemy.health -= damage;
            enemy.vx =
                player.facing * 4;
            enemy.hitTimer = 12;
            if (enemy.health <= 0) {
                enemy.health = 0;
                enemy.alive = false;
                score += 100;
                coins++;
                // 25% chance for gear
                if (Math.random() < 0.25) {
                    const item =
                        gearPool[
                            Math.floor(
                                Math.random() *
                                    gearPool.length
                            )
                        ];
                    gearDrops.push({
                        x:
                            enemy.x +
                            enemy.width / 2,
                        y: enemy.y,
                        item: { ...item },
                        collected: false
                    });
                }
            }
        }
    }
    // Boss
    if (
        boss &&
        boss.alive &&
        rectangleCollision(
            attackBox,
            boss
        ) &&
        boss.hitTimer <= 0
    ) {
        boss.health -= damage;
        boss.hitTimer = 12;
        if (boss.health <= 0) {
            boss.health = 0;
            boss.alive = false;
            score += 1000;
            if (
                level ===
                levelData.length
            ) {
                victory = true;
            } else {
                levelComplete = true;
            }
        }
    }
}
// ------------------------------------------------------------
// Enemy AI
// ------------------------------------------------------------
function updateEnemies() {
    for (const enemy of enemies) {
        if (!enemy.alive) {
            continue;
        }
        if (enemy.hitTimer > 0) {
            enemy.hitTimer--;
        }
        if (player.x < enemy.x) {
            enemy.vx =
                -enemy.speed;
        } else {
            enemy.vx =
                enemy.speed;
        }
        enemy.x += enemy.vx;
        enemy.y += gravity;
        if (
            enemy.y +
                enemy.height >=
            610
        ) {
            enemy.y =
                610 -
                enemy.height;
        }
        if (
            rectangleCollision(
                player,
                enemy
            )
        ) {
            damagePlayer(
                10 +
                    Math.floor(
                        level * 1.5
                    )
            );
        }
    }
}
// ------------------------------------------------------------
// Boss AI
// ------------------------------------------------------------
function updateBoss() {
    if (!boss || !boss.alive) {
        return;
    }
    if (boss.hitTimer > 0) {
        boss.hitTimer--;
    }
    if (player.x < boss.x) {
        boss.x -= boss.speed;
    } else {
        boss.x += boss.speed;
    }
    boss.x = Math.max(
        950,
        Math.min(
            WIDTH - boss.width,
            boss.x
        )
    );
    boss.attackTimer++;
    if (
        boss.attackTimer >
        Math.max(
            55,
            90 - level * 5
        )
    ) {
        boss.attackTimer = 0;
        if (
            Math.abs(
                player.x - boss.x
            ) < 190 &&
            Math.abs(
                player.y - boss.y
            ) < 120
        ) {
            damagePlayer(
                18 + level * 3
            );
        }
    }
}
// ------------------------------------------------------------
// Coins
// ------------------------------------------------------------
function updateCoins() {
    for (const coin of coinsList) {
        if (coin.collected) {
            continue;
        }
        const box = {
            x: coin.x - 12,
            y: coin.y - 12,
            width: 24,
            height: 24
        };
        if (
            rectangleCollision(
                player,
                box
            )
        ) {
            coin.collected = true;
            coins++;
            score += 25;
        }
    }
}
// ------------------------------------------------------------
// Gear Pickup
// ------------------------------------------------------------
function updateGear() {
    for (const drop of gearDrops) {
        if (drop.collected) {
            continue;
        }
        const box = {
            x: drop.x - 16,
            y: drop.y - 20,
            width: 32,
            height: 40
        };
        if (
            rectangleCollision(
                player,
                box
            )
        ) {
            drop.collected = true;
            equipGear(drop.item);
        }
    }
}
// ------------------------------------------------------------
// Level Completion
// ------------------------------------------------------------
function allEnemiesDefeated() {
    return enemies.every(
        enemy => !enemy.alive
    );
}
function checkLevelExit() {
    // Levels without bosses:
    // kill all enemies and reach the right side.
    if (
        !boss &&
        allEnemiesDefeated() &&
        player.x > WIDTH - 100
    ) {
        levelComplete = true;
    }
}
function nextLevel() {
    if (
        level <
        levelData.length
    ) {
        level++;
        setupLevel();
    }
}
// ------------------------------------------------------------
// Update
// ------------------------------------------------------------
function update() {
    if (gameOver || victory) {
        return;
    }
    // Waiting at level-complete screen
    if (levelComplete) {
        if (
            keys["enter"] ||
            keys["n"]
        ) {
            keys["enter"] = false;
            keys["n"] = false;
            nextLevel();
        }
        return;
    }
    updatePlayer();
    playerAttack();
    updateEnemies();
    updateBoss();
    updateCoins();
    updateGear();
    checkLevelExit();
    if (gearMessageTimer > 0) {
        gearMessageTimer--;
    }
    if (levelMessageTimer > 0) {
        levelMessageTimer--;
    }
}
// ------------------------------------------------------------
// Background
// ------------------------------------------------------------
function drawBackground() {
    const data =
        levelData[level - 1];
    ctx.fillStyle =
        data.background;
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    // Moon
    ctx.fillStyle =
        "#eee8c9";
    ctx.beginPath();
    ctx.arc(
        1080,
        90,
        42,
        0,
        Math.PI * 2
    );
    ctx.fill();
    // Mountains
    ctx.fillStyle =
        "rgba(50,65,90,0.55)";
    ctx.beginPath();
    ctx.moveTo(0,610);
    ctx.lineTo(180,350);
    ctx.lineTo(330,610);
    ctx.lineTo(500,300);
    ctx.lineTo(700,610);
    ctx.lineTo(850,370);
    ctx.lineTo(1050,610);
    ctx.lineTo(1200,330);
    ctx.lineTo(1280,610);
    ctx.closePath();
    ctx.fill();
    // Ground
    ctx.fillStyle =
        "#263d29";
    ctx.fillRect(
        0,
        610,
        WIDTH,
        110
    );
    ctx.fillStyle =
        "#3c5b37";
    ctx.fillRect(
        0,
        610,
        WIDTH,
        15
    );
}
// ------------------------------------------------------------
// Platforms
// ------------------------------------------------------------
function drawPlatforms() {
    for (const platform of platforms) {
        ctx.fillStyle =
            "#654936";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
        ctx.fillStyle =
            "#3c5b37";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            7
        );
    }
}
// ------------------------------------------------------------
// Player Drawing
// ------------------------------------------------------------
function drawPlayer() {
    if (
        player.invincibleTimer > 0 &&
        Math.floor(
            player.invincibleTimer / 5
        ) %
            2 ===
            0
    ) {
        return;
    }
    // Cape
    ctx.fillStyle =
        "#8b1e2d";
    ctx.fillRect(
        player.x + 7,
        player.y + 25,
        15,
        38
    );
    // Armor
    ctx.fillStyle =
        "#9da4ad";
    ctx.fillRect(
        player.x + 10,
        player.y + 25,
        28,
        35
    );
    // Helmet
    ctx.fillStyle =
        "#c4cad0";
    ctx.fillRect(
        player.x + 7,
        player.y + 5,
        35,
        27
    );
    // Visor
    ctx.fillStyle =
        "#222";
    ctx.fillRect(
        player.x +
            (player.facing === 1
                ? 25
                : 5),
        player.y + 15,
        15,
        7
    );
    // Legs
    ctx.fillStyle =
        "#555";
    ctx.fillRect(
        player.x + 10,
        player.y + 58,
        10,
        12
    );
    ctx.fillRect(
        player.x + 27,
        player.y + 58,
        10,
        12
    );
    // Sword
    if (player.attacking) {
        const attackBox =
            getAttackBox();
        ctx.fillStyle =
            "#eee";
        ctx.fillRect(
            attackBox.x,
            attackBox.y + 15,
            attackBox.width,
            7
        );
        ctx.fillStyle =
            "#d6b45c";
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
// ------------------------------------------------------------
// Enemy Drawing
// ------------------------------------------------------------
function drawEnemy(enemy) {
    if (!enemy.alive) {
        return;
    }
    ctx.fillStyle =
        "#743c3c";
    ctx.fillRect(
        enemy.x,
        enemy.y + 20,
        enemy.width,
        enemy.height - 20
    );
    ctx.fillStyle =
        "#b46a4a";
    ctx.fillRect(
        enemy.x + 5,
        enemy.y,
        enemy.width - 10,
        28
    );
    ctx.fillStyle =
        "#ffdd55";
    ctx.fillRect(
        enemy.x + 10,
        enemy.y + 10,
        5,
        5
    );
    ctx.fillRect(
        enemy.x + 30,
        enemy.y + 10,
        5,
        5
    );
    drawHealthBar(
        enemy.x,
        enemy.y - 12,
        enemy.width,
        enemy.health,
        enemy.maxHealth
    );
}
// ------------------------------------------------------------
// Boss Drawing
// ------------------------------------------------------------
function drawBoss() {
    if (!boss || !boss.alive) {
        return;
    }
    ctx.fillStyle =
        "#401b50";
    ctx.fillRect(
        boss.x - 5,
        boss.y + 25,
        boss.width + 10,
        boss.height - 25
    );
    ctx.fillStyle =
        "#777";
    ctx.fillRect(
        boss.x,
        boss.y + 20,
        boss.width,
        boss.height - 20
    );
    ctx.fillStyle =
        "#aaa";
    ctx.fillRect(
        boss.x + 5,
        boss.y,
        boss.width - 10,
        30
    );
    ctx.fillStyle =
        "#181818";
    ctx.fillRect(
        boss.x + 10,
        boss.y + 12,
        boss.width - 20,
        8
    );
    ctx.fillStyle =
        "#ff3333";
    ctx.fillRect(
        boss.x + 18,
        boss.y + 13,
        6,
        5
    );
    ctx.fillRect(
        boss.x +
            boss.width -
            24,
        boss.y + 13,
        6,
        5
    );
    drawHealthBar(
        boss.x - 20,
        boss.y - 25,
        boss.width + 40,
        boss.health,
        boss.maxHealth
    );
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "18px Arial";
    ctx.fillText(
        boss.name,
        boss.x - 20,
        boss.y - 35
    );
}
// ------------------------------------------------------------
// Coin Drawing
// ------------------------------------------------------------
function drawCoin(coin) {
    if (coin.collected) {
        return;
    }
    ctx.fillStyle =
        "#ffd84d";
    ctx.beginPath();
    ctx.arc(
        coin.x,
        coin.y,
        11,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle =
        "#fff2a3";
    ctx.beginPath();
    ctx.arc(
        coin.x - 3,
        coin.y - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}
// ------------------------------------------------------------
// Gear Drawing
// ------------------------------------------------------------
function drawGear(drop) {
    if (drop.collected) {
        return;
    }
    const item =
        drop.item;
    if (item.rarity === "Epic") {
        ctx.fillStyle =
            "#c86cff";
    } else if (
        item.rarity === "Rare"
    ) {
        ctx.fillStyle =
            "#55aaff";
    } else {
        ctx.fillStyle =
            "#ddd";
    }
    // Glow
    ctx.beginPath();
    ctx.arc(
        drop.x,
        drop.y,
        18,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle =
        "#111";
    ctx.font =
        "18px Arial";
    ctx.textAlign =
        "center";
    ctx.fillText(
        item.icon,
        drop.x,
        drop.y + 6
    );
    ctx.textAlign =
        "left";
}
// ------------------------------------------------------------
// Health Bar
// ------------------------------------------------------------
function drawHealthBar(
    x,
    y,
    width,
    health,
    maxHealth
) {
    ctx.fillStyle =
        "#111";
    ctx.fillRect(
        x,
        y,
        width,
        8
    );
    ctx.fillStyle =
        "#e33";
    ctx.fillRect(
        x,
        y,
        width *
            Math.max(
                0,
                health / maxHealth
            ),
        8
    );
}
// ------------------------------------------------------------
// UI
// ------------------------------------------------------------
function drawUI() {
    // HP
    ctx.fillStyle =
        "#111";
    ctx.fillRect(
        20,
        20,
        220,
        30
    );
    ctx.fillStyle =
        "#e33";
    ctx.fillRect(
        25,
        25,
        210 *
            (player.health /
                player.maxHealth),
        20
    );
    ctx.strokeStyle =
        "#fff";
    ctx.strokeRect(
        20,
        20,
        220,
        30
    );
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "17px Arial";
    ctx.fillText(
        `HP: ${player.health}/${player.maxHealth}`,
        35,
        44
    );
    // Stats
    ctx.font =
        "18px Arial";
    ctx.fillText(
        `Level: ${level}/5`,
        20,
        78
    );
    ctx.fillText(
        `Coins: ${coins}`,
        20,
        103
    );
    ctx.fillText(
        `Score: ${score}`,
        20,
        128
    );
    // Equipment panel
    ctx.fillStyle =
        "rgba(0,0,0,0.65)";
    ctx.fillRect(
        WIDTH - 315,
        15,
        295,
        120
    );
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "16px Arial";
    ctx.fillText(
        "EQUIPMENT",
        WIDTH - 295,
        38
    );
    ctx.font =
        "14px Arial";
    ctx.fillText(
        `⚔ ${equipment.weapon.name} (${equipment.weapon.damage} dmg)`,
        WIDTH - 295,
        63
    );
    ctx.fillText(
        `🛡 ${equipment.armor.name} (+${equipment.armor.hp} HP)`,
        WIDTH - 295,
        86
    );
    ctx.fillText(
        `👢 ${equipment.boots.name} (+${equipment.boots.speed} speed)`,
        WIDTH - 295,
        109
    );
    // Level name
    if (levelMessageTimer > 0) {
        ctx.textAlign =
            "center";
        ctx.fillStyle =
            "#fff";
        ctx.font =
            "32px Arial";
        ctx.fillText(
            levelData[level - 1].name,
            WIDTH / 2,
            70
        );
        ctx.textAlign =
            "left";
    }
    // Gear notification
    if (gearMessageTimer > 0) {
        ctx.textAlign =
            "center";
        ctx.fillStyle =
            "#ffd84d";
        ctx.font =
            "22px Arial";
        ctx.fillText(
            gearMessage,
            WIDTH / 2,
            HEIGHT - 65
        );
        ctx.textAlign =
            "left";
    }
    // Controls
    ctx.fillStyle =
        "#ddd";
    ctx.font =
        "15px Arial";
    ctx.fillText(
        "A/D or ←/→ Move   W/↑/Space Jump   J/K Attack",
        330,
        695
    );
}
// ------------------------------------------------------------
// Level Complete Screen
// ------------------------------------------------------------
function drawLevelComplete() {
    ctx.fillStyle =
        "rgba(0,0,0,0.78)";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    ctx.textAlign =
        "center";
    ctx.fillStyle =
        "#ffd84d";
    ctx.font =
        "55px Arial";
    ctx.fillText(
        "LEVEL COMPLETE!",
        WIDTH / 2,
        HEIGHT / 2 - 60
    );
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "25px Arial";
    if (
        level <
        levelData.length
    ) {
        ctx.fillText(
            `Get ready for ${levelData[level].name}`,
            WIDTH / 2,
            HEIGHT / 2
        );
        ctx.font =
            "20px Arial";
        ctx.fillText(
            "Press ENTER or N for the next level",
            WIDTH / 2,
            HEIGHT / 2 + 50
        );
    }
    ctx.textAlign =
        "left";
}
// ------------------------------------------------------------
// Game Over
// ------------------------------------------------------------
function drawGameOver() {
    ctx.fillStyle =
        "rgba(0,0,0,0.78)";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    ctx.textAlign =
        "center";
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "60px Arial";
    ctx.fillText(
        "GAME OVER",
        WIDTH / 2,
        HEIGHT / 2 - 40
    );
    ctx.font =
        "25px Arial";
    ctx.fillText(
        `You reached level ${level}`,
        WIDTH / 2,
        HEIGHT / 2 + 10
    );
    ctx.fillText(
        "Refresh the page to try again",
        WIDTH / 2,
        HEIGHT / 2 + 50
    );
    ctx.textAlign =
        "left";
}
// ------------------------------------------------------------
// Victory
// ------------------------------------------------------------
function drawVictory() {
    ctx.fillStyle =
        "rgba(0,0,0,0.8)";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    ctx.textAlign =
        "center";
    ctx.fillStyle =
        "#ffd84d";
    ctx.font =
        "60px Arial";
    ctx.fillText(
        "VICTORY!",
        WIDTH / 2,
        HEIGHT / 2 - 70
    );
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "27px Arial";
    ctx.fillText(
        "The Shadow King has fallen!",
        WIDTH / 2,
        HEIGHT / 2 - 20
    );
    ctx.fillText(
        `Final Score: ${score}   Coins: ${coins}`,
        WIDTH / 2,
        HEIGHT / 2 + 30
    );
    ctx.font =
        "20px Arial";
    ctx.fillText(
        "You conquered all 5 levels!",
        WIDTH / 2,
        HEIGHT / 2 + 70
    );
    ctx.fillText(
        "Refresh the page to play again",
        WIDTH / 2,
        HEIGHT / 2 + 110
    );
    ctx.textAlign =
        "left";
}
// ------------------------------------------------------------
// Drawing
// ------------------------------------------------------------
function draw() {
    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    drawBackground();
    drawPlatforms();
    for (const coin of coinsList) {
        drawCoin(coin);
    }
    for (const drop of gearDrops) {
        drawGear(drop);
    }
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
    drawBoss();
    drawPlayer();
    drawUI();
    if (levelComplete) {
        drawLevelComplete();
    }
    if (gameOver) {
        drawGameOver();
    }
    if (victory) {
        drawVictory();
    }
}
// ------------------------------------------------------------
// Game Loop
// ------------------------------------------------------------
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(
        gameLoop
    );
}
// ------------------------------------------------------------
// Start
// ------------------------------------------------------------
recalculateStats();
setupLevel();
gameLoop();
