import {range, scaleSequential, sequentialLog, interpolateHSL} from './stanford-utils.js';
import {customTooltipStyle} from './stanford-tooltip-style.js';

/**
 * Get the stanfordPlugin options
 *
 * @param chartOptions
 * @returns {*|options.stanfordDiagram|{regions}|{}}
 */
export function getStanfordConfig(chartOptions) {
  const {plugins} = chartOptions;
  const pluginStanfordChart = plugins && plugins.stanfordDiagram ? plugins.stanfordDiagram : null;

  return pluginStanfordChart || chartOptions.stanfordDiagram || {};
}

/**
 * Draws the region polygon
 *
 * @param chart
 * @param regions
 */
function drawRegions(chart, regions) {
  const {ctx} = chart;

  if (!regions) return;

  regions.forEach((element) => {
    ctx.polygon(getPixelValue(chart, element.points), element.fillColor, element.strokeColor);

    if (element.text) {
      drawRegionText(chart, element.text, element.points);
    }
  });
}

/**
 * Get the number of points in a polygon
 *
 * @param chart - Chart.js instance
 * @param points - Array of points
 * @returns {{percentage: string, value: number}}
 */
export function countEpochsInRegion(chart, points) {
  const total = chart.data.datasets[0].data.reduce((accumulator, currentValue) => accumulator + Number(currentValue.epochs), 0);

  // Count how many points are in Region
  const count = chart.data.datasets[0].data.reduce((accumulator, currentValue) => {
    if (pointInPolygon(currentValue, points)) {
      return accumulator + Number(currentValue.epochs);
    }

    return accumulator;
  }, 0);

  return {
    count: count,
    percentage: count !== 0 ? (count / total * 100).toFixed(1) : 0
  };
}

/**
 * Draws the amount of points in a region
 *
 * @param chart
 * @param text
 * @param points
 */
function drawRegionText(chart, text, points) {
  const {ctx} = chart;
  const axisX = chart.scales['x-axis-1'];
  const axisY = chart.scales['y-axis-1'];

  const {count, percentage} = countEpochsInRegion(chart, points);

  // Get text
  const content = text.format ? text.format(count, percentage) : `${count} (${percentage})`;

  ctx.save();
  ctx.font = text.font ? text.font : `${chart.options.defaultFontSize}px ${Chart.defaults.global.defaultFontFamily}`;
  ctx.fillStyle = text.color ? text.color : Chart.defaults.global.defaultFontColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(content, axisX.getPixelForValue(text.x), axisY.getPixelForValue(text.y));
  ctx.restore();
}

/**
 * Converts an array of points to the pixels in the browser
 *
 * @param chart
 * @param points
 * @returns arrayOfPointsWithCorrectScale
 */
function getPixelValue(chart, points) {
  const axisX = chart.scales['x-axis-1'];
  const axisY = chart.scales['y-axis-1'];

  return points.map(p => ({x: axisX.getPixelForValue(p.x), y: axisY.getPixelForValue(p.y)}));
}

/**
 * Check if point is inside polygon
 * thanks to: http://bl.ocks.org/bycoffe/5575904
 *
 * @param point
 * @param polygon
 * @returns {boolean}
 */
export function pointInPolygon(point, polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  let xi;
  let yi;
  let yj;
  let xj;
  let intersect;
  const {x} = point;
  const {y} = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    xi = polygon[i].x;
    yi = polygon[i].y;

    xj = polygon[j].x;
    yj = polygon[j].y;

    intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Create color scale, if {draw} is true, it draws the scale
 *
 * @param chart
 */
function drawColorScale(chart) {
  const {ctx} = chart;

  const barWidth = 25;
  const barHeight = 5;

  const startValue = chart.chartArea.top + 5;
  const intervalValue = barHeight;
  let endValue = chart.chartArea.bottom;

  const linearScale = scaleSequential(value => interpolateHSL([0.7, 1, 0.5], [0, 1, 0.5], value))
    .domain([startValue, endValue]);

  const startPoint = chart.chartArea.right + 25;

  const points = range(startValue, endValue, intervalValue);

  const axisX = chart.scales['x-axis-1'];
  const axisY = chart.scales['y-axis-1'];

  ctx.save();

  points.forEach((p) => {
    ctx.fillStyle = linearScale(endValue - p);
    ctx.fillRect(startPoint, p, barWidth, barHeight);
  });

  // get rounded end value
  endValue = points[points.length - 1] + intervalValue;

  drawLegendAxis(chart, ctx, startPoint + barWidth, startValue, endValue);

  // Draw XY line
  const minMaxXY = Math.min(axisX.max, axisY.max);

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

  ctx.beginPath();
  ctx.moveTo(axisX.getPixelForValue(axisX.min), axisY.getPixelForValue(axisY.min));
  ctx.lineTo(axisX.getPixelForValue(minMaxXY), axisY.getPixelForValue(minMaxXY));
  ctx.stroke();

  ctx.restore();

  const legendPosition = startPoint + barWidth + 9 + chart.options.defaultFontSize + 22;

  drawLegendLabel(chart, ctx, legendPosition, startValue, endValue);
}

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
/**
 * Draw the color scale legend axis
 *
 * @param chart
 * @param ctx
 * @param startPointLeft
 * @param startValue
 * @param endValue
 */
function drawLegendAxis(chart, ctx, startPointLeft, startValue, endValue) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';

  // Vertical Line
  ctx.beginPath();
  ctx.moveTo(startPointLeft + 0.5, startValue);
  ctx.lineTo(startPointLeft + 0.5, endValue);
  ctx.stroke();

  // Text value at that point
  ctx.textAlign = 'start';
  ctx.textBaseline = 'middle';

  // Ticks marks along the positive Y-axis
  // Positive Y-axis of graph is negative Y-axis of the canvas
  for (let i = 0; i < 5; i++) {
    const posY = endValue - ((endValue - startValue) / 4 * i);

    ctx.beginPath();

    ctx.moveTo(startPointLeft, posY);
    ctx.lineTo(startPointLeft + 6, posY);
    ctx.stroke();

    ctx.font = `${chart.options.defaultFontSize - 1}px ${Chart.defaults.global.defaultFontFamily}`;
    ctx.fillText(`${'10 '}`, startPointLeft + 9, posY);

    ctx.font = `${chart.options.defaultFontSize - 2}px ${Chart.defaults.global.defaultFontFamily}`;
    ctx.fillText(`${i}`, startPointLeft + 9 + chart.options.defaultFontSize, posY - 7);
  }
}

