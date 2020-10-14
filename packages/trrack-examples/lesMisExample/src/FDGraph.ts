import * as d3 from "d3";
import {NodeState} from "./ProvenanceSetup"

export default class Graph {

  graph:any;
  private hoverOver: (id: any) => void;
  private hoverOut: () => void;
  private select: (id: any) => void;
  private dragEnded: (d: any) => void;

  constructor(graph, hoverOver, hoverOut, select, dragEnded){
    this.graph = graph;

    this.hoverOver = hoverOver;
    this.hoverOut = hoverOut;
    this.select = select;
    this.dragEnded = dragEnded;

    this.drawGraph();
  }

  drawGraph(){
    let link = undefined;
    let node = undefined;

    let svg = d3.select("#viz"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    svg.selectAll("g").remove();

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append("button")
      .attr("class", "undoRedoButton")

    link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.graph.links)
        .join("line")
        .attr("stroke-width", function(d:any) { return Math.sqrt(d.value); });

    node = svg.append("g")
        .classed("circleG", true)
        .selectAll("circle")
        .data(this.graph.nodes)
        .join("circle")
        .classed("nodes", true)
        .attr("id", function(d:any){return d.id + "N"})
        .attr("fill", function(d:any) { return color(d.group);})
        .call(d3.drag()
            .on("drag", d => this.dragged(d, link, node))
            .on("end", d => this.dragEnded(d)))
        .on("click", d => this.select(d))
        .on("mouseover", d => this.hoverOver(d))
        .on("mouseout", d => this.hoverOut());

    node
        .append("title")
        .text(d => d.id );

    this.draw(link, node);
  }

  dragged(d: any, link, node) {
    d.x = d3.event.x;
    d.y = d3.event.y;
    this.draw(link, node);
  }

  draw(link, node) {
    link
        .attr("x1", function(d:any) { return d.source.x; })
        .attr("y1", function(d:any) { return d.source.y; })
        .attr("x2", function(d:any) { return d.target.x; })
        .attr("y2", function(d:any) { return d.target.y; });

    node
        .attr("cx", function(d:any) { return d.x; })
        .attr("cy", function(d:any) { return d.y; });
  }

  selectNode(id){
    this.deselectAllNodes()

    d3.select("circle[id='"+id +"N']")
      .classed("selectedNode", true);

    let edges = this.graph.links.filter(function(d){
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

  deselectAllNodes(){
    d3.select("#viz")
      .selectAll("circle")
      .classed("nodeEdges", false)
      .classed("selectedNode", false);
  }

  hoverNode(id){
    d3.select("#viz")
      .select("circle[id='"+ id +"N']")
      .classed("hoverNode", true);
  }

  dehoverNodes(){
    d3.select("#viz")
      .select(".hoverNode")
      .classed("hoverNode", false);
  }

  moveNodes(newGraph){
    for(let i of this.graph.nodes){
      i.x = newGraph[i.id][0];
      i.y = newGraph[i.id][1];
    }

    for(let i of this.graph.links){
      i.source.x = newGraph[i.source.id][0];
      i.source.y = newGraph[i.source.id][1];
      i.target.x = newGraph[i.target.id][0];
      i.target.y = newGraph[i.target.id][1];
    }

    let link = d3.select("#viz").select("g.links").selectAll("line");

    let node = d3.select("#viz").select("g.circleG").selectAll("circle");

    this.draw(link, node);
  }
}
