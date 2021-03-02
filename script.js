'use strict';

// const canvas = d3.select('.canvas');
// const svg = canvas.append('svg').attr('height', 600).attr('width', 600);

// const group = svg.append('g').attr('transform', 'translate(0, 100)');

// group
//   .append('rect')
//   .attr('width', 200)
//   .attr('height', 100)
//   .attr('fill', 'blue')
//   .attr('x', 20)
//   .attr('y', 20);

// group
//   .append('circle')
//   .attr('r', 50)
//   .attr('cx', 300)
//   .attr('cy', 70)
//   .attr('fill', 'pink');

// group
//   .append('line')
//   .attr('x1', 370)
//   .attr('x2', 400)
//   .attr('y1', 20)
//   .attr('y2', 120)
//   .attr('stroke', 'red');

// group
//   .append('text')
//   .attr('x', 20)
//   .attr('y', 200)
//   .attr('fill', 'black')
//   .text('Hello, this is .svg')
//   .style('font-family', 'arial');

// const data = [
//   { width: 200, height: 100, fill: 'red' },
//   { width: 100, height: 60, fill: 'pink' },
//   { width: 50, height: 30, fill: 'purple' },
// ];

// const svg = d3.select('svg');
// const rects = svg
//   .selectAll('rect')
//   .data(data)
//   .attr('width', d => d.width)
//   .attr('height', d => d.height)
//   .attr('fill', d => d.fill);

// rects
//   .enter()
//   .append('rect')
//   .attr('width', d => d.width)
//   .attr('height', d => d.height)
//   .attr('fill', d => d.fill);

// const svg = d3.select('svg');
// d3.json('planets.json').then(data => {
//   const circs = svg.selectAll('circle').data(data);

//   circs
//     .attr('cy', 200)
//     .attr('cx', d => d.distance)
//     .attr('r', d => d.radius)
//     .attr('fill', d => d.fill);

//   circs
//     .enter()
//     .append('circle')
//     .attr('cy', 200)
//     .attr('cx', d => d.distance)
//     .attr('r', d => d.radius)
//     .attr('fill', d => d.fill);
// });

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600);

const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.right})`);

const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append('g');

const y = d3.scaleLinear().range([graphHeight, 0]);

const x = d3.scaleBand().range([0, 500]).paddingInner(0.2).paddingOuter(0.2);

const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' orders');

xAxisGroup
  .selectAll('text')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end')
  .attr('fill', 'orange');

const t = d3.transition().duration(1500);

const update = data => {
  y.domain([0, d3.max(data, d => d.orders)]);
  x.domain(data.map(item => item.name));

  const rects = graph.selectAll('rect').data(data);

  rects.exit().remove();

  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .transition(t)
    .attr('height', d => graphHeight - y(d.orders))
    .attr('y', d => y(d.orders));

  rects
    .enter()
    .append('rect')
    .attr('height', 0)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    .attr('y', graphHeight)
    .transition(t)
    .attrTween('width', widthTween)
    .attr('y', d => y(d.orders))
    .attr('height', d => graphHeight - y(d.orders));

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};

var data = [];

db.collection('dishes').onSnapshot(res => {
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modifed':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

const widthTween = d => {
  let i = d3.interpolate(0, x.bandwidth());

  return function (t) {
    return i(t);
  };
};
