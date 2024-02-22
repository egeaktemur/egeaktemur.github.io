import * as THREE from "three";

var audio = document.getElementById("myaudio");
let fun_mode = false;
audio.volume = 0.1;
audio.pause();
const worldWidth = 128;
const worldDepth = 5;
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();

let scene, camera, renderer, clock, mesh, geometry, material1, light;
let crates = [];

document.getElementById("modeToggle").addEventListener('change', function() {
  console.log(this.checked);
  if(this.checked) {
    audio.play();
    fun_mode = true;
    for (let i = 0; i < crates.length; i++) {
      crates[i].crElement.style.display = 'none';
      crates[i].crateMesh.visible = true;
      crates[i].textMesh.visible = true;
    }
  } 
  else {
    audio.pause();
    fun_mode = false;
    for (let i = 0; i < crates.length; i++) {
      crates[i].crElement.style.display = 'grid';
      crates[i].crateMesh.visible = false;
      crates[i].textMesh.visible = false;
    }
  }
});

// Initialize the camera
function initCamera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(0, 200, -3);
}

// Initialize the renderer
function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector("#bg") });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add light to the scene
function addLight() {
  light = new THREE.DirectionalLight(0xfb9062);
  light.position.set(0, 50, -400).normalize();
  scene.add(light);
}

// Add mesh to the scene
function addMesh() {
  geometry = new THREE.PlaneGeometry(20000, 20000, worldWidth - 1, worldDepth - 1);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  position.usage = THREE.DynamicDrawUsage;
  for (let i = 0; i < position.count; i++) {
    const y = 35 * Math.sin(i / 2);
    position.setY(i, y);
  }
  const texture = new THREE.TextureLoader().load("water.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  material1 = new THREE.MeshBasicMaterial({ color: 0x008e8d, map: texture });
  mesh = new THREE.Mesh(geometry, material1);
  mesh.userData.originalColor = 0x335b96;
  scene.add(mesh);
}

class Crate {
  constructor(text, position, font) {
    const textOptions = {
      font,
      size: 30,
      height: 2,
      curveSegments: 10,
      bevelEnabled: false,
      bevelOffset: 0,
      bevelSegments: 1,
      bevelSize: 0.3,
      bevelThickness: 1,
    };
    const textGeometry = new THREE.TextGeometry(text.toUpperCase(), textOptions);
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x000000 }),
      new THREE.MeshPhongMaterial({ color: 0xfad6a5 }), // side
    ];
    this.text = text;
    this.crElement = document.getElementById(this.text);
    this.crElement.style.display = 'none';
    this.textMesh = new THREE.Mesh(textGeometry, materials);
    this.textMesh.castShadow = true;
    this.textMesh.position.set(position.x, position.y, position.z);

    const crateTexture = new THREE.TextureLoader().load("crate.jpg");
    this.crateMesh = new THREE.Mesh(
      new THREE.BoxGeometry(75, 75, 75),
      new THREE.MeshBasicMaterial({ map: crateTexture })
    );
    this.crateMesh.material.reflectivity = 0.3;
    this.crateMesh.userData.originalColor = 0x966f33;
    this.crateMesh.material.color.set(this.crateMesh.userData.originalColor);
    this.crateMesh.position.set(position.x + 60, position.y, position.z);

    this.crateMesh.rotation.x = Math.random() * 2 * Math.PI;
    this.crateMesh.rotation.y = Math.random() * 2 * Math.PI;
    this.crateMesh.rotation.z = Math.random() * 2 * Math.PI;

    this.originalPosition = position;

    scene.add(this.textMesh);
    scene.add(this.crateMesh);

    crates.push(this);

    this.crateMesh.visible = false;
    this.textMesh.visible = false;
    this.crElement.style.display = 'grid';
  }

  hover(intersected) {
    if (fun_mode) {
      if (intersected) {
        this.crateMesh.material.transparent = true;
        this.crateMesh.material.opacity = 0.5;
      } else {
        this.crateMesh.material.color.set(this.crateMesh.userData.originalColor);
        this.crateMesh.material.opacity = 1;
      }
    }
  }

  click(intersected) {
    if (fun_mode) {
      if (intersected) {
        this.crElement.style.display = this.crElement.style.display == "grid" ? "none" : "grid";
      }
      else {
        if (this.crElement.id != "modeToggle"){
          this.crElement.style.display = "none";
        }
        else{
          this.crElement.style.display = "grid";
        }
      }
    }
  }

  update(positionAttribute, i, time) {
    if (this.crateMesh.position.x <= -window.innerWidth / 2 - 250) {
      this.textMesh.position.x = this.originalPosition.x + window.innerWidth;
      this.crateMesh.position.x = this.originalPosition.x + window.innerWidth + 70;

      this.textMesh.position.z = this.originalPosition.z+300;
      this.crateMesh.position.z = this.originalPosition.z+300;

      this.textMesh.rotation.y = -1;
    }

    const y = 35 * Math.sin(i / 5 + (time + i) / 7);
    positionAttribute.setY(i, y);

    if (i == 7) {
      // Text Position
      this.crateMesh.position.x -= 0.15;
      this.crateMesh.position.y = y;
      this.crateMesh.position.z -= 0.05;
      // Crate Position
      this.textMesh.position.x -= 0.15;
      this.textMesh.position.y = y + 75;
      this.textMesh.position.z -= 0.05;
      // Crate Rotation
      this.crateMesh.rotation.x -= 0.0005;
      this.crateMesh.rotation.y += 0.00075;
      this.crateMesh.rotation.z -= 0.0005;
      // Text Rotation
      this.textMesh.rotation.y += 0.0001;
    }
  }
}

