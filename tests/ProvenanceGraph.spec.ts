import { Provenance } from "../src/provenance";
import {
  ActionTemplate,
  RegisterActionTemplate
} from "../src/provenance-core/Actions";

import "mocha";
import "assert";
import { expect } from "chai";

describe("Hello Function", () => {
  it("should return hello world", () => {
    const result = "hello world";
    expect(result).to.equal("hello world");
  });
});
