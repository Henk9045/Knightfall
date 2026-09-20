const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 15000;
const GROUND_Y = 590;
const GRAVITY = 0.65;
const MAX_FALL_SPEED = 15;
const keys = {};
const justPressed = {};
window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (
        key === "arrowleft" ||
        key === "arrowright" ||
        key === "arrowup" ||
        key === " " ||
        key === "backspace"
    ) {
        event.preventDefault();
    }
    if (!keys[key]) {
        justPressed[key] = true;
    }
    keys[key] = true;
    if (key === "i") {
        toggleInventory();
    }
    if (key === "backspace" && gameState === "inventory") {
        discardSelected();
    }
    if (key >= "1" && key <= "9" && gameState === "inventory") {
        equipItem(Number(key) - 1);
    }
    if (key === "r" && (gameState === "dead" || gameState === "victory")) {
        restartGame();
    }
});
window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});
// ============================================================
// ITEMS
// ============================================================
const items = {
    "Iron Sword": {
        type: "weapon",
        damage: 10,
        color: "#d5dbe2"
    },
    "Steel Sword": {
        type: "weapon",
        damage: 18,
        color: "#aebdce"
    },
    "Flame Blade": {
        type: "weapon",
        damage: 30,
        color: "#ff7438"
    },
    "Shadow Greatsword": {
        type: "weapon",
        damage: 45,
        color: "#9d6bea"
    },
    "Crystal Blade": {
        type: "weapon",
        damage: 55,
        color: "#66eaff"
    },
    "Dragon Slayer": {
        type: "weapon",
        damage: 75,
        color: "#ffc94d"
    },
    "Traveler Boots": {
        type: "boots",
        speed: 0,
        jump: 0,
        color: "#8b6847"
    },
    "Swift Boots": {
        type: "boots",
        speed: 1.5,
        jump: 0,
        color: "#5ee38c"
    },
    "Highland Boots": {
        type: "boots",
        speed: 2.5,
        jump: 1,
        color: "#d8a55c"
    },
    "Crystal Boots": {
        type: "boots",
        speed: 3,
        jump: 2,
        color: "#62e6ff"
    },
    "Dragon Boots": {
        type: "boots",
        speed: 4,
        jump: 3,
        color: "#ffb82e"
    },
    "Knight Armor": {
        type: "armor",
        defense: 5,
        health: 20,
        color: "#8996a8"
    },
    "Chainmail": {
        type: "armor",
        defense: 10,
        health: 35,
        color: "#b7c1cc"
    },
    "Knight Plate": {
        type: "armor",
        defense: 18,
        health: 60,
        color: "#d6dee7"
    },
    "Crystal Armor": {
        type: "armor",
        defense: 28,
        health: 90,
        color: "#64eaff"
    },
    "Dragon Armor": {
        type: "armor",
        defense: 40,
        health: 130,
        color: "#e7a83e"
    },
    "Shadow Armor": {
        type: "armor",
        defense: 50,
        health: 150,
        color: "#9c67db"
    }
};
let inventory = [
    "Iron Sword",
    "Knight Armor",
    "Traveler Boots"
];
let selectedItem = 0;
const equipped = {
    weapon: "Iron Sword",
    armor: "Knight Armor",
    boots: "Traveler Boots"
};
// ============================================================
// PLAYER
// ============================================================
const player = {
    x: 300,
    y: GROUND_Y - 64,
    width: 34,
    height: 64,
    velocityX: 0,
    velocityY: 0,
    acceleration: 0.9,
    friction: 0.78,
    speed: 4.5,
    jumpPower: 13,
    onGround: false,
    direction: 1,
    health: 120,
    maxHealth: 120,
    damage: 20,
    defense: 5,
    attackTimer: 0,
    attackCooldown: 0,
    hurtTimer: 0,
    invincibleTimer: 0
};
// ============================================================
// WORLD
// ============================================================
const regions = [
    {
        name: "Knight's Village",
        start: 0,
        end: 1300,
        sky: "#82c7ed",
        ground: "#4f7547"
    },
    {
        name: "Forgotten Fields",
        start: 1300,
        end: 2900,
        sky: "#7da56d",
        ground: "#566942"
    },
    {
        name: "Dark Forest",
        start: 2900,
        end: 4700,
        sky: "#263a35",
        ground: "#344733"
    },
    {
        name: "Ancient Ruins",
        start: 4700,
        end: 6200,
        sky: "#827b70",
        ground: "#5c554b"
    },
    {
        name: "Crystal Caverns",
        start: 6200,
        end: 7800,
        sky: "#222b4a",
        ground: "#393d54"
    },
    {
        name: "Frozen Mountains",
        start: 7800,
        end: 9300,
        sky: "#b9d9e9",
        ground: "#718795"
    },
    {
        name: "Volcano Pass",
        start: 9300,
        end: 10800,
        sky: "#402629",
        ground: "#503530"
    },
    {
        name: "Sky Fortress",
        start: 10800,
        end: 12100,
        sky: "#7092c5",
        ground: "#68727e"
    },
    {
        name: "Cursed Graveyard",
        start: 12100,
        end: 13700,
        sky: "#171a27",
        ground: "#292a32"
    },
    {
        name: "Final Citadel",
        start: 13700,
        end: 15000,
        sky: "#160d1e",
        ground: "#25202c"
    }
];
// Platforms are only collision surfaces from the TOP.
// This makes jumping through the bottom of a platform possible.
const platforms = [
    { x: 400, y: 480, width: 220, height: 22 },
    { x: 780, y: 390, width: 180, height: 22 },
    { x: 1120, y: 490, width: 230, height: 22 },
    { x: 1550, y: 450, width: 260, height: 22 },
    { x: 2050, y: 360, width: 220, height: 22 },
    { x: 2500, y: 470, width: 260, height: 22 },
    { x: 3050, y: 400, width: 200, height: 22 },
    { x: 3500, y: 330, width: 240, height: 22 },
    { x: 4050, y: 460, width: 260, height: 22 },
    { x: 4800, y: 390, width: 250, height: 22 },
    { x: 5300, y: 300, width: 220, height: 22 },
    { x: 5750, y: 450, width: 250, height: 22 },
    { x: 6350, y: 420, width: 240, height: 22 },
    { x: 6900, y: 320, width: 220, height: 22 },
    { x: 7350, y: 460, width: 280, height: 22 },
    { x: 8000, y: 380, width: 250, height: 22 },
    { x: 8500, y: 290, width: 220, height: 22 },
    { x: 8950, y: 450, width: 260, height: 22 },
    { x: 9450, y: 400, width: 240, height: 22 },
    { x: 10000, y: 300, width: 230, height: 22 },
    { x: 10450, y: 450, width: 240, height: 22 },
    { x: 10950, y: 370, width: 250, height: 22 },
    { x: 11400, y: 280, width: 240, height: 22 },
    { x: 11800, y: 450, width: 220, height: 22 },
    { x: 12350, y: 390, width: 240, height: 22 },
    { x: 12800, y: 300, width: 220, height: 22 },
    { x: 13200, y: 450, width: 260, height: 22 },
    { x: 13800, y: 390, width: 240, height: 22 },
    { x: 14300, y: 300, width: 240, height: 22 }
];
// ============================================================
// ENEMIES
// ============================================================
const enemyStats = {
    soldier: {
        width: 38,
        height: 58,
        health: 45,
        damage: 10,
        speed: 1.2,
        color: "#b84b4b"
    },
    knight: {
        width: 42,
        height: 64,
        health: 80,
        damage: 16,
        speed: 1,
        color: "#7b87a1"
    },
    brute: {
        width: 52,
        height: 70,
        health: 150,
        damage: 24,
        speed: 0.55,
        color: "#744b3c"
    },
    shadow: {
        width: 40,
        height: 62,
        health: 110,
        damage: 22,
        speed: 1.5,
        color: "#7651a8"
    },
    iceKnight: {
        width: 44,
        height: 66,
        health: 140,
        damage: 25,
        speed: 0.9,
        color: "#72bcd0"
    },
    demon: {
        width: 50,
        height: 72,
        health: 220,
        damage: 30,
        speed: 1,
        color: "#c84d43"
    }
};
let enemies = [];
function createEnemy(x, type) {
    const stats = enemyStats[type];
    return {
        x,
        y: GROUND_Y - stats.height,
        width: stats.width,
        height: stats.height,
        velocityX: 0,
        velocityY: 0,
        type,
        health: stats.health,
        maxHealth: stats.health,
        damage: stats.damage,
        speed: stats.speed,
        color: stats.color,
        alive: true,
        hitTimer: 0,
        attackCooldown: 0,
        boss: false,
        name: ""
    };
}
function createBoss(x, name, type, health) {
    const enemy = createEnemy(x, type);
    enemy.width += 24;
    enemy.height += 28;
    enemy.y = GROUND_Y - enemy.height;
    enemy.health = health;
    enemy.maxHealth = health;
    enemy.damage += 8;
    enemy.speed *= 0.8;
    enemy.boss = true;
    enemy.name = name;
    return enemy;
}
function createEnemies() {
    enemies = [
        createEnemy(900, "soldier"),
        createEnemy(1450, "soldier"),
        createEnemy(1750, "knight"),
        createEnemy(2300, "soldier"),
        createEnemy(2700, "brute"),
        createEnemy(3150, "shadow"),
        createEnemy(3650, "shadow"),
        createEnemy(4300, "knight"),
        createBoss(5600, "Ruin Guardian", "brute", 500),
        createEnemy(6500, "shadow"),
        createEnemy(7100, "shadow"),
        createBoss(7550, "Crystal Golem", "brute", 650),
        createEnemy(8200, "iceKnight"),
        createEnemy(8800, "iceKnight"),
        createBoss(9050, "Ice Warlord", "iceKnight", 750),
        createEnemy(9650, "demon"),
        createEnemy(10300, "demon"),
        createBoss(10600, "Volcano Demon", "demon", 900),
        createEnemy(11100, "knight"),
        createEnemy(11600, "shadow"),
        createEnemy(12400, "shadow"),
        createEnemy(13000, "shadow"),
        createEnemy(13500, "brute"),
        createBoss(14400, "Shadow King", "shadow", 1400)
    ];
}
// ============================================================
// COINS
// ============================================================
let coins = 0;
let mapCoins = [];
function createCoins() {
    mapCoins = [];
    for (let x = 450; x < WORLD_WIDTH - 300; x += 400) {
        let y = GROUND_Y - 30;
        for (const platform of platforms) {
            if (
                x >= platform.x &&
                x <= platform.x + platform.width
            ) {
                y = platform.y - 30;
                break;
            }
        }
        mapCoins.push({
            x,
            y,
            radius: 8,
            collected: false
        });
    }
}
// ============================================================
// GAME STATE
// ============================================================
let gameState = "playing";
let cameraX = 0;
let message = "";
let messageTimer = 0;
// ============================================================
// PLAYER STATS
// ============================================================
function updatePlayerStats() {
    const weapon = items[equipped.weapon];
    const armor = items[equipped.armor];
    const boots = items[equipped.boots];
    player.damage = 10 + (weapon.damage || 0);
    player.defense = armor.defense || 0;
    player.speed = 4.5 + (boots.speed || 0);
    player.jumpPower = 13 + (boots.jump || 0);
    const oldMax = player.maxHealth;
    player.maxHealth = 100 + (armor.health || 0);
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    if (oldMax < player.maxHealth) {
        player.health += player.maxHealth - oldMax;
    }
}
// ============================================================
// INVENTORY
// ============================================================
function addItem(itemName) {
    if (inventory.length >= 12) {
        showMessage("Inventory is full!");
        return;
    }
    inventory.push(itemName);
    showMessage(`${itemName} found!`);
}
function equipItem(index) {
    const itemName = inventory[index];
    if (!itemName) {
        return;
    }
    const item = items[itemName];
    if (item.type === "weapon") {
        equipped.weapon = itemName;
    }
    if (item.type === "armor") {
        equipped.armor = itemName;
    }
    if (item.type === "boots") {
        equipped.boots = itemName;
    }
    updatePlayerStats();
    showMessage(`Equipped ${itemName}`);
}
function discardSelected() {
    const itemName = inventory[selectedItem];
    if (!itemName) {
        return;
    }
    if (
        itemName === equipped.weapon ||
        itemName === equipped.armor ||
        itemName === equipped.boots
    ) {
        showMessage("You cannot discard equipped gear.");
        return;
    }
    inventory.splice(selectedItem, 1);
    selectedItem = Math.max(
        0,
        Math.min(selectedItem, inventory.length - 1)
    );
}
function toggleInventory() {
    if (gameState === "playing") {
        gameState = "inventory";
    } else if (gameState === "inventory") {
        gameState = "playing";
    }
}
// ============================================================
// MESSAGES
// ============================================================
function showMessage(text) {
    message = text;
    messageTimer = 150;
}
// ============================================================
// COLLISION
// ============================================================
function horizontalOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x
    );
}
// ============================================================
// PLAYER MOVEMENT
// ============================================================
function updatePlayerMovement() {
    const movingLeft =
        keys["a"] ||
        keys["arrowleft"];
    const movingRight =
        keys["d"] ||
        keys["arrowright"];
    // ------------------------------
    // HORIZONTAL MOVEMENT
    // ------------------------------
    if (movingLeft && !movingRight) {
        player.velocityX -= player.acceleration;
        if (player.velocityX < -player.speed) {
            player.velocityX = -player.speed;
        }
        player.direction = -1;
    }
    else if (movingRight && !movingLeft) {
        player.velocityX += player.acceleration;
        if (player.velocityX > player.speed) {
            player.velocityX = player.speed;
        }
        player.direction = 1;
    }
    else {
        player.velocityX *= player.friction;
        if (Math.abs(player.velocityX) < 0.05) {
            player.velocityX = 0;
        }
    }
    // ------------------------------
    // JUMP
    // ------------------------------
    const jumpPressed =
        justPressed["w"] ||
        justPressed["arrowup"] ||
        justPressed[" "];
    if (jumpPressed && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }
    // ------------------------------
    // HORIZONTAL POSITION
    // ------------------------------
    player.x += player.velocityX;
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > WORLD_WIDTH) {
        player.x = WORLD_WIDTH - player.width;
        player.velocityX = 0;
    }
    // ------------------------------
    // GRAVITY
    // ------------------------------
    player.velocityY += GRAVITY;
    if (player.velocityY > MAX_FALL_SPEED) {
        player.velocityY = MAX_FALL_SPEED;
    }
    const oldBottom =
        player.y + player.height;
    player.y += player.velocityY;
    player.onGround = false;
    // ------------------------------
    // GROUND
    // ------------------------------
    if (player.y + player.height >= GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }
    // ------------------------------
    // PLATFORM TOPS
    // ------------------------------
    if (player.velocityY >= 0) {
        for (const platform of platforms) {
            const overlapsX =
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width;
            const crossedTop =
                oldBottom <= platform.y &&
                player.y + player.height >= platform.y;
            if (overlapsX && crossedTop) {
                player.y =
                    platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
                break;
            }
        }
    }
}
// ============================================================
// ATTACK
// ============================================================
function playerAttack() {
    if (player.attackCooldown > 0) {
        return;
    }
    player.attackCooldown = 24;
    player.attackTimer = 13;
    const attackRange = 70;
    const hitbox = {
        x:
            player.direction === 1
                ? player.x + player.width
                : player.x - attackRange,
        y: player.y + 10,
        width: attackRange,
        height: 45
    };
    for (const enemy of enemies) {
        if (!enemy.alive) {
            continue;
        }
        const hit =
            hitbox.x < enemy.x + enemy.width &&
            hitbox.x + hitbox.width > enemy.x &&
            hitbox.y < enemy.y + enemy.height &&
            hitbox.y + hitbox.height > enemy.y;
        if (!hit) {
            continue;
        }
        enemy.health -= player.damage;
        enemy.hitTimer = 8;
        if (enemy.health <= 0) {
            enemy.alive = false;
            coins += enemy.boss ? 100 : 5;
            giveEnemyReward(enemy);
            if (
                enemy.boss &&
                enemy.name === "Shadow King"
            ) {
                gameState = "victory";
            }
        }
    }
}
function giveEnemyReward(enemy) {
    const rewards = {
        soldier: ["Steel Sword"],
        knight: ["Chainmail", "Swift Boots"],
        brute: ["Knight Plate"],
        shadow: ["Shadow Greatsword", "Shadow Armor"],
        iceKnight: ["Crystal Blade", "Crystal Boots"],
        demon: ["Dragon Slayer", "Dragon Armor", "Dragon Boots"]
    };
    const rewardList = rewards[enemy.type];
    if (!rewardList) {
        return;
    }
    if (enemy.boss || Math.random() < 0.35) {
        const reward =
            rewardList[
                Math.floor(Math.random() * rewardList.length)
            ];
        addItem(reward);
    }
}
// ============================================================
// ENEMY MOVEMENT
// ============================================================
function updateEnemies() {
    for (const enemy of enemies) {
        if (!enemy.alive) {
            continue;
        }
        if (enemy.hitTimer > 0) {
            enemy.hitTimer--;
        }
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
        const distance =
            player.x - enemy.x;
        const absoluteDistance =
            Math.abs(distance);
        if (absoluteDistance < 650) {
            enemy.velocityX =
                Math.sign(distance) * enemy.speed;
        } else {
            enemy.velocityX *= 0.9;
        }
        enemy.x += enemy.velocityX;
        if (enemy.x < 0) {
            enemy.x = 0;
        }
        if (enemy.x + enemy.width > WORLD_WIDTH) {
            enemy.x = WORLD_WIDTH - enemy.width;
        }
        enemy.velocityY += GRAVITY;
        if (enemy.velocityY > MAX_FALL_SPEED) {
            enemy.velocityY = MAX_FALL_SPEED;
        }
        const oldBottom =
            enemy.y + enemy.height;
        enemy.y += enemy.velocityY;
        if (enemy.y + enemy.height >= GROUND_Y) {
            enemy.y =
                GROUND_Y - enemy.height;
            enemy.velocityY = 0;
        }
        if (enemy.velocityY >= 0) {
            for (const platform of platforms) {
                const overlapsX =
                    enemy.x + enemy.width > platform.x &&
                    enemy.x < platform.x + platform.width;
                const crossed =
                    oldBottom <= platform.y &&
                    enemy.y + enemy.height >= platform.y;
                if (overlapsX && crossed) {
                    enemy.y =
                        platform.y - enemy.height;
                    enemy.velocityY = 0;
                    break;
                }
            }
        }
        // Enemy damages player when close.
        if (
            absoluteDistance < 55 &&
            enemy.attackCooldown <= 0 &&
            player.invincibleTimer <= 0
        ) {
            const damage =
                Math.max(
                    1,
                    enemy.damage - player.defense
                );
            player.health -= damage;
            player.hurtTimer = 15;
            player.invincibleTimer = 45;
            enemy.attackCooldown = 60;
            // Small knockback
            player.velocityX =
                enemy.x < player.x
                    ? 5
                    : -5;
            player.velocityY = -4;
            if (player.health <= 0) {
                player.health = 0;
                gameState = "dead";
            }
        }
    }
}
// ============================================================
// COINS
// ============================================================
function collectCoins() {
    for (const coin of mapCoins) {
        if (coin.collected) {
            continue;
        }
        const dx =
            player.x + player.width / 2 -
            coin.x;
        const dy =
            player.y + player.height / 2 -
            coin.y;
        const distance =
            Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) {
            coin.collected = true;
            coins++;
        }
    }
}
// ============================================================
// CAMERA
// ============================================================
function updateCamera() {
    // The player stays around the center of the screen.
    const target =
        player.x - WIDTH * 0.42;
    cameraX +=
        (target - cameraX) * 0.12;
    if (cameraX < 0) {
        cameraX = 0;
    }
    if (cameraX > WORLD_WIDTH - WIDTH) {
        cameraX = WORLD_WIDTH - WIDTH;
    }
}
// ============================================================
// UPDATE
// ============================================================
function update() {
    if (gameState !== "playing") {
        for (const key in justPressed) {
            delete justPressed[key];
        }
        return;
    }
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
    }
    if (player.attackTimer > 0) {
        player.attackTimer--;
    }
    if (player.hurtTimer > 0) {
        player.hurtTimer--;
    }
    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
    }
    if (messageTimer > 0) {
        messageTimer--;
    }
    if (justPressed["j"]) {
        playerAttack();
    }
    updatePlayerMovement();
    updateEnemies();
    collectCoins();
    updateCamera();
    for (const key in justPressed) {
        delete justPressed[key];
    }
}
// ============================================================
// DRAW BACKGROUND
// ============================================================
function getRegion(x) {
    for (const region of regions) {
        if (
            x >= region.start &&
            x < region.end
        ) {
            return region;
        }
    }
    return regions[regions.length - 1];
}
function drawBackground() {
    const region =
        getRegion(player.x);
    ctx.fillStyle = region.sky;
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    // Mountains
    const offset =
        (cameraX * 0.2) % 500;
    ctx.fillStyle =
        "rgba(20,25,40,0.20)";
    for (
        let x = -500 - offset;
        x < WIDTH + 500;
        x += 500
    ) {
        ctx.beginPath();
        ctx.moveTo(x, 480);
        ctx.lineTo(
            x + 150,
            310
        );
        ctx.lineTo(
            x + 310,
            480
        );
        ctx.lineTo(
            x + 390,
            350
        );
        ctx.lineTo(
            x + 560,
            480
        );
        ctx.closePath();
        ctx.fill();
    }
}
// ============================================================
// DRAW WORLD
// ============================================================
function drawGround() {
    const region =
        getRegion(player.x);
    ctx.fillStyle =
        region.ground;
    ctx.fillRect(
        0,
        GROUND_Y,
        WIDTH,
        HEIGHT - GROUND_Y
    );
    // Ground details
    ctx.fillStyle =
        "rgba(0,0,0,0.15)";
    for (
        let x = -((cameraX * 0.5) % 80);
        x < WIDTH;
        x += 80
    ) {
        ctx.fillRect(
            x,
            GROUND_Y + 18,
            45,
            6
        );
    }
    // Platforms
    for (const platform of platforms) {
        const x =
            platform.x - cameraX;
        if (
            x + platform.width < 0 ||
            x > WIDTH
        ) {
            continue;
        }
        ctx.fillStyle = "#514a43";
        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            platform.height
        );
        ctx.fillStyle = "#81785e";
        ctx.fillRect(
            x,
            platform.y,
            platform.width,
            6
        );
    }
}
// ============================================================
// DECORATIONS
// ============================================================
function drawDecorations() {
    const first =
        Math.floor(cameraX / 120) * 120;
    for (
        let worldX = first;
        worldX < cameraX + WIDTH + 120;
        worldX += 120
    ) {
        const x =
            worldX - cameraX;
        const region =
            getRegion(worldX);
        if (region.name === "Knight's Village") {
            ctx.fillStyle = "#74533a";
            ctx.fillRect(
                x + 40,
                GROUND_Y - 85,
                15,
                85
            );
            ctx.fillStyle = "#a63d38";
            ctx.beginPath();
            ctx.moveTo(
                x + 15,
                GROUND_Y - 85
            );
            ctx.lineTo(
                x + 48,
                GROUND_Y - 125
            );
            ctx.lineTo(
                x + 80,
                GROUND_Y - 85
            );
            ctx.closePath();
            ctx.fill();
        }
        if (region.name === "Dark Forest") {
            ctx.fillStyle = "#24352b";
            ctx.fillRect(
                x + 48,
                GROUND_Y - 135,
                20,
                135
            );
            ctx.beginPath();
            ctx.moveTo(
                x + 58,
                GROUND_Y - 205
            );
            ctx.lineTo(
                x + 5,
                GROUND_Y - 125
            );
            ctx.lineTo(
                x + 110,
                GROUND_Y - 125
            );
            ctx.closePath();
            ctx.fill();
        }
        if (region.name === "Frozen Mountains") {
            ctx.fillStyle = "#edf7fc";
            ctx.beginPath();
            ctx.moveTo(
                x + 60,
                GROUND_Y
            );
            ctx.lineTo(
                x + 5,
                GROUND_Y - 110
            );
            ctx.lineTo(
                x + 55,
                GROUND_Y - 180
            );
            ctx.lineTo(
                x + 110,
                GROUND_Y - 110
            );
            ctx.closePath();
            ctx.fill();
        }
        if (region.name === "Cursed Graveyard") {
            ctx.strokeStyle = "#55515d";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(
                x + 55,
                GROUND_Y
            );
            ctx.lineTo(
                x + 55,
                GROUND_Y - 60
            );
            ctx.moveTo(
                x + 30,
                GROUND_Y - 42
            );
            ctx.lineTo(
                x + 80,
                GROUND_Y - 42
            );
            ctx.stroke();
        }
    }
}
// ============================================================
// DRAW COINS
// ============================================================
function drawCoins() {
    for (const coin of mapCoins) {
        if (coin.collected) {
            continue;
        }
        const x =
            coin.x - cameraX;
        if (
            x < -20 ||
            x > WIDTH + 20
        ) {
            continue;
        }
        ctx.fillStyle = "#ffd447";
        ctx.beginPath();
        ctx.arc(
            x,
            coin.y,
            coin.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "#9b7015";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            "$",
            x,
            coin.y + 4
        );
        ctx.textAlign = "left";
    }
}
// ============================================================
// DRAW PLAYER
// ============================================================
function drawPlayer() {
    if (
        player.invincibleTimer > 0 &&
        Math.floor(player.invincibleTimer / 4) % 2 === 0
    ) {
        return;
    }
    const x =
        player.x - cameraX;
    const y =
        player.y;
    // Cape
    ctx.fillStyle = "#7c2630";
    ctx.fillRect(
        x + (player.direction === 1 ? 3 : 17),
        y + 22,
        16,
        32
    );
    // Armor
    ctx.fillStyle = "#b9c5d1";
    ctx.fillRect(
        x + 7,
        y + 23,
        23,
        30
    );
    // Helmet
    ctx.fillStyle = "#dbe2e8";
    ctx.fillRect(
        x + 6,
        y + 3,
        25,
        23
    );
    // Helmet opening
    ctx.fillStyle = "#4d5864";
    if (player.direction === 1) {
        ctx.fillRect(
            x + 21,
            y + 12,
            11,
            5
        );
    } else {
        ctx.fillRect(
            x + 2,
            y + 12,
            11,
            5
        );
    }
    // Legs
    ctx.fillStyle = "#394452";
    ctx.fillRect(
        x + 7,
        y + 52,
        9,
        12
    );
    ctx.fillRect(
        x + 20,
        y + 52,
        9,
        12
    );
    // Sword
    ctx.save();
    ctx.translate(
        x + 17,
        y + 35
    );
    ctx.scale(
        player.direction,
        1
    );
    const rotation =
        player.attackTimer > 0
            ? -1.0
            : -0.25;
    ctx.rotate(rotation);
    ctx.fillStyle = "#68432a";
    ctx.fillRect(
        0,
        0,
        5,
        18
    );
    ctx.fillStyle =
        items[equipped.weapon].color;
    ctx.fillRect(
        4,
        -33,
        7,
        35
    );
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(
        2,
        -3,
        15,
        4
    );
    ctx.restore();
}
// ============================================================
// DRAW ENEMIES
// ============================================================
function drawEnemy(enemy) {
    const x =
        enemy.x - cameraX;
    if (
        x + enemy.width < 0 ||
        x > WIDTH
    ) {
        return;
    }
    ctx.fillStyle =
        enemy.hitTimer > 0
            ? "#ffffff"
            : enemy.color;
    ctx.fillRect(
        x,
        enemy.y + 18,
        enemy.width,
        enemy.height - 18
    );
    // Head
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(
        x + 7,
        enemy.y,
        enemy.width - 14,
        24
    );
    // Eyes / visor
    ctx.fillStyle = "#30343c";
    ctx.fillRect(
        x + 8,
        enemy.y + 11,
        enemy.width - 16,
        5
    );
    // Boss health bar
    if (enemy.boss) {
        ctx.fillStyle = "#111";
        ctx.fillRect(
            x - 18,
            enemy.y - 32,
            enemy.width + 36,
            10
        );
        ctx.fillStyle = "#d83b4b";
        ctx.fillRect(
            x - 18,
            enemy.y - 32,
            (enemy.width + 36) *
            Math.max(
                0,
                enemy.health / enemy.maxHealth
            ),
            10
        );
        ctx.fillStyle = "#fff";
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            enemy.name,
            x + enemy.width / 2,
            enemy.y - 40
        );
        ctx.textAlign = "left";
    }
}
// ============================================================
// HUD
// ============================================================
function drawHUD() {
    ctx.fillStyle =
        "rgba(0,0,0,0.65)";
    ctx.fillRect(
        18,
        HEIGHT - 62,
        285,
        45
    );
    // Health background
    ctx.fillStyle = "#222";
    ctx.fillRect(
        30,
        HEIGHT - 48,
        170,
        16
    );
    // Health
    ctx.fillStyle = "#e34646";
    ctx.fillRect(
        30,
        HEIGHT - 48,
        170 *
        (player.health / player.maxHealth),
        16
    );
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(
        30,
        HEIGHT - 48,
        170,
        16
    );
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.fillText(
        `HP ${Math.ceil(player.health)} / ${player.maxHealth}`,
        38,
        HEIGHT - 35
    );
    ctx.fillStyle = "#ffd447";
    ctx.fillText(
        `Coins: ${coins}`,
        215,
        HEIGHT - 35
    );
    // Minimap
    const mapWidth = 300;
    const mapHeight = 20;
    const mapX =
        WIDTH - mapWidth - 20;
    const mapY = 20;
    ctx.fillStyle =
        "rgba(0,0,0,0.65)";
    ctx.fillRect(
        mapX - 5,
        mapY - 5,
        mapWidth + 10,
        mapHeight + 10
    );
    ctx.fillStyle =
        "rgba(255,255,255,0.25)";
    ctx.fillRect(
        mapX,
        mapY,
        mapWidth,
        mapHeight
    );
    // Player position
    ctx.fillStyle = "#ffd447";
    ctx.fillRect(
        mapX +
        (player.x / WORLD_WIDTH) *
        mapWidth -
        2,
        mapY - 2,
        5,
        mapHeight + 4
    );
}
// ============================================================
// INVENTORY SCREEN
// ============================================================
function drawInventory() {
    ctx.fillStyle =
        "rgba(7,9,15,0.97)";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    ctx.fillStyle = "#fff";
    ctx.font =
        "bold 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "INVENTORY",
        WIDTH / 2,
        70
    );
    ctx.font = "16px Arial";
    ctx.fillStyle = "#adb6c4";
    ctx.fillText(
        "1–9 equip • Backspace discard • I close inventory",
        WIDTH / 2,
        105
    );
    const slotWidth = 150;
    const slotHeight = 105;
    const gap = 12;
    const startX = 175;
    const startY = 155;
    for (let i = 0; i < 12; i++) {
        const column = i % 4;
        const row = Math.floor(i / 4);
        const x =
            startX +
            column *
            (slotWidth + gap);
        const y =
            startY +
            row *
            (slotHeight + gap);
        ctx.fillStyle =
            i === selectedItem
                ? "#39445a"
                : "#202633";
        ctx.fillRect(
            x,
            y,
            slotWidth,
            slotHeight
        );
        ctx.strokeStyle =
            i === selectedItem
                ? "#ffd447"
                : "#4b5566";
        ctx.lineWidth =
            i === selectedItem
                ? 3
                : 1;
        ctx.strokeRect(
            x,
            y,
            slotWidth,
            slotHeight
        );
        ctx.fillStyle = "#8993a3";
        ctx.font = "13px Arial";
        ctx.textAlign = "left";
        ctx.fillText(
            `${i + 1}`,
            x + 8,
            y + 18
        );
        const itemName =
            inventory[i];
        if (!itemName) {
            ctx.fillStyle = "#555";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                "Empty",
                x + slotWidth / 2,
                y + 58
            );
            continue;
        }
        const item =
            items[itemName];
        ctx.fillStyle =
            item.color;
        ctx.fillRect(
            x + 61,
            y + 25,
            28,
            28
        );
        ctx.fillStyle = "#fff";
        ctx.font =
            "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            itemName,
            x + slotWidth / 2,
            y + 75
        );
        if (
            itemName === equipped.weapon ||
            itemName === equipped.armor ||
            itemName === equipped.boots
        ) {
            ctx.fillStyle = "#7ee787";
            ctx.font =
                "11px Arial";
            ctx.fillText(
                "EQUIPPED",
                x + slotWidth / 2,
                y + 94
            );
        }
    }
    ctx.textAlign = "left";
}
// ============================================================
// END SCREENS
// ============================================================
function drawEndScreen(title, subtitle) {
    ctx.fillStyle =
        "rgba(5,7,12,0.86)";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font =
        "bold 58px Arial";
    ctx.fillText(
        title,
        WIDTH / 2,
        245
    );
    ctx.font = "22px Arial";
    ctx.fillStyle = "#d2d8e0";
    ctx.fillText(
        subtitle,
        WIDTH / 2,
        295
    );
    ctx.font = "18px Arial";
    ctx.fillStyle = "#ffd447";
    ctx.fillText(
        "Press R to restart",
        WIDTH / 2,
        350
    );
    ctx.textAlign = "left";
}
// ============================================================
// MESSAGE
// ============================================================
function drawMessage() {
    if (messageTimer <= 0) {
        return;
    }
    const width =
        Math.min(
            600,
            message.length * 9 + 60
        );
    ctx.fillStyle =
        "rgba(0,0,0,0.75)";
    ctx.fillRect(
        WIDTH / 2 - width / 2,
        75,
        width,
        42
    );
    ctx.fillStyle = "#fff";
    ctx.font =
        "bold 17px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        message,
        WIDTH / 2,
        102
    );
    ctx.textAlign = "left";
}
// ============================================================
// MAIN DRAW
// ============================================================
function draw() {
    drawBackground();
    drawDecorations();
    drawGround();
    drawCoins();
    for (const enemy of enemies) {
        if (enemy.alive) {
            drawEnemy(enemy);
        }
    }
    drawPlayer();
    drawHUD();
    drawMessage();
    if (gameState === "inventory") {
        drawInventory();
    } else if (gameState === "dead") {
        drawEndScreen(
            "YOU DIED",
            "The kingdom still needs its knight."
        );
    } else if (gameState === "victory") {
        drawEndScreen(
            "VICTORY!",
            "The Shadow King has been defeated."
        );
    }
}
// ============================================================
// RESTART
// ============================================================
function restartGame() {
    player.x = 300;
    player.y =
        GROUND_Y - player.height;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    player.health = 120;
    player.maxHealth = 120;
    player.attackTimer = 0;
    player.attackCooldown = 0;
    player.hurtTimer = 0;
    player.invincibleTimer = 0;
    coins = 0;
    cameraX = 0;
    gameState = "playing";
    inventory = [
        "Iron Sword",
        "Knight Armor",
        "Traveler Boots"
    ];
    equipped.weapon = "Iron Sword";
    equipped.armor = "Knight Armor";
    equipped.boots = "Traveler Boots";
    selectedItem = 0;
    updatePlayerStats();
    createEnemies();
    createCoins();
}
// ============================================================
// START GAME
// ============================================================
restartGame();
// ============================================================
// GAME LOOP
// ============================================================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
