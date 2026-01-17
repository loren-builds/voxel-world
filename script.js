const scene = new THREE.Scene();
const player = new THREE.Group()
scene.add(player)
const world = new THREE.Group()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
player.add(camera)
camera.position.set(0, -.25, 0)
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
let verticalVelocity = 0
const clock = new THREE.Clock();
let hotbarIndex = 1;
const coordsReadout = document.getElementById('coords');
const worldMap = new Map();
let terrainIntensity = 2
const worldSize = 25
const maxWorldHeight = 20
const sandHeight = 11
const treeDensity = 0.01

terrainIntensity /= 20


const hotbarItemGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25)
const hotbarItemMaterials = [
    new THREE.MeshStandardMaterial(),
    new THREE.MeshStandardMaterial(),
    new THREE.MeshStandardMaterial(),
    new THREE.MeshStandardMaterial(),
    new THREE.MeshStandardMaterial(),
    new THREE.MeshStandardMaterial()
];

function updateItemTexture() {
    if (hotbarIndex == 1) {
        topTexture = grassTop
        bottomTexture = dirtTexture
        sideTexture = grassSide
    } else if (hotbarIndex == 2) {
        topTexture = dirtTexture
        bottomTexture = dirtTexture
        sideTexture = dirtTexture
    } else if (hotbarIndex == 3) {
        topTexture = plankTexture
        bottomTexture = plankTexture
        sideTexture = plankTexture
    } else if (hotbarIndex == 4) {
        topTexture = logTop
        bottomTexture = logTop
        sideTexture = logSide
    } else if (hotbarIndex == 5) {
        topTexture = stoneTexture
        bottomTexture = stoneTexture
        sideTexture = stoneTexture
    } else if (hotbarIndex == 6) {
        topTexture = sandTexture
        bottomTexture = sandTexture
        sideTexture = sandTexture
    } else if (hotbarIndex == 7) {
        topTexture = leafTexture
        bottomTexture = leafTexture
        sideTexture = leafTexture
    } else {
        topTexture = unknownTexture
        bottomTexture = unknownTexture
        sideTexture = unknownTexture
    }

    hotbarItemMaterials[0].map = sideTexture
    hotbarItemMaterials[1].map = sideTexture
    hotbarItemMaterials[2].map = topTexture
    hotbarItemMaterials[3].map = bottomTexture
    hotbarItemMaterials[4].map = sideTexture
    hotbarItemMaterials[5].map = sideTexture
}

const hotbarItem = new THREE.Mesh(hotbarItemGeometry, hotbarItemMaterials)
player.add(hotbarItem)
hotbarItem.position.set(1, -1, -1)

const highlightGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
const edgeGeometry = new THREE.EdgesGeometry(highlightGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
const highlightBox = new THREE.LineSegments(edgeGeometry, lineMaterial);

scene.add(highlightBox);
highlightBox.visible = false;

let moveVelocity = 0.1

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);

sunLight.position.set(100, 100, 100);

scene.add(sunLight);

let grounded = true;
let crouching = false;
let sprinting = false;

const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);
raycaster.far = 5;

const downRaycaster = new THREE.Raycaster();
const downVector = new THREE.Vector3(0, -1, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

function loadPixelTexture(source) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(source);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    return texture;
}


let yaw = 0;
let pitch = 0;

const keys = {};

window.addEventListener('keydown', (e) => {
    if (e.code === 'ShiftLeft' && !keys[e.code]) {
        camera.position.y -= .2
        crouching = true;
    }

    if (e.code === "KeyR" && !keys[e.code]) {
        sprinting = true
    }

    if (e.code === "Space" && grounded) {
        verticalVelocity += .15
    }

    if (e.code === "Digit1") {
        hotbarIndex = 1;
        updateItemTexture()
    }

    if (e.code === "Digit2") {
        hotbarIndex = 2;
        updateItemTexture()
    }

    if (e.code === "Digit3") {
        hotbarIndex = 3;
        updateItemTexture()
    }

    if (e.code === "Digit4") {
        hotbarIndex = 4;
        updateItemTexture()
    }

    if (e.code === "Digit5") {
        hotbarIndex = 5;
        updateItemTexture()
    }

    if (e.code === "Digit6") {
        hotbarIndex = 6;
        updateItemTexture()
    }

    if (e.code === "Digit7") {
        hotbarIndex = 7;
        updateItemTexture()
    }

    if (e.code === "Digit8") {
        hotbarIndex = 8;
        updateItemTexture()
    }

    if (e.code === "Digit9") {
        hotbarIndex = 9;
        updateItemTexture()
    }

    if (e.code === "Digit0") {
        hotbarIndex = 0;
        updateItemTexture()
    }

    if (e.code === "KeyP") {
        console.log(getBlockAt(0, -.5, 0))
    }

    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft') {
        camera.position.y += .2
        crouching = false;
    }
    if (e.code == "KeyR") {
        sprinting = false
    }
    delete keys[e.code];
});

