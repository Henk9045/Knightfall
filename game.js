// ============================================================
// KNIGHT'S QUEST
// 5 Levels + RPG Inventory + Animated Enemies + Bosses
// ============================================================
//
// CONTROLS
// A/D or Arrow Keys = Move
// W / Up / Space    = Jump
// J / K             = Attack
// I                 = Inventory
// 1-9               = Equip inventory item
// Enter / N         = Next level
// ============================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const gravity = 0.7;
const groundY = 610;
const keys = {};
window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;
    if (
        [" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
    ) {
        e.preventDefault();
    }
    if (key === "i" && !e.repeat) {
        inventoryOpen = !inventoryOpen;
    }
    if (inventoryOpen && /^[1-9]$/.test(key)) {
        equipInventoryItem(Number(key) - 1);
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
// ============================================================
// GAME STATE
// ============================================================
let level = 1;
let score = 0;
let coins = 0;
let gameOver = false;
let victory = false;
let levelComplete = false;
let inventoryOpen = false;
let levelMessageTimer = 120;
let gearMessage = "";
let gearMessageTimer = 0;
// ============================================================
// PLAYER
// ============================================================
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
// ============================================================
// EQUIPMENT
// ============================================================
const equipment = {
    weapon: {
        type: "weapon",
        name: "Iron Sword",
        damage: 20,
        icon: "⚔",
        rarity: "Common"
    },
    armor: {
        type: "armor",
        name: "Knight Armor",
        hp: 0,
        icon: "🛡",
        rarity: "Common"
    },
    boots: {
        type: "boots",
        name: "Traveler Boots",
        speed: 0,
        jump: 0,
        icon: "👢",
        rarity: "Common"
    }
};
const inventory = [];
const MAX_INVENTORY = 12;
// ============================================================
// GEAR
// ============================================================
const gearPool = [
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
// Put starting gear into inventory.
inventory.push({ ...equipment.weapon });
inventory.push({ ...equipment.armor });
inventory.push({ ...equipment.boots });
// ============================================================
// LEVEL DATA
// ============================================================
const levelData = [
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
                speed: 1.5,
                type: "soldier"
            },
            {
                x: 680,
                y: 545,
                width: 45,
                height: 65,
                health: 45,
                speed: 1.6,
                type: "soldier"
            },
            {
                x: 900,
                y: 445,
                width: 45,
                height: 65,
                health: 55,
                speed: 1.4,
                type: "archer"
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
                speed: 1.8,
                type: "soldier"
            },
            {
                x: 500,
                y: 545,
                width: 45,
                height: 65,
                health: 65,
                speed: 1.9,
                type: "knight"
            },
            {
                x: 760,
                y: 545,
                width: 45,
                height: 65,
                health: 70,
                speed: 2,
                type: "soldier"
            },
            {
                x: 980,
                y: 545,
                width: 45,
                height: 65,
                health: 75,
                speed: 1.9,
                type: "knight"
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
                speed: 2,
                type: "knight"
            },
            {
                x: 480,
                y: 545,
                width: 45,
                height: 65,
                health: 80,
                speed: 2.1,
                type: "knight"
            },
            {
                x: 700,
                y: 545,
                width: 45,
                height: 65,
                health: 85,
                speed: 2,
                type: "soldier"
            },
            {
                x: 930,
                y: 545,
                width: 45,
                height: 65,
                health: 90,
                speed: 2.2,
                type: "knight"
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
            height: 80,
            health: 180,
            speed: 1.3,
            name: "RUIN GUARDIAN",
            type: "guardian"
        }
    },
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
                speed: 2.1,
                type: "knight"
            },
            {
                x: 470,
                y: 545,
                width: 45,
                height: 65,
                health: 95,
                speed: 2.2,
                type: "knight"
            },
            {
                x: 700,
                y: 545,
                width: 45,
                height: 65,
                health: 100,
                speed: 2.1,
                type: "soldier"
            },
            {
                x: 920,
                y: 545,
                width: 45,
                height: 65,
                health: 105,
                speed: 2.3,
                type: "knight"
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
            width: 75,
            height: 85,
            health: 250,
            speed: 1.5,
            name: "ICE WARLORD",
            type: "warlord"
        }
    },
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
                speed: 2.3,
                type: "knight"
            },
            {
                x: 460,
                y: 545,
                width: 45,
                height: 65,
                health: 115,
                speed: 2.4,
                type: "knight"
            },
            {
                x: 650,
                y: 545,
                width: 45,
                height: 65,
                health: 120,
                speed: 2.3,
                type: "knight"
            },
            {
                x: 850,
                y: 545,
                width: 45,
                height: 65,
                health: 130,
                speed: 2.5,
                type: "knight"
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
            y: 235,
            width: 90,
            height: 95,
            health: 400,
            speed: 1.8,
            name: "SHADOW KING",
            type: "king"
        }
    }
];
// ============================================================
// COLLISION
// ============================================================
function rectangleCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
// ============================================================
// STATS
// ============================================================
function recalculateStats() {
    const oldMax = player.maxHealth;
    player.maxHealth =
        100 + (equipment.armor.hp || 0);
    player.speed =
        5 + (equipment.boots.speed || 0);
    player.jumpPower =
        14 + (equipment.boots.jump || 0);
    // Give the player the extra HP when putting
    // on stronger armor.
    if (player.maxHealth > oldMax) {
        player.health +=
            player.maxHealth - oldMax;
    }
    player.health =
        Math.min(
            player.health,
            player.maxHealth
        );
}
// ============================================================
// INVENTORY
// ============================================================
function addToInventory(item) {
    if (
        inventory.length >=
        MAX_INVENTORY
    ) {
        showGearMessage(
            "INVENTORY FULL!"
        );
        return false;
    }
    inventory.push({
        ...item
    });
    score += 50;
    showGearMessage(
        `Found ${item.name}! Press I`
    );
    return true;
}
function equipInventoryItem(index) {
    if (
        index < 0 ||
        index >= inventory.length
    ) {
        return;
    }
    const item =
        inventory[index];
    equipment[item.type] = {
        ...item
    };
    recalculateStats();
    showGearMessage(
        `Equipped ${item.name}!`
    );
}
// ============================================================
// LEVEL SETUP
// ============================================================
function setupLevel() {
    const data =
        levelData[level - 1];
    platforms =
        data.platforms.map(p => ({
            ...p
        }));
    enemies =
        data.enemies.map(e => ({
            ...e,
            maxHealth: e.health,
            alive: true,
            vx: e.speed,
            vy: 0,
            direction: Math.random() > 0.5 ? 1 : -1,
            patrolMin:
                Math.max(
                    0,
                    e.x - 130
                ),
            patrolMax:
                Math.min(
                    WIDTH - e.width,
                    e.x + 130
                ),
            attackCooldown:
                20 + Math.random() * 30,
            attackTimer: 0,
            attackWindup: 0,
            attackActive: false,
            hitTimer: 0,
            flashTimer: 0,
            stepTimer: 0
        }));
    coinsList =
        data.coins.map(c => ({
            ...c,
            collected: false
        }));
    gearDrops =
        data.gear.map(g => ({
            x: g.x,
            y: g.y,
            item: {
                ...gearPool[g.index]
            },
            collected: false,
            bob: Math.random() * 6
        }));
    boss =
        data.boss
            ? {
                ...data.boss,
                maxHealth:
                    data.boss.health,
                alive: true,
                hitTimer: 0,
                flashTimer: 0,
                attackTimer: 0,
                attackWindup: 0,
                attackActive: false,
                direction: -1
            }
            : null;
    player.x = 60;
    player.y = 450;
    player.vx = 0;
    player.vy = 0;
    player.health =
        player.maxHealth;
    player.invincibleTimer = 60;
    levelComplete = false;
    levelMessageTimer = 150;
}
// ============================================================
// MESSAGE
// ============================================================
function showGearMessage(text) {
    gearMessage = text;
    gearMessageTimer = 180;
}
// ============================================================
// PLAYER DAMAGE
// ============================================================
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
    player.invincibleTimer = 50;
    if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
    }
}
// ============================================================
// PLAYER UPDATE
// ============================================================
function updatePlayer() {
    player.vx = 0;
    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        player.vx =
            -player.speed;
        player.facing = -1;
    }
    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        player.vx =
            player.speed;
        player.facing = 1;
    }
    if (
        (
            keys["w"] ||
            keys["arrowup"] ||
            keys[" "]
        ) &&
        player.onGround
    ) {
        player.vy =
            -player.jumpPower;
        player.onGround = false;
    }
    if (
        (
            keys["j"] ||
            keys["k"]
        ) &&
        player.attackCooldown <= 0
    ) {
        player.attacking = true;
        player.attackTimer = 15;
        player.attackCooldown = 28;
    }
    player.x += player.vx;
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;
    if (
        player.y +
            player.height >=
        groundY
    ) {
        player.y =
            groundY -
            player.height;
        player.vy = 0;
        player.onGround = true;
    }
    for (
        const platform of platforms
    ) {
        if (
            player.x +
                player.width >
                platform.x &&
            player.x <
                platform.x +
                    platform.width &&
            player.y +
                player.height <=
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
    player.x =
        Math.max(
            0,
            Math.min(
                WIDTH - player.width,
                player.x
            )
        );
    if (player.attackCooldown > 0)
        player.attackCooldown--;
    if (player.attackTimer > 0) {
        player.attackTimer--;
    } else {
        player.attacking = false;
    }
    if (player.invincibleTimer > 0)
        player.invincibleTimer--;
}
// ============================================================
// PLAYER ATTACK
// ============================================================
function getAttackBox() {
    return {
        x:
            player.facing === 1
                ? player.x + player.width
                : player.x - 65,
        y: player.y + 10,
        width: 65,
        height: 50
    };
}
function playerAttack() {
    if (!player.attacking)
        return;
    const attackBox =
        getAttackBox();
    const damage =
        equipment.weapon.damage;
    for (
        const enemy of enemies
    ) {
        if (
            enemy.alive &&
            rectangleCollision(
                attackBox,
                enemy
            ) &&
            enemy.hitTimer <= 0
        ) {
            enemy.health -= damage;
            enemy.hitTimer = 15;
            enemy.flashTimer = 8;
            enemy.x +=
                player.facing * 12;
            if (enemy.health <= 0) {
                enemy.health = 0;
                enemy.alive = false;
                score += 100;
                coins++;
                if (
                    Math.random() < 0.3
                ) {
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
                        y:
                            enemy.y,
                        item: {
                            ...item
                        },
                        collected: false,
                        bob: 0
                    });
                }
            }
        }
    }
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
        boss.hitTimer = 15;
        boss.flashTimer = 8;
        boss.x +=
            player.facing * 10;
        if (boss.health <= 0) {
            boss.health = 0;
            boss.alive = false;
            score += 1000;
            if (
                level <
                levelData.length
            ) {
                const item =
                    gearPool[
                        Math.min(
                            gearPool.length - 1,
                            level + 1
                        )
                    ];
                gearDrops.push({
                    x:
                        boss.x +
                        boss.width / 2,
                    y:
                        boss.y,
                    item: {
                        ...item
                    },
                    collected: false,
                    bob: 0
                });
            }
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
// ============================================================
// ENEMY ATTACK
// ============================================================
function startEnemyAttack(enemy) {
    if (
        enemy.attackCooldown > 0 ||
        enemy.attackWindup > 0
    ) {
        return;
    }
    enemy.attackWindup = 16;
    enemy.attackActive = false;
    enemy.vx = 0;
}
function updateEnemyAttack(enemy) {
    if (
        enemy.attackCooldown > 0
    ) {
        enemy.attackCooldown--;
    }
    // Wind-up
    if (
        enemy.attackWindup > 0
    ) {
        enemy.attackWindup--;
        if (
            enemy.attackWindup === 5
        ) {
            enemy.attackActive = true;
        }
        if (
            enemy.attackWindup === 0
        ) {
            enemy.attackActive = false;
            enemy.attackCooldown =
                35 +
                Math.random() * 20;
        }
        return;
    }
    // Actual hit
    if (enemy.attackActive) {
        const rangeBox = {
            x:
                enemy.direction === 1
                    ? enemy.x + enemy.width
                    : enemy.x - 55,
            y:
                enemy.y + 12,
            width: 55,
            height: 48
        };
        if (
            rectangleCollision(
                player,
                rangeBox
            )
        ) {
            damagePlayer(
                9 + level * 2
            );
        }
        enemy.attackActive = false;
    }
}
// ============================================================
// ENEMY AI
// ============================================================
function updateEnemies() {
    for (
        const enemy of enemies
    ) {
        if (!enemy.alive)
            continue;
        if (enemy.hitTimer > 0)
            enemy.hitTimer--;
        if (enemy.flashTimer > 0)
            enemy.flashTimer--;
        updateEnemyAttack(enemy);
        if (
            enemy.attackWindup > 0
        ) {
            continue;
        }
        const distance =
            player.x -
            enemy.x;
        const absoluteDistance =
            Math.abs(distance);
        const verticalDistance =
            Math.abs(
                player.y -
                enemy.y
            );
        // Attack much more aggressively.
        if (
            absoluteDistance < 90 &&
            verticalDistance < 80 &&
            enemy.attackCooldown <= 0
        ) {
            enemy.direction =
                distance >= 0 ? 1 : -1;
            startEnemyAttack(enemy);
            continue;
        }
        // Chase
        if (
            absoluteDistance < 330 &&
            verticalDistance < 150
        ) {
            enemy.direction =
                distance >= 0 ? 1 : -1;
            enemy.vx =
                enemy.direction *
                enemy.speed;
        } else {
            // Patrol
            if (
                enemy.x <=
                enemy.patrolMin
            ) {
                enemy.direction = 1;
            }
            if (
                enemy.x >=
                enemy.patrolMax
            ) {
                enemy.direction = -1;
            }
            enemy.vx =
                enemy.direction *
                enemy.speed;
        }
        enemy.x += enemy.vx;
        enemy.x =
            Math.max(
                enemy.patrolMin,
                Math.min(
                    enemy.patrolMax,
                    enemy.x
                )
            );
        enemy.vy += gravity;
        enemy.y += enemy.vy;
        let floor = groundY;
        for (
            const platform of platforms
        ) {
            const center =
                enemy.x +
                enemy.width / 2;
            if (
                center > platform.x &&
                center <
                    platform.x +
                    platform.width &&
                platform.y < floor
            ) {
                floor =
                    platform.y;
            }
        }
        if (
            enemy.y +
                enemy.height >=
            floor
        ) {
            enemy.y =
                floor -
                enemy.height;
            enemy.vy = 0;
        }
    }
}
// ============================================================
// BOSS AI
// ============================================================
function updateBoss() {
    if (
        !boss ||
        !boss.alive
    ) {
        return;
    }
    if (boss.hitTimer > 0)
        boss.hitTimer--;
    if (boss.flashTimer > 0)
        boss.flashTimer--;
    // Boss attack wind-up
    if (
        boss.attackWindup > 0
    ) {
        boss.attackWindup--;
        if (
            boss.attackWindup === 7
        ) {
            boss.attackActive = true;
        }
        if (
            boss.attackWindup === 0
        ) {
            boss.attackActive = false;
            boss.attackTimer = 0;
        }
    } else {
        const distance =
            player.x - boss.x;
        boss.direction =
            distance >= 0 ? 1 : -1;
        const close =
            Math.abs(distance) < 150;
        if (
            close &&
            boss.attackTimer > 45
        ) {
            boss.attackWindup = 22;
        } else {
            boss.x +=
                boss.direction *
                boss.speed;
        }
    }
    if (
        boss.attackActive
    ) {
        const attackBox = {
            x:
                boss.direction === 1
                    ? boss.x + boss.width
                    : boss.x - 90,
            y:
                boss.y + 10,
            width: 90,
            height: 65
        };
        if (
            rectangleCollision(
                player,
                attackBox
            )
        ) {
            damagePlayer(
                18 + level * 4
            );
        }
        boss.attackActive = false;
        boss.attackTimer = 0;
    } else {
        boss.attackTimer++;
    }
    boss.x =
        Math.max(
            820,
            Math.min(
                WIDTH - boss.width,
                boss.x
            )
        );
}
// ============================================================
// COINS
// ============================================================
function updateCoins() {
    for (
        const coin of coinsList
    ) {
        if (coin.collected)
            continue;
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
// ============================================================
// GEAR
// ============================================================
function updateGear() {
    for (
        const drop of gearDrops
    ) {
        if (drop.collected)
            continue;
        const box = {
            x: drop.x - 18,
            y: drop.y - 22,
            width: 36,
            height: 44
        };
        if (
            rectangleCollision(
                player,
                box
            )
        ) {
            if (
                addToInventory(
                    drop.item
                )
            ) {
                drop.collected = true;
            }
        }
        drop.bob += 0.06;
    }
}
// ============================================================
// LEVEL EXIT
// ============================================================
function allEnemiesDefeated() {
    return enemies.every(
        enemy => !enemy.alive
    );
}
function checkLevelExit() {
    if (
        !boss &&
        allEnemiesDefeated() &&
        player.x >
            WIDTH - 100
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
// ============================================================
// UPDATE
// ============================================================
function update() {
    if (
        gameOver ||
        victory
    ) {
        return;
    }
    if (inventoryOpen)
        return;
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
    if (
        gearMessageTimer > 0
    ) {
        gearMessageTimer--;
    }
    if (
        levelMessageTimer > 0
    ) {
        levelMessageTimer--;
    }
}
// ============================================================
// BACKGROUND
// ============================================================
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
    ctx.fillStyle =
        "#263d29";
    ctx.fillRect(
        0,
        groundY,
        WIDTH,
        110
    );
    ctx.fillStyle =
        "#3c5b37";
    ctx.fillRect(
        0,
        groundY,
        WIDTH,
        15
    );
}
// ============================================================
// PLATFORMS
// ============================================================
function drawPlatforms() {
    for (
        const platform of platforms
    ) {
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
// ============================================================
// PLAYER DRAWING
// ============================================================
function drawPlayer() {
    if (
        player.invincibleTimer > 0 &&
        Math.floor(
            player.invincibleTimer / 5
        ) % 2 === 0
    ) {
        return;
    }
    // Cape
    ctx.fillStyle =
        "#8b1e2d";
    ctx.fillRect(
        player.x + 5,
        player.y + 25,
        17,
        38
    );
    // Body armor
    ctx.fillStyle =
        "#9da4ad";
    ctx.fillRect(
        player.x + 9,
        player.y + 25,
        30,
        35
    );
    // Armor highlights
    ctx.fillStyle =
        "#d7dbe0";
    ctx.fillRect(
        player.x + 12,
        player.y + 29,
        5,
        26
    );
    // Helmet
    ctx.fillStyle =
        "#c4cad0";
    ctx.fillRect(
        player.x + 6,
        player.y + 5,
        36,
        28
    );
    // Helmet top
    ctx.fillRect(
        player.x + 12,
        player.y,
        23,
        7
    );
    // Visor
    ctx.fillStyle =
        "#222";
    const visorX =
        player.facing === 1
            ? player.x + 25
            : player.x + 4;
    ctx.fillRect(
        visorX,
        player.y + 15,
        17,
        8
    );
    // Legs
    ctx.fillStyle =
        "#555";
    ctx.fillRect(
        player.x + 9,
        player.y + 58,
        11,
        12
    );
    ctx.fillRect(
        player.x + 27,
        player.y + 58,
        11,
        12
    );
    // Sword
    if (player.attacking) {
        const progress =
            1 -
            player.attackTimer / 15;
        const angle =
            player.facing === 1
                ? -1.1 + progress * 2
                : 1.1 - progress * 2;
        const centerX =
            player.x +
            player.width / 2;
        const centerY =
            player.y + 38;
        ctx.save();
        ctx.translate(
            centerX,
            centerY
        );
        ctx.rotate(angle);
        ctx.fillStyle =
            "#d6b45c";
        ctx.fillRect(
            10,
            -4,
            12,
            8
        );
        ctx.fillStyle =
            "#eeeeee";
        ctx.fillRect(
            18,
            -4,
            48,
            8
        );
        ctx.restore();
    }
}
// ============================================================
// ENEMY DRAWING
// ============================================================
function drawEnemy(enemy) {
    if (!enemy.alive)
        return;
    ctx.save();
    // Hit flash
    if (
        enemy.flashTimer > 0
    ) {
        ctx.globalAlpha = 0.5;
    }
    const x = enemy.x;
    const y = enemy.y;
    // Shadow
    ctx.fillStyle =
        "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(
        x + enemy.width / 2,
        y + enemy.height,
        27,
        7,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();
    // Cape
    ctx.fillStyle =
        enemy.type === "knight"
            ? "#241c3d"
            : "#632c2c";
    ctx.fillRect(
        x + 4,
        y + 28,
        16,
        35
    );
    // Body armor
    ctx.fillStyle =
        enemy.type === "knight"
            ? "#56616b"
            : "#7b4941";
    ctx.fillRect(
        x + 8,
        y + 25,
        30,
        38
    );
    // Chest armor detail
    ctx.fillStyle =
        "#9da4ad";
    ctx.fillRect(
        x + 12,
        y + 30,
        22,
        5
    );
    ctx.fillRect(
        x + 19,
        y + 28,
        5,
        31
    );
    // Helmet
    ctx.fillStyle =
        enemy.type === "knight"
            ? "#8d969e"
            : "#7d5448";
    ctx.fillRect(
        x + 5,
        y + 5,
        35,
        28
    );
    // Helmet crest
    if (
        enemy.type === "knight"
    ) {
        ctx.fillStyle =
            "#b12d3c";
        ctx.fillRect(
            x + 17,
            y - 3,
            11,
            8
        );
    }
    // Visor
    ctx.fillStyle =
        "#171717";
    ctx.fillRect(
        x + 7,
        y + 15,
        32,
        9
    );
    // Glowing eyes
    ctx.fillStyle =
        "#ff4040";
    ctx.fillRect(
        x + 12,
        y + 17,
        5,
        4
    );
    ctx.fillRect(
        x + 29,
        y + 17,
        5,
        4
    );
    // Legs
    ctx.fillStyle =
        "#343a40";
    ctx.fillRect(
        x + 9,
        y + 60,
        10,
        5
    );
    ctx.fillRect(
        x + 27,
        y + 60,
        10,
        5
    );
    // Enemy weapon
    drawEnemyWeapon(enemy);
    // Attack animation
    if (
        enemy.attackWindup > 0
    ) {
        drawEnemyAttackAnimation(
            enemy
        );
    }
    ctx.restore();
    // Health bar
    drawHealthBar(
        x,
        y - 15,
        enemy.width,
        enemy.health,
        enemy.maxHealth
    );
}
// ============================================================
// ENEMY WEAPON
// ============================================================
function drawEnemyWeapon(enemy) {
    const attacking =
        enemy.attackWindup > 0;
    if (attacking)
        return;
    const weaponX =
        enemy.direction === 1
            ? enemy.x + 35
            : enemy.x - 5;
    ctx.fillStyle =
        "#6b4528";
    ctx.fillRect(
        weaponX,
        enemy.y + 35,
        5,
        30
    );
    ctx.fillStyle =
        "#d5d5d5";
    ctx.fillRect(
        weaponX - 4,
        enemy.y + 22,
        13,
        25
    );
}
// ============================================================
// ENEMY ATTACK ANIMATION
// ============================================================
function drawEnemyAttackAnimation(enemy) {
    const progress =
        1 -
        enemy.attackWindup / 16;
    let angle;
    if (
        enemy.direction === 1
    ) {
        angle =
            -1.8 +
            progress * 3;
    } else {
        angle =
            1.8 -
            progress * 3;
    }
    const centerX =
        enemy.x +
        enemy.width / 2;
    const centerY =
        enemy.y + 38;
    ctx.save();
    ctx.translate(
        centerX,
        centerY
    );
    ctx.rotate(angle);
    // Handle
    ctx.fillStyle =
        "#6b4528";
    ctx.fillRect(
        5,
        -4,
        25,
        8
    );
    // Blade
    ctx.fillStyle =
        "#e6e6e6";
    ctx.fillRect(
        25,
        -5,
        48,
        10
    );
    // Blade highlight
    ctx.fillStyle =
        "#ffffff";
    ctx.fillRect(
        30,
        -4,
        38,
        3
    );
    ctx.restore();
    // Attack arc
    if (
        enemy.attackWindup < 8
    ) {
        ctx.strokeStyle =
            "rgba(255,220,120,0.7)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        const start =
            enemy.direction === 1
                ? -1.3
                : Math.PI - 0.3;
        const end =
            enemy.direction === 1
                ? 0.4
                : Math.PI + 0.9;
        ctx.arc(
            enemy.x +
                enemy.width / 2,
            enemy.y + 38,
            58,
            start,
            end
        );
        ctx.stroke();
        ctx.lineWidth = 1;
    }
}
// ============================================================
// BOSS DRAWING
// ============================================================
function drawBoss() {
    if (
        !boss ||
        !boss.alive
    ) {
        return;
    }
    ctx.save();
    if (
        boss.flashTimer > 0
    ) {
        ctx.globalAlpha = 0.5;
    }
    const x = boss.x;
    const y = boss.y;
    // Huge shadow
    ctx.fillStyle =
        "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(
        x + boss.width / 2,
        y + boss.height,
        boss.width / 2,
        10,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();
    // Cape
    ctx.fillStyle =
        boss.type === "king"
            ? "#21082e"
            : boss.type === "warlord"
                ? "#16425b"
                : "#35233f";
    ctx.fillRect(
        x - 8,
        y + 28,
        boss.width + 16,
        boss.height - 25
    );
    // Armor
    ctx.fillStyle =
        boss.type === "king"
            ? "#302a3b"
            : "#6d747c";
    ctx.fillRect(
        x + 5,
        y + 25,
        boss.width - 10,
        boss.height - 25
    );
    // Shoulder armor
    ctx.fillStyle =
        "#9aa2aa";
    ctx.fillRect(
        x - 5,
        y + 30,
        18,
        25
    );
    ctx.fillRect(
        x +
            boss.width -
            13,
        y + 30,
        18,
        25
    );
    // Helmet
    ctx.fillStyle =
        boss.type === "king"
            ? "#4c4057"
            : "#858d94";
    ctx.fillRect(
        x + 4,
        y + 3,
        boss.width - 8,
        32
    );
    // Crown for Shadow King
    if (
        boss.type === "king"
    ) {
        ctx.fillStyle =
            "#d6b45c";
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 8);
        ctx.lineTo(x + 18, y - 12);
        ctx.lineTo(x + 28, y + 5);
        ctx.lineTo(x + 40, y - 15);
        ctx.lineTo(x + 50, y + 5);
        ctx.lineTo(x + 65, y - 10);
        ctx.lineTo(x + 68, y + 14);
        ctx.lineTo(x + 10, y + 14);
        ctx.closePath();
        ctx.fill();
    }
    // Visor
    ctx.fillStyle =
        "#090909";
    ctx.fillRect(
        x + 7,
        y + 16,
        boss.width - 14,
        11
    );
    // Boss eyes
    ctx.fillStyle =
        "#ff2222";
    ctx.fillRect(
        x + 16,
        y + 18,
        8,
        5
    );
    ctx.fillRect(
        x +
            boss.width -
            24,
        y + 18,
        8,
        5
    );
    // Huge weapon
    if (
        boss.attackWindup === 0
    ) {
        ctx.fillStyle =
            "#5c3b28";
        ctx.fillRect(
            boss.direction === 1
                ? x + boss.width - 5
                : x - 5,
            y + 35,
            7,
            55
        );
        ctx.fillStyle =
            "#d8d8d8";
        ctx.fillRect(
            boss.direction === 1
                ? x + boss.width
                : x - 55,
            y + 20,
            55,
            12
        );
    }
    // Boss attack animation
    if (
        boss.attackWindup > 0
    ) {
        const progress =
            1 -
            boss.attackWindup / 22;
        const angle =
            boss.direction === 1
                ? -2 +
                  progress * 3.2
                : 2 -
                  progress * 3.2;
        ctx.save();
        ctx.translate(
            x + boss.width / 2,
            y + 45
        );
        ctx.rotate(angle);
        ctx.fillStyle =
            "#5c3b28";
        ctx.fillRect(
            0,
            -5,
            35,
            10
        );
        ctx.fillStyle =
            "#e5e5e5";
        ctx.fillRect(
            30,
            -8,
            80,
            16
        );
        ctx.restore();
        ctx.strokeStyle =
            "rgba(255,80,80,0.8)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(
            x + boss.width / 2,
            y + 45,
            95,
            boss.direction === 1
                ? -1.4
                : 1.7,
            boss.direction === 1
                ? 0.4
                : 3.0
        );
        ctx.stroke();
        ctx.lineWidth = 1;
    }
    ctx.restore();
    drawHealthBar(
        x - 20,
        y - 30,
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
        x - 20,
        y - 42
    );
}
// ============================================================
// COIN DRAWING
// ============================================================
function drawCoin(coin) {
    if (coin.collected)
        return;
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
// ============================================================
// GEAR DRAWING
// ============================================================
function drawGear(drop) {
    if (drop.collected)
        return;
    const bob =
        Math.sin(drop.bob) * 5;
    const item =
        drop.item;
    if (
        item.rarity === "Epic"
    ) {
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
    ctx.beginPath();
    ctx.arc(
        drop.x,
        drop.y + bob,
        19,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle =
        "#fff";
    ctx.stroke();
    ctx.fillStyle =
        "#111";
    ctx.font =
        "18px Arial";
    ctx.textAlign =
        "center";
    ctx.fillText(
        item.icon,
        drop.x,
        drop.y + bob + 6
    );
    ctx.textAlign =
        "left";
}
// ============================================================
// HEALTH BAR
// ============================================================
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
    ctx.strokeStyle =
        "#000";
    ctx.strokeRect(
        x,
        y,
        width,
        8
    );
}
// ============================================================
// HUD
// ============================================================
function drawUI() {
    // HP bar
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
            (
                player.health /
                player.maxHealth
            ),
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
    // Equipped gear
    ctx.fillStyle =
        "rgba(0,0,0,0.65)";
    ctx.fillRect(
        WIDTH - 335,
        15,
        315,
        125
    );
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "16px Arial";
    ctx.fillText(
        "EQUIPPED",
        WIDTH - 315,
        38
    );
    ctx.font =
        "14px Arial";
    ctx.fillText(
        `⚔ ${equipment.weapon.name} (${equipment.weapon.damage} dmg)`,
        WIDTH - 315,
        63
    );
    ctx.fillText(
        `🛡 ${equipment.armor.name} (+${equipment.armor.hp} HP)`,
        WIDTH - 315,
        87
    );
    ctx.fillText(
        `👢 ${equipment.boots.name} (+${equipment.boots.speed} speed)`,
        WIDTH - 315,
        111
    );
    // Level title
    if (
        levelMessageTimer > 0
    ) {
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
    if (
        gearMessageTimer > 0
    ) {
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
    ctx.fillStyle =
        "#ddd";
    ctx.font =
        "15px Arial";
    ctx.fillText(
        "A/D Move   W/Space Jump   J Attack   I Inventory",
        370,
        695
    );
}
// ============================================================
// INVENTORY
// ============================================================
function drawInventory() {
    if (!inventoryOpen)
        return;
    ctx.fillStyle =
        "rgba(0,0,0,0.9)";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    ctx.fillStyle =
        "#27232d";
    ctx.fillRect(
        150,
        70,
        WIDTH - 300,
        550
    );
    ctx.strokeStyle =
        "#d6b45c";
    ctx.lineWidth = 3;
    ctx.strokeRect(
        150,
        70,
        WIDTH - 300,
        550
    );
    ctx.lineWidth = 1;
    ctx.fillStyle =
        "#fff";
    ctx.textAlign =
        "center";
    ctx.font =
        "38px Arial";
    ctx.fillText(
        "INVENTORY",
        WIDTH / 2,
        115
    );
    ctx.font =
        "17px Arial";
    ctx.fillText(
        `${inventory.length}/${MAX_INVENTORY} slots`,
        WIDTH / 2,
        143
    );
    // Inventory slots
    const startX = 205;
    const startY = 175;
    const size = 82;
    const gap = 13;
    for (
        let i = 0;
        i < MAX_INVENTORY;
        i++
    ) {
        const col =
            i % 6;
        const row =
            Math.floor(i / 6);
        const x =
            startX +
            col *
                (size + gap);
        const y =
            startY +
            row *
                (size + gap);
        ctx.fillStyle =
            "#17151b";
        ctx.fillRect(
            x,
            y,
            size,
            size
        );
        ctx.strokeStyle =
            "#777";
        ctx.strokeRect(
            x,
            y,
            size,
            size
        );
        ctx.fillStyle =
            "#aaa";
        ctx.font =
            "13px Arial";
        ctx.textAlign =
            "left";
        ctx.fillText(
            i + 1,
            x + 6,
            y + 16
        );
        if (
            inventory[i]
        ) {
            const item =
                inventory[i];
            if (
                item.rarity === "Epic"
            ) {
                ctx.strokeStyle =
                    "#c86cff";
            } else if (
                item.rarity === "Rare"
            ) {
                ctx.strokeStyle =
                    "#55aaff";
            } else {
                ctx.strokeStyle =
                    "#ddd";
            }
            ctx.lineWidth = 2;
            ctx.strokeRect(
                x + 2,
                y + 2,
                size - 4,
                size - 4
            );
            ctx.lineWidth = 1;
            ctx.textAlign =
                "center";
            ctx.font =
                "27px Arial";
            ctx.fillStyle =
                "#fff";
            ctx.fillText(
                item.icon,
                x + size / 2,
                y + 40
            );
            ctx.font =
                "10px Arial";
            ctx.fillText(
                item.name,
                x + size / 2,
                y + 58
            );
            let stat = "";
            if (
                item.type === "weapon"
            ) {
                stat =
                    `${item.damage} damage`;
            } else if (
                item.type === "armor"
            ) {
                stat =
                    `+${item.hp} HP`;
            } else {
                stat =
                    `+${item.speed} speed`;
            }
            ctx.fillText(
                stat,
                x + size / 2,
                y + 73
            );
        }
    }
    ctx.textAlign =
        "left";
    ctx.fillStyle =
        "#fff";
    ctx.font =
        "17px Arial";
    ctx.fillText(
        "EQUIPPED",
        205,
        485
    );
    ctx.font =
        "14px Arial";
    ctx.fillText(
        `⚔ ${equipment.weapon.name}`,
        205,
        510
    );
    ctx.fillText(
        `🛡 ${equipment.armor.name}`,
        500,
        510
    );
    ctx.fillText(
        `👢 ${equipment.boots.name}`,
        795,
        510
    );
    ctx.textAlign =
        "center";
    ctx.fillStyle =
        "#aaa";
    ctx.font =
        "17px Arial";
    ctx.fillText(
        "Press I to close • Press 1-9 to equip",
        WIDTH / 2,
        575
    );
    ctx.textAlign =
        "left";
}
// ============================================================
// LEVEL COMPLETE
// ============================================================
function drawLevelComplete() {
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
        "55px Arial";
    ctx.fillText(
        "LEVEL COMPLETE!",
        WIDTH / 2,
        HEIGHT / 2 - 60
    );
    if (
        level <
        levelData.length
    ) {
        ctx.fillStyle =
            "#fff";
        ctx.font =
            "25px Arial";
        ctx.fillText(
            `Next: ${levelData[level].name}`,
            WIDTH / 2,
            HEIGHT / 2
        );
        ctx.font =
            "20px Arial";
        ctx.fillText(
            "Press ENTER or N",
            WIDTH / 2,
            HEIGHT / 2 + 50
        );
    }
    ctx.textAlign =
        "left";
}
// ============================================================
// GAME OVER
// ============================================================
function drawGameOver() {
    ctx.fillStyle =
        "rgba(0,0,0,0.82)";
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
// ============================================================
// VICTORY
// ============================================================
function drawVictory() {
    ctx.fillStyle =
        "rgba(0,0,0,0.85)";
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
        `Score: ${score}   Coins: ${coins}`,
        WIDTH / 2,
        HEIGHT / 2 + 30
    );
    ctx.fillText(
        "You conquered all 5 levels!",
        WIDTH / 2,
        HEIGHT / 2 + 70
    );
    ctx.font =
        "20px Arial";
    ctx.fillText(
        "Refresh the page to play again",
        WIDTH / 2,
        HEIGHT / 2 + 110
    );
    ctx.textAlign =
        "left";
}
// ============================================================
// DRAW
// ============================================================
function draw() {
    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );
    drawBackground();
    drawPlatforms();
    for (
        const coin of coinsList
    ) {
        drawCoin(coin);
    }
    for (
        const drop of gearDrops
    ) {
        drawGear(drop);
    }
    for (
        const enemy of enemies
    ) {
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
    drawInventory();
}
// ============================================================
// GAME LOOP
// ============================================================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(
        gameLoop
    );
}
// ============================================================
// START
// ============================================================
recalculateStats();
setupLevel();
gameLoop();
