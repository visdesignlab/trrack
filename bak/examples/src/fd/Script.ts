import * as d3 from "d3";
import * as ProvenanceLibrary from "../../../../dist/types/index";
import Bars from "./FDBar"
import Graph from "./FDGraph"

function CreateApp(provenance: ProvenanceLibrary.Provenance<NodeState>) {
  return {
    currentState: () => provenance.graph().current.state
  };
}

//Interface to represent the state of the vis
export interface NodeState {
  nodes: {
    nodeMap: {};
    selectedNode:string;
  }
};

//Initial, empty state
const initialState: NodeState = {
  nodes: {
    nodeMap: {},
    selectedNode: 'none'
  }
}

d3.json("../miserables.json").then(graph => {

  let simulation = runSimulation(graph);

  let currProv = setupProvenance();

  let provenance = currProv[0] as ProvenanceLibrary.Provenance<NodeState>;
  let app = currProv[1] as {currentState: () => NodeState;};


  /**
  * Callback function called when either a bar or a node is hovered over.
  */
  let hoverOver = function(currData){
    if(currData.id){
      barVis.hoverBar(currData.id);
      graphVis.hoverNode(currData.id);
    }
    else{
      barVis.hoverBar(currData);
      graphVis.hoverNode(currData);
    }
  }

  /**
  * Callback function called when either a bar or a node is no longer being hovered.
  */
  let hoverOut = function(){
    barVis.dehoverBars();
    graphVis.dehoverNodes();
  }

  /**
  * Callback function called when either a bar or a node is selected. Updates provenance.
  */
  let select = function(currData){
    provenance.applyAction({
      label: currData.id ? currData.id : currData + " Selected",
      action: (id:string) => {
        const test = (app.currentState() as any) as NodeState;
        test.nodes.selectedNode = id;
        return test;
      },
      args: [currData.id ? currData.id : currData]
    });
  }

  /**
  * Callback function called when a node is dragged. Updates provenance.
  */
  let dragEnded = function(d){
    provenance.applyAction({
      label: d.id + " Moved",
      action: (id:string) => {
        const test = (app.currentState() as any) as NodeState;
        test.nodes.nodeMap[d.id][0] = d.x;
        test.nodes.nodeMap[d.id][1] = d.y;
        return test;
      },
      args: [d.id]
    });
  }

  /**
  * Sets the state of the application to that of the given provenance node.
  */
  let setState = function(d){
    let newGraph = provenance.graph().current.state.nodes.nodeMap

    for(let i of graph.nodes){
      i.x = newGraph[i.id][0];
      i.y = newGraph[i.id][1];
    }

    for(let i of graph.links){
      i.source.x = newGraph[i.source.id][0];
      i.source.y = newGraph[i.source.id][1];
      i.target.x = newGraph[i.target.id][0];
      i.target.y = newGraph[i.target.id][1];
    }
    //
    graphVis.graph = graph;
    graphVis.drawGraph();
    //
    let currSelected = provenance.graph().current.state.nodes.selectedNode;
    //
    graphVis.deselectAllNodes();
    barVis.deselectAllBars();

    if(currSelected != "none"){
      graphVis.selectNode(currSelected);
      barVis.selectBar(currSelected);
    }
  }

  initializeProvenanceState(graph, provenance, app, setState);

  const barVis = new Bars(graph, hoverOver, hoverOut, select);
  const graphVis = new Graph(graph, hoverOver, hoverOut, select, dragEnded);

  // When a node is selected, the observer will be called and will update both views.
  provenance.addObserver("nodes.selectedNode", () => {
    barVis.selectBar(provenance.graph().current.state.nodes.selectedNode);
    graphVis.selectNode(provenance.graph().current.state.nodes.selectedNode);
  });

  // Set up undo/redo keybindings
  document.onkeydown = function(e){
    var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    console.log(mac);

    if(!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
      undo(e);
    }
    else if(e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
      redo(e);
    }
  }

  document.getElementById("undoButton").addEventListener("click", undo);
  document.getElementById("redoButton").addEventListener("click", redo);


  /**
  * Function called on undo. Updates provenance and changes state.
  */
  function undo(e){
    provenance.goBackOneStep();
    setState(provenance.graph().current);
  }

  /**
  * Function called on redo. Updates provenance and changes state.
  */
  function redo(e){
    if(provenance.graph().current.children.length == 0){
      return;
    }
    provenance.goToNode(provenance.graph().current.children[provenance.graph().current.children.length - 1])
    setState(provenance.graph().current);
  }
});

/**
* Initialize provenance library, return provenance object and app to access current.
*/
function setupProvenance(){
  const provenance = ProvenanceLibrary.initProvenance(initialState);

  const app = CreateApp(provenance);

  return [provenance, app];
}

/**
* Runs the force directed simulation 300 times to calculate initial position.
*/
function runSimulation(graph){
  let simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d:any) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(530 / 2, 610 / 2));

  simulation
      .nodes(graph.nodes);

  simulation.force<d3.ForceLink<any, any>>('link').links(graph.links);

  for(let i = 0; i < 300; i++){
    simulation.tick();
  }

  return simulation;
}

/**
* Once given initial positions, create the provenance state at those positions.
*/
function initializeProvenanceState(graph, provenance, app, setState) {
    var dict = {}
    let arr:any[] = graph.nodes;

    for (let i = 0; i < arr.length; i++)
    {
      let curr = arr[i].id
      dict[curr]  = [arr[i].x, arr[i].y]
    }

    provenance.applyAction({
      label: "Nodes Placed",
      action: (dict:{}) => {
        const test = (app.currentState() as any) as NodeState;
        test.nodes.nodeMap = dict;
        return test;
      },
      args: [dict]
    });
}
