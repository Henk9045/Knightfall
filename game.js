import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { OrbitControls } from
"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";


// ============================================================
// RISE OF CIVILIZATION
// ============================================================

// -----------------------------
// GAME STATE
// -----------------------------

const game = {

    turn: 1,
    year: 1000,

    food: 120,
    gold: 100,
    science: 0,
    production: 0,

    selected: null,
    selectedType: null,

    technologies: {
        sailing: false,
        navigation: false,
        shipbuilding: false,

        feudalism: false,
        knighthood: false,

        steel: false,
        siege: false,

        cartography: false
    },

    cities: [],
    enemyCities: [],

    units: [],
    enemyUnits: [],

    tiles: []
};


// ============================================================
// COLORS
// ============================================================

const PLAYER_COLOR = 0x3f78d2;

const ENEMY_COLORS = [
    0xb84c4c,
    0x4c9b59,
    0x9a5ec7,
    0xd49c34
];


// ============================================================
// THREE.JS SETUP
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x071b2b);

scene.fog = new THREE.Fog(
    0x071b2b,
    80,
    180
);


const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(
    0,
    55,
    55
);


const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

document
    .getElementById("game")
    .appendChild(renderer.domElement);


// ============================================================
// CAMERA CONTROLS
// ============================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.target.set(0, 0, 0);

controls.enablePan = true;

controls.minDistance = 20;

controls.maxDistance = 110;

controls.maxPolarAngle =
    Math.PI / 2.05;


// ============================================================
// LIGHTING
// ============================================================

const sunlight =
    new THREE.DirectionalLight(
        0xffe7bd,
        3
    );

sunlight.position.set(
    -30,
    60,
    20
);

sunlight.castShadow = true;

scene.add(sunlight);


const ambient =
    new THREE.HemisphereLight(
        0x9dc5e8,
        0x26351c,
        2
    );

scene.add(ambient);


// ============================================================
// MATERIAL HELPER
// ============================================================

function material(color) {

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
            140
        ),

        material(0x0b4662)

    );

water.rotation.x =
    -Math.PI / 2;

water.position.y = -0.5;

scene.add(water);


// ============================================================
// MAP
// ============================================================

const TILE_SIZE = 2.2;

const MAP_WIDTH = 42;

const MAP_HEIGHT = 31;


// This creates the continent layout.
// It is intentionally shaped similarly
// to the map you drew.

function isLand(x, z) {

    function ellipse(
        cx,
        cz,
        rx,
        rz
    ) {

        return (

            ((x - cx) / rx) ** 2 +

            ((z - cz) / rz) ** 2

        ) < 1;

    }


    // Western continent
    const west =
        ellipse(-25, -13, 22, 18) ||
        ellipse(-17, -1, 17, 13) ||
        ellipse(-31, 2, 11, 8);


    // Eastern continent
    const east =
        ellipse(25, -15, 25, 18) ||
        ellipse(18, -1, 17, 14) ||
        ellipse(34, 3, 11, 8);


    // Southern continent
    const south =
        ellipse(3, 21, 25, 12) ||
        ellipse(16, 17, 15, 9) ||
        ellipse(-12, 24, 10, 8);


    // Smaller island
    const island =
        ellipse(-37, 27, 7, 6);


    // Small islands
    const islands =
        ellipse(-3, -28, 4, 3) ||
        ellipse(10, -31, 3, 2) ||
        ellipse(38, 20, 4, 3) ||
        ellipse(-43, -10, 3, 2);


    return (
        west ||
        east ||
        south ||
        island ||
        islands
    );
}


// ============================================================
// CREATE TERRAIN
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

        const worldX =
            x * TILE_SIZE;

        const worldZ =
            z * TILE_SIZE;


        if (
            !isLand(
                worldX,
                worldZ
            )
        ) {

            continue;

        }


        const height =
            0.7 +
            Math.random() * 0.5;


        const tile =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    TILE_SIZE * 1.03,
                    height,
                    TILE_SIZE * 1.03
                ),

                material(
                    0x6f9b45
                )

            );


        tile.position.set(
            worldX,
            height / 2 - 0.35,
            worldZ
        );


        tile.castShadow = true;

        tile.receiveShadow = true;


        tile.userData = {

            type: "tile",

            x: worldX,

            z: worldZ

        };


        scene.add(tile);

        game.tiles.push(tile);


        // Trees

        if (
            Math.random() < 0.08
        ) {

            const tree =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        0.45,
                        1.2,
                        6
                    ),

                    material(
                        0x245b35
                    )

                );


            tree.position.set(
                worldX +
                (Math.random() - 0.5),

                height + 0.4,

                worldZ +
                (Math.random() - 0.5)
            );


            tree.castShadow = true;

            scene.add(tree);

        }


        // Mountains

        if (
            Math.random() < 0.025
        ) {

            const mountain =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        1.1,
                        2.8,
                        6
                    ),

                    material(
                        0x737b7b
                    )

                );


            mountain.position.set(
                worldX,
                height + 1,
                worldZ
            );


            mountain.castShadow = true;

            scene.add(mountain);

        }

    }

}


