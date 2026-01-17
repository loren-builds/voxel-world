const scene = new THREE.Scene();
const player = new THREE.Group()
scene.add(player)
const world = new THREE.Group()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 25);
player.add(camera)
camera.position.set(0, -.25, 0)
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
let verticalVelocity = 0
const clock = new THREE.Clock();
let hotbarIndex = 1;

const highlightGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
const edgeGeometry = new THREE.EdgesGeometry(highlightGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
const highlightBox = new THREE.LineSegments(edgeGeometry, lineMaterial);

scene.add(highlightBox);
highlightBox.visible = false;

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
        console.log("crouching")
    }
    if (e.code === "Space" && grounded) {
        verticalVelocity += .2
    }

    if (e.code === "Digit1") {
        hotbarIndex = 1;
    }

    if (e.code === "Digit2") {
        hotbarIndex = 2;
    }

    if (e.code === "Digit3") {
        hotbarIndex = 3;
    }

    if (e.code === "Digit4") {
        hotbarIndex = 4;
    }

    if (e.code === "Digit5") {
        hotbarIndex = 5;
    }

    if (e.code === "Digit6") {
        hotbarIndex = 6;
    }

    if (e.code === "Digit7") {
        hotbarIndex = 7;
    }

    if (e.code === "Digit8") {
        hotbarIndex = 8;
    }

    if (e.code === "Digit9") {
        hotbarIndex = 9;
    }

    if (e.code === "Digit0") {
        hotbarIndex = 0;
    }

    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft') {
        camera.position.y += .2
        crouching = false;
        console.log("stopped crouching")
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
    camera.rotation.x = pitch;
    player.rotation.y = yaw;
});

window.addEventListener('mousedown', (event) => {
    if (document.pointerLockElement === renderer.domElement && event.button === 0) {
        
        raycaster.setFromCamera(centerScreen, camera);
        const intersects = raycaster.intersectObjects(world.children);

        if (intersects.length > 0) {
            const block = intersects[0].object;
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
                createLog(newX, newY, newZ)
            }

            if (hotbarIndex === 4) {
                createStone(newX, newY, newZ)
            }

            if (hotbarIndex === 5) {
                createSand(newX, newY, newZ)
            }

            if (hotbarIndex === 6) {
                createLeaves(newX, newY, newZ)
            }

            if (hotbarIndex === 7) {
                createPlanks(newX, newY, newZ)
            }

        }
    }
});

// Important: Disable the browser's right-click menu so it doesn't pop up
window.addEventListener('contextmenu', (e) => e.preventDefault());

const geometry = new THREE.BoxGeometry(1,1,1);

