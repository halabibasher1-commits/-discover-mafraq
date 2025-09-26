// main.js - تجربة 3D بسيطة لعرض محافظة المفرق ومواقع سياحية
const canvas = document.getElementById('c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1ff);
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setSize(innerWidth, innerHeight);

// إضاءة
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
hemi.position.set(0, 50, 0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(-10, 20, 10);
scene.add(dir);

// أرض بسيطة
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({color:0x88aa66});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// بعض مباني المفرق (مربعات بسيطة)
function makeBuilding(x,z,w,h,c,label){
  const g = new THREE.BoxGeometry(w, h, w);
  const m = new THREE.MeshStandardMaterial({color:c});
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(x, h/2, z);
  scene.add(mesh);
  // إضافة تسمية ثلاثية الأبعاد بسيطة (عن طريق عنصر HTML متحرك)
  mesh.userData.label = label;
  return mesh;
}
const b1 = makeBuilding( -10, -20, 8, 10, 0xd6c28a, "موقع سياحي: قلعة المفرق");
const b2 = makeBuilding( 20, 0, 10, 14, 0xc3b4ff, "موقع سياحي: وادي الريان");
const b3 = makeBuilding( -30, 25, 6, 8, 0xffb18a, "موقع سياحي: مركز تراثي");

// نقاط سياحية قابلة للنقر (نعمل عليها كـ invisible spheres مع بيانات)
const tourismPoints = [];
function makeTourPoint(x,z,name,desc){
  const s = new THREE.Mesh(new THREE.SphereGeometry(1.2,12,12), new THREE.MeshBasicMaterial({visible:false}));
  s.position.set(x,1.2,z);
  s.userData.info = {name, desc};
  scene.add(s);
  tourismPoints.push(s);
}
makeTourPoint(-10, -20, "قلعة المفرق", "قلعة تاريخية قديمة ومعلَم مهم في المفرق.");
makeTourPoint(20, 0, "وادي الريان", "مناظر طبيعية خلابة مناسبة للسياحة والرحلات.");
makeTourPoint(-30, 25, "المركز التراثي", "مركز يعرض تراث محافظة المفرق.");


// شخصيات بسيطة (3 شخصيات) - نستخدم أشكال هندسية وتمكن تغيير 'السكِن' بتغيير اللون/ملمس
const characters = {};
function makeCharacter(id, color, x,z){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.8,2.2,8), new THREE.MeshStandardMaterial({color}));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45,8,8), new THREE.MeshStandardMaterial({color:0xffe0bd}));
  head.position.set(0,1.6,0);
  body.add(head);
  g.add(body);
  g.position.set(x,1.1,z);
  g.userData.id = id;
  scene.add(g);
  characters[id]=g;
  return g;
}
makeCharacter('char1', 0x3388ff, -5, -5); // بشر - أزرق
makeCharacter('char2', 0xff5588, 5, -5);  // غنى - وردي
makeCharacter('char3', 0x33cc66, 0, 10);  // مريم - أخضر

// كاميرا وتحكم بسيط - pointer lock للتحكم كأنك لاعب
const controls = new THREE.PointerLockControls(camera, document.body);
document.addEventListener('click', ()=> {
  // لبدء التحكم اضغط داخل النافذة
  // controls.lock();
}, false);

// وضع الكاميرا فوق الشخصية المُختارة
let activeCharacter = 'char1';
function updateCameraBehindCharacter(){
  const ch = characters[activeCharacter];
  if(!ch) return;
  const pos = ch.position;
  camera.position.set(pos.x, pos.y+4, pos.z+6);
  camera.lookAt(pos.x, pos.y+1, pos.z);
}
updateCameraBehindCharacter();

// تحريك الشخصية بنظام WASD
const keys = {w:false,a:false,s:false,d:false};
window.addEventListener('keydown', e=> { if(e.key==='w') keys.w=true; if(e.key==='s') keys.s=true; if(e.key==='a') keys.a=true; if(e.key==='d') keys.d=true; });
window.addEventListener('keyup', e=> { if(e.key==='w') keys.w=false; if(e.key==='s') keys.s=false; if(e.key==='a') keys.a=false; if(e.key==='d') keys.d=false; });

function moveCharacter(dt){
  const ch = characters[activeCharacter];
  if(!ch) return;
  const speed = 6; // units per second
  let dx=0,dz=0;
  if(keys.w) dz -= speed * dt;
  if(keys.s) dz += speed * dt;
  if(keys.a) dx -= speed * dt;
  if(keys.d) dx += speed * dt;
  ch.position.x += dx;
  ch.position.z += dz;
  updateCameraBehindCharacter();
}

// واجهة تفاعلية: عند النقر على نقاط سياحية، نظهر لوحة معلومات
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousedown', (ev)=>{
  // تحويل إحداثيات الفأرة
  mouse.x = (ev.clientX / innerWidth) * 2 - 1;
  mouse.y = - (ev.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(tourismPoints, false);
  if(intersects.length>0){
    const info = intersects[0].object.userData.info;
    showPanel(info.name, info.desc);
  }
});

function showPanel(title, text){
  const panel = document.getElementById('panel');
  panel.classList.remove('hidden');
  panel.innerHTML = '<h3>'+title+'</h3><p>'+text+'</p>';
}

// تغيير الشخصية من الواجهة
document.getElementById('characterSelect').addEventListener('change', (e)=>{
  activeCharacter = e.target.value;
  updateCameraBehindCharacter();
});

// زر تشغيل الصوت - سيحاول تشغيل ملف صوتي مطابق للاسم
document.getElementById('playVoice').addEventListener('click', async ()=>{
  const id = activeCharacter;
  const mapping = {char1:'bishr', char2:'ghina', char3:'maryam'};
  const name = mapping[id];
  const url = 'assets/audio/' + name + '.mp3';
  try{
    const a = new Audio(url);
    await a.play();
  }catch(err){
    alert('لم يتم العثور على ملف الصوت: ' + url + '\nضع ملفات الصوت المناسبة في المجلد assets/audio وبأسماء bishr.mp3, ghina.mp3, maryam.mp3');
  }
});

// واجهة مساعدة: عرض أسماء المباني عند الاقتراب
function checkNearbyLabels(){
  const labels = [b1,b2,b3];
  const camPos = camera.position;
  labels.forEach(l=>{
    const d = camPos.distanceTo(l.position);
    if(d < 12){
      // عرض اسم
      const info = document.getElementById('info');
      info.innerText = l.userData.label;
    } else {
      const info = document.getElementById('info');
      info.innerText = 'انقر على نقاط السياحة لعرض معلومات. استخدم WASD للتحرك، الماوس لتدوير الكاميرا.';
    }
  });
}

// حلقة الرسوم
let last = performance.now();
function animate(t){
  const dt = (t - last)/1000;
  last = t;
  moveCharacter(dt);
  checkNearbyLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// تعديل عند تصغير/تكبير النافذة
window.addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
