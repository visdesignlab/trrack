import
{
  initProvenance,
  createAction,
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
  getState,
  Nodes,
  CurrentNode,
  Artifacts,
  Extra
} from '../../../src/index';
import Scatterplot from "./scatterplot"

import * as d3 from "d3"

/**
* interface representing the state of the application
*/
export interface NodeState {
  selectedQuartet:string;
  selectedNode:string;
  hoveredNode:string;
};

/**
* Initial state
*/

const initialState: NodeState = {
  selectedQuartet: 'I',
  selectedNode: 'none',
  hoveredNode: 'none'
}

//initialize provenance with the first state
let prov = initProvenance(initialState);

//Set up apply action functions for each of the 3 actions that affect state

/**
* Function called when the quartet number is changed. Applies an action to provenance.
* This is a complex action, meaning it always stores a state node.
*/

let changeQuartetUpdate = function(newQuartet){
  //create prov Object
  let action = createAction(initialState, (state:NodeState) => {
    state.selectedQuartet = newQuartet;
    return state;
  })

  action
    .addLabel(newQuartet)
    .alwaysStoreState(true);

  prov.changeState(action);

  // prov.applyAction(
  //   newQuartet + " Quartet Selected",
  //   (state:NodeState) =>
  //   {
  //     state.selectedQuartet = newQuartet;
  //     return state;
  //   },
  //   undefined, undefined, undefined, undefined, true
  // );
}

/**
* Function called when a node is selected. Applies an action to provenance.
*/

let selectNodeUpdate = function(newSelected){
  let action = createAction(initialState, (state:NodeState) => {
    state.selectedNode = newSelected;
    return state;
  });

  action.addLabel(newSelected + " Selected");

  prov.changeState(action);
}

/**
* Function called when a node is hovered. Applies an action to provenance.
*/

let hoverNodeUpdate = function(newHover){
  let action = createAction(initialState, (state:NodeState) => {
    state.hoveredNode = newHover;
    return state;
  });

  action.addLabel(newHover + " Hovered");

  prov.changeState(action);
  // prov.applyAction(
  //   newHover + " Hovered",
  //   (state:NodeState) =>
  //   {
  //     state.hoveredNode = newHover;
  //     return state;
  //   }
  // );
}

// Create our scatterplot class which handles the actual vis. Pass it our three action functions
// so it can use them when appropriate.
let scatterplot = new Scatterplot(changeQuartetUpdate, selectNodeUpdate, hoverNodeUpdate);

// Set up observers for the three keys in state. These observers will get called either when an applyAction
// function changes the associated keys value.

// Also will be called when an internal graph change such as goBackNSteps, goBackOneStep or goToNode
// change the keys value.


/**
* Observer for when the quartet state is changed. Calls changeQuartet in scatterplot to update vis.
*/

prov.addObserver(["selectedQuartet"], () => {
  scatterplot.changeQuartet(getState(prov.graph(), prov.current()).selectedQuartet);
  console.log("Is a state node? ", isStateNode(prov.current()), prov.current(), getState(prov.graph(), prov.current()))
});

/**
* Observer for when the selected node state is changed. Calls selectNode in scatterplot to update vis.
*/

prov.addObserver(["selectedNode"], () => {
  scatterplot.selectNode(getState(prov.graph(), prov.current()).selectedNode);
  console.log("Is a state node? ", isStateNode(prov.current()), prov.current(), getState(prov.graph(), prov.current()))
});

/**
* Observer for when the hovered node state is changed. Calls hoverNode in scatterplot to update vis.
*/

prov.addObserver(["hoveredNode"], () => {
  scatterplot.hoverNode(getState(prov.graph(), prov.current()).hoveredNode);
  console.log("Is a state node? ", isStateNode(prov.current()), prov.current(), getState(prov.graph(), prov.current()))
});
