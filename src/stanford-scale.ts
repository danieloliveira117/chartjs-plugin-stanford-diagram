import { Chart } from 'chart.js';
import { StanfordDiagramDataPoint, StanfordDiagramOptions } from './stanford-diagram.options';
import { interpolateHSL, range, scaleSequential } from './stanford-utils';

/**
 * Create color scale, if {draw} is true, it draws the scale
 */
export function drawColorScale(chart: Chart<'stanford'>, pluginOptions: StanfordDiagramOptions, maxEpochs: number) {
  const { ctx, options } = chart;

  const barWidth = 25;
  const barHeight = 5;

  const startValue = chart.chartArea.top + 5;
  const intervalValue = barHeight;
  let endValue = chart.chartArea.bottom;

  // @ts-ignore
  const linearScale = scaleSequential((value: number) => interpolateHSL([0.7, 1, 0.5], [0, 1, 0.5], value)).domain([
    startValue,
    endValue
  ]);

  const startPoint = chart.chartArea.right + 25;

  const points = range(startValue, endValue, intervalValue);

  const axisX = chart.scales.x;
  const axisY = chart.scales.y;

  ctx.save();

  points.forEach((p) => {
    ctx.fillStyle = linearScale(endValue - p);
    ctx.fillRect(startPoint, p, barWidth, barHeight);
  });

  // get rounded end value
  endValue = points[points.length - 1] + intervalValue;

  drawLegendAxis(chart, maxEpochs, startPoint + barWidth, startValue, endValue);

  // Draw XY line
  const minMaxXY = Math.min(axisX.max, axisY.max);

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

  ctx.beginPath();
  ctx.moveTo(axisX.getPixelForValue(axisX.min, 0), axisY.getPixelForValue(axisY.min, 0));
  ctx.lineTo(axisX.getPixelForValue(minMaxXY, 0), axisY.getPixelForValue(minMaxXY, 0));
  ctx.stroke();

  ctx.restore();

  const fontSize: number = options.font!.size!;
  const legendPosition = startPoint + barWidth + 9 + fontSize + 22;

  drawLegendLabel(chart, pluginOptions, legendPosition, startValue, endValue);
}

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
/**
 * Draw the color scale legend axis
 */
function drawLegendAxis(
  { ctx, options }: Chart<'stanford'>,
  maxEpochs: number,
  startPointLeft: number,
  startValue: number,
  endValue: number
) {
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
    const posY = endValue - ((endValue - startValue) / numberOfTicks) * i;

    ctx.beginPath();

    ctx.moveTo(startPointLeft, posY);
    ctx.lineTo(startPointLeft + 6, posY);
    ctx.stroke();

    const fontFamily: string = options.font!.family!;
    const fontSize: number = options.font!.size!;

    ctx.font = `${fontSize - 1}px ${fontFamily}`;
    ctx.fillText(`${'10 '}`, startPointLeft + 9, posY);

    ctx.font = `${fontSize - 2}px ${fontFamily}`;
    ctx.fillText(`${i}`, startPointLeft + 9 + fontSize, posY - 7);
  }
}

/**
 * Gets number of ticks from maxEpochs value
 */
function getNumberOfTicks(maxEpochs: number): number {
  const maxExp = maxEpochs.toExponential();

  return +maxExp.split('e', 2)[1];
}

/**
 * Draw the color scale legend label.
 */
function drawLegendLabel(
  { ctx, options }: Chart<'stanford', StanfordDiagramDataPoint[], unknown>,
  pluginOptions: StanfordDiagramOptions,
  startPointLeft: any,
  startValue: number,
  endValue: number
): void {
  const text = pluginOptions.legendLabel || 'Number of samples (epochs) per point';

  // http://www.java2s.com/Tutorials/HTML_CSS/HTML5_Canvas_Reference/rotate.htm
  ctx.save();

  const fontFamily: string = options.font!.family!;
  const fontSize: number = options.font!.size!;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';

  const metrics = ctx.measureText(text);

  ctx.translate(startPointLeft, (endValue - startValue) / 2 + metrics.width / 2);
  ctx.rotate(-Math.PI / 2);

  ctx.fillText(text, 0, 0);
  ctx.restore();
}
