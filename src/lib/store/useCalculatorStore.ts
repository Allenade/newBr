import { create } from "zustand";

interface CalculatorState {
  hashingPower: string;
  hashUnit: string;
  poolFees: string;
  btcPrice: string;
  maintenance: string;
  hardwareCost: string;
  powerUsage: string;
  blockReward: string;
  powerCost: string;
  difficulty: string;
  updateHashingPower: (value: string) => void;
  updateHashUnit: (value: string) => void;
  updatePoolFees: (value: string) => void;
  updateBtcPrice: (value: string) => void;
  updateMaintenance: (value: string) => void;
  updateHardwareCost: (value: string) => void;
  updatePowerUsage: (value: string) => void;
  updateBlockReward: (value: string) => void;
  updatePowerCost: (value: string) => void;
  resetCalculator: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  hashingPower: "100",
  hashUnit: "GH/s",
  poolFees: "0",
  btcPrice: "82534.00",
  maintenance: "0",
  hardwareCost: "0",
  powerUsage: "0",
  blockReward: "12.5",
  powerCost: "0.11",
  difficulty: "1.1375750881085E+14",

  updateHashingPower: (value: string) => set({ hashingPower: value }),
  updateHashUnit: (value: string) => set({ hashUnit: value }),
  updatePoolFees: (value: string) => set({ poolFees: value }),
  updateBtcPrice: (value: string) => set({ btcPrice: value }),
  updateMaintenance: (value: string) => set({ maintenance: value }),
  updateHardwareCost: (value: string) => set({ hardwareCost: value }),
  updatePowerUsage: (value: string) => set({ powerUsage: value }),
  updateBlockReward: (value: string) => set({ blockReward: value }),
  updatePowerCost: (value: string) => set({ powerCost: value }),
  resetCalculator: () =>
    set({
      hashingPower: "100",
      hashUnit: "GH/s",
      poolFees: "0",
      btcPrice: "82534.00",
      maintenance: "0",
      hardwareCost: "0",
      powerUsage: "0",
      blockReward: "12.5",
      powerCost: "0.11",
      difficulty: "1.1375750881085E+14",
    }),
}));
