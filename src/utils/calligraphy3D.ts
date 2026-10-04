import * as THREE from 'three';
import { CalligraphyLesson, MaterialType } from '../types/calligraphy';

/**
 * Creates 3D materials for calligraphy letters
 */
export function createCalligraphyMaterial(type: MaterialType): THREE.Material {
  switch (type) {
    case 'gold':
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#eab308'),
        emissive: new THREE.Color('#78350f'),
        emissiveIntensity: 0.15,
        metalness: 0.85,
        roughness: 0.22,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        reflectivity: 0.9,
      });
    case 'ink':
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#09090b'),
        emissive: new THREE.Color('#1c1917'),
        emissiveIntensity: 0.05,
        metalness: 0.2,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });
    case 'bronze':
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#b45309'),
        emissive: new THREE.Color('#451a03'),
        emissiveIntensity: 0.1,
        metalness: 0.75,
        roughness: 0.35,
      });
    case 'emerald':
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#059669'),
        emissive: new THREE.Color('#064e3b'),
        emissiveIntensity: 0.2,
        metalness: 0.6,
        roughness: 0.2,
        clearcoat: 0.8,
      });
  }
}

/**
 * Creates a canonical Arabic Calligraphy rhombic dot (النقطة المعينة)
 * Pressed with a reed pen at angle theta, forming a rhombus prism.
 */
export function createCalligraphyDotMesh(
  angleDegrees: number = 70,
  size: number = 0.5,
  thickness: number = 0.12,
  color: string = '#f59e0b'
): THREE.Mesh {
  const shape = new THREE.Shape();
  const rad = (angleDegrees * Math.PI) / 180;
  
  const w = size;
  const h = size * Math.sin(rad);
  const slant = size * Math.cos(rad);

  // A rhombus matching the nib print
  shape.moveTo(0, 0);
  shape.lineTo(w, slant * 0.4);
  shape.lineTo(w + slant * 0.3, h);
  shape.lineTo(slant * 0.3, h - slant * 0.4);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.6,
    roughness: 0.3,
  });

  return new THREE.Mesh(geometry, material);
}

/**
 * Generates the 3D group for a given calligraphy lesson
 */
