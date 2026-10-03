// ============================================================
// RISE OF CIVILIZATION
// GitHub Pages version
// ============================================================


// ============================================================
// GAME DATA
// ============================================================

const game = {

    turn: 1,
    year: 1000,

    food: 100,
    gold: 100,
    science: 0,
    production: 40,

    selected: null,
    selectedType: null,

    cities: [],
    enemyCities: [],

    units: [],
    enemyUnits: [],

    technologies: {

        sailing: false,
        navigation: false,
        shipbuilding: false,

        feudalism: false,
        knighthood: false,

        steel: false,
        siege: false,

        cartography: false

    }

};


// ============================================================
// THREE.JS SETUP
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x081b2b);

scene.fog =
    new THREE.Fog(
        0x081b2b,
        65,
        150
    );


const camera =
    new THREE.PerspectiveCamera(
        50,
        window.innerWidth /
        window.innerHeight,
        0.1,
        500
    );


camera.position.set(
    0,
    55,
    50
);


const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.shadowMap.enabled = true;


document
    .getElementById("game")
    .appendChild(renderer.domElement);


// ============================================================
// LIGHT
// ============================================================

const sunlight =
    new THREE.DirectionalLight(
        0xffe5bd,
        2.5
    );


sunlight.position.set(
    -30,
    70,
    30
);


sunlight.castShadow = true;

scene.add(sunlight);


const ambient =
    new THREE.HemisphereLight(
        0x8fc7ed,
        0x34452b,
        2
    );


scene.add(ambient);


// ============================================================
// MATERIAL HELPER
// ============================================================

function mat(color) {

    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9
    });

}


// ============================================================
// WATER
// ============================================================

const water =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            180,
            150
        ),

        mat(0x0b4b68)

    );


water.rotation.x =
    -Math.PI / 2;

water.position.y =
    -0.6;

scene.add(water);


// ============================================================
// MAP
// ============================================================

const TILE = 2.2;

const MAP_WIDTH = 38;

const MAP_HEIGHT = 30;

const tiles = [];


function land(x, z) {

    // Western continent

    const west =
        (
            ((x + 28) / 24) *
            ((x + 28) / 24)
        ) +

        (
            ((z + 7) / 22) *
            ((z + 7) / 22)
        ) < 1;


    // Eastern continent

    const east =
        (
            ((x - 25) / 27) *
            ((x - 25) / 27)
        ) +

        (
            ((z + 5) / 23) *
            ((z + 5) / 23)
        ) < 1;


    // Southern continent

    const south =
        (
            ((x - 1) / 30) *
            ((x - 1) / 30)
        ) +

        (
            ((z - 24) / 12) *
            ((z - 24) / 12)
        ) < 1;


    // Island

    const island =
        (
            ((x + 39) / 7) *
            ((x + 39) / 7)
        ) +

        (
            ((z - 22) / 6) *
            ((z - 22) / 6)
        ) < 1;


    return (
        west ||
        east ||
        south ||
        island
    );

}


// ============================================================
// CREATE MAP
// ============================================================

for (
    let z = -MAP_HEIGHT;
    z <= MAP_HEIGHT;
    z++
) {

    for (
        let x = -MAP_WIDTH;
        x <= MAP_WIDTH;
        x++
    ) {

        const wx =
            x * TILE;

        const wz =
            z * TILE;


        if (
            !land(wx, wz)
        ) {

            continue;

        }


        const h =
            0.5 +
            Math.random() * 0.45;


        const tile =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    TILE * 1.04,
                    h,
                    TILE * 1.04
                ),

                mat(0x71964d)

            );


        tile.position.set(
            wx,
            h / 2 - 0.35,
            wz
        );


        tile.castShadow = true;

        tile.receiveShadow = true;


        tile.userData = {

            type: "tile",

            x: wx,
            z: wz

        };


        scene.add(tile);

        tiles.push(tile);


        // Trees

        if (
            Math.random() < 0.055
        ) {

            const tree =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        0.4,
                        1.3,
                        6
                    ),

                    mat(0x285c32)

                );


            tree.position.set(

                wx +
                (Math.random() - 0.5),

                h + 0.45,

                wz +
                (Math.random() - 0.5)

            );


            tree.castShadow = true;

            scene.add(tree);

        }


        // Mountains

        if (
            Math.random() < 0.015
        ) {

            const mountain =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        1.1,
                        3,
                        6
                    ),

                    mat(0x777b77)

                );


            mountain.position.set(
                wx,
                h + 1.2,
                wz
            );


            mountain.castShadow = true;

            scene.add(mountain);

        }

    }

}


