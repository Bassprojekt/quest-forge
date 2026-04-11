import { useState } from 'react';
import { useGameStore, CRAFTING_RECIPES, CraftingRecipe } from '@/store/gameStore';

interface Props {
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export const CraftingUI = ({ onClose }: Props) => {
  const inventory = useGameStore(s => s.inventory);
  const craftItem = useGameStore(s => s.craftItem);

  const filtered = CRAFTING_RECIPES.filter(r => r.type === 'potion');

  const canCraft = (recipe: CraftingRecipe) => {
    return recipe.ingredients.every(ing => {
      const mat = inventory.find(i => i.name === ing.name && i.type === 'material');
      return mat && mat.quantity >= ing.quantity;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
      style={{ fontFamily: "'Fredoka', sans-serif" }}
      data-crafting-open="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-md border-2 border-[#E0D5C0] rounded-2xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#9C27B0] font-bold text-lg">⚗️ Tränke Craften</h2>
          <button onClick={onClose} className="text-[#AAA] hover:text-[#333] text-xl">✕</button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map(recipe => (
            <div key={recipe.id}
              className="bg-[#F8F6F0] rounded-xl p-3 border border-[#E0D5C0] flex items-center justify-between"
              style={{ borderColor: RARITY_COLORS[recipe.rarity] + '60' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#333] text-sm font-bold">{recipe.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ color: RARITY_COLORS[recipe.rarity], background: RARITY_COLORS[recipe.rarity] + '20' }}>
                    {recipe.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="text-[#888] text-[10px]">{recipe.stat}</div>
                <div className="flex gap-1 mt-1">
                  {recipe.ingredients.map((ing, i) => {
                    const has = inventory.find(it => it.name === ing.name && it.type === 'material')?.quantity || 0;
                    const enough = has >= ing.quantity;
                    return (
                      <span key={i} className={`text-[9px] px-1 py-0.5 rounded ${enough ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ing.name}: {has}/{ing.quantity}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => craftItem(recipe.id)}
                disabled={!canCraft(recipe)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                  canCraft(recipe)
                    ? 'bg-[#FF9800] text-white hover:bg-[#F57C00]'
                    : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'
                }`}>
                CRAFTEN
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};