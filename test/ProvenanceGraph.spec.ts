import { expect } from "./expect";
import { Provenance } from "../src";

import * as util from "util";

const provenance = Provenance("" as any);

provenance.apply("" as any, true);
provenance.apply("" as any, true);
provenance.apply("" as any, true);

console.log(
  "Latest",
  "\n",
  util.inspect(provenance.graph(), false, null, true)
);
