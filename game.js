import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// RISE OF CIVILIZATION
// ============================================================

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
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x071b2b);

scene.fog =
    new THREE.Fog(
        0x071b2b,
        80,
        180
    );


// ============================================================
// CAMERA
// ============================================================

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
    55
);

camera.lookAt(
    0,
    0,
    0
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
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

let cameraDistance = 78;

let cameraAngle = 0;

let cameraHeight = 55;

let dragging = false;

let lastMouseX = 0;


renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        dragging = true;

        lastMouseX =
            event.clientX;

    }
);


window.addEventListener(
    "pointerup",
    () => {

        dragging = false;

    }
);


window.addEventListener(
    "pointermove",
    event => {

        if (!dragging)
            return;

        const movement =
            event.clientX -
            lastMouseX;

        lastMouseX =
            event.clientX;

        cameraAngle +=
            movement * 0.01;

    }
);


renderer.domElement.addEventListener(
    "wheel",
    event => {

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
// LIGHTING
// ============================================================

const sun =
    new THREE.DirectionalLight(
        0xffe5b5,
        3
    );

sun.position.set(
    -30,
    60,
    20
);

sun.castShadow = true;

scene.add(sun);


scene.add(
    new THREE.HemisphereLight(
        0x9dc5e8,
        0x26351c,
        2
    )
);


// ============================================================
// MATERIAL
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

        material(
            0x0b4662
        )

    );

water.rotation.x =
    -Math.PI / 2;

water.position.y =
    -0.5;

scene.add(water);


// ============================================================
// MAP
// ============================================================

const TILE = 2.2;

const WIDTH = 42;

const HEIGHT = 31;


function ellipse(
    x,
    z,
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


function isLand(x, z) {

    const western =
        ellipse(
            x,
            z,
            -25,
            -13,
            22,
            18
        ) ||

        ellipse(
            x,
            z,
            -17,
            -1,
            17,
            13
        );


    const eastern =
        ellipse(
            x,
            z,
            25,
            -15,
            25,
            18
        ) ||

        ellipse(
            x,
            z,
            18,
            -1,
            17,
            14
        );


    const southern =
        ellipse(
            x,
            z,
            3,
            21,
            25,
            12
        );


    const island =
        ellipse(
            x,
            z,
            -37,
            27,
            7,
            6
        );


    const smallIslands =
        ellipse(
            x,
            z,
            -3,
            -28,
            4,
            3
        ) ||

        ellipse(
            x,
            z,
            10,
            -31,
            3,
            2
        );


    return (
        western ||
        eastern ||
        southern ||
        island ||
        smallIslands
    );

}


// ============================================================
// TERRAIN
// ============================================================

for (
    let z = -HEIGHT;
    z <= HEIGHT;
    z++
) {

    for (
        let x = -WIDTH;
        x <= WIDTH;
        x++
    ) {

        const worldX =
            x * TILE;

        const worldZ =
            z * TILE;


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
                    TILE * 1.03,
                    height,
                    TILE * 1.03
                ),

                material(
                    0x709b46
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
            Math.random() < 0.07
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
            Math.random() < 0.018
        ) {

            const mountain =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        1.1,
                        3,
                        6
                    ),

                    material(
                        0x777d7c
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
// FIND TILE
// ============================================================

function nearestTile(
    x,
    z
) {

    let closest = null;

    let distance =
        Infinity;


    for (
        const tile of game.tiles
    ) {

        const d =
            Math.hypot(

                tile.position.x -
                x,

                tile.position.z -
                z

            );


        if (
            d < distance
        ) {

            distance = d;

            closest = tile;

        }

    }


    return closest;

}


// ============================================================
// CITY
// ============================================================

function createCity(
    x,
    z,
    name,
    enemy = false,
    color = 0
) {

    const tile =
        nearestTile(
            x,
            z
        );


    if (!tile)
        return null;


    const group =
        new THREE.Group();


    group.position.set(

        tile.position.x,

        tile.position.y + 0.5,

        tile.position.z

    );


    const cityColor =
        enemy
            ? [
                0xb84c4c,
                0x4c9b59,
                0x9a5ec7,
                0xd49c34
            ][color]
            : 0x3f78d2;


    const base =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                1.2,
                1.4,
                1,
                8
            ),

            material(
                cityColor
            )

        );


    base.castShadow = true;

    group.add(base);


    const castle =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                0.7,
                2,
                6
            ),

            material(
                0xd6c497
            )

        );


    castle.position.y =
        1.3;

    castle.castShadow = true;

    group.add(castle);


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

            Math.cos(angle) *
            0.9,

            0.8,

            Math.sin(angle) *
            0.9

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

        game.enemyCities.push(
            city
        );

    } else {

        game.cities.push(
            city
        );

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
// UNIT
// ============================================================

function createUnit(
    x,
    z,
    type,
    enemy = false,
    name = "Army"
) {

    const tile =
        nearestTile(
            x,
            z
        );


    if (!tile)
        return null;


    const group =
        new THREE.Group();


    group.position.set(

        tile.position.x,

        tile.position.y + 0.8,

        tile.position.z

    );


    let body;


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
                        : 0x3f78d2
                )

            );


        body.rotation.x =
            Math.PI / 2;

        body.rotation.z =
            Math.PI / 4;

    }

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
                        : 0x3f78d2
                )

            );


        const helmet =
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


        helmet.position.y =
            0.65;


        group.add(
            helmet
        );


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
                        0xe0e0e0
                    )

                );


            plume.position.y =
                1.05;


            group.add(
                plume
            );

        }

    }


    body.castShadow = true;

    group.add(
        body
    );


    scene.add(
        group
    );


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

        game.enemyUnits.push(
            unit
        );

    } else {

        game.units.push(
            unit
        );

    }


    return unit;

}