// ============================================================
// FIND CLOSEST TILE
// ============================================================

function nearestTile(
    x,
    z
) {

    let closest = null;

    let closestDistance =
        Infinity;


    for (
        const tile of game.tiles
    ) {

        const distance =
            Math.hypot(
                tile.position.x - x,
                tile.position.z - z
            );


        if (
            distance <
            closestDistance
        ) {

            closestDistance =
                distance;

            closest =
                tile;

        }

    }


    return closest;
}


// ============================================================
// CREATE CITY
// ============================================================

function createCity(
    x,
    z,
    name,
    enemy = false,
    enemyColor = 0
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
                1.2,
                1.4,
                1,
                8
            ),

            material(
                enemy
                    ? ENEMY_COLORS[enemyColor]
                    : PLAYER_COLOR
            )

        );


    base.castShadow = true;

    group.add(base);


    // Castle

    const castle =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                0.7,
                2,
                6
            ),

            material(
                0xd4c092
            )

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

        const tower =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.18,
                    0.22,
                    1.4,
                    6
                ),

                material(
                    0xe0d3aa
                )

            );


        const angle =
            i * Math.PI / 2;


        tower.position.set(
            Math.cos(angle) * 0.9,
            0.8,
            Math.sin(angle) * 0.9
        );


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
    -27,
    -12,
    "Ravenhold"
);

createCity(
    -13,
    -5,
    "Westport"
);

createCity(
    -29,
    2,
    "Stonehaven",
    true,
    0
);

createCity(
    24,
    -15,
    "Stormgate",
    true,
    1
);

createCity(
    38,
    -9,
    "Dragonhelm",
    true,
    2
);

createCity(
    17,
    0,
    "Sunhaven",
    true,
    3
);

createCity(
    1,
    20,
    "Kingsfall",
    true,
    0
);

createCity(
    15,
    24,
    "Ironridge",
    true,
    1
);

createCity(
    -11,
    23,
    "Greenwall",
    true,
    2
);

createCity(
    -37,
    27,
    "Seawatch",
    true,
    3
);


// ============================================================
// CREATE UNIT
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
        tile.position.y + 0.8,
        tile.position.z
    );


    let body;


    // Ship

    if (
        type === "ship"
    ) {

        body =
            new THREE.Mesh(

                new THREE.ConeGeometry(
                    0.7,
                    1.8,
                    4
                ),

                material(
                    enemy
                        ? 0xb84c4c
                        : PLAYER_COLOR
                )

            );


        body.rotation.x =
            Math.PI / 2;


        body.rotation.z =
            Math.PI / 4;

    }

    // Army

    else {

        body =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.4,
                    0.5,
                    0.9,
                    6
                ),

                material(
                    enemy
                        ? 0xb84c4c
                        : PLAYER_COLOR
                )

            );


        // Helmet

        const head =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.27,
                    8,
                    8
                ),

                material(
                    0xd4b07a
                )

            );


        head.position.y =
            0.65;


        group.add(head);


        // Knight plume

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

                    material(
                        0xd9d9d9
                    )

                );


            plume.position.y =
                1.05;


            group.add(plume);

        }

    }


    body.castShadow = true;

    group.add(body);

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


// ============================================================
// STARTING UNITS
// ============================================================

createUnit(
    -25,
    -12,
    "army",
    false,
    "First Army"
);


createUnit(
    -27,
    -12,
    "ship",
    false,
    "Dawn Fleet"
);


createUnit(
    24,
    -15,
    "army",
    true,
    "Stormguard"
);


createUnit(
    38,
    -9,
    "army",
    true,
    "Dragon Host"
);


// ============================================================
// TECHNOLOGY TREE
// ============================================================

