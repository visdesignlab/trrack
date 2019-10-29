import * as d3 from "d3";
import * as ProvenanceLibrary from "@visdesignlab/provenance-lib-core/lib/src/index.js";
import { updateProv } from "./provenanceVis";

function CreateApp(provenance: ProvenanceLibrary.Provenance<NodeState>) {
  return {
    currentState: () => provenance.graph().current.state
  };
}

export interface NodeState {
  nodes: {
    nodeMap: {};
    selectedNode:string;
  }
};

const initialState: NodeState = {
  nodes: {
    nodeMap: {},
    selectedNode: 'none'
  }
}

d3.select("#undoButton")
  .on("click", undo);

d3.select("#redoButton")
  .on("click", redo);

function setRedo(b){
  d3.select("#redoButton")
    .attr("class", b ? "activeButton" : "inactiveButton");
}

const provenance = ProvenanceLibrary.initProvenance(initialState);

const app = CreateApp(provenance);

let redoAvailable = false;
let undoUsed = false;
let positionChange = false;

let currMap:Map<string, number[]> = new Map<string, number[]>();

provenance.addObserver("nodes.nodeMap", () => {
  console.log(provenance.graph());
  updateProv(provenance, undoUsed, positionChange);
  positionChange = false;
});

provenance.addObserver("nodes.selectedNode", () => {
  console.log(provenance.graph());
  updateProv(provenance, undoUsed, positionChange);
  positionChange = false;
});

let svg = d3.select("#viz"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

let color = d3.scaleOrdinal(d3.schemeCategory10);

let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d:any) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

let link = undefined;
let node = undefined;
let graph = undefined;
let selectedNode = "";
let edgesMap = undefined;
let nodeMap = undefined;
let g = undefined;
let selectedColor = undefined;
let defaultColor = undefined;

