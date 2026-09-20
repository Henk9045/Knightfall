// ============================================================
// KNIGHT'S QUEST - OPEN WORLD
// Complete game.js
//
// Put this file in the SAME folder as index.html.
// Your index.html should contain:
//
// <canvas id="gameCanvas" width="1200" height="680"></canvas>
//
// Controls:
// A / D or Arrow Keys = Move
// W / Up / Space      = Jump
// J / Click           = Attack
// I                   = Inventory
// 1-9                 = Equip inventory item
// Backspace           = Discard selected inventory item
// Enter               = Enter/continue at gates and bosses
// R                   = Restart after death/victory
// ============================================================
"use strict";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.width || 1200;
canvas.height = canvas.height || 680;
ctx.imageSmoothingEnabled = false;
// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 15000;
const GRAVITY = 0.65;
const GROUND_Y = 590;
let gameState = "playing";
let inventoryOpen = false;
let message = "";
let messageTimer = 0;
let cameraX = 0;
let score = 0;
let coins = 0;
const keys = {};
const mouse = {
    x: 0,
    y: 0,
    down: false
};
// ------------------------------------------------------------
// INPUT
// ------------------------------------------------------------
window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    if (
        ["arrowleft", "arrowright", "arrowup", "arrowdown",
         " ", "backspace"].includes(key)
    ) {
        e.preventDefault();
    }
    keys[key] = true;
    if (key === "i") {
        inventoryOpen = !inventoryOpen;
    }
    // Backspace discards the selected inventory item.
    if (key === "backspace") {
        if (inventoryOpen) {
            discardSelected();
        }
    }
    if (/^[1-9]$/.test(key)) {
        const slot = Number(key) - 1;
        if (inventoryOpen && inventory[slot]) {
            equipItem(slot);
        }
    }
    if (key === "enter") {
        if (gameState === "levelComplete") {
            gameState = "playing";
            showMessage("Continue exploring!");
        }
    }
    if (key === "r") {
        if (gameState === "gameOver" || gameState === "victory") {
            restartGame();
        }
    }
});
window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) *
        (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) *
        (canvas.height / rect.height);
});
canvas.addEventListener("mousedown", e => {
    mouse.down = true;
    if (inventoryOpen) {
        handleInventoryClick();
    } else {
        playerAttack();
    }
});
window.addEventListener("mouseup", () => {
    mouse.down = false;
});
// ------------------------------------------------------------
// ITEMS
// ------------------------------------------------------------
const itemDatabase = {
    ironSword: {
        name: "Iron Sword",
        type: "weapon",
        attack: 10,
        color: "#aaaaaa",
        starter: true
    },
    steelSword: {
        name: "Steel Sword",
        type: "weapon",
        attack: 17,
        color: "#dddddd"
    },
    flameBlade: {
        name: "Flame Blade",
        type: "weapon",
        attack: 25,
        color: "#ff632b"
    },
    shadowGreatsword: {
        name: "Shadow Greatsword",
        type: "weapon",
        attack: 34,
        color: "#733cff"
    },
    crystalBlade: {
        name: "Crystal Blade",
        type: "weapon",
        attack: 42,
        color: "#55eaff"
    },
    dragonSlayer: {
        name: "Dragon Slayer",
        type: "weapon",
        attack: 52,
        color: "#ffd447"
    },
    knightSword: {
        name: "Knight's Edge",
        type: "weapon",
        attack: 62,
        color: "#ffffff"
    },
    knightArmor: {
        name: "Knight Armor",
        type: "armor",
        defense: 3,
        health: 0,
        color: "#888888",
        starter: true
    },
    chainmail: {
        name: "Chainmail",
        type: "armor",
        defense: 7,
        health: 10,
        color: "#bcbcbc"
    },
    knightPlate: {
        name: "Knight Plate",
        type: "armor",
        defense: 12,
        health: 20,
        color: "#d5d5d5"
    },
    dragonArmor: {
        name: "Dragon Armor",
        type: "armor",
        defense: 19,
        health: 35,
        color: "#8f3f2f"
    },
    crystalArmor: {
        name: "Crystal Armor",
        type: "armor",
        defense: 25,
        health: 50,
        color: "#48d7e8"
    },
    shadowArmor: {
        name: "Shadow Armor",
        type: "armor",
        defense: 30,
        health: 70,
        color: "#5b3e8c"
    },
    travelerBoots: {
        name: "Traveler Boots",
        type: "boots",
        speed: 0,
        jump: 0,
        color: "#8b5a32",
        starter: true
    },
    swiftBoots: {
        name: "Swift Boots",
        type: "boots",
        speed: 1.8,
        jump: 0,
        color: "#55c45c"
    },
    highlandBoots: {
        name: "Highland Boots",
        type: "boots",
        speed: 1,
        jump: 1.5,
        color: "#b5793e"
    },
    crystalBoots: {
        name: "Crystal Boots",
        type: "boots",
        speed: 2.3,
        jump: 1.5,
        color: "#4fe5ff"
    },
    dragonBoots: {
        name: "Dragon Boots",
        type: "boots",
        speed: 3,
        jump: 2,
        color: "#e05a32"
    }
};
let inventory = [
    "ironSword",
    "knightArmor",
    "travelerBoots"
];
let selectedSlot = 0;
let equipped = {
    weapon: "ironSword",
    armor: "knightArmor",
    boots: "travelerBoots"
};
// ------------------------------------------------------------
// PLAYER
// ------------------------------------------------------------
const player = {
    x: 500,
    y: 400,
    width: 34,
    height: 50,
    vx: 0,
    vy: 0,
    baseSpeed: 4.2,
    baseJump: 12,
    speed: 4.2,
    jumpPower: 12,
    health: 100,
    maxHealth: 100,
    attackDamage: 10,
    defense: 3,
    facing: 1,
    onGround: false,
    attackTimer: 0,
    attackCooldown: 0,
    invincible: 0,
    hurtTimer: 0
};
// ------------------------------------------------------------
// WORLD REGIONS
// ------------------------------------------------------------
const regions = [
    {
        name: "Knight's Village",
        start: 0,
        end: 1300,
        sky: "#6db7e8",
        ground: "#4f7c45",
        description: "A peaceful village on the edge of the kingdom."
    },
    {
        name: "Forgotten Fields",
        start: 1300,
        end: 2900,
        sky: "#72a5bd",
        ground: "#536e3d",
        description: "Old battlefields haunted by wandering soldiers."
    },
    {
        name: "Dark Forest",
        start: 2900,
        end: 4700,
        sky: "#30465b",
        ground: "#29402c",
        description: "A dense forest filled with dangerous creatures."
    },
    {
        name: "Ancient Ruins",
        start: 4700,
        end: 6200,
        sky: "#827d9c",
        ground: "#5e5548",
        description: "The remains of a forgotten civilization."
    },
    {
        name: "Crystal Caverns",
        start: 6200,
        end: 7800,
        sky: "#252d50",
        ground: "#34384e",
        description: "A huge underground cavern glowing with crystals."
    },
    {
        name: "Frozen Mountains",
        start: 7800,
        end: 9300,
        sky: "#9dc7e8",
        ground: "#d7e5ed",
        description: "Frozen peaks guarded by ancient warriors."
    },
    {
        name: "Volcano Pass",
        start: 9300,
        end: 10800,
        sky: "#4a2929",
        ground: "#5a3025",
        description: "A volcanic wasteland surrounded by lava."
    },
    {
        name: "Sky Fortress",
        start: 10800,
        end: 12100,
        sky: "#6f9fd0",
        ground: "#68727e",
        description: "A fortress floating high above the kingdom."
    },
    {
        name: "Cursed Graveyard",
        start: 12100,
        end: 13700,
        sky: "#252536",
        ground: "#353538",
        description: "The dead do not rest here."
    },
    {
        name: "Final Citadel",
        start: 13700,
        end: WORLD_WIDTH,
        sky: "#161624",
        ground: "#272733",
        description: "The final stronghold of the Shadow King."
    }
];
// ------------------------------------------------------------
// PLATFORMS
// ------------------------------------------------------------
let platforms = [];
function addPlatform(x, y, width, height = 30) {
    platforms.push({
        x,
        y,
        width,
        height
    });
}
function buildWorld() {
    platforms = [];
    // Main ground
    addPlatform(0, 620, WORLD_WIDTH, 100);
    // Village
    addPlatform(300, 510, 260, 25);
    addPlatform(750, 440, 230, 25);
    addPlatform(1050, 520, 160, 25);
    // Forgotten Fields
    addPlatform(1450, 500, 250, 25);
    addPlatform(1900, 420, 220, 25);
    addPlatform(2300, 510, 280, 25);
    addPlatform(2700, 390, 150, 25);
    // Dark Forest
    addPlatform(3050, 470, 220, 25);
    addPlatform(3400, 370, 200, 25);
    addPlatform(3800, 490, 300, 25);
    addPlatform(4200, 390, 230, 25);
    addPlatform(4500, 300, 170, 25);
    // Ruins
    addPlatform(4800, 500, 230, 25);
    addPlatform(5150, 410, 180, 25);
    addPlatform(5500, 330, 220, 25);
    addPlatform(5900, 450, 180, 25);
    // Crystal Caverns
    addPlatform(6350, 500, 200, 25);
    addPlatform(6700, 400, 200, 25);
    addPlatform(7100, 310, 220, 25);
    addPlatform(7450, 440, 240, 25);
    // Frozen Mountains
    addPlatform(7900, 480, 230, 25);
    addPlatform(8250, 380, 190, 25);
    addPlatform(8550, 290, 230, 25);
    addPlatform(8950, 430, 220, 25);
    // Volcano
    addPlatform(9450, 500, 220, 25);
    addPlatform(9800, 390, 180, 25);
    addPlatform(10100, 300, 200, 25);
    addPlatform(10500, 450, 190, 25);
    // Sky Fortress
    addPlatform(10900, 470, 220, 25);
    addPlatform(11250, 350, 200, 25);
    addPlatform(11550, 250, 190, 25);
    addPlatform(11800, 400, 220, 25);
    // Graveyard
    addPlatform(12200, 500, 230, 25);
    addPlatform(12550, 400, 190, 25);
    addPlatform(12900, 300, 220, 25);
    addPlatform(13300, 450, 220, 25);
    // Final Citadel
    addPlatform(13850, 500, 250, 25);
    addPlatform(14250, 400, 220, 25);
    addPlatform(14600, 300, 250, 25);
    addPlatform(14900, 450, 200, 25);
}
// ------------------------------------------------------------
// ENEMIES
// ------------------------------------------------------------
let enemies = [];
const enemyTypes = {
    soldier: {
        health: 35,
        speed: 1.5,
        damage: 8,
        color: "#7b8b99"
    },
    knight: {
        health: 60,
        speed: 1.7,
        damage: 12,
        color: "#b7b7b7"
    },
    archer: {
        health: 28,
        speed: 1.2,
        damage: 7,
        color: "#47734d"
    },
    brute: {
        health: 100,
        speed: 0.9,
        damage: 18,
        color: "#704434"
    },
    shadow: {
        health: 75,
        speed: 2.3,
        damage: 15,
        color: "#583e7d"
    },
    iceKnight: {
        health: 90,
        speed: 1.6,
        damage: 17,
        color: "#7eb8d7"
    },
    demon: {
        health: 120,
        speed: 1.8,
        damage: 22,
        color: "#a64438"
    }
};
function spawnEnemy(type, x, y = 560) {
    const data = enemyTypes[type];
    enemies.push({
        type,
        x,
        y,
        width: 34,
        height: 50,
        vx: 0,
        vy: 0,
        health: data.health,
        maxHealth: data.health,
        speed: data.speed,
        damage: data.damage,
        color: data.color,
        facing: -1,
        onGround: false,
        attackCooldown: 0,
        attackTimer: 0,
        hurtTimer: 0,
        dead: false
    });
}
// ------------------------------------------------------------
// BOSSES
// ------------------------------------------------------------
let bosses = [];
const bossTypes = {
    ruinGuardian: {
        name: "Ruin Guardian",
        health: 350,
        damage: 22,
        speed: 1.1,
        color: "#85775b"
    },
    crystalGolem: {
        name: "Crystal Golem",
        health: 500,
        damage: 28,
        speed: 0.8,
        color: "#49cfe1"
    },
    iceWarlord: {
        name: "Ice Warlord",
        health: 600,
        damage: 30,
        speed: 1.15,
        color: "#5f9ec5"
    },
    volcanoDemon: {
        name: "Volcano Demon",
        health: 750,
        damage: 35,
        speed: 1.35,
        color: "#bd4a2f"
    },
    shadowKing: {
        name: "Shadow King",
        health: 1200,
        damage: 42,
        speed: 1.5,
        color: "#633a86"
    }
};
function spawnBoss(type, x) {
    const data = bossTypes[type];
    bosses.push({
        type,
        name: data.name,
        x,
        y: 480,
        width: 58,
        height: 90,
        vx: 0,
        vy: 0,
        health: data.health,
        maxHealth: data.health,
        damage: data.damage,
        speed: data.speed,
        color: data.color,
        facing: -1,
        attackCooldown: 0,
        attackTimer: 0,
        hurtTimer: 0,
        dead: false
    });
}
// ------------------------------------------------------------
// COINS
// ------------------------------------------------------------
let worldCoins = [];
function addCoin(x, y) {
    worldCoins.push({
        x,
        y,
        collected: false,
        bob: Math.random() * Math.PI * 2
    });
}
function buildCoins() {
    worldCoins = [];
    for (let x = 180; x < WORLD_WIDTH - 100; x += 160) {
        const region = getRegionAt(x);
        let y = 550;
        if (region) {
            y = region.start % 2 === 0 ? 550 : 530;
        }
        addCoin(x, y);
    }
    // Extra coins on platforms
    const positions = [
        [400, 470],
        [850, 400],
        [1500, 460],
        [2000, 380],
        [2400, 470],
        [3150, 430],
        [3500, 330],
        [3900, 450],
        [4250, 350],
        [4850, 460],
        [5200, 370],
        [5600, 290],
        [6400, 460],
        [6800, 360],
        [7200, 270],
        [8000, 440],
        [8350, 340],
        [8650, 250],
        [9500, 460],
        [9850, 350],
        [10150, 260],
        [11000, 430],
        [11300, 310],
        [11600, 210],
        [12300, 460],
        [12600, 360],
        [13000, 260],
        [13950, 460],
        [14350, 360],
        [14700, 260]
    ];
    positions.forEach(p => addCoin(p[0], p[1]));
}
// ------------------------------------------------------------
// GEAR DROPS
// ------------------------------------------------------------
let gearDrops = [];
function addGear(x, y, item) {
    gearDrops.push({
        x,
        y,
        item,
        collected: false
    });
}
function buildGearDrops() {
    gearDrops = [];
    addGear(900, 390, "steelSword");
    addGear(1550, 450, "chainmail");
    addGear(2600, 450, "swiftBoots");
    addGear(3300, 420, "flameBlade");
    addGear(4450, 250, "highlandBoots");
    addGear(5150, 350, "knightPlate");
    addGear(6050, 410, "shadowGreatsword");
    addGear(7000, 350, "crystalBlade");
    addGear(7350, 390, "crystalArmor");
    addGear(8150, 430, "crystalBoots");
    addGear(9700, 350, "dragonArmor");
    addGear(10400, 400, "dragonBoots");
    addGear(10600, 400, "dragonSlayer");
    addGear(11700, 340, "shadowArmor");
    addGear(13600, 400, "knightSword");
}
// ------------------------------------------------------------
// WORLD ENEMIES AND BOSSES
// ------------------------------------------------------------
function buildEnemies() {
    enemies = [];
    bosses = [];
    // Village outskirts
    spawnEnemy("soldier", 1100);
    spawnEnemy("soldier", 1250);
    // Fields
    spawnEnemy("soldier", 1500);
    spawnEnemy("soldier", 1800);
    spawnEnemy("knight", 2200);
    spawnEnemy("archer", 2550);
    // Forest
    spawnEnemy("soldier", 3000);
    spawnEnemy("shadow", 3350);
    spawnEnemy("archer", 3650);
    spawnEnemy("shadow", 4100);
    spawnEnemy("knight", 4500);
    // Ruins
    spawnEnemy("knight", 4800);
    spawnEnemy("brute", 5200);
    spawnEnemy("archer", 5550);
    spawnEnemy("knight", 5900);
    spawnBoss("ruinGuardian", 6000);
    // Caverns
    spawnEnemy("shadow", 6350);
    spawnEnemy("brute", 6750);
    spawnEnemy("shadow", 7200);
    spawnEnemy("knight", 7600);
    spawnBoss("crystalGolem", 7700);
    // Mountains
    spawnEnemy("iceKnight", 7900);
    spawnEnemy("iceKnight", 8300);
    spawnEnemy("archer", 8700);
    spawnEnemy("iceKnight", 9000);
    spawnBoss("iceWarlord", 9150);
    // Volcano
    spawnEnemy("demon", 9500);
    spawnEnemy("demon", 9900);
    spawnEnemy("brute", 10200);
    spawnEnemy("demon", 10600);
    spawnBoss("volcanoDemon", 10700);
    // Sky Fortress
    spawnEnemy("knight", 10900);
    spawnEnemy("archer", 11300);
    spawnEnemy("shadow", 11600);
    spawnEnemy("knight", 11900);
    // Graveyard
    spawnEnemy("shadow", 12200);
    spawnEnemy("shadow", 12500);
    spawnEnemy("brute", 12900);
    spawnEnemy("shadow", 13300);
    spawnEnemy("demon", 13500);
    // Final Citadel
    spawnEnemy("knight", 13800);
    spawnEnemy("demon", 14100);
    spawnEnemy("shadow", 14400);
    spawnEnemy("brute", 14700);
    spawnBoss("shadowKing", 14900);
}
// ------------------------------------------------------------
// REGION
// ------------------------------------------------------------
function getRegionAt(x) {
    for (const region of regions) {
        if (x >= region.start && x < region.end) {
            return region;
        }
    }
    return regions[regions.length - 1];
}
let lastRegion = null;
function checkRegionChange() {
    const region = getRegionAt(player.x);
    if (region !== lastRegion) {
        lastRegion = region;
        showMessage(region.name);
        setTimeout(() => {
            if (gameState === "playing") {
                // Description appears briefly through message system.
            }
        }, 100);
    }
}
// ------------------------------------------------------------
// PLAYER STATS
// ------------------------------------------------------------
function recalculateStats() {
    const weapon = itemDatabase[equipped.weapon];
    const armor = itemDatabase[equipped.armor];
    const boots = itemDatabase[equipped.boots];
    player.attackDamage =
        player.baseAttack = 10 + (weapon.attack || 0);
    player.defense =
        3 + (armor.defense || 0);
    player.speed =
        player.baseSpeed + (boots.speed || 0);
    player.jumpPower =
        player.baseJump + (boots.jump || 0);
    const oldMax = player.maxHealth;
    player.maxHealth =
        100 + (armor.health || 0);
    if (player.maxHealth > oldMax) {
        player.health += player.maxHealth - oldMax;
    }
    player.health = Math.min(player.health, player.maxHealth);
}
// ------------------------------------------------------------
// INVENTORY
// ------------------------------------------------------------
function addItem(itemId) {
    if (!itemDatabase[itemId]) return;
    if (inventory.length >= 12) {
        showMessage("Inventory full!");
        return false;
    }
    inventory.push(itemId);
    showMessage("Found: " + itemDatabase[itemId].name);
    return true;
}
function equipItem(slot) {
    if (!inventory[slot]) return;
    const itemId = inventory[slot];
    const item = itemDatabase[itemId];
    equipped[item.type] = itemId;
    selectedSlot = slot;
    recalculateStats();
    showMessage("Equipped " + item.name);
}
function discardSelected() {
    if (!inventory[selectedSlot]) {
        showMessage("No item selected");
        return;
    }
    const itemId = inventory[selectedSlot];
    const item = itemDatabase[itemId];
    // Starter gear cannot be discarded if it is the only
    // item of that type available.
    if (item.starter) {
        let copies = inventory.filter(id => {
            return itemDatabase[id].type === item.type;
        });
        if (copies.length <= 1) {
            showMessage("You need to keep your starter gear.");
            return;
        }
    }
    // Don't allow the player to become completely unequipped.
    if (equipped[item.type] === itemId) {
        const replacementIndex = inventory.findIndex((id, index) => {
            return index !== selectedSlot &&
                itemDatabase[id].type === item.type;
        });
        if (replacementIndex === -1) {
            showMessage("Equip another item of this type first.");
            return;
        }
        equipped[item.type] = inventory[replacementIndex];
    }
    inventory.splice(selectedSlot, 1);
    if (inventory.length === 0) {
        selectedSlot = 0;
    } else {
        selectedSlot =
            Math.min(selectedSlot, inventory.length - 1);
    }
    recalculateStats();
    showMessage("Discarded " + item.name);
}
// ------------------------------------------------------------
// MESSAGE
// ------------------------------------------------------------
function showMessage(text) {
    message = text;
    messageTimer = 140;
}
// ------------------------------------------------------------
// COLLISION
// ------------------------------------------------------------
function rectangleCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
function resolvePlatformCollision(entity) {
    entity.onGround = false;
    for (const p of platforms) {
        if (
            entity.x + entity.width > p.x &&
            entity.x < p.x + p.width &&
            entity.y + entity.height >= p.y &&
            entity.y + entity.height <= p.y + p.height + 15 &&
            entity.vy >= 0
        ) {
            entity.y = p.y - entity.height;
            entity.vy = 0;
            entity.onGround = true;
        }
    }
}
// ------------------------------------------------------------
// PLAYER MOVEMENT
// ------------------------------------------------------------
function updatePlayer() {
    if (gameState !== "playing") return;
    if (inventoryOpen) return;
    let moving = false;
    if (keys["a"] || keys["arrowleft"]) {
        player.vx = -player.speed;
        player.facing = -1;
        moving = true;
    }
    if (keys["d"] || keys["arrowright"]) {
        player.vx = player.speed;
        player.facing = 1;
        moving = true;
    }
    if (!moving) {
        player.vx *= 0.75;
    }
    if (
        (keys["w"] ||
         keys["arrowup"] ||
         keys[" "]) &&
        player.onGround
    ) {
        player.vy = -player.jumpPower;
    }
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;
    resolvePlatformCollision(player);
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x > WORLD_WIDTH - player.width) {
        player.x = WORLD_WIDTH - player.width;
    }
    if (player.y > HEIGHT + 200) {
        damagePlayer(999);
    }
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    if (player.attackTimer > 0) {
        player.attackTimer--;
    }
    if (player.invincible > 0) {
        player.invincible--;
    }
    if (player.hurtTimer > 0) {
        player.hurtTimer--;
    }
    if (keys["j"]) {
        playerAttack();
    }
    checkCoins();
    checkGear();
}
// ------------------------------------------------------------
// PLAYER ATTACK
// ------------------------------------------------------------
function playerAttack() {
    if (gameState !== "playing") return;
    if (inventoryOpen) return;
    if (player.attackCooldown > 0) return;
    player.attackTimer = 13;
    player.attackCooldown = 24;
    const attackRange = 75;
    const attackBox = {
        x:
            player.facing === 1
                ? player.x + player.width
                : player.x - attackRange,
        y: player.y + 8,
        width: attackRange,
        height: 35
    };
    for (const enemy of enemies) {
        if (enemy.dead) continue;
        if (rectangleCollision(attackBox, enemy)) {
            enemy.health -= player.attackDamage;
            enemy.hurtTimer = 8;
            enemy.vx = player.facing * 5;
            enemy.vy = -3;
            if (enemy.health <= 0) {
                killEnemy(enemy);
            }
        }
    }
    for (const boss of bosses) {
        if (boss.dead) continue;
        if (rectangleCollision(attackBox, boss)) {
            boss.health -= player.attackDamage;
            boss.hurtTimer = 8;
            boss.vx = player.facing * 5;
            boss.vy = -3;
            if (boss.health <= 0) {
                killBoss(boss);
            }
        }
    }
}
function killEnemy(enemy) {
    enemy.dead = true;
    score += 100;
    coins += 3;
    addCoin(
        enemy.x + enemy.width / 2,
        enemy.y - 15
    );
}
function killBoss(boss) {
    boss.dead = true;
    score += 2000;
    coins += 50;
    showMessage(boss.name + " defeated!");
    // Reward from bosses.
    if (boss.type === "ruinGuardian") {
        addItem("knightPlate");
    }
    if (boss.type === "crystalGolem") {
        addItem("crystalBlade");
    }
    if (boss.type === "iceWarlord") {
        addItem("crystalArmor");
    }
    if (boss.type === "volcanoDemon") {
        addItem("dragonSlayer");
    }
    if (boss.type === "shadowKing") {
        gameState = "victory";
    }
}
// ------------------------------------------------------------
// PLAYER DAMAGE
// ------------------------------------------------------------
function damagePlayer(amount) {
    if (player.invincible > 0) return;
    const reduced =
        Math.max(1, amount - Math.floor(player.defense * 0.45));
    player.health -= reduced;
    player.invincible = 45;
    player.hurtTimer = 12;
    player.vy = -6;
    if (player.health <= 0) {
        player.health = 0;
        gameState = "gameOver";
        inventoryOpen = false;
    }
}
// ------------------------------------------------------------
// ENEMY AI
// ------------------------------------------------------------
function updateEnemies() {
    if (gameState !== "playing") return;
    if (inventoryOpen) return;
    for (const enemy of enemies) {
        if (enemy.dead) continue;
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.abs(dx);
        if (distance < 550 && Math.abs(dy) < 230) {
            enemy.facing = dx > 0 ? 1 : -1;
            if (distance > 65) {
                enemy.vx = enemy.facing * enemy.speed;
            } else {
                enemy.vx *= 0.6;
                if (enemy.attackCooldown <= 0) {
                    enemy.attackTimer = 15;
                    enemy.attackCooldown = 70;
                }
            }
        } else {
            // Simple patrol.
            enemy.vx = enemy.facing * enemy.speed;
            if (
                enemy.x < 100 ||
                enemy.x > WORLD_WIDTH - 100
            ) {
                enemy.facing *= -1;
            }
        }
        enemy.vy += GRAVITY;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        resolvePlatformCollision(enemy);
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
        if (enemy.attackTimer > 0) {
            enemy.attackTimer--;
            if (
                enemy.attackTimer === 6 &&
                distance < 100 &&
                Math.abs(dy) < 80
            ) {
                damagePlayer(enemy.damage);
            }
        }
        if (enemy.hurtTimer > 0) {
            enemy.hurtTimer--;
        }
    }
    enemies = enemies.filter(e => !e.dead);
}
// ------------------------------------------------------------
// BOSS AI
// ------------------------------------------------------------
function updateBosses() {
    if (gameState !== "playing") return;
    if (inventoryOpen) return;
    for (const boss of bosses) {
        if (boss.dead) continue;
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const distance = Math.abs(dx);
        boss.facing = dx > 0 ? 1 : -1;
        if (distance > 100) {
            boss.vx = boss.facing * boss.speed;
        } else {
            boss.vx *= 0.65;
            if (boss.attackCooldown <= 0) {
                boss.attackTimer = 20;
                boss.attackCooldown = 90;
            }
        }
        boss.vy += GRAVITY;
        boss.x += boss.vx;
        boss.y += boss.vy;
        resolvePlatformCollision(boss);
        if (boss.attackCooldown > 0) {
            boss.attackCooldown--;
        }
        if (boss.attackTimer > 0) {
            boss.attackTimer--;
            if (
                boss.attackTimer === 7 &&
                distance < 125 &&
                Math.abs(dy) < 100
            ) {
                damagePlayer(boss.damage);
            }
        }
        if (boss.hurtTimer > 0) {
            boss.hurtTimer--;
        }
    }
}
// ------------------------------------------------------------
// COINS / ITEMS
// ------------------------------------------------------------
function checkCoins() {
    for (const coin of worldCoins) {
        if (coin.collected) continue;
        const dx =
            player.x + player.width / 2 - coin.x;
        const dy =
            player.y + player.height / 2 - coin.y;
        if (Math.abs(dx) < 35 && Math.abs(dy) < 50) {
            coin.collected = true;
            coins++;
            score += 10;
        }
    }
}
function checkGear() {
    for (const drop of gearDrops) {
        if (drop.collected) continue;
        const dx =
            player.x + player.width / 2 - drop.x;
        const dy =
            player.y + player.height / 2 - drop.y;
        if (Math.abs(dx) < 40 && Math.abs(dy) < 60) {
            if (addItem(drop.item)) {
                drop.collected = true;
            }
        }
    }
}
// ------------------------------------------------------------
// LEVEL / WORLD COMPLETION
// ------------------------------------------------------------
function checkWorldProgress() {
    const finalBoss = bosses.find(
        boss => boss.type === "shadowKing"
    );
    if (
        finalBoss &&
        finalBoss.dead &&
        player.x > WORLD_WIDTH - 250
    ) {
        gameState = "victory";
    }
}
// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------
function updateCamera() {
    const target =
        player.x - WIDTH * 0.42;
    cameraX += (target - cameraX) * 0.08;
    if (cameraX < 0) {
        cameraX = 0;
    }
    if (cameraX > WORLD_WIDTH - WIDTH) {
        cameraX = WORLD_WIDTH - WIDTH;
    }
}
// ------------------------------------------------------------
// DRAW HELPERS
// ------------------------------------------------------------
function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.floor(x),
        Math.floor(y),
        Math.floor(w),
        Math.floor(h)
    );
}
function text(str, x, y, size = 20, color = "#ffffff") {
    ctx.fillStyle = color;
    ctx.font = `${size}px monospace`;
    ctx.fillText(str, x, y);
}
function drawHealthBar(
    x,
    y,
    width,
    height,
    health,
    maxHealth
) {
    rect(x, y, width, height, "#241c1c");
    const amount =
        Math.max(0, health / maxHealth);
    rect(
        x + 2,
        y + 2,
        (width - 4) * amount,
        height - 4,
        "#e44747"
    );
}
// ------------------------------------------------------------
// BACKGROUND
// ------------------------------------------------------------
function drawBackground() {
    const region = getRegionAt(player.x);
    ctx.fillStyle = region.sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Distant mountains.
    ctx.fillStyle = "rgba(20,30,50,0.20)";
    for (let x = -300; x < WIDTH + 400; x += 260) {
        const worldX = x + cameraX * 0.25;
        ctx.beginPath();
        ctx.moveTo(x, 430);
        ctx.lineTo(
            x + 130,
            220 + (worldX % 90)
        );
        ctx.lineTo(
            x + 280,
            430
        );
        ctx.fill();
    }
    // Clouds.
    if (
        region.name !== "Crystal Caverns" &&
        region.name !== "Cursed Graveyard" &&
        region.name !== "Final Citadel"
    ) {
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        for (let x = -200; x < WIDTH + 300; x += 430) {
            const cloudX =
                x - (cameraX * 0.12 % 430);
            ctx.fillRect(cloudX, 100, 100, 20);
            ctx.fillRect(cloudX + 30, 85, 80, 30);
            ctx.fillRect(cloudX + 70, 105, 80, 15);
        }
    }
}
// ------------------------------------------------------------
// DRAW WORLD
// ------------------------------------------------------------
function drawPlatforms() {
    for (const p of platforms) {
        if (
            p.x + p.width < cameraX ||
            p.x > cameraX + WIDTH
        ) {
            continue;
        }
        const sx = p.x - cameraX;
        const region = getRegionAt(p.x);
        rect(
            sx,
            p.y,
            p.width,
            p.height,
            region.ground
        );
        rect(
            sx,
            p.y,
            p.width,
            7,
            "#7fa15a"
        );
    }
}
// ------------------------------------------------------------
// DRAW REGION SIGNS
// ------------------------------------------------------------
function drawRegionSigns() {
    for (const region of regions) {
        if (
            region.start < cameraX - 300 ||
            region.start > cameraX + WIDTH + 300
        ) {
            continue;
        }
        const x = region.start - cameraX + 25;
        rect(x, 505, 10, 80, "#633e25");
        rect(x - 70, 480, 150, 40, "#8c6339");
        text(
            region.name,
            x - 60,
            506,
            13,
            "#ffffff"
        );
    }
}
// ------------------------------------------------------------
// DRAW COINS
// ------------------------------------------------------------
function drawCoins() {
    for (const coin of worldCoins) {
        if (coin.collected) continue;
        const sx = coin.x - cameraX;
        if (sx < -30 || sx > WIDTH + 30) continue;
        const bob =
            Math.sin(Date.now() / 250 + coin.bob) * 4;
        rect(sx - 7, coin.y - 7 + bob, 14, 14, "#ffd84a");
        rect(sx - 4, coin.y - 9 + bob, 8, 18, "#fff080");
    }
}
// ------------------------------------------------------------
// DRAW GEAR
// ------------------------------------------------------------
function drawGearDrops() {
    for (const drop of gearDrops) {
        if (drop.collected) continue;
        const sx = drop.x - cameraX;
        if (sx < -50 || sx > WIDTH + 50) continue;
        const item = itemDatabase[drop.item];
        const bounce =
            Math.sin(Date.now() / 300 + drop.x) * 5;
        rect(
            sx - 13,
            drop.y - 15 + bounce,
            26,
            26,
            "#222222"
        );
        rect(
            sx - 9,
            drop.y - 11 + bounce,
            18,
            18,
            item.color
        );
        text(
            "?",
            sx - 5,
            drop.y + 4 + bounce,
            15,
            "#ffffff"
        );
    }
}
// ------------------------------------------------------------
// PIXEL KNIGHT
// ------------------------------------------------------------
function drawPlayer() {
    if (
        player.invincible > 0 &&
        Math.floor(player.invincible / 4) % 2 === 0
    ) {
        return;
    }
    const x = player.x - cameraX;
    const y = player.y;
    const flip = player.facing === -1;
    ctx.save();
    if (flip) {
        ctx.translate(x + player.width, 0);
        ctx.scale(-1, 1);
    }
    // Cape
    rect(7, y + 20, 9, 28, "#712d38");
    // Legs
    rect(9, y + 38, 7, 12, "#444b55");
    rect(21, y + 38, 7, 12, "#444b55");
    // Boots
    rect(7, y + 47, 10, 4, "#38271f");
    rect(21, y + 47, 10, 4, "#38271f");
    // Body armor
    rect(7, y + 18, 23, 23, "#8e99a6");
    rect(10, y + 20, 17, 15, "#aeb7c0");
    // Belt
    rect(7, y + 34, 23, 5, "#4c3825");
    rect(17, y + 34, 5, 5, "#e2bd47");
    // Head
    rect(8, y + 2, 22, 19, "#aeb7c0");
    // Helmet
    rect(6, y, 26, 8, "#737e8b");
    rect(11, y - 3, 16, 5, "#8c98a5");
    // Visor
    rect(8, y + 9, 25, 6, "#252a30");
    // Eye
    rect(27, y + 10, 3, 3, "#ff4c4c");
    // Shoulder
    rect(3, y + 19, 7, 9, "#6f7a87");
    // Sword
    if (player.attackTimer > 0) {
        ctx.save();
        ctx.translate(
            27,
            y + 27
        );
        ctx.rotate(-0.8);
        rect(
            0,
            -4,
            55,
            8,
            "#e4e8eb"
        );
        rect(
            0,
            -6,
            7,
            12,
            "#c59a42"
        );
        ctx.restore();
    } else {
        rect(27, y + 22, 6, 28, "#d6dce0");
        rect(25, y + 23, 10, 4, "#c59a42");
    }
    ctx.restore();
}
// ------------------------------------------------------------
// DRAW ENEMIES
// ------------------------------------------------------------
function drawEnemy(enemy) {
    const x = enemy.x - cameraX;
    const y = enemy.y;
    if (x < -100 || x > WIDTH + 100) return;
    ctx.save();
    if (enemy.facing === -1) {
        ctx.translate(x + enemy.width, 0);
        ctx.scale(-1, 1);
    }
    const color =
        enemy.hurtTimer > 0
            ? "#ffffff"
            : enemy.color;
    // Legs
    rect(8, y + 38, 7, 12, "#252525");
    rect(21, y + 38, 7, 12, "#252525");
    // Body
    rect(6, y + 17, 25, 24, color);
    // Armor highlights
    rect(10, y + 21, 17, 4, "#d1d1d1");
    rect(17, y + 27, 4, 12, "#333333");
    // Helmet
    rect(5, y + 2, 27, 18, color);
    rect(3, y, 30, 7, "#40464c");
    // Visor
    rect(6, y + 9, 27, 6, "#181b1f");
    // Eye
    rect(27, y + 10, 3, 3, "#ff3333");
    // Weapon
    if (enemy.attackTimer > 0) {
        rect(27, y + 25, 42, 5, "#dadada");
    } else {
        rect(29, y + 22, 5, 27, "#dadada");
    }
    ctx.restore();
    // Health bar
    drawHealthBar(
        x,
        y - 12,
        36,
        6,
        enemy.health,
        enemy.maxHealth
    );
}
// ------------------------------------------------------------
// DRAW BOSSES
// ------------------------------------------------------------
function drawBoss(boss) {
    const x = boss.x - cameraX;
    const y = boss.y;
    if (x < -150 || x > WIDTH + 150) return;
    ctx.save();
    if (boss.facing === -1) {
        ctx.translate(x + boss.width, 0);
        ctx.scale(-1, 1);
    }
    const color =
        boss.hurtTimer > 0
            ? "#ffffff"
            : boss.color;
    // Cape
    rect(8, y + 28, 18, 55, "#351d46");
    // Legs
    rect(10, y + 65, 12, 25, "#202026");
    rect(34, y + 65, 12, 25, "#202026");
    // Body
    rect(7, y + 23, 45, 48, color);
    // Armor
    rect(13, y + 30, 32, 27, "#a5a5ad");
    // Belt
    rect(8, y + 56, 44, 8, "#39271c");
    // Head
    rect(11, y + 3, 38, 28, color);
    // Crown/helmet
    rect(6, y, 48, 9, "#403a4a");
    rect(14, y - 7, 8, 10, "#c69c3d");
    rect(29, y - 10, 8, 13, "#c69c3d");
    rect(43, y - 7, 8, 10, "#c69c3d");
    // Face
    rect(12, y + 12, 38, 8, "#18181f");
    // Eyes
    rect(18, y + 14, 6, 4, "#ff3333");
    rect(39, y + 14, 6, 4, "#ff3333");
    // Sword
    if (boss.attackTimer > 0) {
        rect(45, y + 35, 75, 9, "#eeeeee");
    } else {
        rect(48, y + 32, 8, 58, "#d8d8d8");
    }
    ctx.restore();
    // Boss name
    text(
        boss.name,
        x - 10,
        y - 25,
        17,
        "#ffffff"
    );
    drawHealthBar(
        x - 20,
        y - 17,
        100,
        9,
        boss.health,
        boss.maxHealth
    );
}
// ------------------------------------------------------------
// HUD
// ------------------------------------------------------------
function drawHUD() {
    // Health
    rect(20, 20, 260, 55, "rgba(0,0,0,0.65)");
    text(
        "HEALTH",
        32,
        42,
        15
    );
    drawHealthBar(
        32,
        49,
        200,
        15,
        player.health,
        player.maxHealth
    );
    text(
        `${Math.ceil(player.health)} / ${player.maxHealth}`,
        238,
        62,
        11
    );
    // Coins
    text(
        `Coins: ${coins}`,
        310,
        45,
        18
    );
    text(
        `Score: ${score}`,
        310,
        70,
        16
    );
    // Region
    const region = getRegionAt(player.x);
    rect(
        WIDTH / 2 - 170,
        15,
        340,
        45,
        "rgba(0,0,0,0.55)"
    );
    text(
        region.name,
        WIDTH / 2 - 130,
        44,
        20
    );
    // Controls
    text(
        "I: Inventory",
        20,
        HEIGHT - 25,
        14,
        "#eeeeee"
    );
    text(
        "J: Attack",
        150,
        HEIGHT - 25,
        14,
        "#eeeeee"
    );
}
// ------------------------------------------------------------
// INVENTORY UI
// ------------------------------------------------------------
function drawInventory() {
    if (!inventoryOpen) return;
    rect(
        0,
        0,
        WIDTH,
        HEIGHT,
        "rgba(0,0,0,0.72)"
    );
    const panelX = 150;
    const panelY = 70;
    const panelW = 900;
    const panelH = 540;
    rect(
        panelX,
        panelY,
        panelW,
        panelH,
        "#252833"
    );
    rect(
        panelX + 8,
        panelY + 8,
        panelW - 16,
        panelH - 16,
        "#111319"
    );
    text(
        "KNIGHT'S INVENTORY",
        panelX + 30,
        panelY + 48,
        28
    );
    text(
        "Click an item to select it. Press 1-9 to equip.",
        panelX + 30,
        panelY + 78,
        15,
        "#bbbbbb"
    );
    text(
        "BACKSPACE = DISCARD SELECTED",
        panelX + 30,
        panelY + 105,
        16,
        "#ffcf55"
    );
    // Slots
    for (let i = 0; i < 12; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = panelX + 35 + col * 205;
        const y = panelY + 135 + row * 105;
        const selected = i === selectedSlot;
        rect(
            x,
            y,
            180,
            85,
            selected ? "#4d5870" : "#292d38"
        );
        rect(
            x + 5,
            y + 5,
            170,
            75,
            "#16191f"
        );
        text(
            String(i + 1),
            x + 12,
            y + 25,
            15,
            "#bbbbbb"
        );
        if (inventory[i]) {
            const item =
                itemDatabase[inventory[i]];
            rect(
                x + 18,
                y + 32,
                25,
                25,
                item.color
            );
            text(
                item.name,
                x + 55,
                y + 47,
                14
            );
            text(
                item.type.toUpperCase(),
                x + 55,
                y + 67,
                11,
                "#999999"
            );
            if (
                equipped[item.type] === inventory[i]
            ) {
                text(
                    "EQUIPPED",
                    x + 55,
                    y + 22,
                    10,
                    "#63e66b"
                );
            }
        } else {
            text(
                "EMPTY",
                x + 60,
                y + 50,
                15,
                "#555555"
            );
        }
    }
    // Bottom information
    const selectedItem =
        inventory[selectedSlot]
            ? itemDatabase[inventory[selectedSlot]]
            : null;
    if (selectedItem) {
        text(
            `Selected: ${selectedItem.name}`,
            panelX + 35,
            panelY + 475,
            18
        );
        if (selectedItem.attack) {
            text(
                `Attack: +${selectedItem.attack}`,
                panelX + 35,
                panelY + 500,
                14,
                "#dddddd"
            );
        }
        if (selectedItem.defense) {
            text(
                `Defense: +${selectedItem.defense}`,
                panelX + 35,
                panelY + 500,
                14,
                "#dddddd"
            );
        }
        if (selectedItem.speed) {
            text(
                `Speed: +${selectedItem.speed}`,
                panelX + 35,
                panelY + 500,
                14,
                "#dddddd"
            );
        }
    }
    text(
        "Press I to close inventory",
        panelX + 600,
        panelY + 500,
        14,
        "#aaaaaa"
    );
}
// ------------------------------------------------------------
// INVENTORY MOUSE
// ------------------------------------------------------------
function handleInventoryClick() {
    const panelX = 150;
    const panelY = 70;
    for (let i = 0; i < 12; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = panelX + 35 + col * 205;
        const y = panelY + 135 + row * 105;
        if (
            mouse.x >= x &&
            mouse.x <= x + 180 &&
            mouse.y >= y &&
            mouse.y <= y + 85
        ) {
            selectedSlot = i;
            return;
        }
    }
}
// ------------------------------------------------------------
// REGION DECORATIONS
// ------------------------------------------------------------
function drawDecorations() {
    const start =
        Math.max(0, Math.floor(cameraX / 100) * 100);
    for (let x = start; x < cameraX + WIDTH + 100; x += 130) {
        const region = getRegionAt(x);
        if (region.name === "Knight's Village") {
            // Houses
            if (x % 390 === 0) {
                const sx = x - cameraX;
                rect(sx, 450, 100, 120, "#a67c52");
                // roof
                ctx.fillStyle = "#663b35";
                ctx.beginPath();
                ctx.moveTo(sx - 10, 450);
                ctx.lineTo(sx + 50, 395);
                ctx.lineTo(sx + 110, 450);
                ctx.fill();
                rect(sx + 38, 510, 25, 60, "#4b3529");
            }
        }
        if (region.name === "Dark Forest") {
            const sx = x - cameraX;
            rect(sx + 35, 400, 22, 220, "#392a20");
            rect(sx, 350, 95, 75, "#203a27");
            rect(sx + 15, 315, 70, 65, "#25462e");
        }
        if (region.name === "Cursed Graveyard") {
            const sx = x - cameraX;
            rect(sx + 35, 550, 8, 55, "#8a8a8a");
            rect(sx + 20, 565, 38, 8, "#8a8a8a");
        }
        if (region.name === "Volcano Pass") {
            const sx = x - cameraX;
            rect(
                sx,
                610,
                110,
                10,
                "#e54b2d"
            );
        }
    }
}
// ------------------------------------------------------------
// FINAL GATE
// ------------------------------------------------------------
function drawFinalGate() {
    const x = WORLD_WIDTH - 120 - cameraX;
    rect(x, 350, 100, 270, "#28252e");
    rect(x + 15, 365, 70, 255, "#121117");
    text(
        "FINAL",
        x + 25,
        330,
        16,
        "#ffffff"
    );
    text(
        "CITADEL",
        x + 8,
        350,
        14,
        "#ffffff"
    );
}
// ------------------------------------------------------------
// MESSAGE
// ------------------------------------------------------------
function drawMessage() {
    if (messageTimer <= 0) return;
    const alpha =
        Math.min(1, messageTimer / 25);
    ctx.fillStyle =
        `rgba(0,0,0,${0.75 * alpha})`;
    ctx.fillRect(
        WIDTH / 2 - 250,
        HEIGHT - 100,
        500,
        45
    );
    text(
        message,
        WIDTH / 2 - ctx.measureText(message).width / 2,
        HEIGHT - 70,
        18
    );
}
// ------------------------------------------------------------
// VICTORY / GAME OVER
// ------------------------------------------------------------
function drawEndScreen() {
    if (
        gameState !== "gameOver" &&
        gameState !== "victory"
    ) {
        return;
    }
    rect(
        0,
        0,
        WIDTH,
        HEIGHT,
        "rgba(0,0,0,0.78)"
    );
    if (gameState === "victory") {
        text(
            "KNIGHT'S QUEST COMPLETE!",
            WIDTH / 2 - 250,
            250,
            34,
            "#ffd85a"
        );
        text(
            "You defeated the Shadow King.",
            WIDTH / 2 - 190,
            300,
            20
        );
        text(
            `Final Score: ${score}`,
            WIDTH / 2 - 100,
            350,
            18
        );
        text(
            `Coins Collected: ${coins}`,
            WIDTH / 2 - 115,
            380,
            18
        );
    } else {
        text(
            "YOU DIED",
            WIDTH / 2 - 90,
            280,
            40,
            "#ff5555"
        );
        text(
            "The kingdom has fallen...",
            WIDTH / 2 - 140,
            330,
            20
        );
    }
    text(
        "Press R to restart",
        WIDTH / 2 - 110,
        420,
        18
    );
}
// ------------------------------------------------------------
// OPEN-WORLD MINI MAP
// ------------------------------------------------------------
function drawMiniMap() {
    const mapX = WIDTH - 310;
    const mapY = 20;
    const mapW = 280;
    const mapH = 35;
    rect(
        mapX,
        mapY,
        mapW,
        mapH,
        "rgba(0,0,0,0.65)"
    );
    for (const region of regions) {
        const x =
            mapX +
            (region.start / WORLD_WIDTH) * mapW;
        const w =
            ((region.end - region.start) /
            WORLD_WIDTH) * mapW;
        rect(
            x,
            mapY + 8,
            Math.max(2, w),
            19,
            region.ground
        );
    }
    const playerMapX =
        mapX +
        (player.x / WORLD_WIDTH) * mapW;
    rect(
        playerMapX - 2,
        mapY + 3,
        4,
        29,
        "#ffffff"
    );
}
// ------------------------------------------------------------
// DRAW EVERYTHING
// ------------------------------------------------------------
function draw() {
    drawBackground();
    ctx.save();
    drawDecorations();
    drawPlatforms();
    drawRegionSigns();
    drawCoins();
    drawGearDrops();
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
    for (const boss of bosses) {
        if (!boss.dead) {
            drawBoss(boss);
        }
    }
    drawFinalGate();
    drawPlayer();
    ctx.restore();
    drawHUD();
    drawMiniMap();
    drawMessage();
    drawInventory();
    drawEndScreen();
}
// ------------------------------------------------------------
// GAME UPDATE
// ------------------------------------------------------------
function update() {
    if (messageTimer > 0) {
        messageTimer--;
    }
    updatePlayer();
    updateEnemies();
    updateBosses();
    updateCamera();
    checkRegionChange();
    checkWorldProgress();
}
// ------------------------------------------------------------
// RESTART
// ------------------------------------------------------------
function restartGame() {
    score = 0;
    coins = 0;
    inventory = [
        "ironSword",
        "knightArmor",
        "travelerBoots"
    ];
    selectedSlot = 0;
    equipped = {
        weapon: "ironSword",
        armor: "knightArmor",
        boots: "travelerBoots"
    };
    player.x = 500;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    player.health = 100;
    player.maxHealth = 100;
    player.attackTimer = 0;
    player.attackCooldown = 0;
    player.invincible = 0;
    player.hurtTimer = 0;
    cameraX = 0;
    lastRegion = null;
    gameState = "playing";
    inventoryOpen = false;
    buildWorld();
    buildCoins();
    buildGearDrops();
    buildEnemies();
    recalculateStats();
    showMessage("Welcome to Knight's Quest!");
}
// ------------------------------------------------------------
// START GAME
// ------------------------------------------------------------
buildWorld();
buildCoins();
buildGearDrops();
buildEnemies();
recalculateStats();
showMessage("Explore the kingdom!");
// ------------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------------
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