const technologies = [

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
            "Ships move farther."
    },

    {
        id: "shipbuilding",
        name: "Shipbuilding",
        cost: 55,
        requires: "navigation",
        description:
            "Build powerful warships."
    },

    {
        id: "cartography",
        name: "Cartography",
        cost: 65,
        requires: "navigation",
        description:
            "Improve exploration."
    },

    {
        id: "feudalism",
        name: "Feudalism",
        cost: 30,
        description:
            "Unlocks the path to Knights."
    },

    {
        id: "knighthood",
        name: "Knighthood",
        cost: 60,
        requires: "feudalism",
        description:
            "Unlock Knights."
    },

    {
        id: "steel",
        name: "Steel",
        cost: 70,
        description:
            "Make armies stronger."
    },

    {
        id: "siege",
        name: "Siege Engineering",
        cost: 80,
        requires: "steel",
        description:
            "Unlock siege weapons."
    }

];


// ============================================================
// BUILD GAME UI
// ============================================================

const style = document.createElement(
    "style"
);

style.textContent = `

* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #071522;
    color: white;
    font-family: Georgia, serif;
}

button {
    background:
        linear-gradient(
            #28547c,
            #102c46
        );

    color: white;

    border:
        1px solid #b08a42;

    border-radius: 7px;

    padding: 9px 12px;

    cursor: pointer;

    font-family:
        Georgia, serif;
}

button:hover {
    filter: brightness(1.3);
}


/* TOP BAR */

#topbar {

    position: fixed;

    top: 0;
    left: 0;
    right: 0;

    height: 70px;

    background:
        linear-gradient(
            #111d2d,
            #07111c
        );

    border-bottom:
        2px solid #9a7430;

    display: flex;

    align-items: center;

    gap: 18px;

    padding: 8px 15px;

    z-index: 10;

}

.resource {

    padding:
        7px 12px;

    border-left:
        1px solid #3c4b59;

}

.resource b {

    color: #f3d16d;

}

.turn {

    margin-left: auto;

    text-align: center;

}

#endTurn {

    font-weight: bold;

    color: #f6dc8b;

    padding:
        12px 22px;

}


/* LEFT PANEL */

#panel {

    position: fixed;

    left: 12px;

    top: 85px;

    width: 250px;

    background:
        #091520ed;

    border:
        1px solid #87662f;

    border-radius: 10px;

    padding: 14px;

    z-index: 10;

}

#panel h2 {

    margin-top: 0;

    color: #f2d27b;

}

.actions {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 7px;

    margin-top: 12px;

}


/* BOTTOM */

#bottom {

    position: fixed;

    bottom: 15px;

    left: 50%;

    transform:
        translateX(-50%);

    width: 700px;

    max-width: 90vw;

    background:
        #091520ed;

    border:
        1px solid #87662f;

    border-radius: 12px;

    padding: 12px;

    z-index: 10;

    display: flex;

    gap: 8px;

    align-items: center;

}


/* TECHNOLOGY */

#technology {

    position: fixed;

    inset: 0;

    background:
        #000a;

    display: flex;

    align-items: center;

    justify-content: center;

    z-index: 50;

}

#techWindow {

    width:
        min(950px, 92vw);

    max-height:
        85vh;

    overflow: auto;

    background:
        linear-gradient(
            145deg,
            #101c2b,
            #08111b
        );

    border:
        2px solid #9b7737;

    border-radius: 12px;

    padding: 22px;

}

#techWindow h1 {

    color:
        #f1d37c;

}

.techGrid {

    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 10px;

}

.tech {

    background:
        #102031;

    border:
        1px solid #46586a;

    border-radius: 8px;

    padding: 12px;

    margin-bottom: 8px;

}

.tech.available {

    border-color:
        #4da4e5;

}

.tech.done {

    border-color:
        #d2aa4e;

    background:
        #193047;

}

.techName {

    font-weight: bold;

    color:
        #7fc4ff;

}

.techCost {

    font-size: 12px;

    color:
        #aebbc7;

    margin-top: 6px;

}


/* LOG */

#log {

    position: fixed;

    right: 12px;

    top: 85px;

    width: 240px;

    background:
        #091520e8;

    border:
        1px solid #6d552e;

    border-radius: 8px;

    padding: 10px;

    z-index: 10;

    font-size: 12px;

}


/* MOBILE */

@media(max-width:800px) {

    .resource:nth-of-type(n+4) {
        display: none;
    }

    #panel {
        width: 200px;
    }

    #log {
        display: none;
    }

    #bottom {
        width: 95vw;
    }

    .techGrid {
        grid-template-columns:
            1fr 1fr;
    }

}

`;

