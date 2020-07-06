import
{
  initProvenance,
  ProvenanceGraph,
  Provenance,
  ActionFunction,
  SubscriberFunction,
  NodeMetadata,
  NodeID,
  Diff,
  RootNode,
  StateNode,
  ProvenanceNode,
  isStateNode,
  Nodes,
  CurrentNode,
  Artifacts,
  Extra
} from '../../../src/index';
import Scatterplot from "./scatterplot"

import ReactDOM from 'react-dom'
import * as d3 from "d3"

import { ProvVis, EventConfig, Config, ProvVisConfig, ProvVisCreator, UndoRedoButtonCreator } from '../ProvVis/provvis';


/**
* interface representing the state of the application
*/
export interface NodeState {
  selectedQuartet:string;
  selectedNode:string;
  hoveredNode:string;
};

export interface NodeExtra {
  nodeNum: number;
  nodeX: number;
  nodeY: number;
};

/**
* Initial state
*/

const initialState: NodeState = {
  selectedQuartet: 'I',
  selectedNode: 'none',
  hoveredNode: 'none'
}

type EventTypes = "Change Quartet" | "Select Node" | "Hover Node"


//initialize provenance with the first state
let prov = initProvenance<NodeState, EventTypes, NodeExtra>(initialState, false);

//Set up apply action functions for each of the 3 actions that affect state

/**
* Function called when the quartet number is changed. Applies an action to provenance.
* This is a complex action, meaning it always stores a state node.
*/

let changeQuartetUpdate = function(newQuartet: string){
  //create prov Object

  let action = prov.addAction(
    "Quartet " + newQuartet + " Selected",
    (state:NodeState) => {
      state.selectedQuartet = newQuartet;
      return state;
    }
  )

  action
    .addEventType("Change Quartet")
    .alwaysStoreState(true)
    .applyAction();
}

/**
* Function called when a node is selected. Applies an action to provenance.
*/

let selectNodeUpdate = function(selectedNode: number, x:number, y:number){
  let action = prov.addAction(
    "node_" + selectedNode + " Selected",
    (state:NodeState) => {
      state.selectedNode = "node_" + selectedNode;
      return state;
    }
  )

  action
    .addExtra({
      nodeNum: selectedNode,
      nodeX: x,
      nodeY: y
    })
    .addEventType("Select Node")
    .applyAction();
}

/**
* Function called when a node is hovered. Applies an action to provenance.
*/

let hoverNodeUpdate = function(newHover: string){
  let action = prov.addAction(
    newHover === "" ? "Hover Removed" : newHover + " Hovered",
    (state:NodeState) => {
      state.hoveredNode = newHover;
      return state;
    }
  )

  action
    .addEventType("Hover Node")
    .applyAction();
}

// Create our scatterplot class which handles the actual vis. Pass it our three action functions
// so it can use them when appropriate.
let scatterplot = new Scatterplot(changeQuartetUpdate, selectNodeUpdate, hoverNodeUpdate);

//Create function to pass to the ProvVis library for when a node is selected in the graph.
//For our purposes, were simply going to jump to the selected node.
let visCallback = function(newNode:NodeID)
{
  prov.goToNode(newNode);

  //Incase the state doesn't change and the observers arent called, updating the ProvVis here.
  provVisUpdate()
}

// Set up observers for the three keys in state. These observers will get called either when an applyAction
// function changes the associated keys value.

// Also will be called when an internal graph change such as goBackNSteps, goBackOneStep or goToNode
// change the keys value.

/**
* Observer for when the quartet state is changed. Calls changeQuartet in scatterplot to update vis.
*/
prov.addObserver(["selectedQuartet"], () => {
  scatterplot.changeQuartet(prov.current().getState().selectedQuartet);

  provVisUpdate()

});

/**
* Observer for when the selected node state is changed. Calls selectNode in scatterplot to update vis.
*/
prov.addObserver(["selectedNode"], () => {
  scatterplot.selectNode(prov.current().getState().selectedNode);

  provVisUpdate()

});

/**
* Observer for when the hovered node state is changed. Calls hoverNode in scatterplot to update vis.
*/
prov.addObserver(["hoveredNode"], () => {
  scatterplot.hoverNode(prov.current().getState().hoveredNode);

  provVisUpdate()
  console.log(prov.graph())
});

//Setup ProvVis once initially
provVisUpdate()

// Undo function which simply goes one step backwards in the graph.
function undo(){
  prov.goBackOneStep();
}

//Redo function which traverses down the tree one step.
function redo(){
  if(prov.current().children.length == 0){
    return;
  }
  prov.goForwardOneStep();
}

function provVisUpdate()
{
  ProvVisCreator(
    document.getElementById("provDiv")!,
    prov,
    visCallback);

}

d3.select("#annotationButton")
  .on("click", () => {
    let val = (d3.select("#annotateInput").node() as HTMLInputElement).value;

    prov.addAnnotationToNode(prov.current().id, val);
    provVisUpdate();
  })

//Setting up undo/redo hotkey to typical buttons
document.onkeydown = function(e){
  var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  if(!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    undo();
  }
  else if(e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    redo();
  }
}