const grassSide = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAi0lEQVR4AUyMMQqDQBBFP0NIiiAhjXYpkiKkCWhr5TG8gff1BFqInYqIaLPyVhAX3s6f+X/GsiJ27zRyvzzy9azxrB0a3V7SUsu/s67KRvatQgEGCfTfhX6Jagzvj0BJ/xEDeiA4Xp/ygWkYBRiEAR2s3R5gAAwJAhqOC+18oT9gAYwPOIeLpnIFNgAAAP//b8ahKwAAAAZJREFUAwBHcTw2Wdvl6wAAAABJRU5ErkJggg==")
const grassTop = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAbUlEQVR4AWyOsQqAMAxEQxZHR6WDgruDs5N/4//6BToUV0cn5Qkpkbbw4JrkjtNlnZ5hboqw0/OKUnWSntf7FkXvQwTsAt2PIZmUBS5AA04O0d8BH8AJLAz1A5y+E6lZSZKAhLYO/5KWhhNIfAEAAP//TqR1dgAAAAZJREFUAwDwazVZxABy7gAAAABJRU5ErkJggg==")
const dirtTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAdUlEQVR4AWTN0QbDQBCF4bWqVEX1ri/RF+hFlb5A3/8JehcRESIkvmEiZPl3zsyeM1u/n/fyez0P5Lw2U1v253pron1c5kJXHdGf72QZun6rdBhMJNQkA2HghEfbkF+HwQAMjKARBoP/eNJvCKC6kCtpLiGsAAAA//8Gvug6AAAABklEQVQDACKoODazFylhAAAAAElFTkSuQmCC")
const logSide = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAT0lEQVR4AYSMsQ0AIAgEDWPY2FkYaxO3cAbHdQB7J9HEBAKKkQIeuH+I3s5a8nxNMJ8iIAWnogS0PgSABkAhvmyhBHbbEhMv4EwEJLdNaQsAAP//dNz2FQAAAAZJREFUAwBkxRbkLr3MJwAAAABJRU5ErkJggg==")
const logTop = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAUklEQVR4AXyNMQoAIAwDi89wcXMQZ/8/+wB3X6JGiFgpCiG1vaYuRz9+crJeSUEsrZFsAEVtXW6hBx0AH6agphTA5u0K4AkTYDyd0E7g5uuAJgAAAP//V/xZ2QAAAAZJREFUAwAugC9pMchJcgAAAABJRU5ErkJggg==")
const stoneTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAVUlEQVR4AVTOgQkAMQhD0eIOnaxLdHeHuOMJgi18TDRK45zz3XsLGu3V2HuvfjT4zFyIaTR4CKICRGM4g8FgDoT1UH/QEOjamn8uGMCmiudCD2zS+AEAAP//DpfCrwAAAAZJREFUAwDBqEQMMlso/wAAAABJRU5ErkJggg==")
const sandTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAYElEQVR4AVyNyxGAIAxEnZy8a5H2YEn2oDer0Ts34GXYDJ9hSXZ5EHufM/e6r8M9FdnSVvp+79Z9i0pv84W8U/UwqFpjywscRiiEFjiMUAiAeBAjMArpEQ/8BxkAQglfAAAA///oTAVgAAAABklEQVQDABXQQav0Sv3XAAAAAElFTkSuQmCC")
const leafTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAXUlEQVR4AVyNQQrAIBADZUvPQnvpK/oD//8ezyLqrAQWxZg4G9Ty/46nfAOPErO0Vq8tXfleaW8yjJsXIgBqCPdCBBQkuNGKgCyGG60TiuH+BQUJqOwvcAAYKMthEwAA//9gBeXdAAAABklEQVQDACgbMc55FkgrAAAAAElFTkSuQmCC")
const plankTexture = loadPixelTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAB1JREFUKFNjLIy1/M+ABzCmBRnhV0DQBIIKBoEVAA9BD+JoUwO2AAAAAElFTkSuQmCC")

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

const dirtMaterial = new THREE.MeshStandardMaterial({map: dirtTexture})
const stoneMaterial = new THREE.MeshStandardMaterial({map: stoneTexture})
const sandMaterial = new THREE.MeshStandardMaterial({map: sandTexture})
const leafMaterial = new THREE.MeshStandardMaterial({map: leafTexture})
const plankMaterial = new THREE.MeshStandardMaterial({map: plankTexture})

function createPlanks(x, y, z) {
    const block = new THREE.Mesh(geometry, plankMaterial)
    block.userData.type = "planks"
    block.position.set(x, y, z)
    world.add(block)
}

function createLeaves(x, y, z) {
    const block = new THREE.Mesh(geometry, leafMaterial);
    block.userData.type = "leaves"
    block.position.set(x, y, z);
    world.add(block)
}

function createSand(x, y, z) {
    const block = new THREE.Mesh(geometry, sandMaterial);
    block.userData.type = "sand"
    block.position.set(x, y, z);
    world.add(block);
}

function createLog(x, y, z) {
    const block = new THREE.Mesh(geometry, logMaterials);
    block.userData.type = "log";
    block.position.set(x, y, z)
    world.add(block)
}

function createDirt(x, y, z) {
    const block = new THREE.Mesh(geometry, dirtMaterial);
    block.userData.type = "dirt";
    block.position.set(x, y, z)
    world.add(block)
}

function createStone(x, y, z) {
    const block = new THREE.Mesh(geometry, stoneMaterial);
    block.userData.type = "stone";
    block.position.set(x, y, z)
    world.add(block)
}

function createGrass(x, y, z) {
    const block = new THREE.Mesh(geometry, grassMaterials);
    block.userData.type = "grass";
    block.position.set(x, y, z)
    world.add(block)
}
let bx = 0
let bz = 0

for (let i = 0; i < 25; i++) {
    for (let i = 0; i < 25; i++) {
        createGrass(bx, -.5, bz);
        bz += 1
    }
    bx += 1
    bz = 0
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
player.position.set(3, 2, 3)
function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(centerScreen, camera);

    // 2. See what we hit (use your list of blocks)
    const intersects = raycaster.intersectObjects(world.children);

    if (intersects.length > 0) {
        const target = intersects[0].object;

        // 3. Move the highlight box to the block's position
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
    const moveSpeed = 0.1 * delta
    
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

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();