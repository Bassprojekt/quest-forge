import { useState, useRef } from 'react';

const COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#000000', '#FFFFFF', '#808080', '#008000',
];

const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'shield'];

interface LogoConfig {
  bgColor: string;
  shape1: string;
  shape1Color: string;
  shape2: string;
  shape2Color: string;
  text: string;
  textColor: string;
}

interface Props {
  onSelect: (logoUrl: string, config: LogoConfig) => void;
  onClose: () => void;
}

export const GuildLogoEditor = ({ onSelect, onClose }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<LogoConfig>({
    bgColor: '#1a1a2e',
    shape1: 'shield',
    shape1Color: '#FFD700',
    shape2: 'circle',
    shape2Color: '#FFFFFF',
    text: '',
    textColor: '#FFFFFF',
  });

  const drawLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, size, size);

    const drawShape = (shape: string, color: string, x: number, y: number, r: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      if (shape === 'circle') {
        ctx.arc(x, y, r, 0, Math.PI * 2);
      } else if (shape === 'square') {
        ctx.rect(x - r, y - r, r * 2, r * 2);
      } else if (shape === 'triangle') {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.lineTo(x - r, y + r);
        ctx.closePath();
      } else if (shape === 'star') {
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = x + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (shape === 'diamond') {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
      } else if (shape === 'shield') {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y - r * 0.5);
        ctx.lineTo(x + r, y + r * 0.3);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y + r * 0.3);
        ctx.lineTo(x - r, y - r * 0.5);
        ctx.closePath();
      }
      ctx.fill();
    };

    drawShape(config.shape2, config.shape2Color + '40', size / 2, size / 2, 60);
    drawShape(config.shape1, config.shape1Color, size / 2, size / 2, 40);

    if (config.text) {
      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 24px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(config.text.substring(0, 3).toUpperCase(), size / 2, size / 2 + 8);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSelect(dataUrl, config);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1a2e] border-2 border-[#FFD700] rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-[#FFD700] font-bold text-xl mb-4 text-center">🎨 Gilden-Logo erstellen</h3>
        
        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} width={200} height={200} className="border-2 border-[#FFD700] rounded-lg" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/80 text-sm">Hintergrund</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setConfig({ ...config, bgColor: c })}
                  className={`w-8 h-8 rounded border-2 ${config.bgColor === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/80 text-sm">Haupt-Shape</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {SHAPES.map(s => (
                <button
                  key={s}
                  onClick={() => setConfig({ ...config, shape1: s })}
                  className={`px-3 py-1 rounded text-sm ${
                    config.shape1 === s ? 'bg-[#FFD700] text-black' : 'bg-white/20 text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setConfig({ ...config, shape1Color: c })}
                  className={`w-8 h-8 rounded border-2 ${config.shape1Color === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/80 text-sm">Kürzel (3 Buchstaben)</label>
            <input
              type="text"
              maxLength={3}
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value.toUpperCase() })}
              className="w-full mt-1 px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:border-[#FFD700] outline-none"
              placeholder="ABC"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={drawLogo}
            className="flex-1 px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30 transition"
          >
            Vorschau
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-red-500/80 text-white rounded hover:bg-red-500 transition"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-[#FFC000] transition font-bold"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};