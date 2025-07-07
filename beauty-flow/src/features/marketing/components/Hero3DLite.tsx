import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float,
  useGLTF,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';

// Configuration optimisée pour les performances
const PERFORMANCE_CONFIG = {
  shadows: false, // Désactivé pour les performances
  starCount: 500, // Réduit de 5000
  particleCount: 30, // Réduit de 150
  reflectionResolution: 512, // Réduit de 2048
  dpr: [1, 1.5], // Limité à 1.5 max
};

// Logo 3D simplifié
function SimpleLogo3D({ modelUrl }: { modelUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  // Version simplifiée sans modèle GLB
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.3}>
      <group ref={groupRef}>
        <mesh
          scale={hovered ? 1.1 : 1}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <torusGeometry args={[1, 0.4, 8, 50]} />
          <meshStandardMaterial 
            color={hovered ? "#06B6D4" : "#4F46E5"}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Dashboard simplifié
function SimpleDashboard() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[3, 0, -2]}>
      <mesh>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial 
          color="#1E293B"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color="#06B6D4" opacity={0.6} transparent />
      </mesh>
    </group>
  );
}

// Sol simple sans réflexion
function SimpleFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow={false}>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial 
        color="#0a0a0a"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Composant principal optimisé
interface Hero3DLiteProps {
  logoModelUrl?: string;
  quality?: 'low' | 'medium' | 'high';
}

export const Hero3DLite: React.FC<Hero3DLiteProps> = ({ logoModelUrl, quality = 'medium' }) => {
  const [mounted, setMounted] = useState(false);
  
  // Progressive enhancement
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder CSS pendant le chargement
    return (
      <div className="hero-3d-placeholder" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="loading-spinner" style={{
          width: '60px',
          height: '60px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #4F46E5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Configuration selon la qualité
  const config = {
    low: { stars: 200, dpr: [1, 1] as [number, number] },
    medium: { stars: 500, dpr: [1, 1.5] as [number, number] },
    high: { stars: 1000, dpr: [1, 2] as [number, number] }
  }[quality];

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
        shadows={false}
        dpr={config.dpr}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        camera={{ position: [0, 2, 8], fov: 50 }}
      >
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          enableDamping
          dampingFactor={0.05}
        />
        
        {/* Éclairage simplifié */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow={false}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#06B6D4" />

        <fog attach="fog" args={['#0a0a0a', 8, 25]} />
        
        <Suspense fallback={null}>
          {/* Logo 3D central */}
          <SimpleLogo3D modelUrl={logoModelUrl} />
          
          {/* Dashboard flottant */}
          <SimpleDashboard />
          
          {/* Sol simple */}
          <SimpleFloor />
          
          {/* Étoiles optimisées */}
          <Stars
            radius={50}
            depth={30}
            count={config.stars}
            factor={3}
            saturation={0}
            fade
            speed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Export de la version complète pour lazy loading
export const Hero3DFull = React.lazy(() => import('./Hero3D').then(module => ({ 
  default: module.Hero3D 
})));
