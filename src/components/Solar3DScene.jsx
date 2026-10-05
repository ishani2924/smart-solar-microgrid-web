import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const SolarPanel = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>

      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2, 0.1, 1.2]} />
        <meshStandardMaterial color="#1a202c" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh>
        <boxGeometry args={[1.9, 0.05, 1.1]} />
        <meshPhysicalMaterial
          color="#0ea5e9"
          metalness={0.9}
          roughness={0.1}
          transmission={0.5}
          thickness={0.5}
        />
      </mesh>

      <mesh position={[0, 0.03, 0]}>
        <planeGeometry args={[1.9, 1.1]} />
        <meshBasicMaterial color="#38bdf8" wireframe={true} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const House = ({ position }) => {
  return (
    <group position={position}>

      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.8, 1, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      <SolarPanel position={[0, 2.7, 1]} rotation={[Math.PI / 6, 0, 0]} />
    </group>
  );
};

const MicrogridStation = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 3, 8]} />
        <meshStandardMaterial color="#0f766e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <MeshDistortMaterial color="#2dd4bf" emissive="#14b8a6" emissiveIntensity={2} distort={0.3} speed={2} />
      </mesh>

      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
    </group>
  );
};

const EnergyParticles = () => {
  const particlesRef = useRef();
  const count = 50;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {

    positions[i * 3] = -2 + (Math.random() - 0.5) * 1;
    positions[i * 3 + 1] = 1 + Math.random() * 2;
    positions[i * 3 + 2] = -1 + (Math.random() - 0.5);
    phases[i] = Math.random() * Math.PI * 2;
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        positions[i3] += 0.02;
        if (positions[i3] > 3) {
          positions[i3] = -2 + (Math.random() - 0.5);
          positions[i3 + 1] = 1 + Math.random() * 2;
          positions[i3 + 2] = -1 + (Math.random() - 0.5);
        }

        positions[i3 + 1] += Math.sin(time * 3 + phases[i]) * 0.01;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#4ade80" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </points>
  );
};

const BatteryStorage = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.5, 1.5, 1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      <mesh position={[0.8, 0.75, 0.3]}>
        <boxGeometry args={[0.1, 1, 0.2]} />
        <meshBasicMaterial color="#2dd4bf" />
      </mesh>
      <mesh position={[0.8, 0.75, 0]}>
        <boxGeometry args={[0.1, 1, 0.2]} />
        <meshBasicMaterial color="#2dd4bf" />
      </mesh>
      <mesh position={[0.8, 0.75, -0.3]}>
        <boxGeometry args={[0.1, 1, 0.2]} />
        <meshBasicMaterial color="#2dd4bf" />
      </mesh>
    </group>
  );
};

export default function Solar3DScene() {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas camera={{ position: [6, 4, 8], fov: 45 }}>
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#2dd4bf" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={[0, -1, 0]}>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <circleGeometry args={[6, 64]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} />
            </mesh>

            <House position={[-2, 0, -1]} />
            <MicrogridStation position={[3, 0, 1]} />
            <BatteryStorage position={[1.5, 0, -2.5]} />

            <EnergyParticles />
          </group>
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 4}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
