import * as d3 from "d3";
import * as ProvenanceLibrary from "@visdesignlab/provenance-lib-core/lib/src/index.js";
import {NodeState} from "./Script";
// import {setState} from "./Script";

let depthMap = {};
let maxWidth = 0;

export function updateProv(provenance: ProvenanceLibrary.Provenance<NodeState>, setState)
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
  let margin = {top: 20, right: 200, bottom: 30, left: 90},
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

  if(!root.width){
    DFS(root);

  }
  // assignDepth(root);

  // console.log(depthMap);
  //console.log(links);

  //We use x0 and y0 to keep track of the parent's position. We will use it to animate the children.
  root.x0 = height / 2;
  root.y0 = 0;

  // root.children.forEach(collapse);
  let path = [];
  // findPathToTargetNode(provenance.graph(), provenance.graph().root, provenance.graph().current, path);


  update(root);
  drawDescriptions();
  // console.log(depthMap);

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

  function DFS(node:any) {

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



  function drawDescriptions(){
    let frontNodes = d3.selectAll("g.provNode")
      .filter(d => (d as any).width == 0);

    let backNodes = d3.selectAll("g.provNode")
      .filter(d => (d as any).width != 0);

    backNodes.selectAll("g").transition().duration(500).style("opacity", 0).remove();

    let descriptionG = frontNodes.append("g")
      .style("opacity", 0);

    descriptionG.transition().duration(1000).style("opacity", 1);

    descriptionG.append("rect")
      .attr("width",180)
      .attr("height", 40)
      .attr("y", -20)
      .attr("x", 15)
      .classed("descriptionRect", true);

    descriptionG.append("text")
      .text(function(d){
        // console.log(d);
        return d.data.data.label;
      })
      .attr("x", 20)
      .attr("y", -5)

    descriptionG.append("text")
      .text(function(d){
        // console.log(d);
        return d.data.id;
      })
      .attr("font-size", ".6em")
      .attr("x", 20)
      .attr("y", 15)

    descriptionG.append("text")
      .text(function(d){
        let ts = new Date(d.data.data.metadata.createdOn);
        return ts.toLocaleString();
      })
      .attr("font-size", ".6em")
      .attr("x", 20)
      .attr("y", 5)
  }


  function update(source:any) {
    let treeData = treemap(root);
    assignDepth(root);

    let nodes = treeData.descendants();
    let node = svg.selectAll<SVGGElement, any>('g.provNode')
        .data(nodes, function(d:any){
          return d.data.id;
        });

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node.enter().append('g')
      .classed("provNode", true)
      .attr("id", d => { return (d as any).data.id });

    d3.select(".provNodeSelected")
      .classed("provNodeSelected", false);

    d3.select("g[id='"+ provenance.graph().current.id +"']")
      .classed("provNodeSelected", true);

    nodesToBeShifted(0);

    nodeEnter
        .attr("transform", function(d:any) {
          if(d.data.parent && d.data.id == provenance.graph().current.id){
            return "translate(" + (width - d.parent.width * 50) + "," + (margin.top + d.parent.depth * 50) + ")"
          }
          return "translate(" + (width - d.width * 50) + "," + (margin.top + d.depth * 50) + ")";
        })
        .on('click', clicked);

    // Add Circle for the nodes
    nodeEnter.filter(function(d){
        return d.data.data.label[d.data.data.label.length - 3] != "v";
      })
        .append('circle')
        .attr('class', 'provNode');

    nodeEnter.filter(function(d){
        return d.data.data.label[d.data.data.label.length - 3] == "v";
      })
        .append('rect')
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", -10)
        .attr("y", -10)
        .attr('class', 'provNode');
    // UPDATE
    let nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d:any){return "translate(" + (width - d.width * 50) + "," + (margin.top + d.depth * 50) + ")";});

    // ****************** links section ***************************

    updateLinks();
    moveNodes();
    drawDescriptions();
    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      let path = `M ${s.x} ${s.y}
                ${d.x} ${d.y}`
      return path
    }

    function clicked(d){
      setState(d.data);
      d3.select(".provNodeSelected")
        .classed("provNodeSelected", false);

      d3.select("g[id='"+d.data.id +"']")
        .classed("provNodeSelected", true);
      // update(provenance.graph().root)
      nodesToBeShifted(0);
      moveNodes();
      drawDescriptions();
      updateLinks();

      // update(root);
    }

    function updateLinks(){
      let nodes = d3.selectAll("g.provNode").data();
      links = [];
      nodes.forEach(function(node){
        if(node.children){
          for(let i = 0; i < node.children.length; i++){
            if(node.width == node.children[i].width){
              links.push({parent:node, child:node.children[i]});
            }
            if(i > 0){
              links.push({parent:node.children[i], child:node.children[i-1]});
            }
          }
        }
      })

      console.log(links);

      let link = svg.selectAll<SVGPathElement, any>('path.link')
          .data(links, function(d){
            return d.parent.data.id + d.child.data.id;
          });

      link.exit().remove();

      let linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', d => {
            if(d.child.data.parent && d.child.data.id == provenance.graph().current.id){
              let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}
              return diagonal(parent, parent)
            }
            let child = {x: (width - d.child.width * 50), y: (margin.top + d.child.depth * 50)}
            let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}
            return diagonal(child, parent)
          });
      // UPDATE
      let linkUpdate = linkEnter.merge(link)
      // Transition to the correct position
      linkUpdate.transition()
          .duration(duration)
          .attr('d', function(d){
            let child = {x: (width - d.child.width * 50), y: (margin.top + d.child.depth * 50)}
            let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}

            return diagonal(child, parent)
          });
    }

    function nodesToBeShifted(shift: number){
      let currNode = d3.select("g.provNodeSelected").data()[0];

      let shiftList = []

      let currWidth = currNode.width;
      shiftList.push(currNode);
      while(currNode.parent && currNode.parent.width == currWidth){
        currNode = currNode.parent;
        shiftList.push(currNode);
      }

      let parentWidth = currNode.parent? currNode.parent.width : 0
      let parentDepth = currNode.parent? currNode.parent.depth : 0
      let moveDist = currNode.width - parentWidth

      if(parentWidth == 0){
        d3.selectAll("g.provNode")
          .filter(function(d){
            return d.width < currNode.width && d.depth > parentDepth;
          })
          .data().forEach(function(d){
            console.log(d);
              d.width += findMaxChildWidth(shiftList[shiftList.length - 1]) - currNode.width + 1;
          })
      }
      else{
        d3.selectAll("g.provNode")
          .filter(function(d){
            return d.width < currNode.width && d.width >= parentWidth && d.depth > parentDepth;
          })
          .data().forEach(function(d){
            console.log(d);
              d.width += findMaxChildWidth(shiftList[shiftList.length - 1]) - currNode.width + 1;
          })
      }

      addWidthToChildren(shiftList[shiftList.length - 1], -moveDist);

      console.log(shiftList);

      if(parentWidth != 0){
        nodesToBeShifted(shift + findMaxChildWidth(shiftList[shiftList.length - 1]) - 1);
      }
      // currNode.width = 2;
    }

    function addWidthToChildren(node, widthToAdd){
      node.width += widthToAdd;
      if(node.children){
        node.children.forEach(function(d){
          addWidthToChildren(d, widthToAdd);
        })
      }
    }

    function findMaxChildWidth(node){
      let maxWidth = node.width;

      if(node.children){
        node.children.forEach(d => {
            let currWidth = findMaxChildWidth(d)
            if(currWidth > maxWidth){
              maxWidth = currWidth;
            }
        });
      }

      return maxWidth;
    }

    function moveNodes(){
      d3.selectAll("g.provNode")
        .transition()
        .duration(duration)
        .attr("transform", function(d:any){return "translate(" + (width - d.width * 50) + "," + (margin.top + d.depth * 50) + ")";});

      d3.selectAll("path.link")
          .transition()
          .duration(duration)
          .attr('d', function(d){
            let child = {x: (width - d.child.width * 50), y: (margin.top + d.child.depth * 50)}
            let parent = {x: (width - d.parent.width * 50), y: (margin.top + d.parent.depth * 50)}

            return diagonal(child, parent)
          });
    }
  }
}
