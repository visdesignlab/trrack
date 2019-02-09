import { expect } from "./expect";
import { Provenance } from "../src";

import * as util from "util";
import { StateNode } from "../src/provenance-core/Nodes";

const provenance = Provenance("" as any);

console.log("Pregraph", provenance.graph());

provenance.apply("" as any, true);
provenance.apply("" as any, true);
provenance.apply("" as any, true);
provenance.apply("" as any, true);

console.log(
  "Latest ######################################################3",
  "\n",
  util.inspect(provenance.graph(), false, null, true)
);

provenance.goto(provenance.graph().root.id);

console.log(
  "Latest ########################################################################################################################################################################",
  "\n",
  util.inspect(provenance.graph(), false, null, true)
);