// ============================================================
// FIND NEAREST TILE
// ============================================================

function nearestTile(x, z) {

    let best = null;

    let bestDistance =
        Infinity;


    for (
        let i = 0;
        i < tiles.length;
        i++
    ) {

        const t =
            tiles[i];


        const d =
            Math.hypot(
                t.position.x - x,
                t.position.z - z
            );


        if (
            d < bestDistance
        ) {

            bestDistance = d;

            best = t;

        }

    }


    return best;

}


// ============================================================
// CITY
// ============================================================

function createCity(
    x,
    z,
    name,
    enemy = false
) {

    const tile =
        nearestTile(x, z);


    if (!tile) {
        return null;
    }


    const group =
        new THREE.Group();


    group.position.set(

        tile.position.x,

        tile.position.y + 0.5,

        tile.position.z

    );


    // City base

    const base =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                1.35,
                1.55,
                0.8,
                8
            ),

            mat(
                enemy
                    ? 0xa84242
                    : 0x326bc2
            )

        );


    base.castShadow = true;

    group.add(base);


    // Castle

    const castle =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                0.75,
                2.1,
                6
            ),

            mat(0xd8c99f)

        );


    castle.position.y =
        1.3;


    castle.castShadow = true;

    group.add(castle);


    // Towers

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const angle =
            i *
            Math.PI /
            2;


        const tower =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.2,
                    0.25,
                    1.4,
                    6
                ),

                mat(0xe2d3a9)

            );


        tower.position.set(

            Math.cos(angle) *
            0.95,

            0.75,

            Math.sin(angle) *
            0.95

        );


        tower.castShadow = true;

        group.add(tower);

    }


    scene.add(group);


    const city = {

        name: name,

        x: tile.position.x,

        z: tile.position.z,

        population: 5,

        level: 1,

        hp: 100,

        enemy: enemy,

        group: group

    };


    group.userData = {

        type: "city",

        city: city

    };


    if (enemy) {

        game.enemyCities.push(city);

    } else {

        game.cities.push(city);

    }


    return city;

}


// ============================================================
// CITIES
// ============================================================

createCity(
    -28,
    -8,
    "Dawnkeep"
);


createCity(
    -18,
    3,
    "Westport"
);


createCity(
    -34,
    4,
    "Stonehaven",
    true
);


createCity(
    25,
    -14,
    "Stormgate",
    true
);


createCity(
    38,
    -5,
    "Dragonhelm",
    true
);


createCity(
    17,
    1,
    "Sunhaven",
    true
);


createCity(
    8,
    22,
    "Kingsfall",
    true
);


createCity(
    -9,
    25,
    "Ironridge",
    true
);


// ============================================================
// UNITS
// ============================================================