/**
 * Draw the color scale legend label
 *
 * @param chart
 * @param ctx
 * @param startPointLeft
 * @param startValue
 * @param endValue
 */
function drawLegendLabel(chart, ctx, startPointLeft, startValue, endValue) {
  const text = chart.options.plugins.stanfordDiagram.legendLabel || 'Number of samples (epochs) per point';

  // http://www.java2s.com/Tutorials/HTML_CSS/HTML5_Canvas_Reference/rotate.htm
  ctx.save();

  ctx.font = `${chart.options.defaultFontSize}px ${Chart.defaults.global.defaultFontFamily}`;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';

  const metrics = ctx.measureText(text);

  ctx.translate(startPointLeft, (endValue - startValue) / 2 + metrics.width / 2);
  ctx.rotate(-Math.PI / 2);

  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/**
 * Extension to draw a polygon in a canvas 2DContext
 *
 * @param pointsArray
 * @param fillColor
 * @param strokeColor
 */
CanvasRenderingContext2D.prototype.polygon = function(pointsArray, fillColor, strokeColor) {
  if (pointsArray.length <= 0) return;

  this.save();
  this.globalCompositeOperation = 'destination-over'; // draw behind existing pixels https://stackoverflow.com/questions/9165766/html5-canvas-set-z-index/26064753

  this.beginPath();
  this.moveTo(pointsArray[0].x, pointsArray[0].y);

  for (let i = 1; i < pointsArray.length; i++) {
    this.lineTo(pointsArray[i].x, pointsArray[i].y);
  }

  this.closePath();

  if (strokeColor) {
    this.lineWidth = 1;
    this.strokeStyle = strokeColor;
    this.stroke();
  }

  if (fillColor) {
    this.fillStyle = fillColor;
    this.fill();
  }

  this.restore();
};

/**
 * Stanford Diagram -- chart type
 */
Chart.controllers.stanford = Chart.controllers.line.extend({
  update: function() {
    // "Responsive" point radius
    this.chart.options.elements.point.radius = Math.max(Math.round(this.chart.height / 200), 1);

    Chart.controllers.line.prototype.update.apply(this, arguments);
  }
});

Chart.defaults._set('stanford', {
  animation: false,
  aspectRatio: 1.12,
  elements: {
    point: {
      radius: 2.5,
      pointStyle: 'rect'
    }
  },
  hover: {
    mode: null
  },
  legend: {
    display: false
  },
  scales: {
    xAxes: [{
      id: 'x-axis-1',    // need an ID so datasets can reference the scale
      type: 'linear',    // stanford should not use a category axis
      position: 'bottom',
      ticks: {
        suggestedMax: 60,
        beginAtZero: true
      }
    }],
    yAxes: [{
      id: 'y-axis-1',
      type: 'linear',
      position: 'left',
      ticks: {
        suggestedMax: 60,
        beginAtZero: true
      }
    }]
  },
  showLines: false,
  tooltips: {
    // Disable the on-canvas tooltip
    enabled: false,
    custom: customTooltipStyle,
    callbacks: {
      title: function(item) {
        return [
          {
            label: this._chart.scales['x-axis-1'].options.scaleLabel.labelString,
            value: item[0].xLabel
          }, {
            label: this._chart.scales['y-axis-1'].options.scaleLabel.labelString,
            value: item[0].yLabel
          }
        ];
      },
      label: function(item, data) {
        return {
          label: this._chart.options.plugins.stanfordDiagram.epochsLabel || 'Epochs',
          value: data.datasets[0].data[item.index].epochs
        };
      }
    }
  }
});

/**
 * Stanford Diagram Plugin
 */
const stanfordDiagramPlugin = {
  beforeInit(c) {
    const ns = c.stanfordDiagramPlugin = {
      options: getStanfordConfig(c.options.plugins),
    };

    ns.colorScale = sequentialLog(value => interpolateHSL([0.7, 1, 0.5], [0, 1, 0.5], value))
      .domain([1, 10000]);

    // add space for scale
    c.options.layout.padding.right += 95;
  },
  beforeDatasetsUpdate(c) {
    const ns = c.stanfordDiagramPlugin;

    if (ns.colorScale) {
      c.data.datasets[0].pointBackgroundColor = [];

      for (let i = 0; i < c.data.datasets[0].data.length; i++) {
        c.data.datasets[0].pointBackgroundColor[i] =
          ns.colorScale(c.data.datasets[0].data[i].epochs);
      }
    }
  },
  beforeUpdate(c) {
    // "Responsive" font-size with a min size of 8px
    c.chart.options.defaultFontSize = Math.max(Math.round(c.chart.height / 50), 8);
  },
  afterRender(c) {

    drawColorScale(c);
    drawRegions(c, c.stanfordDiagramPlugin.options.regions);
  }
};

export default stanfordDiagramPlugin;
