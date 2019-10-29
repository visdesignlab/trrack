import * as d3 from "d3";
import * as ProvenanceLibrary from "@visdesignlab/provenance-lib-core/lib/src/index.js";
import {NodeState} from "./ForceDirectedGraphExample";
import {setState} from "./ForceDirectedGraphExample";

let depthMap = {};
let maxWidth = 0;

export function updateProv(provenance: ProvenanceLibrary.Provenance<NodeState>, undo:boolean, positionChange:boolean)
{
  let links = [];
  let nodes = provenance.graph().nodes;
  depthMap[provenance.graph().root.id] = 0;

  let nodeArray = [];
  for (let node in nodes){
    nodeArray.push(nodes[node]);
  }

  let stratify = d3.stratify()
    .id(function(d:any){
      return d.id;
    })
    .parentId(function(d:any){
      return d.parent === undefined ? null : d.parent;
    });

  let rootNode = stratify(nodeArray);
  //
  //
  // Set the dimensions and margins of the diagram
  let margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 530 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  // let svg = d3.select("#prov").select("g");

  let svg:d3.Selection<SVGGElement, unknown, HTMLElement, any> = undefined;

  if(d3.select("#prov").select("g").size() > 0){
    svg = d3.select("#prov").select("g");
  }
  else{
    d3.select("#prov").selectAll("g").remove();
    svg = d3.select("#prov")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");
  }

  let i = 0,
      duration = 750,
      root;

  // declares a tree layout and assigns the size
  let treemap = d3.tree().size([height, width]);

  // Assigns parent, children, height, depth
  //console.log(rootNode);
  root = d3.hierarchy(rootNode, d => d.children);

  DFS(root, !positionChange);
  // assignDepth(root);

  console.log(depthMap);
  //console.log(links);

  //We use x0 and y0 to keep track of the parent's position. We will use it to animate the children.
  root.x0 = height / 2;
  root.y0 = 0;

  // root.children.forEach(collapse);

  update(root);

  // // Collapse the node and all it's children
  // //Here we create a _children attribute to hide the 'hidden' children.
  // function collapse(d:any) {
  //   if(d.children) {
  //     d._children = d.children
  //     d._children.forEach(collapse)
  //     d.children = null
  //   }
  // }

  function assignDepth(d:any){
    d.width = depthMap[d.data.id];
    if(d.children){
      d.children.forEach(assignDepth);
    }
  }



  function findPathToTargetNode<T>(
    nodes: any,
    currentNode: any,
    targetNode: any,
    track: any[],
    comingFromNode: any = currentNode
  ): boolean {
    if (currentNode && currentNode.id === targetNode.id) {
      console.log("here");
      track.unshift(currentNode);
      return true;
    } else if (currentNode) {
      const nodesToCheck: any[] = currentNode.children.map(
        c => nodes[c]
      );

      if (currentNode.parent) {
        nodesToCheck.push(nodes[currentNode.parent]);
      }

      for (let node of nodesToCheck) {
        if (node === comingFromNode) continue;
        if (findPathToTargetNode(nodes, node, targetNode, track, currentNode)) {
          track.unshift(currentNode);
          return true;
        }
      }
    }

    console.log(track);
    return false;
  }


  function DFS(node:any, setDepth:boolean) {

    // let list = []
    //
    // console.log(findPathToTargetNode(provenance.graph().nodes, provenance.graph().root, provenance.graph().current, list));
    // console.log(list);

    let explored = new Set();
    //
    //
    // for( let j of list){
    //   depthMap[j.id] = 0;
    //   explored.add(j.id);
    // }
    //
    let s = [];

   let currDepth = 0;

   s.push(node);

   // We'll continue till our Stack gets empty
   while (s.length != 0) {
      let t = s.pop();

      if(!explored.has(t.data.id)){
        t.width = currDepth;
        depthMap[t.data.id] = t.width
        explored.add(t.data.id);
      }
      else{
        t.width = depthMap[t.data.id]
      }

      if(t.parent && t.parent.width == depthMap[t.data.id]){
        links.push({parent:t.parent, child:t});
      }

      // 1. In the edges object, we search for nodes this node is directly connected to.
      // 2. We filter out the nodes that have already been explored.
      // 3. Then we mark each unexplored node as explored and push it to the Stack.
      if(t.children){

        if(t.children.length > 1){
          for(let i = 0; i < t.children.length - 1; i++){
            links.push({child:t.children[i], parent:t.children[i+1]});
          }
        }
        t.children
          .forEach(n => {
            s.push(n);
        });
      }
      else{
        currDepth++;
      }
   }
 }

 function swapCurrentToFront(node:any, widthToSwap:number) {
   let explored = new Set();
   let s = [];

  let currDepth = 0;

  s.push(node);

  while (s.length != 0) {
     let t = s.pop();

     if(!explored.has(t.data.id)){
       t.width = currDepth;
       depthMap[t.data.id] = t.width
       explored.add(t.data.id);
     }
     else{
       t.width = depthMap[t.data.id]
     }

     if(t.parent && t.parent.width == depthMap[t.data.id]){
       links.push({parent:t.parent, child:t});
     }

     if(t.children){

       if(t.children.length > 1){
         for(let i = 0; i < t.children.length - 1; i++){
           links.push({child:t.children[i], parent:t.children[i+1]});
         }
       }
       t.children
         .forEach(n => {
           s.push(n);
       });
     }
     else{
       currDepth++;
     }
  }
 }


  function update(source:any) {

    // Assigns the x and y position for the nodes
    let treeData = treemap(root);

    let nodes = treeData.descendants();
    let node = svg.selectAll<SVGGElement, any>('g.node')
        .data(nodes, function(d:any){
          return d.data.id;
        });

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d:any) {
          if(!undo && d.data.parent && d.data.id == provenance.graph().current.id){
            console.log(d.width);

            return "translate(" + (width - d.parent.width * 50) + "," + (margin.top + d.parent.depth * 50) + ")"
          }
          return "translate(" + (width - d.width * 50) + "," + (margin.top + d.depth * 50) + ")";
      })
      .on('click', clicked);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6);

    // UPDATE
    let nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d:any){return "translate(" + (width - d.width * 50) + "," + (margin.top + d.depth * 50) + ")";});
    // Update the node attributes and style

    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style('fill', function(d:any){
        // console.log(d)
        if(d.data.id == provenance.graph().current.id){
          return "cornflowerblue";
        }
        return "#FFF";
      });
    // ****************** links section ***************************
    let link = svg.selectAll<SVGPathElement, any>('path.link')
        .data(links, function(d){
          return d.child.data.id;
        });

    // Enter any new links at the parent's previous position.
    let linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', d => {
          if(!undo && d.child.data.parent && d.child.data.id == provenance.graph().current.id){
            let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}
            return diagonal(parent, parent)
          }
          let child = {x: (width - d.child.width * 50), y: (margin.top + d.child.depth * 50)}
          let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}
          return diagonal(child, parent)
        });
    //
    // // UPDATE
    let linkUpdate = linkEnter.merge(link);
    //
    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){
          let child = {x: (width - d.child.width * 50), y: (margin.top + d.child.depth * 50)}
          let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}

          return diagonal(child, parent)
        });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      let path = `M ${s.x} ${s.y}
                ${d.x} ${d.y}`

      return path
    }

    function clicked(d){
      setState(d, true);
    }
  }
}
