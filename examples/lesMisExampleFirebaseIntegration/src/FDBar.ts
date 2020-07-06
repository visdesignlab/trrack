import {NodeState} from "./ProvenanceSetup"
import * as d3 from "d3";

export default class Bars {

  private graph = undefined;
  private hoverOver: (id: string) => void;
  private hoverOut: () => void;
  private select: (id: string) => void;

  constructor(graph, hoverOver, hoverOut, select){
    this.graph = graph;

    this.hoverOver = hoverOver;
    this.hoverOut = hoverOut;
    this.select = select;

    this.drawBar();
  }

  drawBar(){

    let nodeMap = new Map();

    for(let i = 0; i < this.graph.links.length; i++)
    {
      if(nodeMap.get(this.graph.links[i].source.id) == undefined)
      {
        nodeMap.set(this.graph.links[i].source.id, 1);
      }
      else
      {
        nodeMap.set(this.graph.links[i].source.id, nodeMap.get(this.graph.links[i].source.id) + 1);
      }
      if(nodeMap.get(this.graph.links[i].target.id) == undefined)
      {
        nodeMap.set(this.graph.links[i].target.id, 1);
      }
      else
      {
        nodeMap.set(this.graph.links[i].target.id, nodeMap.get(this.graph.links[i].target.id) + 1);
      }
    }

    let bars = d3.select("#bars");

    let width:number = +bars.attr("width") - 10;
    let height:number = +bars.attr("height") - 10;

    let edgePadding = 50;
    let bottomPadding = 90;
    let rightPadding = 4;
    let barPadding = 1;

    let g = bars.append("g");

    let scale = d3.scaleLinear();

    let keyList:string[] = Array.from(nodeMap.keys());
    let values:number[] = Array.from(nodeMap.values());

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
      .attr("width", (width - edgePadding) / keyList.length - barPadding)
      .attr("height", function(d : any){
        return scale(nodeMap.get(d));
      })
      .attr("id", function(d:any){
        return d + "B";
      })
      .classed("bar", true)
      .on("click", d => this.select(d))
      .on("mouseover", d => this.hoverOver(d))
      .on("mouseout", d => this.hoverOut());

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
          .attr("font-size", "11px")
          .attr("dx", "-1em")
          .attr("dy", "-.45em")
          .attr("transform", "rotate(-90)");
      // The title
      g.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0)
           .attr("x",0 - (height / 2))
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text("Node Degree");
  }

  selectBar(id){
    this.deselectAllBars();


    d3.select("#bars")
      .selectAll("rect[id='"+ id +"B']")
      .classed("barSelected", true);
  }

  deselectAllBars(){
    d3.select("#bars")
      .selectAll(".barSelected")
      .classed("barSelected", false);
  }

  hoverBar(id){
    d3.select("#bars")
      .selectAll("rect[id='"+ id +"B']")
      .classed("barHover", true);
    }

  dehoverBars(){
    d3.select("#bars")
      .selectAll(".barHover")
      .classed("barHover", false);
  }
}
