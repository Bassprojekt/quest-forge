import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';

export const DamageNumbers = () => {
  const popups = useGameStore(s => s.damagePopups);

  return (
    <>
      {popups.map(popup => (
        <DamageNumber key={popup.id} popup={popup} />
      ))}
    </>
  );
};

const COLORS = {
  damage: '#FF4444',
  crit: '#FF8800',
  heal: '#44CC44',
  xp: '#FFD700',
  gold: '#FF9800',
  gem: '#E040FB',
};

const PREFIXES = {
  damage: '-',
  crit: '💥 ',
  heal: '+',
  xp: '+',
  gold: '+',
  gem: '+',
};

const SUFFIXES = {
  damage: '',
  crit: '',
  heal: ' HP',
  xp: ' XP',
  gold: ' 💰',
  gem: ' 💎',
};

interface DamageNumberProps {
  popup: { id: string; position: [number, number, number]; amount: number; type: 'damage' | 'heal' | 'xp' | 'gold' | 'crit' | 'gem'; timestamp: number };
}

const DamageNumber = ({ popup }: DamageNumberProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const yOffset = useRef(0);
  const opacity = useRef(1);

  useFrame((_, delta) => {
    yOffset.current += delta * 1.5;
    opacity.current = Math.max(0, 1 - (Date.now() - popup.timestamp) / 1200);
    if (ref.current) {
      ref.current.style.transform = `translateY(${-yOffset.current * 40}px)`;
      ref.current.style.opacity = `${opacity.current}`;
    }
  });

  const typeIndex = popup.type === 'xp' ? 0.3 : popup.type === 'gold' ? 0.6 : popup.type === 'gem' ? 0.9 : 0;

  return (
    <group position={[popup.position[0] + typeIndex, popup.position[1] + 1.5, popup.position[2]]}>
      <Html center>
        <div ref={ref} style={{
          color: COLORS[popup.type],
          fontSize: popup.type === 'crit' ? 26 : 18,
          fontWeight: 900,
          fontFamily: "'Fredoka', sans-serif",
          textShadow: `
            0 0 10px ${COLORS[popup.type]},
            0 0 20px ${COLORS[popup.type]}80,
            0 0 30px ${COLORS[popup.type]}40,
            0 2px 4px rgba(0,0,0,0.8)
          `,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          padding: '2px 6px',
          borderRadius: '4px',
          background: 'rgba(0,0,0,0.5)',
        }}>
          {PREFIXES[popup.type]}{popup.amount}{SUFFIXES[popup.type]}
        </div>
      </Html>
    </group>
  );
};
