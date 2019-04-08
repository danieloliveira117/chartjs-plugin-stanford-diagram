import { range, scaleSequential, scaleLog, interpolateHSL } from './stanford-utils';

/**
 * Get the stanfordPlugin options
 *
 * @param chartOptions
 * @returns {*|options.stanfordDiagram|{regions}|{}}
 */
function getStanfordConfig(chartOptions) {
  const { plugins } = chartOptions;
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
  const { ctx } = chart;

  if (!regions) return;

  regions.forEach((element) => {
    ctx.polygon(getPixelValue(chart, element.points), element.fillColor, element.strokeColor);

    if (element.text) {
      drawRegionText(chart, element.text, element.points);
    }
  });
}

/**
 * Draws the amount of points in a region
 *
 * @param chart
 * @param text
 * @param points
 */
function drawRegionText(chart, text, points) {
  const { ctx } = chart;
  const axisX = chart.scales['x-axis-1'];
  const axisY = chart.scales['y-axis-1'];

  const total = chart.data.datasets[0].data.reduce((accumulator, currentValue) => accumulator + Number(currentValue.epochs), 0);

  // Count how many points are in Region
  const count = chart.data.datasets[0].data.reduce((accumulator, currentValue) => {
    if (pointInPolygon(currentValue, points)) {
      return accumulator + Number(currentValue.epochs);
    }

    return accumulator;
  }, 0);

  const percentage = count !== 0 ? (count / total * 100).toFixed(1) : 0;

  // Get text
  const content = text.format ? text.format(count, percentage) : `${count} (${percentage})`;

  ctx.save();
  ctx.font = text.font ? text.font : `11px ${Chart.defaults.global.defaultFontFamily}`;
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

  return points.map(p => ({ x: axisX.getPixelForValue(p.x), y: axisY.getPixelForValue(p.y) }));
}

/**
 * Check if point is inside polygon
 * thanks to: http://bl.ocks.org/bycoffe/5575904
 *
 * @param point
 * @param polygon
 * @returns {boolean}
 */
function pointInPolygon(point, polygon) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  let xi; let yi; let yj; let xj; let intersect;
  const { x } = point;
  const { y } = point;
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
 * @param draw
 * @returns function to get the color of a respective value
 */
function createColorScale(chart, draw) {
  const { ctx } = chart;

  const barWidth = 25;
  const barHeight = 5;

  const startValue = chart.chartArea.top + 15;
  const intervalValue = barHeight;
  let endValue = chart.chartArea.bottom - 15;


  const colorScale = scaleSequential(value => interpolateHSL([0.7, 1, 0.5], [0, 1, 0.5], value))
    .domain([startValue, endValue]);

  const valueScale = scaleLog()
    .domain([1, 10000])
    .range([startValue, endValue]);

  if (draw) {
    const startPoint = chart.chartArea.right + 10;

    const points = range(startValue, endValue, intervalValue);

    const axisX = chart.scales['x-axis-1'];
    const axisY = chart.scales['y-axis-1'];

    ctx.save();

    points.forEach((p) => {
      ctx.fillStyle = colorScale(endValue - p);
      ctx.fillRect(startPoint, p, barWidth, barHeight);
    });

    // get rounded end value
    endValue = points[points.length - 1] + intervalValue;

    drawLegendAxis(ctx, startPoint + barWidth, startValue, endValue);

    // Draw XY line
    const minMaxXY = Math.min(axisX.max, axisY.max);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

    ctx.beginPath();
    ctx.moveTo(axisX.getPixelForValue(axisX.min), axisY.getPixelForValue(axisY.min));
    ctx.lineTo(axisX.getPixelForValue(minMaxXY), axisY.getPixelForValue(minMaxXY));
    ctx.stroke();

    ctx.restore();
  }

  return value => colorScale(valueScale(value));
}

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
/**
 * Draw the color scale legend axis
 *
 * @param ctx
 * @param startPointLeft
 * @param startValue
 * @param endValue
 */
function drawLegendAxis(ctx, startPointLeft, startValue, endValue) {
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

    ctx.font = `10px ${Chart.defaults.global.defaultFontFamily}`;
    ctx.fillText(`${'10 '}`, startPointLeft + 9, posY);

    ctx.font = `9px ${Chart.defaults.global.defaultFontFamily}`;
    ctx.fillText(`${i}`, startPointLeft + 20, posY - 7);
  }
}

/**
 * Extension to draw a polygon in a canvas 2DContext
 *
 * @param pointsArray
 * @param fillColor
 * @param strokeColor
 */
CanvasRenderingContext2D.prototype.polygon = function (pointsArray, fillColor, strokeColor) {
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
Chart.controllers.stanford = Chart.controllers.line;

Chart.defaults._set('stanford', {
  animation: false,
  aspectRatio: 1.12,
  elements: {
    point: {
      radius: 4,
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
    callbacks: {
      title: function() {
        return '';     // doesn't make sense for stanford since data are formatted as a point
      },
      label: function (item, data) {
        return `S: ${data.datasets[0].data[item.index].epochs}   (${item.xLabel}, ${item.yLabel})`;
      }
    }
  }
});

/**
 * Stanford Diagram Plugin
 */
const stanfordDiagramPlugin = {
  beforeInit(chartInstance) {
    const ns = chartInstance.stanfordDiagramPlugin = {
      options: getStanfordConfig(chartInstance.options.plugins),
    };

    ns.colorScale = undefined;

    // add space for scale
    chartInstance.options.layout.padding.right += 65;
  },
  afterRender(chartInstance) {
    const ns = chartInstance.stanfordDiagramPlugin;

    // Avoid infinite cycle
    if (!ns.colorScale) {
      ns.colorScale = createColorScale(chartInstance, false);

      chartInstance.update();
    } else {
      ns.colorScale = createColorScale(chartInstance, true);

      drawRegions(chartInstance, ns.options.regions);
    }
  },
  beforeDatasetsUpdate(chartInstance) {
    const ns = chartInstance.stanfordDiagramPlugin;

    if (ns.colorScale) {
      chartInstance.data.datasets[0].pointBackgroundColor = [];

      for (let i = 0; i < chartInstance.data.datasets[0].data.length; i++) {
        chartInstance.data.datasets[0].pointBackgroundColor[i] =
				ns.colorScale(chartInstance.data.datasets[0].data[i].epochs);
      }
    }
  },
};

export default stanfordDiagramPlugin;