d3.json("../miserables.json").then(function(innerGraph) {
  graph = innerGraph;

  svg.append("button")
    .attr("class", "undoRedoButton")
    .attr("x")

  link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .join("line")
      .attr("stroke-width", function(d:any) { return Math.sqrt(d.value); });

  node = svg.append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .join("circle")
      .attr("class", "nodes")
      .attr("r", 5)
      .attr("id", function(d:any){return d.id})
      .attr("fill", function(d:any) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node
      .append("title")
      .text(function(d:any) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked)
      .on("end", ended);

  simulation.force<d3.ForceLink<any, any>>('link').links(graph.links);

  nodeMap = new Map();
  edgesMap = new Map();

  for(let i = 0; i < graph.links.length; i++)
  {
    //dealing with edgesMap
    if(edgesMap.get(graph.links[i].source.id) == undefined)
    {
      edgesMap.set(graph.links[i].source.id, [graph.links[i].target.id])
    }
    else
    {
      edgesMap.get(graph.links[i].source.id).push(graph.links[i].target.id)
    }

    if(edgesMap.get(graph.links[i].target.id) == undefined)
    {
      edgesMap.set(graph.links[i].target.id, [graph.links[i].source.id])
    }
    else
    {
      edgesMap.get(graph.links[i].target.id).push(graph.links[i].source.id)
    }

    //dealing with nodeMap
    if(nodeMap.get(graph.links[i].source.id) == undefined)
    {
      nodeMap.set(graph.links[i].source.id, 1);
    }
    else
    {
      nodeMap.set(graph.links[i].source.id, nodeMap.get(graph.links[i].source.id) + 1);
    }

    if(nodeMap.get(graph.links[i].target.id) == undefined)
    {
      nodeMap.set(graph.links[i].target.id, 1);
    }
    else
    {
      nodeMap.set(graph.links[i].target.id, nodeMap.get(graph.links[i].target.id) + 1);
    }
  }


  //starting bars section
  let bars = d3.select("#bars");

  width = width - 10;
  height = height - 10;

  let edgePadding:number = 50;
  let bottomPadding = 90;
  let rightPadding = 4;
  let barPadding = 1;

  g = bars.append("g");

  let scale = d3.scaleLinear();

  let keyList:string[] = Array.from(nodeMap.keys());
  let values:number[] = Array.from(nodeMap.values());

  defaultColor = "lightgray";
  selectedColor = "blue";
  let hoverColor = "green";


  keyList = keyList.sort(function(x, y){
    if(nodeMap.get(x) < nodeMap.get(y)){
      return 1;
    }
    else if (nodeMap.get(x) > nodeMap.get(y)){
      return -1;
    }
    return 0;
  });

  scale.domain([0, Math.max(...values)]);
  scale.range([0, height - bottomPadding * 2]);

  console.log(nodeMap);

  //setting up the bar chart, as well as the bar chart on click and hover.
  g
    .selectAll("rect")
    .data(keyList)
    .enter()
    .append("rect")
    .attr("x", function(d : any, i){
      return i * ((width - edgePadding) / keyList.length) + barPadding + edgePadding - rightPadding;
    })
    .attr("y", function(d : any){
      return height - scale(nodeMap.get(d)) - bottomPadding;
    })
    .attr("fill", defaultColor)
    .attr("width", (width - edgePadding) / keyList.length - barPadding)
    .attr("height", function(d : any){
      return scale(nodeMap.get(d));
    })
    .on("click", function(d : any){
      if(d == selectedNode){
        deselectAll(true);
      }
      else{
        selectNode(d, true);
        selectBar(d);
      }
    })
    .on("mouseover", function(d : any){
      if(d != selectedNode){
        d3.select(this).attr("fill", hoverColor);
      }
      node
        .attr("r", function(d2 : any){
          if(d2.id == selectedNode){
            return 10;
          }
          else if(d2.id == d){
            return 8;
          }
          return 5;
        })
    })
    .on("mouseout", function(d : any){
      if(d != selectedNode){
        d3.select(this).attr("fill", defaultColor);
      }
      node
        .attr("r", function(d2 : any){
          if(d2.id == selectedNode){
            return 10;
          }
          return 5;
        })
    });

  //Setting up nodes on click and hover
  node
    .on("mouseover", function(d : any){
      if(parseInt(d3.select(this).attr("r")) == 5){
        d3.select(this).attr("r", 8);
      }
      g.selectAll("rect")
        .attr("fill", function(d2 : any, i){
          if(d2 == d.id && d2 != selectedNode){
            return hoverColor;
          }
          else if(d2 == selectedNode){
            return selectedColor;
          }
          return defaultColor;
        });
    })
    .on("mouseout", function(d : any){
      if(parseInt(d3.select(this).attr("r")) == 8){
        d3.select(this).attr("r", 5);
      }
      g.selectAll("rect")
        .attr("fill", function(d2 : any, i){
          if(d2 != selectedNode){
            return defaultColor;
          }
          else{
            return selectedColor;
          }
        });
    })
    .on("click", function(d: any){
      if(d.id == selectedNode){
        deselectAll(true);
      }
      else{
        selectNode(d.id, true);
        selectBar(d.id);
      }
    })

  let fakeScale = d3.scaleLinear();

  fakeScale.domain([Math.max(...values), 0]);
  fakeScale.range([0, height - bottomPadding * 2]);

  let yAxis = d3.axisLeft(fakeScale);


  let xScale = d3.scaleBand()
      .domain(keyList)
      .range([1 + edgePadding - rightPadding, 1 + width - rightPadding]);

  let xAxis = d3.axisBottom(xScale);


  //These are the axis
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (edgePadding - 6) + "," + bottomPadding + ")")
      .call(yAxis);

  //the y axis
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (height - bottomPadding + 1) + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("font-size", "7px")
      .attr("dx", "-1em")
      .attr("dy", "-.98em")
      .attr("transform", "rotate(-90)");
  // The title
  g.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0)
       .attr("x",0 - (height / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Node Degree");


});



function ended() {

  var dict = {}
  let arr:any[] = node.data();
  // currMap.clear();

  for (let i = 0; i < arr.length; i++)
  {
    let curr = arr[i].id
    dict[curr]  = [arr[i].x, arr[i].y]
    // currMap.set(arr[i].id, [arr[i].x, arr[i].y])
  }

  setRedo(false);

  redoAvailable  = false;
  undoUsed = false;
  provenance.applyAction({
    label: "Nodes Moved",
    action: (dict:{}) => {
      const test = (app.currentState() as any) as NodeState;
      test.nodes.nodeMap = dict;
      return test;
    },
    args: [dict]
  });
}

function ticked() {

  link
      .attr("x1", function(d:any) { return d.source.x; })
      .attr("y1", function(d:any) { return d.source.y; })
      .attr("x2", function(d:any) { return d.target.x; })
      .attr("y2", function(d:any) { return d.target.y; });

  node
      .attr("cx", function(d:any) { return d.x; })
      .attr("cy", function(d:any) { return d.y; });
}

function dragstarted(d: any) {
  // if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  // d.fx = d.x;
  // d.fy = d.y;
}

function dragged(d: any) {
  d.x = d3.event.x;
  d.y = d3.event.y;
  ticked();
}

function dragended(d: any) {
  ended();
}



//helper function to change the r of every node to 5 except the node with the passed in id
function selectNode(id:string, provenanceActive:boolean){
  node.attr("r", function(d2: any, i2){
    if(d2.id == id){
      selectedNode = id;
      return 10;
    }
    else{
      return 5;
    }
  })
  .attr("class", function(d: any){
    let nodeList = edgesMap.get(selectedNode);
    if(nodeList.includes(d.id)){
     return "nodeEdges";
    }
    return "nodes";
  });

  if(provenanceActive){
    setRedo(false);
    redoAvailable  = false;

    undoUsed = false;

    provenance.applyAction({
      label: "Node Selected",
      action: (id:string) => {
        const test = (app.currentState() as any) as NodeState;
        test.nodes.selectedNode = id;
        return test;
      },
      args: [id]
    });
  }


}

//helper function to change the fill of every bar to blue except for the bar with the passed in id
function selectBar(id:string){
  g.selectAll("rect")
    .attr("fill", function(d, i){
      if(id == d){
        selectedNode = id;
        return selectedColor;
      }
      return defaultColor;
    });
}

function deselectAll(provenanceActive: boolean){
  selectedNode = "";
  g.selectAll("rect")
    .attr("fill", function(d){
      return defaultColor;
    });
  node
    .attr("r", function(d){
      return 5;
    })
    .attr("class", "nodes");

  if(provenanceActive){
    setRedo(false);
    redoAvailable  = false;

    undoUsed = false;

    provenance.applyAction({
      label: "Node De-Selected",
      action: () => {
        const test = (app.currentState() as any) as NodeState;
        test.nodes.selectedNode = 'none';
        return test;
      },
      args: []
    });
  }
}

function undo(e){
  setRedo(true);
  redoAvailable = true;

  undoUsed = true;

  provenance.goBackOneStep();
  setState(provenance.graph().current, false);
}

function redo(e){
  undoUsed = true;

  if(provenance.graph().current.children.length == 0){
    return;
  }

  setState(provenance.graph().current.children[provenance.graph().current.children.length - 1], false);
}

document.onkeydown = function(e){
  var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  console.log(mac);

  if(!e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    undo(e);
  }
  else if(redoAvailable && e.shiftKey && (mac ? e.metaKey : e.ctrlKey) && e.which == 90){
    redo(e);
  }
}

export function setState(d, b){

  positionChange = b;

  console.log(d);
  if(d.data){
    provenance.goToNode(d.data.id);
  }
  else if (d.id){
    provenance.goToNode(d.id);
  }
  else{
    provenance.goToNode(d);
  }

  let currSelected = provenance.graph().current.state.nodes.selectedNode;
  deselectAll(false);
  if(currSelected != "none"){
    selectNode(currSelected, false);
    selectBar(currSelected);
  }

  for (let i in provenance.graph().current.state.nodes.nodeMap){
    d3.selectAll("circle")
      .filter(function(d:any){
        return d.id == i;
      })
      .attr("cx", provenance.graph().current.state.nodes.nodeMap[i][0])
      .attr("cy", provenance.graph().current.state.nodes.nodeMap[i][1]);

    d3.select("#viz")
      .selectAll("line")
      .filter(function(d:any){
        return d.source.id == i;
      });
  }

  for(let i of graph.nodes){
    i.x = +d3.select("circle[id='"+i.id +"']").attr("cx");
    i.y = +d3.select("circle[id='"+i.id +"']").attr("cy");
  }

  for(let i of graph.links){

    i.source.x = +d3.select("circle[id='"+i.source.id +"']").attr("cx");
    i.source.y = +d3.select("circle[id='"+i.source.id +"']").attr("cy");
    i.target.x = +d3.select("circle[id='"+i.target.id +"']").attr("cx");
    i.target.y = +d3.select("circle[id='"+i.target.id +"']").attr("cy");

  }

  let currNode = d3.select(".nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .join("circle")
      .attr("r", 5)
      .attr("id", function(d:any){return d.id})
      .attr("fill", function(d:any) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  currNode
      .attr("cx", function(d:any) { return d.x; })
      .attr("cy", function(d:any) { return d.y; });

  let currLink = d3.select(".links")
      .selectAll("line")
      .data(graph.links)
      .join("line")
      .attr("stroke-width", function(d:any) { return Math.sqrt(d.value); });

  currLink
      .attr("x1", function(d:any) { return d.source.x; })
      .attr("y1", function(d:any) { return d.source.y; })
      .attr("x2", function(d:any) { return d.target.x; })
      .attr("y2", function(d:any) { return d.target.y; });
}
