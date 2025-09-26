
let scene, camera, renderer, controls, player, clock;
let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false;
let playerSpeed=0.1;

init();
animate();

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.y = 1.8;
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5,10,5);
    scene.add(light);
    const floorGeometry = new THREE.PlaneGeometry(50,50);
    const floorMaterial = new THREE.MeshPhongMaterial({color:0x228B22});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);
    controls = new THREE.PointerLockControls(camera, document.body);
    document.body.addEventListener('click', ()=>controls.lock());
    const loader = new THREE.GLTFLoader();
    loader.load('assets/player.glb', function(gltf){
        player = gltf.scene;
        player.position.set(0,0,0);
        scene.add(player);
    });
    const npcs = [
        {file:'npc_bashar.glb', pos:[5,0,0]},
        {file:'npc_ghina.glb', pos:[-5,0,2]},
        {file:'npc_mariam.glb', pos:[0,0,-5]}
    ];
    npcs.forEach(n=>{
        loader.load('assets/'+n.file, function(gltf){
            let npc = gltf.scene;
            npc.position.set(...n.pos);
            npc.name = n.file.split('.')[0];
            scene.add(npc);
        });
    });
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    clock = new THREE.Clock();
}

function keyDown(event){
    switch(event.code){
        case "KeyW": moveForward=true; break;
        case "KeyS": moveBackward=true; break;
        case "KeyA": moveLeft=true; break;
        case "KeyD": moveRight=true; break;
    }
}

function keyUp(event){
    switch(event.code){
        case "KeyW": moveForward=false; break;
        case "KeyS": moveBackward=false; break;
        case "KeyA": moveLeft=false; break;
        case "KeyD": moveRight=false; break;
    }
}

function animate(){
    requestAnimationFrame(animate);
    let direction = new THREE.Vector3();
    if(moveForward) direction.z -= playerSpeed;
    if(moveBackward) direction.z += playerSpeed;
    if(moveLeft) direction.x -= playerSpeed;
    if(moveRight) direction.x += playerSpeed;
    controls.moveRight(direction.x);
    controls.moveForward(direction.z);
    renderer.render(scene, camera);
}
