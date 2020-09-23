import { interpolateHSL, range, scaleSequential, sequentialLog } from './stanford-utils.js';
import { customTooltipStyle } from './stanford-tooltip-style.js';

/**
 * Get the stanfordPlugin options
 *
 * @param chartOptions
 * @returns {*|options.stanfordDiagram|{}}
 */
export function getStanfordConfig(chartOptions) {
  const { plugins } = chartOptions;
  const pluginStanfordChart = plugins && plugins.stanfordDiagram ? plugins.stanfordDiagram : null;

  return pluginStanfordChart || chartOptions.stanfordDiagram || {};
}

/**
 * Draws the region polygon
 *
 * @param chart - Chart.js instance
 * @param regions - Array of regions
 * @param countOnlyVisible - Count only the visible points
 */
function drawRegions(chart, regions, countOnlyVisible) {
  const { ctx } = chart;

  if (!regions) return;

  regions.forEach((element) => {
    ctx.polygon(getPixelValue(chart, element.points), element.fillColor, element.strokeColor);

    if (element.text) {
      drawRegionText(chart, element.text, element.points, countOnlyVisible);
    }
  });
}

/**
 * Get the number of points in a polygon
 *
 * @param chart - Chart.js instance
 * @param points - Array of points
 * @param countOnlyVisible - Count only the visible points
 * @returns {{percentage: string, value: number}}
 */
export function countEpochsInRegion(chart, points, countOnlyVisible) {
  const total = chart.data.datasets[0].data
    .reduce((accumulator, currentValue) => accumulator + Number(currentValue.epochs), 0);

  // Count how many points are in Region
  const count = chart.data.datasets[0].data.reduce((accumulator, currentValue) => {
    if (pointInPolygon(chart, currentValue, points, countOnlyVisible)) {
      return accumulator + Number(currentValue.epochs);
    }

    return accumulator;
  }, 0);

  return {
    count: count,
    percentage: calculatePercentageValue(chart, total, count)
  };
}

/**
 * Calculate percentage value.
 *
 * @param chart - Chart.js instance
 * @param total - total of points
 * @param count - number of points in the region
 * @return {string} the percentage value as string
 */
export function calculatePercentageValue(chart, total, count) {
  const options = chart.options.plugins.stanfordDiagram && chart.options.plugins.stanfordDiagram.percentage ? chart.options.plugins.stanfordDiagram.percentage : {};

  if (options instanceof Intl.NumberFormat) {
    return options.format(count === 0 ? 0 : count / total);
  }

  const decimalPlaces = isNaN(+options.decimalPlaces) ? 1 : options.decimalPlaces;
  const percentage = count === 0 ? 0 : count / total * 100;

  if (percentage === 0) {
    return percentage.toFixed(decimalPlaces);
  }

  let roundingMethod;

  switch (options.roundingMethod) {
  case 'ceil':
    roundingMethod = Math.ceil;
    break;
  case 'floor':
    roundingMethod = Math.floor;
    break;
  case 'round':
  default:
    roundingMethod = Math.round;
    break;
  }

  return round(roundingMethod, percentage, decimalPlaces).toFixed(decimalPlaces);
}

/**
 * Round
 * @param method
 * @param value
 * @param precision
 * @return {number}
 */
function round(method, value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return method(value * multiplier) / multiplier;
}

/**
 * Draws the amount of points in a region
 *
 * @param chart
 * @param text
 * @param points
 * @param countOnlyVisible
 */
function drawRegionText(chart, text, points, countOnlyVisible) {
  const { ctx } = chart;
  const axisX = chart.scales['x-axis-1'];
  const axisY = chart.scales['y-axis-1'];

  const { count, percentage } = countEpochsInRegion(chart, points, countOnlyVisible);

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

  return points.map(p => ({
    x: axisX.getPixelForValue(getPointToDraw(p.x, axisX, axisY)),
    y: axisY.getPixelForValue(getPointToDraw(p.y, axisX, axisY))
  }));
}

/**
 * Obtains the point to draw.
 *
 * @param point
 * @param axisX
 * @param axisY
 * @returns {number} point to draw
 */
function getPointToDraw(point, axisX, axisY) {
  switch (point) {
  case 'MAX_XY':
    return Math.min(axisX.max, axisY.max);
  case 'MAX_X':
    return axisX.max;
  case 'MAX_Y':
    return axisY.max;
  default:
    return point;
  }
}