// ============================================================
// STARTING ARMIES
// ============================================================

createUnit(
    -25,
    -12,
    "army",
    false,
    "First Army"
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
// UI
// ============================================================

const ui =
document.createElement(
    "div"
);


ui.innerHTML = `

<style>

body {
    font-family: Georgia, serif;
    color: white;
}

#top {

    position: fixed;

    left: 0;
    right: 0;
    top: 0;

    height: 65px;

    background:
        linear-gradient(
            #142438,
            #08121d
        );

    border-bottom:
        2px solid #a47c36;

    display: flex;

    align-items: center;

    gap: 20px;

    padding: 8px 15px;

    z-index: 10;

}

.resource {

    padding:
        8px 12px;

    border-left:
        1px solid #394858;

}

.resource b {

    color:
        #f2ce68;

}

#turn {

    margin-left:
        auto;

    text-align:
        center;

}

button {

    background:
        linear-gradient(
            #28547c,
            #102d47
        );

    border:
        1px solid #b18a42;

    color:
        white;

    border-radius:
        7px;

    padding:
        9px 13px;

    cursor:
        pointer;

    font-family:
        Georgia, serif;

}

button:hover {

    filter:
        brightness(1.3);

}

#panel {

    position:
        fixed;

    top: 80px;

    left: 12px;

    width: 250px;

    background:
        #091520ee;

    border:
        1px solid #87662f;

    border-radius:
        10px;

    padding:
        14px;

    z-index:
        10;

}

#panel h2 {

    margin-top: 0;

    color:
        #f1d27a;

}

.actions {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        7px;

    margin-top:
        15px;

}

#log {

    position:
        fixed;

    top:
        80px;

    right:
        12px;

    width:
        250px;

    padding:
        12px;

    background:
        #091520ee;

    border:
        1px solid #87662f;

    border-radius:
        10px;

    z-index:
        10;

    font-size:
        13px;

}

#techWindow {

    position:
        fixed;

    inset:
        0;

    background:
        #000b;

    z-index:
        30;

    display:
        none;

    align-items:
        center;

    justify-content:
        center;

}

#techBox {

    width:
        900px;

    max-width:
        90vw;

    max-height:
        85vh;

    overflow:
        auto;

    padding:
        25px;

    background:
        #0d1926;

    border:
        2px solid #a17c39;

    border-radius:
        12px;

}

#techBox h1 {

    color:
        #f1d27a;

}

.techGrid {

    display:
        grid;

    grid-template-columns:
        repeat(4,1fr);

    gap:
        10px;

}

.tech {

    background:
        #122437;

    border:
        1px solid #41576b;

    border-radius:
        8px;

    padding:
        12px;

}

.tech.available {

    border-color:
        #50a6e4;

    cursor:
        pointer;

}

.tech.done {

    border-color:
        #d3ac4c;

}

.techName {

    color:
        #7fc5ff;

    font-weight:
        bold;

}

@media(max-width:800px) {

    #log {
        display:none;
    }

    #panel {
        width:205px;
    }

    .resource:nth-of-type(n+4) {
        display:none;
    }

    .techGrid {
        grid-template-columns:
            1fr 1fr;
    }

}

</style>


<div id="top">

    <b>🏰 Kingdom of Dawn</b>

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

    <div id="turn">
        Turn <b id="turnNumber">1</b>
        <br>
        <small id="year">1000 AD</small>
    </div>

    <button id="endTurn">
        END TURN
    </button>

</div>


<div id="panel">

    <h2>Kingdom</h2>

    <div id="selection">
        Select a city or army.
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
            🏛 City
        </button>

        <button id="technology">
            🔬 Technology
        </button>

    </div>

</div>


<div id="log">

    <b>Chronicle</b>

    <br><br>

    Your civilization has begun.

</div>


<div id="techWindow">

    <div id="techBox">

        <button id="closeTech">
            Close
        </button>

        <h1>
            Technology Tree
        </h1>

        <div
            class="techGrid"
            id="techGrid">
        </div>

    </div>

</div>

`;


document.body.appendChild(
    ui
);


// ============================================================
// LOG
// ============================================================

function logMessage(
    message
) {

    const log =
        document.getElementById(
            "log"
        );


    log.innerHTML =

        "<b>Chronicle</b>" +

        "<br><br>" +

        message +

        "<hr>" +

        log.innerHTML
            .replace(
                "<b>Chronicle</b>",
                ""
            );

}


// ============================================================
// SELECT
// ============================================================

function selectObject(
    object,
    type
) {

    game.selected =
        object;

    game.selectedType =
        type;


    const panel =
        document.getElementById(
            "selection"
        );


    if (
        type === "city"
    ) {

        panel.innerHTML = `

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

    }


    if (
        type === "unit"
    ) {

        panel.innerHTML = `

        <b>
        ${object.type === "ship"
            ? "⛵"
            : "⚔"}

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

        logMessage(
            "This unit has already moved."
        );

        return;

    }


    const tile =
        nearestTile(
            x,
            z
        );


    if (!tile)
        return;


    const distance =
        Math.hypot(

            tile.position.x -
            unit.x,

            tile.position.z -
            unit.z

        );


    const range =
        unit.type === "ship" &&
        game.technologies.navigation

            ? 8
            : 5;


    if (
        distance > range
    ) {

        logMessage(
            "That unit cannot reach that tile."
        );

        return;

    }


    unit.x =
        tile.position.x;

    unit.z =
        tile.position.z;


    unit.group.position.set(

        unit.x,

        tile.position.y +
        0.8,

        unit.z

    );


    unit.movement =
        0;


    // Attack cities

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

}


// ============================================================
// ATTACK
// ============================================================

function attackCity(
    unit,
    city
) {

    let damage = 40;


    if (
        unit.type ===
        "knight"
    ) {

        damage =
            65;

    }


    if (
        game.technologies.steel
    ) {

        damage +=
            20;

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

        captureCity(
            city
        );

    }

}


// ============================================================
// CAPTURE
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


    city.group.children[0]
        .material =
        material(
            0x3f78d2
        );


    logMessage(

        "🏰 <b>" +
        city.name +
        "</b> has been conquered!"

    );


    if (
        game.enemyCities.length === 0
    ) {

        logMessage(
            "👑 <b>VICTORY!</b> You control the entire map!"
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
        "⚔ New army created."
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

            "Dawn Ship"

        );


    selectObject(
        ship,
        "unit"
    );


    logMessage(
        "⛵ New ship built."
    );


    updateUI();

}


// ============================================================
// KNIGHTS
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
        "♞ The Royal Knights have been created!"
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
            "Select an army."
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
        "🏛 New settlement founded!"
    );

}


