import { useSkillTreeStore } from '@/store/skillTreeStore';

interface Props {
  onClose: () => void;
}

export const SkillTreeUI = ({ onClose }: Props) => {
  const { skillPoints, nodes, upgradeNode, resetTree } = useSkillTreeStore();
  const categories = ['offense', 'defense', 'utility'] as const;
  const catNames = { offense: '⚔️ Angriff', defense: '🛡️ Verteidigung', utility: '🔧 Nützlich' };
  const catColors = { offense: '#F44336', defense: '#4169E1', utility: '#FF9800' };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ background: 'rgba(0,0,0,0.6)', fontFamily: "'Fredoka', sans-serif" }}>
      <div className="bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-5 max-w-[700px] w-full mx-4 max-h-[80vh] overflow-auto"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black text-[#333]">🌳 Skill-Baum</h2>
            <div className="text-sm font-bold text-[#FF9800]">✨ {skillPoints} Punkte verfügbar</div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetTree}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFF3E0] text-[#FF9800] border border-[#FFE0B2] hover:bg-[#FFE0B2]">
              🔄 Reset
            </button>
            <button onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFCDD2] text-[#F44336] hover:bg-[#EF9A9A]">
              ✕ Schließen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat} className="space-y-2">
              <div className="text-center text-sm font-bold py-1 rounded-lg"
                style={{ background: `${catColors[cat]}15`, color: catColors[cat] }}>
                {catNames[cat]}
              </div>
              {nodes.filter(n => n.category === cat).map(node => {
                const canUpgrade = node.currentLevel < node.maxLevel && skillPoints >= node.cost
                  && (!node.requires || nodes.find(n => n.id === node.requires)!.currentLevel > 0);
                const isMaxed = node.currentLevel >= node.maxLevel;
                return (
                  <button key={node.id}
                    onClick={() => upgradeNode(node.id)}
                    disabled={!canUpgrade}
                    className={`w-full p-2.5 rounded-xl border-2 text-left transition-all ${
                      isMaxed ? 'border-[#FFD700] bg-[#FFFDE7]' :
                      canUpgrade ? 'border-[#4CAF50] bg-[#E8F5E9] hover:bg-[#C8E6C9] cursor-pointer' :
                      'border-[#E0E0E0] bg-[#F5F5F5] opacity-60'
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{node.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-[#333] truncate">{node.name}</div>
                        <div className="text-[9px] text-[#888]">{node.effect}</div>
                      </div>
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isMaxed ? 'bg-[#FFD700] text-white' : 'bg-[#E0E0E0] text-[#666]'
                      }`}>
                        {node.currentLevel}/{node.maxLevel}
                      </div>
                    </div>
                    {!isMaxed && (
                      <div className="mt-1 text-[8px] text-[#999]">Kosten: {node.cost} SP</div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