window.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

window.addEventListener('mousemove', (event) => {
    const sensitivity = 0.002;

    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;

    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

    camera.rotation.order = "YXZ";
    player.rotation.order = "YXZ"
    player.rotation.x = pitch;
    player.rotation.y = yaw;
});

window.addEventListener('mousedown', (event) => {
    if (document.pointerLockElement === renderer.domElement && event.button === 0) {

        raycaster.setFromCamera(centerScreen, camera);
        const intersects = raycaster.intersectObjects(world.children);

        if (intersects.length > 0) {
            const block = intersects[0].object;
            const key = `${block.position.x},${block.position.y},${block.position.z}`;
            worldMap.delete(key)
            world.remove(block);


        }
    }
});

window.addEventListener('mousedown', (event) => {
    if (document.pointerLockElement === renderer.domElement && event.button === 2) {

        raycaster.setFromCamera(centerScreen, camera);
        const intersects = raycaster.intersectObjects(world.children);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const block = hit.object;

            const normal = hit.face.normal;

            const newX = block.position.x + normal.x;
            const newY = block.position.y + normal.y;
            const newZ = block.position.z + normal.z;

            if (hotbarIndex === 1) {
                createGrass(newX, newY, newZ)
            }

            if (hotbarIndex === 2) {
                createDirt(newX, newY, newZ)
            }

            if (hotbarIndex === 3) {
                createPlanks(newX, newY, newZ)
            }

            if (hotbarIndex === 4) {
                createLog(newX, newY, newZ)
            }

            if (hotbarIndex === 5) {
                createStone(newX, newY, newZ)
            }

            if (hotbarIndex === 6) {
                createSand(newX, newY, newZ)
            }

            if (hotbarIndex === 7) {
                createLeaves(newX, newY, newZ)
            }

        }
    }
});

let hotbarSlots = 7
window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        hotbarIndex += 1
        if (hotbarIndex > hotbarSlots) {
            hotbarIndex = 1
        }
    } else {
        hotbarIndex -= 1
        if (hotbarIndex < 1) {
            hotbarIndex = hotbarSlots
        }

    }
    updateItemTexture()
}, { passive: true });

// Important: Disable the browser's right-click menu so it doesn't pop up
window.addEventListener('contextmenu', (e) => e.preventDefault());

function getBlockAt(x, y, z) {
    const key = `${x},${y},${z}`;

    const blockEntry = worldMap.get(key);

    if (blockEntry) {
        return blockEntry.type;
    } else {
        return null;
    }
}

function removeBlockAt(x, y, z) {
    const key = `${x},${y},${z}`;
    const entry = worldMap.get(key);

    if (entry && entry.mesh) {
        world.remove(entry.mesh);

        worldMap.delete(key);
    }
}

const geometry = new THREE.BoxGeometry(1, 1, 1);

