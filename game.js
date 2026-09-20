// ============================================================
// KNIGHT'S QUEST
// Complete game.js
// ============================================================
"use strict";
// ------------------------------------------------------------
// CANVAS
// ------------------------------------------------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const W = canvas.width;
const H = canvas.height;
// ------------------------------------------------------------
// GAME STATE
// ------------------------------------------------------------
let currentLevel = 0;
let score = 0;
let coins = 0;
let gameOver = false;
let victory = false;
let levelComplete = false;
let inventoryOpen = false;
let levelObjects = [];
let enemies = [];
let boss = null;
let levelCoins = [];
let gearDrops = [];
let message = "";
let messageTimer = 0;
// ------------------------------------------------------------
// INPUT
// ------------------------------------------------------------
const keys = {};
window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === "i") {
        inventoryOpen = !inventoryOpen;
    }
    if (gameOver || victory) {
        if (e.key === "r" || e.key === "R") {
            restartGame();
        }
    }
    if (levelComplete && e.key === "Enter") {
        nextLevel();
    }
    if (inventoryOpen) {
        const n = parseInt(e.key);
        if (n >= 1 && n <= 9) {
            equipInventorySlot(n - 1);
        }
    }
});
window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});
canvas.addEventListener("click", e => {
    if (!inventoryOpen) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) *
        (canvas.width / rect.width);
    const my = (e.clientY - rect.top) *
        (canvas.height / rect.height);
    handleInventoryClick(mx, my);
});
// ------------------------------------------------------------
// PLAYER
// ------------------------------------------------------------
const player = {
    x: 90,
    y: 400,
    width: 34,
    height: 54,
    vx: 0,
    vy: 0,
    speed: 4.2,
    jumpPower: 11,
    health: 100,
    maxHealth: 100,
    attackDamage: 18,
    facing: 1,
    onGround: false,
    attackTimer: 0,
    attackCooldown: 0,
    invincible: 0,
    hurtTimer: 0
};
// ------------------------------------------------------------
// EQUIPMENT
// ------------------------------------------------------------
const starterGear = [
    {
        name: "Iron Sword",
        type: "weapon",
        damage: 18,
        defense: 0,
        speed: 0,
        rarity: "Common"
    },
    {
        name: "Knight Armor",
        type: "armor",
        damage: 0,
        defense: 5,
        speed: 0,
        rarity: "Common"
    },
    {
        name: "Traveler Boots",
        type: "boots",
        damage: 0,
        defense: 0,
        speed: 0.4,
        rarity: "Common"
    }
];
const gearPool = [
    {
        name: "Steel Sword",
        type: "weapon",
        damage: 25,
        defense: 0,
        speed: 0,
        rarity: "Uncommon"
    },
    {
        name: "Flame Blade",
        type: "weapon",
        damage: 34,
        defense: 0,
        speed: 0,
        rarity: "Rare"
    },
    {
        name: "Shadow Greatsword",
        type: "weapon",
        damage: 46,
        defense: 0,
        speed: -0.2,
        rarity: "Epic"
    },
    {
        name: "Chainmail",
        type: "armor",
        damage: 0,
        defense: 10,
        speed: -0.1,
        rarity: "Uncommon"
    },
    {
        name: "Knight Plate",
        type: "armor",
        damage: 0,
        defense: 17,
        speed: -0.25,
        rarity: "Rare"
    },
    {
        name: "Dragon Armor",
        type: "armor",
        damage: 0,
        defense: 28,
        speed: -0.1,
        rarity: "Epic"
    },
    {
        name: "Swift Boots",
        type: "boots",
        damage: 0,
        defense: 0,
        speed: 1.0,
        rarity: "Uncommon"
    },
    {
        name: "Highland Boots",
        type: "boots",
        damage: 0,
        defense: 3,
        speed: 1.5,
        rarity: "Rare"
    }
];
let inventory = [];
let equipped = {
    weapon: null,
    armor: null,
    boots: null
};
function cloneGear(item) {
    return { ...item };
}
function initializeEquipment() {
    inventory = starterGear.map(cloneGear);
    equipped.weapon = inventory[0];
    equipped.armor = inventory[1];
    equipped.boots = inventory[2];
    recalcStats();
}
function recalcStats() {
    let damage = 18;
    let defense = 0;
    let speed = 4.2;
    if (equipped.weapon) {
        damage = equipped.weapon.damage;
    }
    if (equipped.armor) {
        defense += equipped.armor.defense;
        speed += equipped.armor.speed || 0;
    }
    if (equipped.boots) {
        defense += equipped.boots.defense || 0;
        speed += equipped.boots.speed || 0;
    }
    player.attackDamage = damage;
    player.speed = Math.max(2.5, speed);
    player.maxHealth = 100 + defense * 2;
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
}
// ------------------------------------------------------------
// LEVEL DATA
// ------------------------------------------------------------
const levels = [
    {
        name: "Forgotten Fields",
        sky: "#5b8dd9",
        ground: "#314b32",
        platforms: [
            { x: 0, y: 610, w: 1200, h: 70 },
            { x: 180, y: 510, w: 180, h: 25 },
            { x: 470, y: 440, w: 170, h: 25 },
            { x: 760, y: 500, w: 190, h: 25 },
            { x: 1010, y: 400, w: 150, h: 25 }
        ],
        enemies: [
            { x: 420, y: 560, type: "soldier" },
            { x: 690, y: 390, type: "knight" },
            { x: 930, y: 440, type: "archer" }
        ],
        coins: [
            { x: 240, y: 470 },
            { x: 520, y: 400 },
            { x: 830, y: 460 },
            { x: 1080, y: 360 }
        ],
        gear: [
            { x: 560, y: 395, item: "Steel Sword" }
        ],
        boss: null
    },
    {
        name: "Dark Forest",
        sky: "#182b32",
        ground: "#18251d",
        platforms: [
            { x: 0, y: 610, w: 1200, h: 70 },
            { x: 120, y: 520, w: 180, h: 25 },
            { x: 390, y: 460, w: 170, h: 25 },
            { x: 640, y: 520, w: 160, h: 25 },
            { x: 880, y: 430, w: 200, h: 25 }
        ],
        enemies: [
            { x: 330, y: 560, type: "soldier" },
            { x: 570, y: 410, type: "knight" },
            { x: 820, y: 470, type: "archer" },
            { x: 1020, y: 380, type: "knight" }
        ],
        coins: [
            { x: 190, y: 480 },
            { x: 450, y: 420 },
            { x: 700, y: 480 },
            { x: 960, y: 390 }
        ],
        gear: [
            { x: 460, y: 415, item: "Chainmail" },
            { x: 740, y: 475, item: "Swift Boots" }
        ],
        boss: null
    },
    {
        name: "Ancient Ruins",
        sky: "#655a4a",
        ground: "#3f382d",
        platforms: [
            { x: 0, y: 610, w: 1200, h: 70 },
            { x: 140, y: 500, w: 180, h: 25 },
            { x: 390, y: 410, w: 160, h: 25 },
            { x: 650, y: 500, w: 180, h: 25 },
            { x: 920, y: 400, w: 190, h: 25 }
        ],
        enemies: [
            { x: 300, y: 560, type: "soldier" },
            { x: 530, y: 360, type: "knight" },
            { x: 820, y: 450, type: "soldier" },
            { x: 1060, y: 350, type: "archer" }
        ],
        coins: [
            { x: 200, y: 460 },
            { x: 450, y: 370 },
            { x: 720, y: 460 },
            { x: 990, y: 360 }
        ],
        gear: [
            { x: 450, y: 365, item: "Flame Blade" },
            { x: 730, y: 465, item: "Highland Boots" }
        ],
        boss: {
            name: "Ruin Guardian",
            x: 1090,
            y: 330,
            health: 300,
            damage: 22,
            speed: 1.7
        }
    },
    {
        name: "Frozen Keep",
        sky: "#6e9db5",
        ground: "#405967",
        platforms: [
            { x: 0, y: 610, w: 1200, h: 70 },
            { x: 100, y: 510, w: 180, h: 25 },
            { x: 360, y: 430, w: 190, h: 25 },
            { x: 650, y: 510, w: 160, h: 25 },
            { x: 900, y: 390, w: 200, h: 25 }
        ],
        enemies: [
            { x: 280, y: 560, type: "knight" },
            { x: 560, y: 380, type: "soldier" },
            { x: 820, y: 470, type: "knight" },
            { x: 1040, y: 340, type: "archer" }
        ],
        coins: [
            { x: 170, y: 470 },
            { x: 450, y: 390 },
            { x: 720, y: 470 },
            { x: 990, y: 350 }
        ],
        gear: [
            { x: 460, y: 385, item: "Shadow Greatsword" },
            { x: 730, y: 465, item: "Knight Plate" }
        ],
        boss: {
            name: "Ice Warlord",
            x: 1080,
            y: 320,
            health: 450,
            damage: 28,
            speed: 1.9
        }
    },
    {
        name: "Shadow Castle",
        sky: "#110f1b",
        ground: "#211b29",
        platforms: [
            { x: 0, y: 610, w: 1200, h: 70 },
            { x: 120, y: 500, w: 170, h: 25 },
            { x: 370, y: 420, w: 180, h: 25 },
            { x: 650, y: 500, w: 180, h: 25 },
            { x: 920, y: 380, w: 200, h: 25 }
        ],
        enemies: [
            { x: 290, y: 560, type: "knight" },
            { x: 560, y: 370, type: "knight" },
            { x: 820, y: 460, type: "soldier" },
            { x: 1060, y: 330, type: "archer" }
        ],
        coins: [
            { x: 180, y: 460 },
            { x: 460, y: 380 },
            { x: 720, y: 460 },
            { x: 990, y: 340 }
        ],
        gear: [
            { x: 730, y: 465, item: "Dragon Armor" }
        ],
        boss: {
            name: "Shadow King",
            x: 1080,
            y: 300,
            health: 650,
            damage: 34,
            speed: 2.2
        }
    }
];
// ------------------------------------------------------------
// LOAD LEVEL
// ------------------------------------------------------------
function loadLevel(index) {
    currentLevel = index;
    const data = levels[index];
    levelObjects = data.platforms.map(p => ({ ...p }));
    enemies = data.enemies.map((e, i) => ({
        ...e,
        id: i,
        width: 38,
        height: 52,
        vx: 0,
        vy: 0,
        health: e.type === "knight" ? 90 : 65,
        maxHealth: e.type === "knight" ? 90 : 65,
        speed:
            e.type === "knight"
                ? 1.55
                : e.type === "archer"
                    ? 1.35
                    : 1.45,
        rushSpeed: 2.45,
        facing: -1,
        state: "patrol",
        attackTimer: 0,
        attackCooldown: 0,
        windup: 0,
        invincible: 0,
        patrolStart: e.x - 80,
        patrolEnd: e.x + 80,
        onGround: false
    }));
    levelCoins = data.coins.map(c => ({
        x: c.x,
        y: c.y,
        collected: false,
        bob: Math.random() * Math.PI * 2
    }));
    gearDrops = data.gear.map(g => ({
        x: g.x,
        y: g.y,
        item: g.item,
        collected: false,
        bob: Math.random() * Math.PI * 2
    }));
    boss = null;
    if (data.boss) {
        boss = {
            ...data.boss,
            width: 68,
            height: 88,
            vx: 0,
            vy: 0,
            maxHealth: data.boss.health,
            attackCooldown: 0,
            windup: 0,
            facing: -1,
            invincible: 0,
            onGround: false
        };
    }
    player.x = 70;
    player.y = 450;
    player.vx = 0;
    player.vy = 0;
    player.health = player.maxHealth;
    player.attackTimer = 0;
    player.attackCooldown = 0;
    levelComplete = false;
    inventoryOpen = false;
    showMessage(data.name, 120);
}
function restartGame() {
    currentLevel = 0;
    score = 0;
    coins = 0;
    gameOver = false;
    victory = false;
    initializeEquipment();
    loadLevel(0);
}
function nextLevel() {
    if (currentLevel >= levels.length - 1) {
        victory = true;
        levelComplete = false;
        return;
    }
    loadLevel(currentLevel + 1);
}
// ------------------------------------------------------------
// MESSAGE
// ------------------------------------------------------------
function showMessage(text, time = 100) {
    message = text;
    messageTimer = time;
}
// ------------------------------------------------------------
// COLLISION
// ------------------------------------------------------------
function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
// ------------------------------------------------------------
// PLAYER UPDATE
// ------------------------------------------------------------
function updatePlayer() {
    if (gameOver || victory || inventoryOpen) return;
    player.vx = 0;
    if (keys["a"] || keys["arrowleft"]) {
        player.vx = -player.speed;
        player.facing = -1;
    }
    if (keys["d"] || keys["arrowright"]) {
        player.vx = player.speed;
        player.facing = 1;
    }
    if (
        (keys["w"] ||
            keys["arrowup"] ||
            keys[" "]) &&
        player.onGround
    ) {
        player.vy = -player.jumpPower;
        player.onGround = false;
    }
    if (
        (keys["j"] ||
            keys["z"] ||
            keys["f"]) &&
        player.attackCooldown <= 0
    ) {
        player.attackTimer = 14;
        player.attackCooldown = 24;
    }
    player.x += player.vx;
    player.vy += 0.55;
    if (player.vy > 14) {
        player.vy = 14;
    }
    player.y += player.vy;
    player.onGround = false;
    for (const p of levelObjects) {
        if (
            player.x + player.width > p.x &&
            player.x < p.x + p.w &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + 18 &&
            player.vy >= 0
        ) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.onGround = true;
        }
    }
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > W) {
        player.x = W - player.width;
    }
    if (player.y > H + 100) {
        takeDamage(999);
    }
    if (player.attackTimer > 0) {
        player.attackTimer--;
    }
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    if (player.invincible > 0) {
        player.invincible--;
    }
    if (player.hurtTimer > 0) {
        player.hurtTimer--;
    }
    checkPlayerAttack();
    collectCoins();
    collectGear();
    // Reaching the end only counts after everything is defeated.
    if (
        player.x > W - 85 &&
        allEnemiesDefeated()
    ) {
        levelComplete = true;
    }
}
// ------------------------------------------------------------
// PLAYER ATTACK
// ------------------------------------------------------------
function checkPlayerAttack() {
    if (player.attackTimer !== 8) return;
    const range = 72;
    const attackBox = {
        x:
            player.facing === 1
                ? player.x + player.width
                : player.x - range,
        y: player.y + 8,
        width: range,
        height: 40
    };
    for (const enemy of enemies) {
        if (
            enemy.health > 0 &&
            rectsOverlap(attackBox, enemy)
        ) {
            damageEnemy(enemy, player.attackDamage);
        }
    }
    if (boss && boss.health > 0) {
        if (rectsOverlap(attackBox, boss)) {
            damageBoss(boss, player.attackDamage);
        }
    }
}
function damageEnemy(enemy, damage) {
    if (enemy.invincible > 0) return;
    enemy.health -= damage;
    enemy.invincible = 8;
    enemy.vx =
        player.facing * 4;
    score += 10;
    if (enemy.health <= 0) {
        enemy.health = 0;
        score += 50;
    }
}
function damageBoss(target, damage) {
    if (target.invincible > 0) return;
    target.health -= damage;
    target.invincible = 10;
    target.vx =
        player.facing * 3;
    score += 20;
    if (target.health <= 0) {
        target.health = 0;
        score += 500;
        showMessage("BOSS DEFEATED!", 120);
    }
}
// ------------------------------------------------------------
// ENEMY UPDATE
// ------------------------------------------------------------
function updateEnemies() {
    if (gameOver || victory || inventoryOpen) return;
    for (const enemy of enemies) {
        if (enemy.health <= 0) continue;
        const dx =
            player.x - enemy.x;
        const dy =
            player.y - enemy.y;
        const distance = Math.abs(dx);
        // Detect player.
        if (
            distance < 520 &&
            Math.abs(dy) < 220
        ) {
            enemy.state = "rush";
        } else {
            enemy.state = "patrol";
        }
        if (enemy.invincible > 0) {
            enemy.invincible--;
        }
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
        // Attack windup.
        if (enemy.windup > 0) {
            enemy.windup--;
            if (
                enemy.windup === 4 &&
                rectsOverlap(enemy, player)
            ) {
                takeDamage(
                    9 + currentLevel * 2
                );
            }
            continue;
        }
        if (enemy.state === "rush") {
            if (dx > 0) {
                enemy.vx = enemy.rushSpeed;
                enemy.facing = 1;
            } else {
                enemy.vx = -enemy.rushSpeed;
                enemy.facing = -1;
            }
            if (
                Math.abs(dx) < 112 &&
                Math.abs(dy) < 85 &&
                enemy.attackCooldown <= 0
            ) {
                enemy.windup = 12;
                enemy.attackCooldown =
                    24 + Math.floor(Math.random() * 12);
            }
        } else {
            if (enemy.facing === 1) {
                enemy.vx = enemy.speed;
                if (enemy.x > enemy.patrolEnd) {
                    enemy.facing = -1;
                }
            } else {
                enemy.vx = -enemy.speed;
                if (enemy.x < enemy.patrolStart) {
                    enemy.facing = 1;
                }
            }
        }
        enemy.x += enemy.vx;
        enemy.vy += 0.55;
        if (enemy.vy > 14) {
            enemy.vy = 14;
        }
        enemy.y += enemy.vy;
        enemy.onGround = false;
        for (const p of levelObjects) {
            if (
                enemy.x + enemy.width > p.x &&
                enemy.x < p.x + p.w &&
                enemy.y + enemy.height >= p.y &&
                enemy.y + enemy.height <= p.y + 20 &&
                enemy.vy >= 0
            ) {
                enemy.y =
                    p.y - enemy.height;
                enemy.vy = 0;
                enemy.onGround = true;
            }
        }
        if (enemy.x < 0) {
            enemy.x = 0;
            enemy.facing = 1;
        }
        if (enemy.x + enemy.width > W) {
            enemy.x = W - enemy.width;
            enemy.facing = -1;
        }
    }
}
// ------------------------------------------------------------
// BOSS UPDATE
// ------------------------------------------------------------
function updateBoss() {
    if (!boss || boss.health <= 0) return;
    if (gameOver || victory || inventoryOpen) return;
    if (boss.invincible > 0) {
        boss.invincible--;
    }
    if (boss.attackCooldown > 0) {
        boss.attackCooldown--;
    }
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    if (boss.windup > 0) {
        boss.windup--;
        if (
            boss.windup === 5 &&
            Math.abs(dx) < 115 &&
            Math.abs(dy) < 95
        ) {
            takeDamage(boss.damage);
        }
        return;
    }
    if (dx > 0) {
        boss.facing = 1;
        boss.vx = boss.speed;
    } else {
        boss.facing = -1;
        boss.vx = -boss.speed;
    }
    if (
        Math.abs(dx) < 135 &&
        Math.abs(dy) < 100 &&
        boss.attackCooldown <= 0
    ) {
        boss.windup = 18;
        boss.attackCooldown = 40;
    }
    boss.x += boss.vx;
    boss.vy += 0.5;
    if (boss.vy > 12) {
        boss.vy = 12;
    }
    boss.y += boss.vy;
    boss.onGround = false;
    for (const p of levelObjects) {
        if (
            boss.x + boss.width > p.x &&
            boss.x < p.x + p.w &&
            boss.y + boss.height >= p.y &&
            boss.y + boss.height <= p.y + 25 &&
            boss.vy >= 0
        ) {
            boss.y =
                p.y - boss.height;
            boss.vy = 0;
            boss.onGround = true;
        }
    }
    if (boss.x < 700) {
        boss.x = 700;
    }
    if (boss.x + boss.width > W) {
        boss.x = W - boss.width;
    }
}
// ------------------------------------------------------------
// PLAYER DAMAGE
// ------------------------------------------------------------
function takeDamage(amount) {
    if (player.invincible > 0) return;
    if (gameOver) return;
    const defense =
        getDefense();
    const finalDamage =
        amount === 999
            ? 999
            : Math.max(
                1,
                amount - Math.floor(defense * 0.45)
            );
    player.health -= finalDamage;
    player.invincible = 45;
    player.hurtTimer = 12;
    if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
    }
}
function getDefense() {
    let defense = 0;
    if (equipped.armor) {
        defense += equipped.armor.defense || 0;
    }
    if (equipped.boots) {
        defense += equipped.boots.defense || 0;
    }
    return defense;
}
// ------------------------------------------------------------
// COINS
// ------------------------------------------------------------
function collectCoins() {
    for (const coin of levelCoins) {
        if (coin.collected) continue;
        const dx =
            player.x + player.width / 2 -
            coin.x;
        const dy =
            player.y + player.height / 2 -
            coin.y;
        if (
            Math.abs(dx) < 30 &&
            Math.abs(dy) < 35
        ) {
            coin.collected = true;
            coins++;
            score += 25;
        }
    }
}
// ------------------------------------------------------------
// GEAR DROPS
// ------------------------------------------------------------
function collectGear() {
    for (const drop of gearDrops) {
        if (drop.collected) continue;
        const dx =
            player.x + player.width / 2 -
            drop.x;
        const dy =
            player.y + player.height / 2 -
            drop.y;
        if (
            Math.abs(dx) < 32 &&
            Math.abs(dy) < 40
        ) {
            const item = gearPool.find(
                g => g.name === drop.item
            );
            if (item) {
                addToInventory(item);
                drop.collected = true;
                showMessage(
                    "Found: " + item.name,
                    100
                );
            }
        }
    }
}
function addToInventory(item) {
    if (inventory.length >= 12) {
        showMessage("Inventory Full!", 100);
        return;
    }
    const copy = cloneGear(item);
    inventory.push(copy);
    // Automatically equip better gear when collected.
    if (copy.type === "weapon") {
        if (
            !equipped.weapon ||
            copy.damage > equipped.weapon.damage
        ) {
            equipped.weapon = copy;
            recalcStats();
        }
    }
    if (copy.type === "armor") {
        if (
            !equipped.armor ||
            copy.defense > equipped.armor.defense
        ) {
            equipped.armor = copy;
            recalcStats();
        }
    }
    if (copy.type === "boots") {
        if (
            !equipped.boots ||
            copy.speed > equipped.boots.speed
        ) {
            equipped.boots = copy;
            recalcStats();
        }
    }
}
// ------------------------------------------------------------
// INVENTORY
// ------------------------------------------------------------
function equipInventorySlot(index) {
    if (!inventory[index]) return;
    const item = inventory[index];
    equipped[item.type] = item;
    recalcStats();
    showMessage(
        "Equipped: " + item.name,
        60
    );
}
function discardInventorySlot(index) {
    if (!inventory[index]) return;
    const item = inventory[index];
    // Keep at least one copy of each starter item.
    if (
        starterGear.some(
            s => s.name === item.name
        ) &&
        inventory.filter(
            x => x.name === item.name
        ).length <= 1
    ) {
        showMessage(
            "Cannot discard your last starter item.",
            120
        );
        return;
    }
    const wasEquipped =
        equipped[item.type] === item;
    inventory.splice(index, 1);
    if (wasEquipped) {
        const replacement =
            inventory.find(
                x => x.type === item.type
            );
        equipped[item.type] =
            replacement || null;
        recalcStats();
    }
    showMessage(
        "Discarded: " + item.name,
        70
    );
}
let selectedInventorySlot = -1;
function handleInventoryClick(mx, my) {
    const startX = 180;
    const startY = 175;
    const slotW = 130;
    const slotH = 90;
    const gap = 10;
    for (let i = 0; i < 12; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x =
            startX +
            col * (slotW + gap);
        const y =
            startY +
            row * (slotH + gap);
        if (
            mx >= x &&
            mx <= x + slotW &&
            my >= y &&
            my <= y + slotH
        ) {
            if (inventory[i]) {
                selectedInventorySlot = i;
            }
            return;
        }
    }
    // Discard button.
    const bx = 465;
    const by = 555;
    const bw = 270;
    const bh = 48;
    if (
        mx >= bx &&
        mx <= bx + bw &&
        my >= by &&
        my <= by + bh
    ) {
        if (selectedInventorySlot >= 0) {
            discardInventorySlot(
                selectedInventorySlot
            );
            selectedInventorySlot = -1;
        }
    }
}
// ------------------------------------------------------------
// GAME CONDITIONS
// ------------------------------------------------------------
function allEnemiesDefeated() {
    const enemiesDead =
        enemies.every(e => e.health <= 0);
    const bossDead =
        !boss || boss.health <= 0;
    return enemiesDead && bossDead;
}
// ------------------------------------------------------------
// DRAW BACKGROUND
// ------------------------------------------------------------
function drawBackground() {
    const data = levels[currentLevel];
    ctx.fillStyle = data.sky;
    ctx.fillRect(0, 0, W, H);
    // Clouds / distant scenery.
    if (currentLevel === 0) {
        drawCloud(150, 100);
        drawCloud(700, 130);
        drawCloud(1000, 80);
    }
    if (currentLevel === 1) {
        drawTrees();
    }
    if (currentLevel === 2) {
        drawRuinsBackground();
    }
    if (currentLevel === 3) {
        drawSnowBackground();
    }
    if (currentLevel === 4) {
        drawCastleBackground();
    }
}
function drawCloud(x, y) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, 80, 22);
    ctx.fillRect(x + 15, y - 12, 42, 34);
    ctx.fillRect(x + 45, y - 6, 40, 28);
}
function drawTrees() {
    for (let x = 50; x < W; x += 130) {
        ctx.fillStyle = "#18251d";
        ctx.fillRect(x, 320, 25, 290);
        ctx.fillRect(x - 45, 350, 115, 25);
        ctx.fillRect(x - 30, 315, 85, 30);
        ctx.fillRect(x - 15, 285, 55, 35);
    }
}
function drawRuinsBackground() {
    ctx.fillStyle = "#504738";
    for (let x = 50; x < W; x += 220) {
        ctx.fillRect(x, 270, 70, 340);
        ctx.fillRect(x - 15, 250, 100, 25);
    }
}
function drawSnowBackground() {
    ctx.fillStyle = "#cbdde4";
    for (let x = 0; x < W; x += 150) {
        ctx.fillRect(x, 280, 100, 12);
        ctx.fillRect(x + 30, 250, 40, 30);
    }
}
function drawCastleBackground() {
    ctx.fillStyle = "#17131f";
    ctx.fillRect(60, 230, 180, 380);
    ctx.fillRect(500, 180, 210, 430);
    ctx.fillRect(930, 210, 190, 400);
    ctx.fillStyle = "#33263d";
    for (let x = 60; x < 240; x += 40) {
        ctx.fillRect(x, 210, 25, 35);
    }
    for (let x = 500; x < 710; x += 40) {
        ctx.fillRect(x, 160, 25, 35);
    }
}
// ------------------------------------------------------------
// DRAW PLATFORMS
// ------------------------------------------------------------
function drawPlatforms() {
    const data = levels[currentLevel];
    for (const p of levelObjects) {
        ctx.fillStyle = data.ground;
        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );
        ctx.fillStyle =
            currentLevel === 3
                ? "#a9c9d6"
                : "#536b3b";
        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            8
        );
        // Pixel details.
        ctx.fillStyle = "#222";
        for (
            let x = p.x + 12;
            x < p.x + p.w - 5;
            x += 35
        ) {
            ctx.fillRect(
                x,
                p.y + 17,
                7,
                5
            );
        }
    }
}
// ------------------------------------------------------------
// PIXEL SPRITE SYSTEM
// ------------------------------------------------------------
const sprites = {
    soldier: [
        "      HHH      ",
        "     HHHHH     ",
        "    HHHHHHH    ",
        "    VVVVVVV    ",
        "    VVVVVVV    ",
        "     E E E     ",
        "      MMM      ",
        "   AAAWWAAAA   ",
        "  AAAAAAAAAA   ",
        "  AAAAAAAA     ",
        "  AAAAAAAA     ",
        "    BBBBBB     ",
        "   BBBBBBBB    ",
        "   BBBBBBBB    ",
        "    BBBBB      ",
        "   BB   BB     ",
        "   BB   BB     ",
        "   BB   BB     ",
        "  SS     SS    ",
        " SS       SS   ",
        "SS         SS  ",
        "SS         SS  "
    ],
    knight: [
        "     HHHHH     ",
        "    HHHHHHH    ",
        "   HHHHHHHHH   ",
        "   VVVVVVVVV   ",
        "   VVVVVVVVV   ",
        "   EE   EE     ",
        "   VVVVVVVVV   ",
        "    MMMMMMM    ",
        "   AAAAAAAAA   ",
        "  AAAAAAAAAAA  ",
        "  AAAAAAAAAAA  ",
        "  AAAAWWAAAAA  ",
        "  AAAAAAAAAAA  ",
        "   BBBBBBBBB   ",
        "   BBBBBBBBB   ",
        "   BBBBBBBBB   ",
        "   BB     BB   ",
        "   BB     BB   ",
        "  SS       SS  ",
        "  SS       SS  ",
        " SS         SS ",
        "SS           SS"
    ],
    archer: [
        "      HHH      ",
        "     HHHHH     ",
        "    HHHHHHH    ",
        "    VVVVVVV    ",
        "    VVVVVVV    ",
        "     E   E     ",
        "      MMM      ",
        "   AAAAAAAAA   ",
        "  AAAAAAAAAAA  ",
        "  AAAAAAAACCC  ",
        "  AAAAAAAACCC  ",
        "    BBBBBBB    ",
        "    BBBBBBB    ",
        "   BBBBBBBBB   ",
        "   BB     BB   ",
        "  SS       SS  ",
        " SS         SS ",
        "SS           SS",
        "SS           SS",
        "      |        ",
        "     /|        ",
        "    / |        "
    ]
};
const palettes = {
    soldier: {
        H: "#555555",
        V: "#222222",
        E: "#ffcc66",
        M: "#333333",
        A: "#668899",
        B: "#333f55",
        S: "#222222",
        W: "#dddddd",
        C: "#8b5a2b"
    },
    knight: {
        H: "#8c8c8c",
        V: "#222222",
        E: "#ffdd66",
        M: "#111111",
        A: "#4b6c88",
        B: "#29394d",
        S: "#151515",
        W: "#e8e8e8",
        C: "#8b5a2b"
    },
    archer: {
        H: "#57402c",
        V: "#241d19",
        E: "#ffdd66",
        M: "#39241b",
        A: "#6d8750",
        B: "#435534",
        S: "#221c18",
        W: "#dddddd",
        C: "#704523"
    }
};
function drawPixelSprite(
    sprite,
    palette,
    x,
    y,
    scale = 3,
    flip = false
) {
    for (let row = 0; row < sprite.length; row++) {
        const line = sprite[row];
        for (let col = 0; col < line.length; col++) {
            const char = line[col];
            if (char === " ") continue;
            ctx.fillStyle =
                palette[char] || "#ffffff";
            const px =
                flip
                    ? x +
                    (line.length - col - 1) * scale
                    : x + col * scale;
            ctx.fillRect(
                px,
                y + row * scale,
                scale,
                scale
            );
        }
    }
}
// ------------------------------------------------------------
// DRAW PLAYER
// ------------------------------------------------------------
function drawPlayer() {
    if (
        player.invincible > 0 &&
        Math.floor(player.invincible / 4) % 2 === 0
    ) {
        return;
    }
    const x = player.x - 5;
    const y = player.y - 8;
    // Cape.
    ctx.fillStyle = "#6b1d2a";
    if (player.facing === 1) {
        ctx.fillRect(
            x - 5,
            y + 20,
            13,
            35
        );
    } else {
        ctx.fillRect(
            x + 28,
            y + 20,
            13,
            35
        );
    }
    // Helmet.
    ctx.fillStyle = "#b7b7b7";
    ctx.fillRect(
        x + 8,
        y,
        24,
        8
    );
    ctx.fillRect(
        x + 4,
        y + 8,
        32,
        12
    );
    // Helmet shadow.
    ctx.fillStyle = "#777";
    ctx.fillRect(
        x + 4,
        y + 17,
        32,
        5
    );
    // Visor.
    ctx.fillStyle = "#171717";
    ctx.fillRect(
        x + 5,
        y + 10,
        30,
        6
    );
    // Eye slit.
    ctx.fillStyle = "#e7c65a";
    ctx.fillRect(
        player.facing === 1
            ? x + 26
            : x + 7,
        y + 11,
        5,
        3
    );
    // Body armor.
    ctx.fillStyle = "#536b78";
    ctx.fillRect(
        x + 8,
        y + 22,
        24,
        23
    );
    // Armor highlights.
    ctx.fillStyle = "#839aa5";
    ctx.fillRect(
        x + 10,
        y + 24,
        6,
        17
    );
    // Belt.
    ctx.fillStyle = "#6b492c";
    ctx.fillRect(
        x + 7,
        y + 42,
        26,
        5
    );
    // Legs.
    ctx.fillStyle = "#252b31";
    const legOffset =
        player.onGround &&
            Math.abs(player.vx) > 0
            ? Math.floor(
                Date.now() / 100
            ) % 2 * 3
            : 0;
    ctx.fillRect(
        x + 9,
        y + 47,
        8,
        18 + legOffset
    );
    ctx.fillRect(
        x + 22,
        y + 47,
        8,
        18 - legOffset
    );
    // Boots.
    ctx.fillStyle = "#15171a";
    ctx.fillRect(
        x + 6,
        y + 62 + legOffset,
        12,
        6
    );
    ctx.fillRect(
        x + 21,
        y + 62 - legOffset,
        12,
        6
    );
    // Arms.
    ctx.fillStyle = "#617783";
    ctx.fillRect(
        player.facing === 1
            ? x + 29
            : x + 1,
        y + 25,
        9,
        22
    );
    // Shield.
    ctx.fillStyle = "#927044";
    ctx.fillRect(
        player.facing === 1
            ? x - 1
            : x + 27,
        y + 28,
        8,
        17
    );
    // Sword.
    drawPlayerSword();
}
function drawPlayerSword() {
    if (player.attackTimer <= 0) {
        drawSwordAt(
            player.x +
            (player.facing === 1
                ? player.width
                : -12),
            player.y + 27,
            player.facing,
            0
        );
        return;
    }
    const progress =
        1 -
        player.attackTimer / 14;
    drawSwordAt(
        player.x +
        (player.facing === 1
            ? 27
            : 7),
        player.y + 24,
        player.facing,
        progress
    );
}
function drawSwordAt(
    x,
    y,
    facing,
    progress
) {
    ctx.save();
    ctx.translate(x, y);
    if (facing === -1) {
        ctx.scale(-1, 1);
    }
    let angle =
        -0.8 + progress * 1.7;
    ctx.rotate(angle);
    ctx.fillStyle = "#dedede";
    ctx.fillRect(
        0,
        -4,
        42,
        7
    );
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        5,
        -3,
        30,
        2
    );
    ctx.fillStyle = "#7a512e";
    ctx.fillRect(
        -5,
        -7,
        8,
        14
    );
    ctx.restore();
}
// ------------------------------------------------------------
// DRAW ENEMIES
// ------------------------------------------------------------
function drawEnemies() {
    for (const enemy of enemies) {
        if (enemy.health <= 0) continue;
        const sprite =
            sprites[enemy.type];
        const palette =
            palettes[enemy.type];
        const scale = 3;
        const spriteW =
            sprite[0].length * scale;
        const spriteH =
            sprite.length * scale;
        const drawX =
            enemy.x +
            enemy.width / 2 -
            spriteW / 2;
        const drawY =
            enemy.y +
            enemy.height -
            spriteH;
        drawPixelSprite(
            sprite,
            palette,
            drawX,
            drawY,
            scale,
            enemy.facing === -1
        );
        drawEnemyWeapon(enemy);
        drawHealthBar(
            enemy.x,
            enemy.y - 13,
            enemy.width,
            enemy.health,
            enemy.maxHealth
        );
        if (enemy.state === "rush") {
            ctx.fillStyle = "#ffdf5c";
            ctx.font = "bold 22px monospace";
            ctx.fillText(
                "!",
                enemy.x +
                enemy.width / 2 - 5,
                enemy.y - 20
            );
        }
    }
}
function drawEnemyWeapon(enemy) {
    ctx.fillStyle = "#ddd";
    const y =
        enemy.y + 27;
    if (enemy.type === "archer") {
        ctx.strokeStyle = "#9b6337";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (enemy.facing === 1) {
            ctx.arc(
                enemy.x + 38,
                y,
                15,
                -1.1,
                1.1
            );
        } else {
            ctx.arc(
                enemy.x,
                y,
                15,
                2.0,
                4.2
            );
        }
        ctx.stroke();
        return;
    }
    const sx =
        enemy.facing === 1
            ? enemy.x + 34
            : enemy.x - 28;
    ctx.fillRect(
        sx,
        y,
        28,
        4
    );
}
// ------------------------------------------------------------
// DRAW BOSS
// ------------------------------------------------------------
function drawBoss() {
    if (!boss || boss.health <= 0) return;
    const x = boss.x;
    const y = boss.y;
    if (
        boss.invincible > 0 &&
        Math.floor(boss.invincible / 3) % 2 === 0
    ) {
        return;
    }
    // Cape.
    ctx.fillStyle =
        currentLevel === 4
            ? "#160b25"
            : "#252c38";
    ctx.fillRect(
        x - 8,
        y + 25,
        boss.width + 16,
        55
    );
    // Body.
    ctx.fillStyle = "#404c59";
    ctx.fillRect(
        x + 12,
        y + 25,
        45,
        42
    );
    // Shoulder armor.
    ctx.fillStyle = "#7e8790";
    ctx.fillRect(
        x + 3,
        y + 25,
        18,
        17
    );
    ctx.fillRect(
        x + 48,
        y + 25,
        18,
        17
    );
    // Helmet.
    ctx.fillStyle =
        currentLevel === 4
            ? "#332448"
            : "#8c969f";
    ctx.fillRect(
        x + 10,
        y,
        50,
        27
    );
    ctx.fillStyle = "#111";
    ctx.fillRect(
        x + 8,
        y + 13,
        54,
        8
    );
    // Eyes.
    ctx.fillStyle = "#ff3e3e";
    ctx.fillRect(
        x + 18,
        y + 15,
        8,
        3
    );
    ctx.fillRect(
        x + 41,
        y + 15,
        8,
        3
    );
    // Belt.
    ctx.fillStyle = "#553b25";
    ctx.fillRect(
        x + 10,
        y + 62,
        50,
        7
    );
    // Legs.
    ctx.fillStyle = "#20252b";
    ctx.fillRect(
        x + 15,
        y + 69,
        15,
        20
    );
    ctx.fillRect(
        x + 38,
        y + 69,
        15,
        20
    );
    // Weapon.
    const weaponX =
        boss.facing === 1
            ? x + boss.width
            : x - 55;
    ctx.fillStyle = "#dedede";
    ctx.fillRect(
        weaponX,
        y + 35,
        55,
        8
    );
    ctx.fillStyle = "#8a633b";
    ctx.fillRect(
        weaponX - 8,
        y + 29,
        9,
        20
    );
    // Health bar.
    drawHealthBar(
        x - 10,
        y - 25,
        boss.width + 20,
        boss.health,
        boss.maxHealth
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
        boss.name,
        x + boss.width / 2,
        y - 32
    );
    ctx.textAlign = "left";
}
// ------------------------------------------------------------
// HEALTH BAR
// ------------------------------------------------------------
function drawHealthBar(
    x,
    y,
    width,
    health,
    maxHealth
) {
    ctx.fillStyle = "#111";
    ctx.fillRect(
        x - 2,
        y - 2,
        width + 4,
        10
    );
    ctx.fillStyle = "#b52b2b";
    ctx.fillRect(
        x,
        y,
        width,
        6
    );
    ctx.fillStyle = "#46bd4f";
    ctx.fillRect(
        x,
        y,
        width *
        Math.max(
            0,
            health / maxHealth
        ),
        6
    );
}
// ------------------------------------------------------------
// DRAW COINS
// ------------------------------------------------------------
function drawCoins() {
    for (const coin of levelCoins) {
        if (coin.collected) continue;
        coin.bob += 0.06;
        const bob =
            Math.sin(coin.bob) * 4;
        ctx.fillStyle = "#f5c542";
        ctx.fillRect(
            coin.x - 7,
            coin.y - 9 + bob,
            14,
            18
        );
        ctx.fillStyle = "#fff0a0";
        ctx.fillRect(
            coin.x - 3,
            coin.y - 7 + bob,
            3,
            12
        );
    }
}
// ------------------------------------------------------------
// DRAW GEAR
// ------------------------------------------------------------
function drawGearDrops() {
    for (const drop of gearDrops) {
        if (drop.collected) continue;
        drop.bob += 0.05;
        const bob =
            Math.sin(drop.bob) * 5;
        ctx.fillStyle = "#e6d27a";
        ctx.fillRect(
            drop.x - 12,
            drop.y - 12 + bob,
            24,
            24
        );
        ctx.fillStyle = "#222";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
            "G",
            drop.x,
            drop.y + 5 + bob
        );
        ctx.textAlign = "left";
    }
}
// ------------------------------------------------------------
// HUD
// ------------------------------------------------------------
function drawHUD() {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(
        15,
        15,
        350,
        100
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px monospace";
    ctx.fillText(
        "KNIGHT'S QUEST",
        28,
        42
    );
    ctx.font = "16px monospace";
    ctx.fillText(
        `Level ${currentLevel + 1}/5: ${levels[currentLevel].name}`,
        28,
        65
    );
    ctx.fillText(
        `Coins: ${coins}   Score: ${score}`,
        28,
        88
    );
    // Player health.
    ctx.fillStyle = "#111";
    ctx.fillRect(
        385,
        25,
        300,
        28
    );
    ctx.fillStyle = "#8f2525";
    ctx.fillRect(
        390,
        30,
        290,
        18
    );
    ctx.fillStyle = "#43c452";
    ctx.fillRect(
        390,
        30,
        290 *
        Math.max(
            0,
            player.health / player.maxHealth
        ),
        18
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px monospace";
    ctx.fillText(
        `HP ${Math.ceil(player.health)} / ${player.maxHealth}`,
        400,
        44
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px monospace";
    ctx.fillText(
        "A/D Move   W/Space Jump   J Attack   I Inventory",
        700,
        32
    );
}
// ------------------------------------------------------------
// INVENTORY DRAW
// ------------------------------------------------------------
function drawInventory() {
    if (!inventoryOpen) return;
    ctx.fillStyle =
        "rgba(0,0,0,0.88)";
    ctx.fillRect(
        100,
        80,
        1000,
        550
    );
    ctx.strokeStyle = "#d4af52";
    ctx.lineWidth = 4;
    ctx.strokeRect(
        100,
        80,
        1000,
        550
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
        "INVENTORY",
        W / 2,
        130
    );
    ctx.font = "14px monospace";
    ctx.fillText(
        "Press 1-9 to equip • Click an item to select it",
        W / 2,
        153
    );
    const startX = 180;
    const startY = 175;
    const slotW = 130;
    const slotH = 90;
    const gap = 10;
    for (let i = 0; i < 12; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x =
            startX +
            col * (slotW + gap);
        const y =
            startY +
            row * (slotH + gap);
        ctx.fillStyle =
            selectedInventorySlot === i
                ? "#66521f"
                : "#252525";
        ctx.fillRect(
            x,
            y,
            slotW,
            slotH
        );
        ctx.strokeStyle =
            selectedInventorySlot === i
                ? "#f2d36b"
                : "#777";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x,
            y,
            slotW,
            slotH
        );
        const item = inventory[i];
        if (!item) continue;
        ctx.fillStyle =
            rarityColor(item.rarity);
        ctx.font =
            "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillText(
            `${i + 1}. ${item.name}`,
            x + 8,
            y + 20
        );
        ctx.fillStyle = "#ccc";
        ctx.font = "12px monospace";
        ctx.fillText(
            item.type.toUpperCase(),
            x + 8,
            y + 39
        );
        if (item.damage) {
            ctx.fillText(
                `DMG +${item.damage}`,
                x + 8,
                y + 56
            );
        }
        if (item.defense) {
            ctx.fillText(
                `DEF +${item.defense}`,
                x + 8,
                y + 56
            );
        }
        if (item.speed) {
            ctx.fillText(
                `SPD ${item.speed > 0 ? "+" : ""}${item.speed}`,
                x + 8,
                y + 72
            );
        }
        if (
            equipped[item.type] === item
        ) {
            ctx.fillStyle = "#75e17e";
            ctx.fillText(
                "EQUIPPED",
                x + 75,
                y + 72
            );
        }
    }
    // Discard button.
    ctx.fillStyle =
        selectedInventorySlot >= 0
            ? "#8f3434"
            : "#444";
    ctx.fillRect(
        465,
        555,
        270,
        48
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
        "DISCARD SELECTED",
        600,
        585
    );
    ctx.textAlign = "left";
}
function rarityColor(rarity) {
    switch (rarity) {
        case "Uncommon":
            return "#69d26d";
        case "Rare":
            return "#5ea5ff";
        case "Epic":
            return "#d66cff";
        default:
            return "#eeeeee";
    }
}
// ------------------------------------------------------------
// LEVEL COMPLETE / GAME OVER
// ------------------------------------------------------------
function drawOverlays() {
    if (gameOver) {
        ctx.fillStyle =
            "rgba(0,0,0,0.78)";
        ctx.fillRect(
            0,
            0,
            W,
            H
        );
        ctx.fillStyle = "#e64b4b";
        ctx.font = "bold 58px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
            "YOU DIED",
            W / 2,
            280
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = "22px monospace";
        ctx.fillText(
            "Press R to restart",
            W / 2,
            330
        );
        ctx.textAlign = "left";
    }
    if (victory) {
        ctx.fillStyle =
            "rgba(0,0,0,0.8)";
        ctx.fillRect(
            0,
            0,
            W,
            H
        );
        ctx.fillStyle = "#f3d15b";
        ctx.font = "bold 52px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
            "QUEST COMPLETE!",
            W / 2,
            260
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = "22px monospace";
        ctx.fillText(
            `Final Score: ${score}`,
            W / 2,
            315
        );
        ctx.fillText(
            `Coins Collected: ${coins}`,
            W / 2,
            350
        );
        ctx.fillText(
            "Press R to play again",
            W / 2,
            405
        );
        ctx.textAlign = "left";
    }
    if (
        levelComplete &&
        !gameOver &&
        !victory
    ) {
        ctx.fillStyle =
            "rgba(0,0,0,0.75)";
        ctx.fillRect(
            260,
            220,
            680,
            220
        );
        ctx.strokeStyle = "#d4af52";
        ctx.lineWidth = 4;
        ctx.strokeRect(
            260,
            220,
            680,
            220
        );
        ctx.fillStyle = "#f1d35d";
        ctx.font = "bold 38px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
            currentLevel === levels.length - 1
                ? "CASTLE CONQUERED!"
                : "LEVEL COMPLETE!",
            W / 2,
            295
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px monospace";
        ctx.fillText(
            currentLevel === levels.length - 1
                ? "Press ENTER to finish the quest"
                : "Press ENTER for the next level",
            W / 2,
            350
        );
        ctx.textAlign = "left";
    }
}
// ------------------------------------------------------------
// MESSAGE DRAW
// ------------------------------------------------------------
function drawMessage() {
    if (messageTimer <= 0) return;
    messageTimer--;
    ctx.fillStyle =
        "rgba(0,0,0,0.7)";
    ctx.fillRect(
        W / 2 - 220,
        125,
        440,
        42
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
        message,
        W / 2,
        153
    );
    ctx.textAlign = "left";
}
// ------------------------------------------------------------
// UPDATE
// ------------------------------------------------------------
function update() {
    if (gameOver || victory) return;
    if (!levelComplete && !inventoryOpen) {
        updatePlayer();
        updateEnemies();
        updateBoss();
    }
}
// ------------------------------------------------------------
// DRAW
// ------------------------------------------------------------
function draw() {
    ctx.clearRect(
        0,
        0,
        W,
        H
    );
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawGearDrops();
    drawEnemies();
    drawBoss();
    drawPlayer();
    drawHUD();
    drawMessage();
    if (inventoryOpen) {
        drawInventory();
    }
    drawOverlays();
}
// ------------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------------
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// ------------------------------------------------------------
// START GAME
// ------------------------------------------------------------
initializeEquipment();
loadLevel(0);
gameLoop();