// Load and add objects to the scene
async function addObjects() {
  const font = await loadFont();
  const crateabout     = new Crate('about',           { x: -500, y: 0, z: -400 }, font);
  const crateeducation = new Crate('education',       { x: -300, y: 0, z: -700 }, font);
  const cratework      = new Crate('work experience', { x: 100,  y: 0, z: -300 }, font);
  const crateskills    = new Crate('skills',          { x: 300,  y: 0, z: -600 }, font);
  const crateproject   = new Crate('project',         { x: 500,  y: 0, z: -500 }, font);
}

// Initialize the scene
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x14123b );
  scene.fog = new THREE.FogExp2( 0x14123b, 0.001 );

  initCamera();
  initRenderer();
  addLight();
  addMesh();
  addObjects();

  clock = new THREE.Clock();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("pointermove", onPointerMove);
  document.onclick = onClick;

  animate();
}

// Load font
function loadFont() {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FontLoader();
    loader.load("./font.json", resolve, undefined, reject);
  });
}

// Render and update the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  updateScene();
}

// Render the scene
function render() {
  renderer.render(scene, camera);
}

// Update the scene
function updateScene() {
  hovered();

  const time = clock.getElapsedTime() * 10;
  const position = geometry.attributes.position;

  crates.forEach(crate => {
    for (let i = 0; i < position.count; i++) {
      crate.update(position, i, time);
    }
  });
  position.needsUpdate = true;
}

// Handle mouse click event
function onClick(event) {
  const intersects = raycaster.intersectObjects(scene.children);
  const intersectedObjects = intersects.map(intersect => intersect.object);
  crates.forEach(crate => {
    crate.click(intersectedObjects.includes(crate.crateMesh));
  });
}

// Handle mouse hover event
function hovered() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  
  const intersectedObjects = intersects.map(intersect => intersect.object);
  crates.forEach(crate => {
    crate.hover(intersectedObjects.includes(crate.crateMesh));
  });
  
  if (intersectedObjects.includes(mesh)) {
    mesh.material.color.set(0x7fcdff);
  } else {
    mesh.material.color.set(mesh.userData.originalColor);
  }
}

// Handle pointer move event
function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Handle window resize event
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init()