const grassSide = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAi0lEQVR4AUyMMQqDQBBFP0NIiiAhjXYpkiKkCWhr5TG8gff1BFqInYqIaLPyVhAX3s6f+X/GsiJ27zRyvzzy9azxrB0a3V7SUsu/s67KRvatQgEGCfTfhX6Jagzvj0BJ/xEDeiA4Xp/ygWkYBRiEAR2s3R5gAAwJAhqOC+18oT9gAYwPOIeLpnIFNgAAAP//b8ahKwAAAAZJREFUAwBHcTw2Wdvl6wAAAABJRU5ErkJggg==")
const grassTop = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAbUlEQVR4AWyOsQqAMAxEQxZHR6WDgruDs5N/4//6BToUV0cn5Qkpkbbw4JrkjtNlnZ5hboqw0/OKUnWSntf7FkXvQwTsAt2PIZmUBS5AA04O0d8BH8AJLAz1A5y+E6lZSZKAhLYO/5KWhhNIfAEAAP//TqR1dgAAAAZJREFUAwDwazVZxABy7gAAAABJRU5ErkJggg==")
const dirtTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAdUlEQVR4AWTN0QbDQBCF4bWqVEX1ri/RF+hFlb5A3/8JehcRESIkvmEiZPl3zsyeM1u/n/fyez0P5Lw2U1v253pron1c5kJXHdGf72QZun6rdBhMJNQkA2HghEfbkF+HwQAMjKARBoP/eNJvCKC6kCtpLiGsAAAA//8Gvug6AAAABklEQVQDACKoODazFylhAAAAAElFTkSuQmCC")
const logSide = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAT0lEQVR4AYSMsQ0AIAgEDWPY2FkYaxO3cAbHdQB7J9HEBAKKkQIeuH+I3s5a8nxNMJ8iIAWnogS0PgSABkAhvmyhBHbbEhMv4EwEJLdNaQsAAP//dNz2FQAAAAZJREFUAwBkxRbkLr3MJwAAAABJRU5ErkJggg==")
const logTop = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAUklEQVR4AXyNMQoAIAwDi89wcXMQZ/8/+wB3X6JGiFgpCiG1vaYuRz9+crJeSUEsrZFsAEVtXW6hBx0AH6agphTA5u0K4AkTYDyd0E7g5uuAJgAAAP//V/xZ2QAAAAZJREFUAwAugC9pMchJcgAAAABJRU5ErkJggg==")
const stoneTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAWUlEQVR4AUzOiQnAIBBEUbEHK7MJe7cI41syIYEf5wLtc86DtdYBHfje3m/v3cCOMRzlayBApfeX4ZWtp/iHMtRAASYhD1ldQSAhnfE3SKBExvUGZQIlD/oBAAD//2Wql6EAAAAGSURBVAMAXKU0zbb1CQUAAAAASUVORK5CYII=")
const sandTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAYElEQVR4AVyNyxGAIAxEnZy8a5H2YEn2oDer0Ts34GXYDJ9hSXZ5EHufM/e6r8M9FdnSVvp+79Z9i0pv84W8U/UwqFpjywscRiiEFjiMUAiAeBAjMArpEQ/8BxkAQglfAAAA///oTAVgAAAABklEQVQDABXQQav0Sv3XAAAAAElFTkSuQmCC")
const leafTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAXUlEQVR4AVyNQQrAIBADZUvPQnvpK/oD//8ezyLqrAQWxZg4G9Ty/46nfAOPErO0Vq8tXfleaW8yjJsXIgBqCPdCBBQkuNGKgCyGG60TiuH+BQUJqOwvcAAYKMthEwAA//9gBeXdAAAABklEQVQDACgbMc55FkgrAAAAAElFTkSuQmCC")
const plankTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAB1JREFUKFNjLIy1/M+ABzCmBRnhV0DQBIIKBoEVAA9BD+JoUwO2AAAAAElFTkSuQmCC")
const unknownTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAATUlEQVR4AVyNgQ0AERRDm5vohjC2IWyEJypK0pT2ff+T1K1fpSO/cYDp0izUVJe4a58DUO4s7ABOmb7hAN6SoQAIXgVwf20wAFa4sA8AAAD//zASmHMAAAAGSURBVAMAcakUfbNSEKwAAAAASUVORK5CYII=")

const grassMaterials = [
    new THREE.MeshStandardMaterial({ map: grassSide }),
    new THREE.MeshStandardMaterial({ map: grassSide }),
    new THREE.MeshStandardMaterial({ map: grassTop }),
    new THREE.MeshStandardMaterial({ map: dirtTexture }),
    new THREE.MeshStandardMaterial({ map: grassSide }),
    new THREE.MeshStandardMaterial({ map: grassSide })
];

const logMaterials = [
    new THREE.MeshStandardMaterial({ map: logSide }),
    new THREE.MeshStandardMaterial({ map: logSide }),
    new THREE.MeshStandardMaterial({ map: logTop }),
    new THREE.MeshStandardMaterial({ map: logTop }),
    new THREE.MeshStandardMaterial({ map: logSide }),
    new THREE.MeshStandardMaterial({ map: logSide })
];

const dirtMaterial = new THREE.MeshStandardMaterial({ map: dirtTexture })
const stoneMaterial = new THREE.MeshStandardMaterial({ map: stoneTexture })
const sandMaterial = new THREE.MeshStandardMaterial({ map: sandTexture })
const leafMaterial = new THREE.MeshStandardMaterial({ map: leafTexture })
const plankMaterial = new THREE.MeshStandardMaterial({ map: plankTexture })

function createPlanks(x, y, z) {
    const block = new THREE.Mesh(geometry, plankMaterial)
    block.userData.type = "planks"
    block.position.set(x, y, z)
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block)
}

function createLeaves(x, y, z) {
    const block = new THREE.Mesh(geometry, leafMaterial);
    block.userData.type = "leaves"
    block.position.set(x, y, z);
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block)
}