export function buildLesson3DGroup(
  lesson: CalligraphyLesson,
  materialType: MaterialType = 'gold',
  showPointsScale: boolean = true,
  showPenAngle: boolean = true
): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = `lesson-root-${lesson.id}`;

  const mainMaterial = createCalligraphyMaterial(materialType);

  // 1. Build the letter geometry based on lesson
  const letterGroup = new THREE.Group();
  letterGroup.name = 'letter-mesh-group';

  if (lesson.id === 'thuluth-noon') {
    // حرف النون بخط الثلث
    const curvePoints = [
      new THREE.Vector3(1.2, 1.4, 0),    // ترويس الرأس
      new THREE.Vector3(1.0, 0.8, 0),
      new THREE.Vector3(0.6, -0.6, 0),
      new THREE.Vector3(0.0, -1.2, 0),   // قاع الكأس الأعمق
      new THREE.Vector3(-0.8, -0.9, 0),
      new THREE.Vector3(-1.3, -0.2, 0),
      new THREE.Vector3(-1.4, 0.6, 0),   // صعود الطرف
      new THREE.Vector3(-1.3, 0.9, 0),   // الرأس المدبب الداخلي
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.22, 16, false);
    const letterMesh = new THREE.Mesh(tubeGeometry, mainMaterial);
    letterMesh.castShadow = true;
    letterMesh.receiveShadow = true;
    letterGroup.add(letterMesh);

    // إضافة نقطة النون الكلاسيكية
    const noonDot = createCalligraphyDotMesh(lesson.penAngleDegrees, 0.55, 0.16, '#f59e0b');
    noonDot.position.set(-0.1, 0.3, 0.05);
    letterGroup.add(noonDot);

  } else if (lesson.id === 'ruqah-waw') {
    // حرف الواو بخط الرقعة (رأس مطموس وجسم يستقر على السطر)
    const headGeom = new THREE.CylinderGeometry(0.42, 0.35, 0.25, 24);
    headGeom.rotateZ(Math.PI / 4);
    const headMesh = new THREE.Mesh(headGeom, mainMaterial);
    headMesh.position.set(0.6, 0.6, 0);
    letterGroup.add(headMesh);

    const bodyPoints = [
      new THREE.Vector3(0.5, 0.45, 0),
      new THREE.Vector3(0.3, 0.0, 0),
      new THREE.Vector3(-0.2, -0.5, 0),
      new THREE.Vector3(-0.9, -0.65, 0), // ذيل مستقر
    ];
    const bodyCurve = new THREE.CatmullRomCurve3(bodyPoints);
    const bodyGeom = new THREE.TubeGeometry(bodyCurve, 40, 0.18, 16, false);
    const bodyMesh = new THREE.Mesh(bodyGeom, mainMaterial);
    letterGroup.add(bodyMesh);

  } else if (lesson.id === 'naskh-ayn') {
    // حرف العين بخط النسخ (حاجب مقوس، عنق، وبطن هلالي تحت السطر)
    const eyebrowPoints = [
      new THREE.Vector3(-0.2, 0.9, 0),
      new THREE.Vector3(0.3, 1.15, 0),
      new THREE.Vector3(0.7, 0.95, 0),
      new THREE.Vector3(0.4, 0.6, 0),
    ];
    const eyebrowCurve = new THREE.CatmullRomCurve3(eyebrowPoints);
    const eyebrowGeom = new THREE.TubeGeometry(eyebrowCurve, 32, 0.16, 16, false);
    const eyebrowMesh = new THREE.Mesh(eyebrowGeom, mainMaterial);
    letterGroup.add(eyebrowMesh);

    const bellyPoints = [
      new THREE.Vector3(0.4, 0.6, 0),
      new THREE.Vector3(0.8, -0.1, 0),
      new THREE.Vector3(0.3, -0.9, 0),
      new THREE.Vector3(-0.7, -1.2, 0),
      new THREE.Vector3(-1.3, -0.7, 0),
      new THREE.Vector3(-1.4, -0.2, 0),
    ];
    const bellyCurve = new THREE.CatmullRomCurve3(bellyPoints);
    const bellyGeom = new THREE.TubeGeometry(bellyCurve, 48, 0.2, 16, false);
    const bellyMesh = new THREE.Mesh(bellyGeom, mainMaterial);
    letterGroup.add(bellyMesh);

  } else {
    // البسملة أو تركيب خطي عام
    // نركب نحتاً ثلاثي الأبعاد فاخراً من خطوط عربية متداخلة
    const baselinePoints = [
      new THREE.Vector3(2.0, -0.5, 0),
      new THREE.Vector3(0.8, -0.5, 0),
      new THREE.Vector3(-0.4, -0.5, 0),
      new THREE.Vector3(-1.8, -0.4, 0),
    ];
    const baseGeom = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(baselinePoints), 40, 0.18, 12, false);
    letterGroup.add(new THREE.Mesh(baseGeom, mainMaterial));

    // الألفات واللامات الصاعدة
    const alifX = [1.2, 0.4, -0.2, -1.0];
    alifX.forEach((x, idx) => {
      const height = 1.6 + (idx % 2) * 0.4;
      const alifPoints = [
        new THREE.Vector3(x, -0.5, 0),
        new THREE.Vector3(x + 0.05, height * 0.5, 0),
        new THREE.Vector3(x, height, 0),
      ];
      const alifGeom = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(alifPoints), 24, 0.13, 12, false);
      letterGroup.add(new THREE.Mesh(alifGeom, mainMaterial));

      // تروس علوي
      const tarwees = createCalligraphyDotMesh(lesson.penAngleDegrees, 0.3, 0.1, '#f59e0b');
      tarwees.position.set(x - 0.1, height + 0.1, 0);
      letterGroup.add(tarwees);
    });
  }

  rootGroup.add(letterGroup);

  // 2. ميزان النقاط (Rhombic Points Scale)
  if (showPointsScale) {
    const scaleGroup = new THREE.Group();
    scaleGroup.name = 'points-scale-group';

    const dotSize = 0.35;
    const dotSpacing = dotSize * 0.85;

    // عرض النقاط أفقياً
    const widthCount = Math.min(lesson.pointScale.widthDots, 6);
    for (let i = 0; i < widthCount; i++) {
      const dot = createCalligraphyDotMesh(lesson.penAngleDegrees, dotSize, 0.06, '#38bdf8');
      dot.position.set(-0.8 + i * dotSpacing, -0.3, 0.08);
      scaleGroup.add(dot);
    }

    // عمق النقاط رأسياً
    const heightCount = Math.min(lesson.pointScale.heightDots, 4);
    for (let j = 0; j < heightCount; j++) {
      const dot = createCalligraphyDotMesh(lesson.penAngleDegrees, dotSize, 0.06, '#f43f5e');
      dot.position.set(1.4, 0.8 - j * dotSpacing, 0.08);
      scaleGroup.add(dot);
    }

    // خط سطر الميزان
    const lineGeom = new THREE.CylinderGeometry(0.015, 0.015, 3.8, 8);
    lineGeom.rotateZ(Math.PI / 2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.6 });
    const baseline = new THREE.Mesh(lineGeom, lineMat);
    baseline.position.set(0, -0.5, 0);
    scaleGroup.add(baseline);

    rootGroup.add(scaleGroup);
  }

  // 3. قلم القصب وزاوية القطة (Reed Pen Model & Angle Gizmo)
  if (showPenAngle) {
    const penGroup = new THREE.Group();
    penGroup.name = 'pen-angle-group';

    // جسم القلم (Reed stalk)
    const stalkGeom = new THREE.CylinderGeometry(0.12, 0.14, 2.4, 16);
    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.6,
      metalness: 0.1,
    });
    const stalk = new THREE.Mesh(stalkGeom, stalkMat);
    stalk.position.set(0, 1.2, 0);
    penGroup.add(stalk);

    // سن القلم والقطة (Beveled Nib)
    const nibGeom = new THREE.ConeGeometry(0.14, 0.6, 16);
    const nibMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.4,
    });
    const nib = new THREE.Mesh(nibGeom, nibMat);
    nib.rotation.x = Math.PI;
    nib.position.set(0, -0.1, 0);
    penGroup.add(nib);

    // تدوير القلم حسب زاوية الدرس
    const angleRad = (lesson.penAngleDegrees * Math.PI) / 180;
    penGroup.rotation.z = Math.PI / 2 - angleRad;
    penGroup.position.set(1.7, 1.5, 0.3);
    penGroup.scale.set(0.6, 0.6, 0.6);

    rootGroup.add(penGroup);
  }

  return rootGroup;
}
