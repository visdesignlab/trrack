import * as d3 from "d3";
import {selectBar, hoverBar, dehoverBars} from "./FDBar";

export function drawGraph(graph, simulation){
  let link = undefined;
  let node = undefined;

  let svg = d3.select("#viz"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  let color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("button")
    .attr("class", "undoRedoButton")

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
      .classed("nodes", true)
      .attr("id", function(d:any){return d.id + "N"})
      .attr("fill", function(d:any) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", function(d:any){
            dragged(d, link, node)
          })
          .on("end", dragended))
      .on("click", function(d:any){
        selectNode(graph, d.id);
        selectBar(graph, d.id);
      })
      .on("mouseover", function(d:any){
        hoverNode(d.id);
        hoverBar(d.id);

      })
      .on("mouseout", function(d:any){
        dehoverNodes();
        dehoverBars();
      });

  node
      .append("title")
      .text(function(d:any) { return d.id; });
  simulation
      .nodes(graph.nodes)
      .on("tick", function(d:any){ticked(d, link, node)});
      // .on("end", ended);
  simulation.force<d3.ForceLink<any, any>>('link').links(graph.links);
}

function dragstarted(d: any) {

}

function dragged(d: any, link, node) {
  d.x = d3.event.x;
  d.y = d3.event.y;
  ticked(d, link, node);
}

function dragended(d: any) {
  // ended();
}

function ticked(d, link, node) {
  link
      .attr("x1", function(d:any) { return d.source.x; })
      .attr("y1", function(d:any) { return d.source.y; })
      .attr("x2", function(d:any) { return d.target.x; })
      .attr("y2", function(d:any) { return d.target.y; });

  node
      .attr("cx", function(d:any) { return d.x; })
      .attr("cy", function(d:any) { return d.y; });
}

export function selectNode(graph, id){
  deselectAll()

  d3.select("circle[id='"+id +"N']")
    .classed("selectedNode", true);

  let edges = graph.links.filter(function(d){
    return d.source.id == id || d.target.id == id
  })

  edges.forEach(function(d){
    d3.select("circle[id='"+d.source.id +"N']").filter(function(d:any){
      return d.id != id;
    })
    .classed("nodeEdges", true);

    d3.select("circle[id='"+d.target.id +"N']").filter(function(d:any){
      return d.id != id;
    })
    .classed("nodeEdges", true);
  });
}

function deselectAll(){
  d3.select("#viz")
    .selectAll("circle")
    .classed("nodeEdges", false)
    .classed("selectedNode", false);
}

export function hoverNode(id){
  d3.select("#viz")
    .select("circle[id='"+ id +"N']")
    .classed("hoverNode", true);
}

export function dehoverNodes(){
  d3.select("#viz")
    .select(".hoverNode")
    .classed("hoverNode", false);
}
