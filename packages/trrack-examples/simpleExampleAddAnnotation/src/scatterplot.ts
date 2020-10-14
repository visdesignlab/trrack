import * as d3 from "d3"

export default class Scatterplot{

  margin:any;
  width:number;
  height:number;
  quartetNum:string;
  data:any[];
  svg:d3.Selection<SVGSVGElement, any, HTMLElement, any>;
  xScale:d3.ScaleLinear<number, number>;
  yScale:d3.ScaleLinear<number, number>;

  constructor(
    changeQuartetFunc: (s:string) => void,
    selectNodeFunc: (s:number, x:number, y:number) => void,
    hoverNodeFunc: (s:string) => void
  ){
    this.margin = {};
    this.width = 0;
    this.height = 0;
    this.quartetNum = "";
    this.data = [];
    this.svg = d3.select("#mainDiv")
      .append("svg")
    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleLinear();

    d3.csv("https://gist.githubusercontent.com/ericbusboom/b2ac1d366c005cd2ed8c/raw/c92c66e43d144fa9c29dbd602d5af6988e8db533/anscombes.csv")
      .then((d) =>
      {
        this.data = d;
        this.margin = {top: 20, right: 20, bottom: 20, left: 20}
        this.width = 800 - this.margin.left - this.margin.right;
        this.height = 800 - this.margin.top - this.margin.bottom;

        this.quartetNum = "I";

        this.xScale.domain([d3.min(this.data, d => +d.x)!, d3.max(this.data, d => +d.x)!])
        this.xScale.range([50, 750])

        this.yScale.domain([d3.min(this.data, d => +d.y)!, d3.max(this.data, d => +d.y)!])
        this.yScale.range([50, 750])

        d3.select("#quartets")
          .on("change", function(){
            changeQuartetFunc((this as HTMLSelectElement).value);
          })

        this.initializeVis(selectNodeFunc, hoverNodeFunc);
      })
  }

  /**
  * Creates an svg and draws the initial visualization
  */

  initializeVis(selectNodeFunc: (s:number, x:number, y:number) => void, hoverNodeFunc: (s:string) => void)
  {
    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    let currData = this.data.filter(d => {
      return d.dataset === this.quartetNum;
    })

    this.svg.selectAll("circle")
      .data(currData)
      .enter()
      .append("circle")
      .attr("class", "normalNode")
      .attr("id", d => "node_" + d.id)
      .attr("cx", d => this.xScale(+d.x))
      .attr("cy", d => this.height - this.yScale(+d.y))
      .on("click", d => selectNodeFunc(d.id, d.x, d.y))
      .on("mouseover", d => hoverNodeFunc("node_" + d.id))
      .on("mouseout", d => hoverNodeFunc(""))
  }

  /**
  * Filters the data so that only points associated with the new quartet are used
  * Updates each circle and transitions them to their new position
  */

  changeQuartet(newQuartet:string)
  {
    this.quartetNum = newQuartet;

    let currData = this.data.filter(d => {
      return d.dataset === this.quartetNum;
    })

    this.svg.selectAll("circle")
      .data(currData)
      .attr("id", d => "node_" + d.id)
      .transition()
      .duration(750)
      .attr("cx", d => this.xScale(+d.x))
      .attr("cy", d => this.height - this.yScale(+d.y))
  }

  /**
  * Ensures the previously selected node is no longer selected
  * Selects the new node
  */

  selectNode(selectedNode:string)
  {
    d3.select(".selectedNode")
      .classed("selectedNode", false)

    d3.select("#" + selectedNode)
      .classed("selectedNode", true)
  }

  /**
  * Ensures the previously hovered node is no longer hovered
  * If hoverNode is not empty, hovers the new node
  */

  hoverNode(hoverNode:string)
  {
    d3.select(".hoverNode")
      .classed("hoverNode", false)

    if(hoverNode !== "")
    {
      d3.select("#" + hoverNode)
        .classed("hoverNode", true)
    }
  }
}