function createUnit(
    x,
    z,
    type,
    enemy = false,
    name = "Army"
) {

    const tile =
        nearestTile(x, z);


    if (!tile) {
        return null;
    }


    const group =
        new THREE.Group();


    group.position.set(

        tile.position.x,

        tile.position.y + 0.7,

        tile.position.z

    );


    let body;


    // Ship

    if (
        type === "ship"
    ) {

        body =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    1.7,
                    0.35,
                    0.7
                ),

                mat(
                    enemy
                        ? 0xa84242
                        : 0x326bc2
                )

            );


        group.add(body);


        const mast =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.06,
                    0.06,
                    1.5,
                    6
                ),

                mat(0x6c4725)

            );


        mast.position.y =
            0.8;


        group.add(mast);


        const sail =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    0.8,
                    0.9
                ),

                mat(0xe8dfc7)

            );


        sail.position.set(
            0,
            0.8,
            0
        );


        sail.rotation.y =
            Math.PI / 2;


        group.add(sail);

    }

    // Land unit

    else {

        body =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.42,
                    0.52,
                    0.9,
                    6
                ),

                mat(
                    enemy
                        ? 0xa84242
                        : 0x326bc2
                )

            );


        body.castShadow = true;

        group.add(body);


        const head =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.28,
                    8,
                    8
                ),

                mat(0xd8ad7a)

            );


        head.position.y =
            0.68;


        group.add(head);


        // Sword

        const sword =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.08,
                    0.8,
                    0.08
                ),

                mat(0xd5d5d5)

            );


        sword.position.set(
            0.45,
            0.25,
            0
        );


        sword.rotation.z =
            -0.4;


        group.add(sword);


        if (
            type === "knight"
        ) {

            const plume =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        0.15,
                        0.6,
                        5
                    ),

                    mat(0xe5e5e5)

                );


            plume.position.y =
                1.05;


            group.add(plume);

        }

    }


    scene.add(group);


    const unit = {

        name: name,

        type: type,

        x: tile.position.x,

        z: tile.position.z,

        hp: 100,

        movement: 1,

        enemy: enemy,

        group: group

    };


    group.userData = {

        type: "unit",

        unit: unit

    };


    if (enemy) {

        game.enemyUnits.push(unit);

    } else {

        game.units.push(unit);

    }


    return unit;

}


// Starting armies

createUnit(
    -25,
    -8,
    "army",
    false,
    "First Army"
);


createUnit(
    25,
    -14,
    "army",
    true,
    "Stormguard"
);


createUnit(
    38,
    -5,
    "army",
    true,
    "Dragon Host"
);


// ============================================================
// LOG
// ============================================================

function logMessage(message) {

    const log =
        document.getElementById(
            "logText"
        );


    log.innerHTML =
        message +
        "<hr>" +
        log.innerHTML;

}


// ============================================================
// SELECT OBJECT
// ============================================================

function selectObject(
    object,
    type
) {

    game.selected =
        object;

    game.selectedType =
        type;


    const box =
        document.getElementById(
            "selection"
        );


    if (
        type === "city"
    ) {

        box.innerHTML =

            "<b>🏰 " +
            object.name +
            "</b><br><br>" +

            "Population: " +
            object.population +
            "<br>" +

            "Level: " +
            object.level +
            "<br>" +

            "HP: " +
            object.hp +
            "/100";

    }


    if (
        type === "unit"
    ) {

        box.innerHTML =

            "<b>" +
            (
                object.type === "ship"
                    ? "⛵ "
                    : "⚔ "
            ) +

            object.name +
            "</b><br><br>" +

            "Type: " +
            object.type +
            "<br>" +

            "HP: " +
            object.hp +
            "<br>" +

            "Movement: " +
            object.movement;

    }

}


// ============================================================
// MOVE UNIT
// ============================================================

function moveUnit(
    unit,
    x,
    z
) {

    if (
        unit.movement <= 0
    ) {

        logMessage(
            "This unit has already moved this turn."
        );

        return;

    }


    const tile =
        nearestTile(x, z);


    if (!tile) {
        return;
    }


    const distance =
        Math.hypot(

            tile.position.x -
            unit.x,

            tile.position.z -
            unit.z

        );


    const range =
        unit.type === "ship"
            ? (
                game.technologies.navigation
                    ? 10
                    : 6
            )
            : 7;


    if (
        distance > range
    ) {

        logMessage(
            "That destination is too far away."
        );

        return;

    }


    unit.x =
        tile.position.x;

    unit.z =
        tile.position.z;


    unit.group.position.set(

        unit.x,

        tile.position.y + 0.7,

        unit.z

    );


    unit.movement =
        0;


    // Check for enemy city

    if (
        unit.type !== "ship"
    ) {

        for (
            let i = 0;
            i < game.enemyCities.length;
            i++
        ) {

            const city =
                game.enemyCities[i];


            const d =
                Math.hypot(
                    city.x - unit.x,
                    city.z - unit.z
                );


            if (
                d < 2.8
            ) {

                attackCity(
                    unit,
                    city
                );

                break;

            }

        }

    }


    selectObject(
        unit,
        "unit"
    );

}