document.head.appendChild(style);


// ============================================================
// TOP BAR
// ============================================================

const topbar =
    document.createElement("div");

topbar.id = "topbar";

topbar.innerHTML = `

<div>
    🏰 <b>Kingdom of Dawn</b>
</div>

<div class="resource">
    🌾 <b id="food">120</b>
</div>

<div class="resource">
    🪙 <b id="gold">100</b>
</div>

<div class="resource">
    🧪 <b id="science">0</b>
</div>

<div class="resource">
    ⚒ <b id="production">0</b>
</div>

<div class="turn">
    Turn <b id="turn">1</b><br>
    <small id="year">1000 AD</small>
</div>

<button id="endTurn">
    END TURN
</button>

`;

document.body.appendChild(topbar);


// ============================================================
// LEFT PANEL
// ============================================================

const panel =
    document.createElement("div");

panel.id = "panel";

panel.innerHTML = `

<h2>Kingdom</h2>

<div id="selection">
    Click a city or unit.
</div>

<div class="actions">

<button id="army">
    ⚔ Army
</button>

<button id="ship">
    ⛵ Ship
</button>

<button id="knight">
    ♞ Knight
</button>

<button id="fortify">
    🛡 Fortify
</button>

<button id="found">
    🏛 Found City
</button>

<button id="tech">
    🔬 Tech
</button>

</div>

`;

document.body.appendChild(panel);


// ============================================================
// BOTTOM BAR
// ============================================================

const bottom =
    document.createElement("div");

bottom.id = "bottom";

bottom.innerHTML = `

<button id="technologyButton">
    🔬 Technology Tree
</button>

<button id="mapInfo">
    🗺 World Map
</button>

<div id="cityInfo">
    No city selected
</div>

`;

document.body.appendChild(bottom);


// ============================================================
// LOG
// ============================================================

const log =
    document.createElement("div");

log.id = "log";

log.innerHTML =
    "<b>Chronicle</b><br><br>" +
    "Your civilization begins.<br>";

document.body.appendChild(log);


function addLog(message) {

    log.innerHTML =
        "<b>Chronicle</b><br><br>" +
        message +
        "<hr>" +
        log.innerHTML
            .replace("<b>Chronicle</b><br><br>", "");

}


// ============================================================
// TECHNOLOGY WINDOW
// ============================================================

const technology =
    document.createElement("div");

technology.id = "technology";

technology.style.display =
    "none";


technology.innerHTML = `

<div id="techWindow">

<button id="closeTech">
    Close
</button>

<h1>
    Technology Tree
</h1>

<p>
Research technologies to advance your civilization.
</p>

<div
    id="techGrid"
    class="techGrid">
</div>

</div>

`;

document.body.appendChild(
    technology
);


// ============================================================
// RENDER TECHNOLOGY TREE
// ============================================================

function renderTechTree() {

    const grid =
        document.getElementById(
            "techGrid"
        );

    grid.innerHTML = "";


    for (
        const tech of technologies
    ) {

        const div =
            document.createElement(
                "div"
            );


        const researched =
            game.technologies[
                tech.id
            ];


        const requirementMet =
            !tech.requires ||
            game.technologies[
                tech.requires
            ];


        if (
            researched
        ) {

            div.className =
                "tech done";

        }

        else if (
            requirementMet
        ) {

            div.className =
                "tech available";

        }

        else {

            div.className =
                "tech";

        }


        div.innerHTML = `

            <div class="techName">
                ${tech.name}
            </div>

            <div class="techCost">
                🧪 ${tech.cost} Science
            </div>

            <div class="techCost">
                ${tech.description}
            </div>

            ${
                researched
                    ? "<br>✓ RESEARCHED"
                    : ""
            }

        `;


        if (
            !researched &&
            requirementMet
        ) {

            div.onclick = function() {

                researchTechnology(
                    tech
                );

            };

        }


        grid.appendChild(div);

    }

}


// ============================================================
// RESEARCH
// ============================================================