function createSand(x, y, z) {
    const block = new THREE.Mesh(geometry, sandMaterial);
    block.userData.type = "sand"
    block.position.set(x, y, z);
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block);
}

function createLog(x, y, z) {
    const block = new THREE.Mesh(geometry, logMaterials);
    block.userData.type = "log";
    block.position.set(x, y, z)
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block)
}

function createDirt(x, y, z) {
    const block = new THREE.Mesh(geometry, dirtMaterial);
    block.userData.type = "dirt";
    block.position.set(x, y, z)
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block)
}

function createStone(x, y, z) {
    const block = new THREE.Mesh(geometry, stoneMaterial);
    block.userData.type = "stone";
    block.position.set(x, y, z)
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block)
}

function createGrass(x, y, z) {
    const block = new THREE.Mesh(geometry, grassMaterials);
    block.userData.type = "grass";
    block.position.set(x, y, z)
    const key = `${x},${y},${z}`;
    worldMap.set(key, {
        type: block.userData.type,
        mesh: block
    });
    world.add(block)
}

function createTree(x, y, z) {
    createLog(x, y + 1, z)
    createLog(x, y + 2, z)
    createLog(x, y + 3, z)
    createLog(x, y + 4, z)
    createLeaves(x - 1, y + 4, z - 1)
    createLeaves(x - 1, y + 4, z)
    createLeaves(x - 1, y + 4, z + 1)
    createLeaves(x + 1, y + 4, z - 1)
    createLeaves(x + 1, y + 4, z)
    createLeaves(x + 1, y + 4, z + 1)
    createLeaves(x, y + 4, z - 1)
    createLeaves(x, y + 4, z + 1)
    createLeaves(x - 2, y + 5, z - 1)
    createLeaves(x - 2, y + 5, z)
    createLeaves(x - 2, y + 5, z + 1)
    createLeaves(x + 2, y + 5, z - 1)
    createLeaves(x + 2, y + 5, z)
    createLeaves(x + 2, y + 5, z + 1)
    createLeaves(x - 1, y + 5, z - 2)
    createLeaves(x, y + 5, z - 2)
    createLeaves(x + 1, y + 5, z - 2)
    createLeaves(x - 1, y + 5, z + 2)
    createLeaves(x, y + 5, z + 2)
    createLeaves(x + 1, y + 5, z + 2)
    let leafX = x - 1
    let leafY = y + 5
    let leafZ = z - 1
    for (let i = 0; i < 2; i++) {
        for (let i = 0; i < 3; i++) {
            for (let i = 0; i < 3; i++) {
                createLeaves(leafX, leafY, leafZ)
                leafZ += 1
            }
            leafX += 1
            leafZ = z - 1
        }
        leafY += 1
        leafX = x - 1
    }
}
function generateWorld() {
    let bx = 0
    let by = 9.5
    let ogy = 9.5
    let bz = 0
    let chance = 0
    let y = 0


    for (let i = 0; i < worldSize; i++) {
        for (let i = 0; i < worldSize; i++) {
            chance = Math.random()
            y = -0.5
            block = (getBlockAt(bx - 1, by - 1, bz))
            if (block === null && getBlockAt(bx - 1, by, bz) == null) {
                if (bx != 0) {
                    by -= 1
                } else {
                    if (chance > (1 - terrainIntensity)) {
                        if (by < maxWorldHeight) {
                            by += 1
                        }
                    } else if (chance < terrainIntensity + 0.1) {
                        if (by > -0.5) {
                            by -= 1
                        }
                    }
                }

            } else if (block === "grass" || block === "sand") {
                if (chance < .08) {
                    if (by > -0.5) {
                        by -= 1
                    }
                }
            } else if (block === "dirt" || block === 'stone') {
                if (getBlockAt(bx - 1, by, bz) === "grass" || getBlockAt(bx - 1, by, bz) === "sand") {
                    if (chance > (1 - terrainIntensity)) {
                        if (by < maxWorldHeight) {
                            by += 1
                        }
                    } else if (chance < terrainIntensity + 0.3) {
                        if (by > -0.5) {
                            by -= 1
                        }
                    }
                } else {
                    if (by < maxWorldHeight) {
                        by += 1
                    }
                }
            }

            while (y < by) {
                createDirt(bx, y, bz)
                y += 1
            }
            if (by > sandHeight) {
                createGrass(bx, by, bz);
            } else {
                createSand(bx, by, bz)
            }
            bz += 1
        }
        bx += 1
        bz = 0
        chance = Math.random()
        if (chance < terrainIntensity) {
            ogy += 1
        }
        if (chance > (1 - terrainIntensity)) {
            ogy -= 1
        }
        by = ogy
    }
}