// ============================================================
// ATTACK CITY
// ============================================================

function attackCity(
    unit,
    city
) {

    let damage = 40;


    if (
        unit.type === "knight"
    ) {

        damage = 65;

    }


    if (
        game.technologies.steel
    ) {

        damage += 20;

    }


    if (
        game.technologies.siege
    ) {

        damage += 30;

    }


    city.hp -=
        damage;


    logMessage(

        "⚔ " +
        unit.name +
        " attacked " +
        city.name +
        " for " +
        damage +
        " damage."

    );


    if (
        city.hp <= 0
    ) {

        captureCity(city);

    }

}


// ============================================================
// CAPTURE CITY
// ============================================================

function captureCity(city) {

    const index =
        game.enemyCities.indexOf(
            city
        );


    if (
        index !== -1
    ) {

        game.enemyCities.splice(
            index,
            1
        );

    }


    city.enemy =
        false;

    city.hp =
        100;


    game.cities.push(city);


    // Change city color

    city.group.children[0]
        .material =
        mat(0x326bc2);


    logMessage(

        "👑 <b>" +
        city.name +
        " has been conquered!</b>"

    );


    if (
        game.enemyCities.length === 0
    ) {

        logMessage(

            "🏆 <b>VICTORY!</b><br>" +
            "Your civilization controls the entire map."

        );

    }

}


// ============================================================
// BUILD ARMY
// ============================================================

function buildArmy() {

    if (
        game.production < 25
    ) {

        logMessage(
            "You need 25 production."
        );

        return;

    }


    const city =
        game.selectedType === "city"
            ? game.selected
            : game.cities[0];


    game.production -=
        25;


    const army =
        createUnit(

            city.x,
            city.z,

            "army",

            false,

            "New Army"

        );


    selectObject(
        army,
        "unit"
    );


    logMessage(
        "⚔ A new army has been created."
    );


    updateUI();

}


// ============================================================
// BUILD SHIP
// ============================================================

function buildShip() {

    if (
        !game.technologies.sailing
    ) {

        logMessage(
            "Research Sailing first."
        );

        return;

    }


    if (
        game.production < 35
    ) {

        logMessage(
            "You need 35 production."
        );

        return;

    }


    const city =
        game.selectedType === "city"
            ? game.selected
            : game.cities[0];


    game.production -=
        35;


    const ship =
        createUnit(

            city.x,
            city.z,

            "ship",

            false,

            "Dawn Fleet"

        );


    selectObject(
        ship,
        "unit"
    );


    logMessage(
        "⛵ A new ship has been built."
    );


    updateUI();

}


// ============================================================
// BUILD KNIGHT
// ============================================================

function buildKnight() {

    if (
        !game.technologies.knighthood
    ) {

        logMessage(
            "Research Knighthood first."
        );

        return;

    }


    if (
        game.production < 50
    ) {

        logMessage(
            "You need 50 production."
        );

        return;

    }


    const city =
        game.selectedType === "city"
            ? game.selected
            : game.cities[0];


    game.production -=
        50;


    const knight =
        createUnit(

            city.x,
            city.z,

            "knight",

            false,

            "Royal Knights"

        );


    selectObject(
        knight,
        "unit"
    );


    logMessage(
        "♞ Your Royal Knights have arrived!"
    );


    updateUI();

}


// ============================================================
// FOUND CITY
// ============================================================

function foundCity() {

    if (
        game.selectedType !==
        "unit"
    ) {

        logMessage(
            "Select an army first."
        );

        return;

    }


    if (
        game.selected.type ===
        "ship"
    ) {

        logMessage(
            "Ships cannot found cities."
        );

        return;

    }


    createCity(

        game.selected.x,

        game.selected.z,

        "New Settlement",

        false

    );


    logMessage(
        "🏛 A new settlement has been founded."
    );

}


// ============================================================
// FORTIFY
// ============================================================

