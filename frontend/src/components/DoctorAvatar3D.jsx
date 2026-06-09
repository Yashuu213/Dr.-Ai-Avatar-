import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Use the local downloaded Humanoid GLB
const MODEL_URL = "/models/doctor.glb";
const AvatarModel = ({ isTalking, url }) => {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, groupRef);

  React.useEffect(() => {
    // Avaturn uses 'gesture_1' or similar for its default animation
    const animName = actions['gesture_1'] ? 'gesture_1' : (actions['Idle'] ? 'Idle' : Object.keys(actions)[0]);
    if (animName && actions[animName]) {
      actions[animName].reset().fadeIn(0.5).play();
    }
    
    return () => {
      if (animName && actions[animName]) actions[animName].fadeOut(0.5);
    };
  }, [actions]);

  React.useEffect(() => {
    const defaultAnim = actions['gesture_1'] ? 'gesture_1' : (actions['Idle'] ? 'Idle' : Object.keys(actions)[0]);
    const talkingAnim = actions['Yes'] ? 'Yes' : defaultAnim;
    
    if (isTalking && actions[talkingAnim] && talkingAnim !== defaultAnim) {
      if (actions[defaultAnim]) actions[defaultAnim].fadeOut(0.5);
      actions[talkingAnim].reset().fadeIn(0.5).play();
    } else if (!isTalking && actions[talkingAnim] && actions[defaultAnim] && talkingAnim !== defaultAnim) {
      actions[talkingAnim].fadeOut(0.5);
      actions[defaultAnim].reset().fadeIn(0.5).play();
    }
  }, [isTalking, actions]);

  React.useEffect(() => {
    // Fix T-Pose programmatically by rotating the arm bones down
    scene.traverse((child) => {
      if (child.isBone) {
        // Lower arms to a natural resting position
        if (child.name.includes('LeftArm')) {
          child.rotation.z = -1.2;
        }
        if (child.name.includes('RightArm')) {
          child.rotation.z = 1.2;
        }
        // Slightly lower shoulders
        if (child.name.includes('LeftShoulder')) {
          child.rotation.z = -0.2;
        }
        if (child.name.includes('RightShoulder')) {
          child.rotation.z = 0.2;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    // Keep the backup lip-sync logic just in case the user later adds a real ReadyPlayerMe/Avaturn human
    let headRef = null;
    scene.traverse((child) => {
      // Check if child has morph targets, Avaturn and RPM usually have them on the Head mesh
      if (child.isMesh && child.morphTargetDictionary && 
         (child.morphTargetDictionary['jawOpen'] !== undefined || child.morphTargetDictionary['mouthOpen'] !== undefined)) {
        headRef = child;
      }
    });

    if (headRef && headRef.morphTargetInfluences) {
      const morphDict = headRef.morphTargetDictionary;
      const influences = headRef.morphTargetInfluences;
      
      const targetMouthOpen = isTalking ? (Math.random() * 0.5 + 0.1) : 0;
      
      // Handle both RPM (mouthOpen) and Avaturn/ARKit (jawOpen) securely
      const jawIndex = morphDict['jawOpen'];
      const mouthIndex = morphDict['mouthOpen'];
      
      const currentMouthOpen = (mouthIndex !== undefined ? influences[mouthIndex] : (jawIndex !== undefined ? influences[jawIndex] : 0));
      const nextMouthOpen = THREE.MathUtils.lerp(currentMouthOpen, targetMouthOpen, delta * 15);
      
      if (mouthIndex !== undefined) influences[mouthIndex] = nextMouthOpen;
      if (jawIndex !== undefined) influences[jawIndex] = nextMouthOpen * 0.8; // Avaturn relies heavily on jawOpen
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.8, 0]}>
      <primitive object={scene} scale={1.2} />
    </group>
  );
};

// Preload to prevent suspense lag
useGLTF.preload(MODEL_URL);

const DoctorAvatar3D = ({ isTalking }) => {
  return (
    <div className="w-full h-full min-h-[400px] relative rounded-3xl overflow-hidden glass shadow-2xl border border-white/50 bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <React.Suspense fallback={null}>
          <AvatarModel isTalking={isTalking} url={MODEL_URL} />
          <Environment preset="city" />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} far={4} />
        </React.Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 2} 
        />
      </Canvas>

      {/* Status Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 glass rounded-full text-xs font-mono font-bold tracking-widest text-white border border-white/40 flex items-center gap-2 z-10 shadow-lg">
        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${isTalking ? 'bg-blue-400 animate-ping text-blue-400' : 'bg-green-400 text-green-400'}`} />
        {isTalking ? "ANALYZING & SPEAKING" : "LISTENING & MONITORING"}
      </div>
    </div>
  );
};

export default DoctorAvatar3D;