function polishWorld() {
    let cullX = 0
    let cullY = -0.5
    let cullZ = 0
    for (let i = 0; i < maxWorldHeight; i++) {
        for (let i = 0; i < worldSize; i++) {
            for (let i = 0; i < worldSize; i++) {
                blockType = getBlockAt(cullX, cullY, cullZ)
                if (blockType === 'dirt') {
                    removeBlockAt(cullX, cullY, cullZ)
                }
                if (blockType === "grass") {
                    if (Math.random() < treeDensity) {
                        createTree(cullX, cullY, cullZ)
                    }
                }
                if (blockType === "grass" || blockType === "sand") {
                    if (getBlockAt(cullX + 1, cullY, cullZ) === null && getBlockAt(cullX - 1, cullY, cullZ) === null && getBlockAt(cullX, cullY, cullZ - 1) === null && getBlockAt(cullX, cullY, cullZ + 1) === null && getBlockAt(cullX + 1, cullY + 1, cullZ) === null && getBlockAt(cullX - 1, cullY + 1, cullZ) === null && getBlockAt(cullX, cullY + 1, cullZ - 1) === null && getBlockAt(cullX, cullY + 1, cullZ + 1) === null) {
                        removeBlockAt(cullX, cullY, cullZ)
                        if (cullY- 1 > sandHeight) {
                            createGrass(cullX, cullY - 1, cullZ)
                        }
                        if (cullY - 1 <= sandHeight) {
                            createSand(cullX, cullY - 1, cullZ)
                        }
                    }
                }

                if (blockType === null) {
                    if (getBlockAt(cullX + 1, cullY, cullZ) != null && getBlockAt(cullX - 1, cullY, cullZ) != null && getBlockAt(cullX, cullY, cullZ - 1) != null && getBlockAt(cullX, cullY, cullZ + 1) != null) {
                        if (cullY > sandHeight) {
                            createGrass(cullX, cullY, cullZ)
                        } else {
                            createSand(cullX, cullY, cullZ)
                        }
                    }
                }

                cullZ += 1
            }
            cullX += 1
            cullZ = 0
        }

        cullY += 1
        cullX = 0
    }
    animate()
}

function checkGround() {
    downRaycaster.set(player.position, downVector)
    const intersections = downRaycaster.intersectObjects(world.children)
    if (intersections.length > 0) {
        const distance = intersections[0].distance
        if (distance > 2) {
            grounded = false
        }
        if (distance <= 2) {
            grounded = true
            player.position.y = intersections[0].point.y + 2
        }
    } else {
        grounded = false
    }
}

scene.add(world)
player.position.set(worldSize / 2, 15, worldSize / 2)
function animate() {
    requestAnimationFrame(animate);
    moveVelocity = 0.1
    if (sprinting) {
        moveVelocity = .15
    }
    if (crouching) {
        moveVelocity = .05
    }

    coordsReadout.innerText = `Position: ${Math.round(player.position.x)}, ${Math.round(player.position.y - 2)}, ${Math.round(player.position.z)}`

    if (player.position.y < -100) {
        player.position.set(0, maxWorldHeight, 0)
    }

    raycaster.setFromCamera(centerScreen, camera);


    const intersects = raycaster.intersectObjects(world.children);

    if (intersects.length > 0) {
        const target = intersects[0].object;

        highlightBox.position.copy(target.position);
        highlightBox.visible = true;
    } else {
        highlightBox.visible = false;
    }

    const delta = clock.getDelta() / 0.016666667;
    checkGround()
    if (!grounded) {
        verticalVelocity -= .01 * delta
    }

    player.position.y += verticalVelocity * delta

    checkGround()
    if (grounded) {
        verticalVelocity = 0
    }

    const direction = new THREE.Vector3();
    const moveSpeed = moveVelocity * delta

    camera.getWorldDirection(direction);

    direction.y = 0;

    direction.normalize();

    const sideDirection = new THREE.Vector3();
    sideDirection.crossVectors(direction, camera.up);

    if (keys['KeyW']) {
        player.position.addScaledVector(direction, moveSpeed);
    }
    if (keys['KeyS']) {
        player.position.addScaledVector(direction, -moveSpeed);
    }
    if (keys['KeyA']) {
        player.position.addScaledVector(sideDirection, -moveSpeed);
    }
    if (keys['KeyD']) {
        player.position.addScaledVector(sideDirection, moveSpeed);
    }

    renderer.render(scene, camera)
}

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

updateItemTexture()
generateWorld()
coordsReadout.innerText = `Polishing World`
setTimeout(() => {
    polishWorld();
}, 0);