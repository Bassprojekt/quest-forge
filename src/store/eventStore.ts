import { create } from 'zustand';

export type EventType = 'easter' | 'halloween' | 'christmas' | 'summer' | 'none';

interface EventConfig {
  type: EventType;
  name: string;
  icon: string;
  startMonth: number;
  endMonth: number;
  bonusMultiplier: number;
  specialItems: { name: string; icon: string; price: number }[];
}

const EVENT_CONFIGS: EventConfig[] = [
  {
    type: 'easter',
    name: 'Oster-Event',
    icon: '🥚',
    startMonth: 3,
    endMonth: 4,
    bonusMultiplier: 1.5,
    specialItems: [
      { name: 'Osterkorb', icon: '🧺', price: 500 },
      { name: 'Osterhase Pet', icon: '🐰', price: 2000 },
    ],
  },
  {
    type: 'halloween',
    name: 'Halloween-Event',
    icon: '🎃',
    startMonth: 10,
    endMonth: 10,
    bonusMultiplier: 2.0,
    specialItems: [
      { name: 'Kürbis-Laterne', icon: '🎃', price: 300 },
      { name: 'Vampir Umhang', icon: '🧛', price: 1500 },
      { name: 'Geister Pet', icon: '👻', price: 3000 },
    ],
  },
  {
    type: 'christmas',
    name: 'Weihnachts-Event',
    icon: '🎄',
    startMonth: 12,
    endMonth: 12,
    bonusMultiplier: 2.0,
    specialItems: [
      { name: 'Weihnachtsmütze', icon: '🎅', price: 400 },
      { name: 'Geschenk', icon: '🎁', price: 100 },
      { name: 'Rentier Pet', icon: '🦌', price: 2500 },
    ],
  },
  {
    type: 'summer',
    name: 'Sommer-Event',
    icon: '☀️',
    startMonth: 6,
    endMonth: 8,
    bonusMultiplier: 1.25,
    specialItems: [
      { name: 'Sonnenbrille', icon: '🕶️', price: 250 },
      { name: 'Strandball', icon: '🏖️', price: 150 },
    ],
  },
];

const DEBUG_FORCE_EVENT: EventType | null = null; // Set to 'easter', 'halloween', etc. to force an event

function getCurrentEvent(): EventConfig | null {
  if (DEBUG_FORCE_EVENT) {
    return EVENT_CONFIGS.find(e => e.type === DEBUG_FORCE_EVENT) || null;
  }
  
  const month = new Date().getMonth() + 1;
  
  for (const event of EVENT_CONFIGS) {
    if (month >= event.startMonth && month <= event.endMonth) {
      return event;
    }
  }
  return null;
}

interface EventState {
  currentEvent: EventConfig | null;
  eventXpBonus: number;
  eventGoldBonus: number;
  collectedEventItems: string[];
  
  checkEvent: () => void;
  collectEventItem: (itemName: string) => void;
  getEventMultiplier: () => number;
  isEventItem: (itemName: string) => boolean;
}

export const useEventStore = create<EventState>((set, get) => ({
currentEvent: null,
    eventXpBonus: 1,
    eventGoldBonus: 1,
    collectedEventItems: [],
    
    checkEvent: () => {
      const event = getCurrentEvent();
      if (event) {
        set({
          currentEvent: event,
          eventXpBonus: event.bonusMultiplier,
          eventGoldBonus: event.bonusMultiplier,
        });
      } else {
      set({
        currentEvent: null,
        eventXpBonus: 1,
        eventGoldBonus: 1,
      });
    }
  },
  
  collectEventItem: (itemName: string) => {
    const state = get();
    if (!state.collectedEventItems.includes(itemName)) {
      set({
        collectedEventItems: [...state.collectedEventItems, itemName],
      });
    }
  },
  
  getEventMultiplier: () => {
    return get().eventXpBonus;
  },
  
  isEventItem: (itemName: string) => {
    return EVENT_CONFIGS.some(e => 
      e.specialItems.some(i => i.name === itemName)
    );
  },
}));

export { EVENT_CONFIGS };
export type { EventConfig };