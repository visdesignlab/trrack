import { Provenance } from "../src/provenance-core/ProvenanceCore";

export interface CalcState {
  count: {
    count2: {
      count3: number;
      count4: number;
    };
  };
}

export const initCalcState: CalcState = {
  count: {
    count2: {
      count3: 0,
      count4: 1
    }
  }
};

export function Calculator(provenance: Provenance<CalcState>) {
  return {
    currentState: () => provenance.graph().current.state
  };
}