function researchTechnology(
    tech
) {

    if (
        game.science <
        tech.cost
    ) {

        addLog(
            "Not enough science."
        );

        return;

    }


    game.science -=
        tech.cost;


    game.technologies[
        tech.id
    ] = true;


    addLog(
        "Research completed: " +
        "<b>" +
        tech.name +
        "</b>"
    );


    updateUI();

    renderTechTree();

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


    const selection =
        document.getElementById(
            "selection"
        );


    if (
        type === "city"
    ) {

        selection.innerHTML = `

        <b>🏰 ${object.name}</b>

        <br><br>

        Population:
        ${object.population}

        <br>

        Level:
        ${object.level}

        <br>

        HP:
        ${object.hp}/100

        `;


        document.getElementById(
            "cityInfo"
        ).textContent =
            object.name +
            " • Population " +
            object.population;

    }


    if (
        type === "unit"
    ) {

        selection.innerHTML = `

        <b>
            ${
                object.type === "ship"
                    ? "⛵"
                    : "⚔"
            }
            ${object.name}
        </b>

        <br><br>

        Type:
        ${object.type}

        <br>

        HP:
        ${object.hp}

        <br>

        Movement:
        ${object.movement}

        `;

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

        addLog(
            "This unit has already moved this turn."
        );

        return;

    }


    const target =
        nearestTile(
            x,
            z
        );


    if (!target) {

        return;

    }


    const distance =
        Math.hypot(
            target.position.x -
            unit.x,

            target.position.z -
            unit.z
        );


    let movementRange =
        5;


    if (
        unit.type === "ship" &&
        game.technologies.navigation
    ) {

        movementRange =
            8;

    }


    if (
        distance >
        movementRange
    ) {

        addLog(
            "That unit cannot reach that tile."
        );

        return;

    }


    unit.x =
        target.position.x;

    unit.z =
        target.position.z;


    unit.group.position.set(

        unit.x,

        target.position.y +
        0.8,

        unit.z

    );


    unit.movement = 0;


    // Attack enemy city

    if (
        unit.type !== "ship"
    ) {

        const enemy =
            game.enemyCities.find(
                city =>
                    Math.hypot(
                        city.x -
                        unit.x,

                        city.z -
                        unit.z
                    ) < 2.5
            );


        if (enemy) {

            attackCity(
                unit,
                enemy
            );

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

        damage =
            65;

    }


    if (
        game.technologies.steel
    ) {

        damage += 20;

    }


    city.hp -=
        damage;


    addLog(

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

        captureCity(
            city
        );

    }

}


// ============================================================
// CAPTURE CITY
// ============================================================

function captureCity(
    city
) {

    const index =
        game.enemyCities.indexOf(
            city
        );


    if (
        index >= 0
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


    game.cities.push(
        city
    );


    // Change city color

    city.group.children[0]
        .material =
        material(
            PLAYER_COLOR
        );


    addLog(

        "🏰 <b>" +
        city.name +
        "</b> has been conquered!"

    );


    if (
        game.enemyCities.length === 0
    ) {

        addLog(
            "👑 <b>VICTORY!</b> You control the entire map."
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

        addLog(
            "You need 25 production."
        );

        return;

    }


    const city =
        game.selectedType === "city"
            ? game.selected
            : game.cities[0];


    if (!city) {

        return;

    }


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


    addLog(
        "⚔ A new army has been raised."
    );


    selectObject(
        army,
        "unit"
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

        addLog(
            "Research Sailing first."
        );

        return;

    }


    if (
        game.production < 35
    ) {

        addLog(
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

            "New Ship"

        );


    addLog(
        "⛵ A new ship has been built."
    );


    selectObject(
        ship,
        "unit"
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

        addLog(
            "Research Knighthood first."
        );

        return;

    }


    if (
        game.production < 50
    ) {

        addLog(
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


    addLog(
        "♞ The Royal Knights have been raised!"
    );


    selectObject(
        knight,
        "unit"
    );


    updateUI();

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


    addLog(
        "🛡 " +
        game.selected.name +
        " fortified."
    );

}


// ============================================================
// FOUND CITY
// ============================================================

function foundCity() {

    if (
        game.selectedType !==
        "unit"
    ) {

        addLog(
            "Select an army first."
        );

        return;

    }


    if (
        game.selected.type ===
        "ship"
    ) {

        return;

    }


    const newCity =
        createCity(

            game.selected.x,

            game.selected.z,

            "New Settlement",

            false

        );


    if (
        newCity
    ) {

        addLog(
            "🏛 A new city has been founded."
        );

    }

}


// ============================================================
// END TURN
// ============================================================

function endTurn() {

    game.turn++;

    game.year +=
        25;


    // Food

    for (
        const city of game.cities
    ) {

        game.food +=
            city.population * 4;

        game.gold +=
            city.level * 3;

        game.science +=
            city.level * 2;

        game.production +=
            city.level * 3;

    }


    // Reset movement

    for (
        const unit of game.units
    ) {

        unit.movement =
            1;

    }


    // Enemy turns

    enemyTurn();


    addLog(
        "Turn " +
        game.turn +
        " — " +
        game.year +
        " AD"
    );


    updateUI();

}


// ============================================================
// ENEMY TURN
// ============================================================

function enemyTurn() {

    for (
        const enemy of
        game.enemyUnits
    ) {

        if (
            game.cities.length === 0
        ) {

            return;

        }


        // Find nearest player city

        let target =
            game.cities[0];


        let shortest =
            Infinity;


        for (
            const city of game.cities
        ) {

            const d =
                Math.hypot(

                    enemy.x -
                    city.x,

                    enemy.z -
                    city.z

                );


            if (
                d < shortest
            ) {

                shortest =
                    d;

                target =
                    city;

            }

        }


        if (
            shortest < 12
        ) {

            const angle =
                Math.atan2(

                    target.z -
                    enemy.z,

                    target.x -
                    enemy.x

                );


            const destination =
                nearestTile(

                    enemy.x +
                    Math.cos(angle) * 4,

                    enemy.z +
                    Math.sin(angle) * 4

                );


            if (
                destination
            ) {

                enemy.x =
                    destination.position.x;

                enemy.z =
                    destination.position.z;


                enemy.group.position.set(

                    enemy.x,

                    destination.position.y +
                    0.8,

                    enemy.z

                );

            }


            if (
                Math.hypot(
                    enemy.x -
                    target.x,

                    enemy.z -
                    target.z
                ) < 3
            ) {

                target.hp -=
                    15;


                addLog(
                    "⚠ Enemy forces attacked " +
                    target.name
                );


                if (
                    target.hp <= 0
                ) {

                    target.hp =
                        100;

                    target.population =
                        Math.max(
                            1,
                            target.population - 1
                        );

                }

            }

        }

    }

}


// ============================================================
// UPDATE UI
// ============================================================

function updateUI() {

    document.getElementById(
        "food"
    ).textContent =
        Math.floor(
            game.food
        );


    document.getElementById(
        "gold"
    ).textContent =
        Math.floor(
            game.gold
        );


    document.getElementById(
        "science"
    ).textContent =
        Math.floor(
            game.science
        );


    document.getElementById(
        "production"
    ).textContent =
        Math.floor(
            game.production
        );


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
// MOUSE SELECTION
// ============================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


renderer.domElement.addEventListener(
    "pointerdown",
    function(event) {

        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (event.clientX -
                rect.left) /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (event.clientY -
                rect.top) /
                rect.height
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const objects =
            raycaster.intersectObjects(
                scene.children,
                true
            );


        if (
            objects.length === 0
        ) {

            return;

        }


        let object =
            objects[0].object;


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

            selectObject(

                object.userData.city,

                "city"

            );

            return;

        }


        // Unit

        if (
            object.userData.type ===
            "unit"
        ) {

            const unit =
                object.userData.unit;


            if (
                !unit.enemy
            ) {

                selectObject(
                    unit,
                    "unit"
                );

            }

            return;

        }


        // Tile movement

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
    "army"
).onclick =
    buildArmy;


document.getElementById(
    "ship"
).onclick =
    buildShip;


document.getElementById(
    "knight"
).onclick =
    buildKnight;


document.getElementById(
    "fortify"
).onclick =
    fortify;


document.getElementById(
    "found"
).onclick =
    foundCity;


document.getElementById(
    "tech"
).onclick =
    function() {

        technology.style.display =
            "flex";

        renderTechTree();

    };


document.getElementById(
    "technologyButton"
).onclick =
    function() {

        technology.style.display =
            "flex";

        renderTechTree();

    };


document.getElementById(
    "closeTech"
).onclick =
    function() {

        technology.style.display =
            "none";

    };


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
// START GAME
// ============================================================

updateUI();

renderTechTree();

addLog(
    "Welcome, ruler! Build your civilization."
);


// ============================================================
// GAME LOOP
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    renderer.render(
        scene,
        camera
    );

}


animate();