/**
 * Obtains the point to draw.
 *
 * @param point
 * @param axisX
 * @param axisY
 * @param comparePoint
 * @param axis 'x' or 'y'
 *
 * @returns {number} point to draw
 */
function getPointToDrawForPolygon(point, axisX, axisY, comparePoint, axis) {
  switch (point) {
  case 'MAX_XY':
    if (axis === 'x' && comparePoint > axisX.max) {
      return Math.ceil(comparePoint * axisY.max / axisX.max) + 1;
    }

    if (axis === 'y' && comparePoint > axisY.max) {
      return Math.ceil(comparePoint * axisX.max / axisY.max) + 1;
    }

    return Math.min(axisX.max, axisY.max) + 1;
  case 'MAX_X':
    if (axis === 'x' && comparePoint > axisX.max) {
      return comparePoint + 1;
    }

    return axisX.max + 1;
  case 'MAX_Y':
    if (axis === 'y' && comparePoint > axisY.max) {
      return comparePoint + 1;
    }

    return axisY.max + 1;
  default:
    return point;
  }
}


/**
 * Check if point is inside polygon
 * thanks to: http://bl.ocks.org/bycoffe/5575904
 *
 * @param chart
 * @param point
 * @param polygon
 * @param countOnlyVisible
 *
 * @returns {boolean}
 */
export function pointInPolygon(chart, point, polygon, countOnlyVisible) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  const axisX = chart.scales['x-axis-1'];
  const axisY = chart.scales['y-axis-1'];

  let xi;
  let yi;
  let yj;
  let xj;
  let intersect;
  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (countOnlyVisible) {
      xi = getPointToDraw(polygon[i].x, axisX, axisY);
      yi = getPointToDraw(polygon[i].y, axisX, axisY);
      xj = getPointToDraw(polygon[j].x, axisX, axisY);
      yj = getPointToDraw(polygon[j].y, axisX, axisY);

      if (typeof polygon[i].x !== 'number') {
        xi += 1;
      }

      if (typeof polygon[i].y !== 'number') {
        yi += 1;
      }

      if (typeof polygon[j].x !== 'number') {
        xj += 1;
      }

      if (typeof polygon[j].y !== 'number') {
        yj += 1;
      }
    } else {
      xi = getPointToDrawForPolygon(polygon[i].x, axisX, axisY, x, 'x');
      xj = getPointToDrawForPolygon(polygon[j].x, axisX, axisY, x, 'x');
      yi = getPointToDrawForPolygon(polygon[i].y, axisX, axisY, y, 'y');
      yj = getPointToDrawForPolygon(polygon[j].y, axisX, axisY, y, 'y');
    }

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
 * @param maxEpochs
 */
function drawColorScale(chart, maxEpochs) {
  const { ctx } = chart;

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

  drawLegendAxis(chart, ctx, maxEpochs, startPoint + barWidth, startValue, endValue);

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
 * @param maxEpochs
 * @param startPointLeft
 * @param startValue
 * @param endValue
 */
function drawLegendAxis(chart, ctx, maxEpochs, startPointLeft, startValue, endValue) {
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

  const numberOfTicks = getNumberOfTicks(maxEpochs);

  // Ticks marks along the positive Y-axis
  // Positive Y-axis of graph is negative Y-axis of the canvas
  for (let i = 0; i <= numberOfTicks; i++) {
    const posY = endValue - ((endValue - startValue) / numberOfTicks * i);

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
 * Gets number of ticks from maxEpochs value
 *
 * @param maxEpochs
 */
function getNumberOfTicks(maxEpochs) {
  const maxExp = maxEpochs.toExponential();

  return +maxExp.split('e', 2)[1];
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
export const stanfordDiagramPlugin = {
  beforeInit(c) {
    const ns = c.stanfordDiagramPlugin = {
      options: getStanfordConfig(c.options.plugins)
    };

    if (!ns.options.maxEpochs) {
      ns.options.maxEpochs = 10000;
    }

    ns.colorScale = sequentialLog(value => interpolateHSL([0.7, 1, 0.5], [0, 1, 0.5], value))
      .domain([1, ns.options.maxEpochs]);

    // add space for scale
    c.options.layout.padding.right += 100;
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
    drawColorScale(c, c.stanfordDiagramPlugin.options.maxEpochs);
    drawRegions(c, c.stanfordDiagramPlugin.options.regions, !!c.stanfordDiagramPlugin.options.countOnlyVisible);
  }
};
