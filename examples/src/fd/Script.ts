import * as d3 from "d3";
import * as ProvenanceLibrary from "@visdesignlab/provenance-lib-core/lib/src/index.js";
import { updateProv } from "./provenanceVis";
import{drawGraph} from "./FDGraph";
import{drawBar} from "./FDBar";

let graph = undefined;
let selectedNode = "";
let edgesMap = undefined;
let nodeMap = undefined;
let g = undefined;
let selectedColor = undefined;
let defaultColor = undefined;

d3.json("../miserables.json").then(function(graph) {

  let simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d:any) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(530 / 2, 610 / 2));

  console.log(nodeMap)

  drawGraph(graph, simulation);
  drawBar(graph, simulation);
});
