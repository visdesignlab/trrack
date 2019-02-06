import { Provenance } from "../src/index";
import { ActionTemplate, RegisterActionTemplate } from "../src/index";

import "mocha";
import "assert";
import { expect, assert } from "chai";
import { IProvenanceGraph } from "../src/provenance-core/IProvenanceGraph";

describe("Testing Provenance Library", () => {
  const prov = Provenance();

  describe("check the provenance object", () => {
    describe("check for graph property", () => {
      it("should have graph as a function", () => {
        expect(prov)
          .to.have.property("graph")
          .which.is.a("Function");
      });
      const g = prov.graph();
      describe("testing return value of graph", () => {
        it("should be of type ProvenanceGraph", () => {
          assert.typeOf(g, "IProvenanceGraph");
        });
      });
    });

    describe("check for apply property", () => {
      it("should have apply as a function", () => {
        expect(prov)
          .to.have.property("apply")
          .which.is.a("Function");
      });
    });

    describe("check for register property", () => {
      it("should have register as a function", () => {
        expect(prov)
          .to.have.property("register")
          .which.is.a("Function");
      });
    });

    describe("check for to property", () => {
      it("should have to", () => {
        expect(prov)
          .to.have.property("to")
          .which.is.a("Function");
      });
    });

    describe("check for serialize property", () => {
      it("should have serialize", () => {
        expect(prov)
          .to.have.property("serialize")
          .which.is.a("Function");
      });
    });
  });
});