function fortify() {

    if (
        game.selectedType !==
        "unit"
    ) {

        return;

    }


    game.selected.movement =
        0;


    game.selected.hp =
        Math.min(
            120,
            game.selected.hp + 20
        );


    logMessage(
        "🛡 Unit fortified."
    );

}


// ============================================================
// TECHNOLOGY TREE
// ============================================================

const techs = [

    {
        id: "sailing",
        name: "Sailing",
        cost: 20,
        description:
            "Unlocks ships."
    },

    {
        id: "navigation",
        name: "Navigation",
        cost: 35,
        requires: "sailing",
        description:
            "Ships can travel farther."
    },

    {
        id: "shipbuilding",
        name: "Shipbuilding",
        cost: 55,
        requires: "navigation",
        description:
            "Improves your navy."
    },

    {
        id: "cartography",
        name: "Cartography",
        cost: 65,
        requires: "navigation",
        description:
            "Improves exploration."
    },

    {
        id: "feudalism",
        name: "Feudalism",
        cost: 30,
        description:
            "Begins the path to Knights."
    },

    {
        id: "knighthood",
        name: "Knighthood",
        cost: 60,
        requires: "feudalism",
        description:
            "Unlocks powerful Knights."
    },

    {
        id: "steel",
        name: "Steel",
        cost: 70,
        description:
            "Makes armies stronger."
    },

    {
        id: "siege",
        name: "Siege Engineering",
        cost: 80,
        requires: "steel",
        description:
            "Makes city attacks stronger."
    }

];


function renderTechTree() {

    const grid =
        document.getElementById(
            "techGrid"
        );


    grid.innerHTML = "";


    for (
        let i = 0;
        i < techs.length;
        i++
    ) {

        const tech =
            techs[i];


        const researched =
            game.technologies[
                tech.id
            ];


        const unlocked =
            !tech.requires ||
            game.technologies[
                tech.requires
            ];


        const box =
            document.createElement(
                "div"
            );


        box.className =
            "tech";


        if (researched) {

            box.className +=
                " done";

        }

        else if (unlocked) {

            box.className +=
                " available";

        }


        box.innerHTML =

            "<div class='techName'>" +
            tech.name +
            "</div>" +

            "<br>" +

            "🔬 Cost: " +
            tech.cost +

            "<br><br>" +

            "<small>" +
            tech.description +
            "</small>" +

            "<br><br>" +

            (
                researched
                    ? "✓ RESEARCHED"
                    : unlocked
                        ? "Click to research"
                        : "🔒 Requires " +
                          tech.requires
            );


        if (
            unlocked &&
            !researched
        ) {

            box.onclick =
                function() {

                    researchTech(
                        tech
                    );

                };

        }


        grid.appendChild(box);

    }

}


// ============================================================
// RESEARCH
// ============================================================

function researchTech(tech) {

    if (
        game.science <
        tech.cost
    ) {

        logMessage(
            "You need more science."
        );

        return;

    }


    game.science -=
        tech.cost;


    game.technologies[
        tech.id
    ] = true;


    logMessage(

        "🔬 Technology researched: " +
        tech.name

    );


    renderTechTree();

    updateUI();

}


// ============================================================
// END TURN
// ============================================================

function endTurn() {

    game.turn++;

    game.year += 25;


    // City income

    for (
        let i = 0;
        i < game.cities.length;
        i++
    ) {

        const city =
            game.cities[i];


        game.food +=
            city.population * 4;


        game.gold +=
            city.level * 4;


        game.science +=
            city.level * 3;


        game.production +=
            city.level * 4;

    }


    // Reset movement

    for (
        let i = 0;
        i < game.units.length;
        i++
    ) {

        game.units[i].movement =
            1;

    }


    logMessage(

        "📜 Turn " +
        game.turn +
        " — " +
        game.year +
        " AD"

    );


    updateUI();

}


// ============================================================
// UPDATE UI
// ============================================================

function updateUI() {

    document.getElementById(
        "food"
    ).textContent =
        Math.floor(game.food);


    document.getElementById(
        "gold"
    ).textContent =
        Math.floor(game.gold);


    document.getElementById(
        "science"
    ).textContent =
        Math.floor(game.science);


    document.getElementById(
        "production"
    ).textContent =
        Math.floor(game.production);


    document.getElementById(
        "turn"
    ).textContent =
        game.turn;


    document.getElementById(
        "year"
    ).textContent =
        game.year +
        " AD";

}


