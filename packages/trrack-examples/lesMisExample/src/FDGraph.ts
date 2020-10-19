/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import * as d3 from 'd3';

export default class Graph {
  graph:any;

  private hoverOver: (id: any) => void;

  private hoverOut: () => void;

  private select: (id: any) => void;

  private dragEnded: (d: any) => void;

  constructor(graph, hoverOver, hoverOut, select, dragEnded) {
    this.graph = graph;

    this.hoverOver = hoverOver;
    this.hoverOut = hoverOut;
    this.select = select;
    this.dragEnded = dragEnded;

    this.drawGraph();
  }

  drawGraph() {
    const svg = d3.select('#viz');

    svg.selectAll('g').remove();

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append('button')
      .attr('class', 'undoRedoButton');

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.graph.links)
      .join('line')
      .attr('stroke-width', (d:any) => Math.sqrt(d.value));

    const node = svg.append('g')
      .classed('circleG', true)
      .selectAll('circle')
      .data(this.graph.nodes)
      .join('circle')
      .classed('nodes', true)
      .attr('id', (d:any) => `${d.id}N`)
      .attr('fill', (d:any) => color(d.group))
      .attr('r', 5)
      .call(d3.drag()
        .on('drag', (d) => this.dragged(d, link, node))
        .on('end', (d) => this.dragEnded(d)))
      .on('click', (d) => this.select(d))
      .on('mouseover', (d) => this.hoverOver(d))
      .on('mouseout', (d) => this.hoverOut());

    node
      .append('title')
      .text((d) => d.id);

    this.draw(link, node);
  }

  dragged(d: any, link, node) {
    d.x = d3.event.x;
    d.y = d3.event.y;
    this.draw(link, node);
  }

  draw(link, node) {
    link
      .attr('x1', (d:any) => d.source.x)
      .attr('y1', (d:any) => d.source.y)
      .attr('x2', (d:any) => d.target.x)
      .attr('y2', (d:any) => d.target.y);

    node
      .attr('cx', (d:any) => d.x)
      .attr('cy', (d:any) => d.y);
  }

  selectNode(id) {
    this.deselectAllNodes();

    d3.select(`circle[id='${id}N']`)
      .classed('selectedNode', true)
      .attr('r', 10);

    const edges = this.graph.links.filter((d) => d.source.id === id || d.target.id === id);

    edges.forEach((data) => {
      d3.select(`circle[id='${data.source.id}N']`).filter((d:any) => d.id !== id)
        .classed('nodeEdges', true);

      d3.select(`circle[id='${data.target.id}N']`).filter((d:any) => d.id !== id)
        .classed('nodeEdges', true);
    });
  }

  deselectAllNodes() {
    d3.select('#viz')
      .selectAll('circle')
      .classed('nodeEdges', false)
      .classed('selectedNode', false)
      .attr('r', 5);
  }

  hoverNode(id) {
    d3.select('#viz')
      .select(`circle[id='${id}N']`)
      .classed('hoverNode', true)
      .attr('r', 8);
  }

  dehoverNodes() {
    const s = d3.select('#viz')
      .select('.hoverNode')
      .classed('hoverNode', false);

    if (s.classed('selectedNode')) {
      s.attr('r', 10);
    } else {
      s.attr('r', 5);
    }
  }

  moveNodes(newGraph) {
    for (const i of this.graph.nodes) {
      i.x = newGraph[i.id][0];
      i.y = newGraph[i.id][1];
    }

    for (const i of this.graph.links) {
      i.source.x = newGraph[i.source.id][0];
      i.source.y = newGraph[i.source.id][1];
      i.target.x = newGraph[i.target.id][0];
      i.target.y = newGraph[i.target.id][1];
    }

    const link = d3.select('#viz').select('g.links').selectAll('line');

    const node = d3.select('#viz').select('g.circleG').selectAll('circle');

    this.draw(link, node);
  }
}
