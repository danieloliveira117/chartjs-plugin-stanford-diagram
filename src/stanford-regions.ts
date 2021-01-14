import { Chart, Color, CoreScaleOptions, Point, Scale } from 'chart.js';
import {
  StanfordDiagramDataPoint,
  StanfordDiagramPluginOptions,
  StanfordDiagramRegion,
  StanfordDiagramRegionPoint,
  StanfordDiagramRegionPointGroup,
  StanfordDiagramRegionText
} from './stanford-diagram.options';

/**
 * Draws the region polygon
 */
export function drawRegions(chart: Chart<'stanford'>, pluginOptions: StanfordDiagramPluginOptions): void {
  const { regions, countOnlyVisible } = pluginOptions;

  if (!regions || regions.length === 0) {
    return;
  }

  regions.forEach((element: StanfordDiagramRegion) => {
    drawPolygon(chart.ctx, getPixelValue(chart, element.points), element.fillColor, element.strokeColor);

    if (element.text) {
      drawRegionText(chart, pluginOptions, element.text, element.points, countOnlyVisible);
    }
  });
}

/**
 * Get the number of points in a polygon
 */
export function countEpochsInRegion(
  chart: Chart<'stanford', StanfordDiagramDataPoint[], unknown>,
  pluginOptions: StanfordDiagramPluginOptions,
  points: StanfordDiagramRegionPointGroup[],
  countOnlyVisible: boolean = false
): { count: number; percentage: string } {
  const total = chart.data.datasets[0].data.reduce(
    (accumulator: number, currentValue: StanfordDiagramDataPoint) => accumulator + Number(currentValue.epochs),
    0
  );

  // Count how many points are in Region
  const count = chart.data.datasets[0].data.reduce((accumulator, currentValue) => {
    if (pointInPolygon(chart, currentValue, points, countOnlyVisible)) {
      return accumulator + Number(currentValue.epochs);
    }

    return accumulator;
  }, 0);

  return {
    count: count,
    percentage: calculatePercentageValue(pluginOptions, total, count)
  };
}

/**
 * Calculate percentage value.
 */
export function calculatePercentageValue(
  pluginOptions: StanfordDiagramPluginOptions,
  total: number,
  count: number
): string {
  const options = pluginOptions.percentage ?? {};

  if (options instanceof Intl.NumberFormat) {
    return options.format(count === 0 ? 0 : count / total);
  }

  const decimalPlaces = options.decimalPlaces ?? 1;
  const percentage = count === 0 ? 0 : (count / total) * 100;

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
 * Round number using a custom method.
 */
function round(method: (x: number) => number, value: number, precision: number): number {
  const multiplier = Math.pow(10, precision || 0);
  return method(value * multiplier) / multiplier;
}

/**
 * Draws the amount of points in a region
 */
function drawRegionText(
  chart: Chart<'stanford'>,
  pluginOptions: StanfordDiagramPluginOptions,
  text: StanfordDiagramRegionText,
  points: StanfordDiagramRegionPointGroup[],
  countOnlyVisible: boolean = false
): void {
  const { ctx, options } = chart;
  const axisX = chart.scales.x;
  const axisY = chart.scales.y;

  const { count, percentage } = countEpochsInRegion(chart, pluginOptions, points, countOnlyVisible);

  // Get text
  const content = text.format ? text.format(count, percentage) : `${count} (${percentage})`;

  const fontFamily: string = options.font!.family!;
  const fontSize: number = options.font!.size!;
  const fontColor: Color = options.color as Color;

  ctx.save();
  ctx.font = text.font ? text.font : `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = text.color ? text.color : fontColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(content, axisX.getPixelForValue(text.x, 0), axisY.getPixelForValue(text.y, 0));
  ctx.restore();
}

/**
 * Converts an array of points to the pixels in the browser
 *
 * @param chart
 * @param points
 * @returns arrayOfPointsWithCorrectScale
 */
function getPixelValue(chart: Chart<'stanford'>, points: StanfordDiagramRegionPointGroup[]): Point[] {
  const axisX = chart.scales.x;
  const axisY = chart.scales.y;

  return points.map((p: StanfordDiagramRegionPointGroup) => ({
    x: axisX.getPixelForValue(getPointToDraw(p.x, axisX, axisY), 0),
    y: axisY.getPixelForValue(getPointToDraw(p.y, axisX, axisY), 0)
  }));
}

/**
 * Obtains the point to draw.
 */
function getPointToDraw(
  point: StanfordDiagramRegionPoint,
  axisX: Scale<CoreScaleOptions>,
  axisY: Scale<CoreScaleOptions>
): number {
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
 */
function getPointToDrawForPolygon(
  point: StanfordDiagramRegionPoint,
  axisX: Scale<CoreScaleOptions>,
  axisY: Scale<CoreScaleOptions>,
  comparePoint: number,
  axis: string
): number {
  switch (point) {
    case 'MAX_XY':
      if (axis === 'x' && comparePoint > axisX.max) {
        return Math.ceil((comparePoint * axisY.max) / axisX.max) + 1;
      }

      if (axis === 'y' && comparePoint > axisY.max) {
        return Math.ceil((comparePoint * axisX.max) / axisY.max) + 1;
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
 */
export function pointInPolygon(
  chart: Chart,
  point: Point,
  polygon: StanfordDiagramRegionPointGroup[],
  countOnlyVisible: boolean = false
): boolean {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  const axisX = chart.scales.x;
  const axisY = chart.scales.y;

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

    intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Draw a polygon in a canvas 2DContext
 */
function drawPolygon(
  ctx: CanvasRenderingContext2D,
  pointsArray: Point[],
  fillColor?: Color,
  strokeColor?: Color
): void {
  if (pointsArray.length <= 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'destination-over'; // draw behind existing pixels https://stackoverflow.com/questions/9165766/html5-canvas-set-z-index/26064753

  ctx.beginPath();
  ctx.moveTo(pointsArray[0].x, pointsArray[0].y);

  for (let i = 1; i < pointsArray.length; i++) {
    ctx.lineTo(pointsArray[i].x, pointsArray[i].y);
  }

  ctx.closePath();

  if (strokeColor) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.restore();
}
