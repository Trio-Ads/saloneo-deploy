import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Float,
  Text3D,
  Center,
  useGLTF,
  MeshReflectorMaterial,
  Sparkles,
  Stars,
  Box,
  Sphere
} from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Composant pour le logo 3D animé
function Logo3D({ modelUrl }: { modelUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  // Si on a un modèle GLB, on l'utilise
  if (modelUrl) {
    const { scene } = useGLTF(modelUrl);
    return (
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <primitive 
          ref={groupRef}
          object={scene} 
          scale={hovered ? 1.2 : 1}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        />
      </Float>
    );
  }

  // Sinon, on crée un logo 3D procédural
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Logo S stylisé en 3D */}
        <mesh
          scale={hovered ? 1.2 : 1}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <torusGeometry args={[1, 0.4, 16, 100]} />
          <meshStandardMaterial 
            color={hovered ? "#06B6D4" : "#4F46E5"}
            metalness={0.8}
            roughness={0.2}
            emissive={hovered ? "#06B6D4" : "#4F46E5"}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.3, 2, 0.3]} />
          <meshStandardMaterial 
            color={hovered ? "#06B6D4" : "#4F46E5"}
            metalness={0.8}
            roughness={0.2}
            emissive={hovered ? "#06B6D4" : "#4F46E5"}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Dashboard flottant 3D
function FloatingDashboard() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[3, 0, -2]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Écran principal */}
      <mesh scale={hovered ? 1.05 : 1}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial 
          color="#1E293B"
          metalness={0.9}
          roughness={0.1}
          emissive="#4F46E5"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Contenu de l'écran */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color="#06B6D4" opacity={0.8} transparent />
      </mesh>

      {/* Graphiques flottants */}
      <Float speed={2} floatIntensity={0.3}>
        <mesh position={[1.5, 0.5, 0.5]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color="#06B6D4"
            metalness={0.5}
            roughness={0.3}
            emissive="#06B6D4"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Particules animées
function AnimatedParticles() {
  return (
    <>
      <Sparkles
        count={100}
        scale={10}
        size={2}
        speed={0.5}
        opacity={0.5}
        color="#4F46E5"
      />
      <Sparkles
        count={50}
        scale={10}
        size={3}
        speed={0.3}
        opacity={0.3}
        color="#06B6D4"
      />
    </>
  );
}

// Sol réfléchissant
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        mirror={0}
        blur={[300, 100]}
        resolution={2048}
        mixBlur={1}
        mixStrength={50}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.5}
      />
    </mesh>
  );
}

// Animation de la caméra
function CameraAnimation() {
  const { camera } = useThree();
  
  useEffect(() => {
    gsap.to(camera.position, {
      x: 5,
      y: 3,
      z: 5,
      duration: 2,
      ease: "power2.inOut"
    });
  }, [camera]);

  return null;
}

// Composant principal Hero 3D
interface Hero3DProps {
  logoModelUrl?: string;
}

export const Hero3D: React.FC<Hero3DProps> = ({ logoModelUrl }) => {
  return (
    <div className="hero-3d-container" style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1
    }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
        
        {/* Éclairage */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#06B6D4" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />

        {/* Environnement */}
        <Environment preset="city" />
        <fog attach="fog" args={['#0a0a0a', 5, 30]} />
        
        <Suspense fallback={null}>
          {/* Logo 3D central */}
          <Logo3D modelUrl={logoModelUrl} />
          
          {/* Dashboard flottant */}
          <FloatingDashboard />
          
          {/* Sol réfléchissant */}
          <ReflectiveFloor />
          
          {/* Particules */}
          <AnimatedParticles />
          
          {/* Étoiles */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        </Suspense>

        <CameraAnimation />
      </Canvas>
    </div>
  );
};

// Préchargement des modèles
export function preloadModels(modelUrls: string[]) {
  modelUrls.forEach(url => {
    if (url) useGLTF.preload(url);
  });
}