// ============================================================
// MAP CLICKING
// ============================================================

const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();


let mouseDownX = 0;

let mouseDownY = 0;


renderer.domElement.addEventListener(
    "pointerdown",
    function(event) {

        mouseDownX =
            event.clientX;

        mouseDownY =
            event.clientY;

    }
);


renderer.domElement.addEventListener(
    "pointerup",
    function(event) {

        const moved =
            Math.hypot(

                event.clientX -
                mouseDownX,

                event.clientY -
                mouseDownY

            );


        if (
            moved > 8
        ) {

            return;

        }


        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const hits =
            raycaster.intersectObjects(
                scene.children,
                true
            );


        if (
            hits.length === 0
        ) {

            return;

        }


        let object =
            hits[0].object;


        while (
            object &&
            !object.userData.type
        ) {

            object =
                object.parent;

        }


        if (!object) {
            return;
        }


        // City

        if (
            object.userData.type ===
            "city"
        ) {

            const city =
                object.userData.city;


            if (!city.enemy) {

                selectObject(
                    city,
                    "city"
                );

            }
            else {

                logMessage(
                    "⚔ Enemy city: " +
                    city.name +
                    ". Attack it with an army."
                );

            }


            return;

        }


        // Unit

        if (
            object.userData.type ===
            "unit"
        ) {

            const unit =
                object.userData.unit;


            if (!unit.enemy) {

                selectObject(
                    unit,
                    "unit"
                );

            }

            return;

        }


        // Tile

        if (
            object.userData.type ===
            "tile"
        ) {

            if (
                game.selectedType ===
                "unit"
            ) {

                moveUnit(

                    game.selected,

                    object.userData.x,

                    object.userData.z

                );

            }

        }

    }
);


// ============================================================
// BUTTONS
// ============================================================

document.getElementById(
    "endTurn"
).onclick =
    endTurn;


document.getElementById(
    "armyButton"
).onclick =
    buildArmy;


document.getElementById(
    "shipButton"
).onclick =
    buildShip;


document.getElementById(
    "knightButton"
).onclick =
    buildKnight;


document.getElementById(
    "cityButton"
).onclick =
    foundCity;


document.getElementById(
    "fortifyButton"
).onclick =
    fortify;


document.getElementById(
    "techButton"
).onclick =
    function() {

        document.getElementById(
            "techWindow"
        ).style.display =
            "flex";

        renderTechTree();

    };


document.getElementById(
    "closeTech"
).onclick =
    function() {

        document.getElementById(
            "techWindow"
        ).style.display =
            "none";

    };


// ============================================================
// CAMERA
// ============================================================

let cameraAngle = 0;

let cameraDistance = 75;

let cameraHeight = 55;

let dragging = false;

let lastX = 0;


renderer.domElement.addEventListener(
    "pointerdown",
    function(event) {

        dragging = true;

        lastX =
            event.clientX;

    }
);


window.addEventListener(
    "pointerup",
    function() {

        dragging = false;

    }
);


window.addEventListener(
    "pointermove",
    function(event) {

        if (!dragging) {
            return;
        }


        const movement =
            event.clientX -
            lastX;


        lastX =
            event.clientX;


        cameraAngle +=
            movement * 0.008;

    }
);


renderer.domElement.addEventListener(
    "wheel",
    function(event) {

        cameraDistance +=
            event.deltaY * 0.05;


        cameraDistance =
            Math.max(
                25,
                Math.min(
                    110,
                    cameraDistance
                )
            );

    }
);


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    function() {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ============================================================
// GAME LOOP
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    camera.position.x =
        Math.sin(cameraAngle) *
        cameraDistance;


    camera.position.z =
        Math.cos(cameraAngle) *
        cameraDistance;


    camera.position.y =
        cameraHeight;


    camera.lookAt(
        0,
        0,
        0
    );


    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// START
// ============================================================

updateUI();

renderTechTree();

animate();