// ============================================================
// FORTIFY
// ============================================================

function fortify() {

    if (
        game.selectedType ===
        "unit"
    ) {

        game.selected.movement =
            0;

        logMessage(
            "🛡 Unit fortified."
        );

    }

}


// ============================================================
// TECHNOLOGIES
// ============================================================

const technologies = [

    {
        id: "sailing",
        name: "Sailing",
        cost: 20,
        description:
            "Unlock ships."
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
            "Build warships."
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
            "Begin the path to Knights."
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
            "Improve army strength."
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


function renderTech() {

    const grid =
        document.getElementById(
            "techGrid"
        );


    grid.innerHTML = "";


    for (
        const tech of technologies
    ) {

        const box =
            document.createElement(
                "div"
            );


        const done =
            game.technologies[
                tech.id
            ];


        const requirement =
            !tech.requires ||
            game.technologies[
                tech.requires
            ];


        box.className =
            "tech " +
            (
                done
                    ? "done"
                    : requirement
                        ? "available"
                        : ""
            );


        box.innerHTML = `

            <div class="techName">
                ${tech.name}
            </div>

            <br>

            🧪 ${tech.cost} Science

            <br>

            <small>
                ${tech.description}
            </small>

            ${
                done
                    ? "<br><br>✓ RESEARCHED"
                    : ""
            }

        `;


        if (
            !done &&
            requirement
        ) {

            box.onclick =
                () => {

                    research(
                        tech
                    );

                };

        }


        grid.appendChild(
            box
        );

    }

}


function research(
    tech
) {

    if (
        game.science <
        tech.cost
    ) {

        logMessage(
            "You don't have enough science."
        );

        return;

    }


    game.science -=
        tech.cost;


    game.technologies[
        tech.id
    ] = true;


    logMessage(

        "🔬 Research completed: " +
        tech.name

    );


    renderTech();

    updateUI();

}


// ============================================================
// END TURN
// ============================================================

function endTurn() {

    game.turn++;

    game.year +=
        25;


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


    for (
        const unit of game.units
    ) {

        unit.movement =
            1;

    }


    logMessage(

        "Turn " +
        game.turn +
        " — " +
        game.year +
        " AD"

    );


    updateUI();

}


// ============================================================
// UI UPDATE
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
        "turnNumber"
    ).textContent =
        game.turn;


    document.getElementById(
        "year"
    ).textContent =
        game.year +
        " AD";

}


// ============================================================
// CLICK MAP
// ============================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


renderer.domElement.addEventListener(
    "pointerdown",
    event => {

        // Don't select when dragging

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


        const hits =
            raycaster.intersectObjects(
                scene.children,
                true
            );


        if (
            hits.length === 0
        )
            return;


        let object =
            hits[0].object;


        while (
            object &&
            !object.userData.type
        ) {

            object =
                object.parent;

        }


        if (!object)
            return;


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
    "technology"
).onclick =
    () => {

        document.getElementById(
            "techWindow"
        ).style.display =
            "flex";

        renderTech();

    };


document.getElementById(
    "closeTech"
).onclick =
    () => {

        document.getElementById(
            "techWindow"
        ).style.display =
            "none";

    };


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

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


    // Camera rotation

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


updateUI();

renderTech();

animate();
