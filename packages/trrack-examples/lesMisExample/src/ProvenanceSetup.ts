//
import * as d3 from 'd3';
import
{
  initProvenance,
  Provenance,
  NodeID,
  createAction,
} from '@visdesignlab/trrack';
import { ProvVisCreator } from '@visdesignlab/trrack-vis';
import Bars from './FDBar';
import Graph from './FDGraph';

export interface NodeState {
  nodeMap: {};
  selectedNode:string;
}

const initialState: NodeState = {
  nodeMap: {},
  selectedNode: 'none',
};

d3.json('./data/miserables.json').then((graph) => {
  runSimulation(graph);

  const provenance = setupProvenance(graph);

  const hoverOver = function (currData) {
    if (currData.id) {
      barVis.hoverBar(currData.id);
      graphVis.hoverNode(currData.id);
    } else {
      barVis.hoverBar(currData);
      graphVis.hoverNode(currData);
    }
  };

  const hoverOut = function () {
    barVis.dehoverBars();
    graphVis.dehoverNodes();
  };

  /**
  * Two callback functions where the actions are applied. Subsequently calls the observers, which
  * changes the les mis vis and updates the prov vis.
  */
  const selectAction = createAction(
    (state:NodeState, newSelected:string) => {
      state.selectedNode = newSelected;
    },
  );

  const select = function (currData) {
    selectAction.setLabel(currData.id ? `${currData.id} Selected` : `${currData} Selected`);

    provenance
      .apply(selectAction(currData.id ? currData.id : currData));
  };

  const dragAction = createAction(
    (state:NodeState, x:number, y:number, id:string) => {
      console.log(id, x, y);
      state.nodeMap[id][0] = x;
      state.nodeMap[id][1] = y;
    },
  );

  const dragEnded = function (d) {
    // Doing this so clicking on node-link doesnt cause two state changes.
    const state = provenance.getState(provenance.current);

    if (state.nodeMap[d.id][0] >= d.x - 0.1
       && state.nodeMap[d.id][0] <= d.x + 0.1
       && state.nodeMap[d.id][1] >= d.y - 0.1
       && state.nodeMap[d.id][1] <= d.y + 0.1) {
      return;
    }

    dragAction.setLabel(`${d.id} Moved`);

    console.log(d.x, d.y);

    provenance.apply(dragAction(d.x, d.y, d.id));
  };

  const barVis = new Bars(graph, hoverOver, hoverOut, select);
  const graphVis = new Graph(graph, hoverOver, hoverOut, select, dragEnded);

  /*
  * Setting up observers. Called on state changed.
  */

  provenance.addObserver((state) => state.selectedNode, () => {
    barVis.selectBar(provenance.getState(provenance.current).selectedNode);
    graphVis.selectNode(provenance.getState(provenance.current).selectedNode);
  });

  provenance.addObserver((state) => state.nodeMap, () => {
    graphVis.moveNodes(provenance.getState(provenance.current).nodeMap);
  });

  provenance.done();

  /**
  *
  * Setting up undo/redo keys
  *
  */
  document.onkeydown = function (e) {
    const mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    console.log(mac);

    if (!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which === 90) {
      undo();
    } else if (e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which === 90) {
      redo();
    }
  };

  function undo() {
    provenance.goBackOneStep();
  }

  function redo() {
    if (provenance.current.children.length === 0) {
      return;
    }
    provenance.goToNode(provenance.current.children[provenance.current.children.length - 1]);
  }

  ProvVisCreator(document.getElementById('provDiv')!, provenance, (id: NodeID) => {
    provenance.goToNode(id);
  });
});

/*
* Creates starting state. Is called after running simulations.
* Creates and returns provenance object.
*/
function setupProvenance(graph) : Provenance<NodeState, any, any> {
  const dict = {};
  const arr:any[] = graph.nodes;

  for (let i = 0; i < arr.length; i += 1) {
    const curr = arr[i].id;
    dict[curr] = [arr[i].x, arr[i].y];
  }

  initialState.nodeMap = dict;

  const provenance = initProvenance(initialState);

  return provenance;
}

/*
* Runs the force simulation 300 times. Only done at beginning to find initial placement.
*
*/

function runSimulation(graph) {
  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d:any) => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(800 / 2, 1000 / 2));

  simulation
    .nodes(graph.nodes);

  simulation.force<d3.ForceLink<any, any>>('link').links(graph.links);

  for (let i = 0; i < 300; i += 1) {
    simulation.tick();
  }

  return simulation;
}
