// import { range } from '../node_modules/d3-array/dist/d3-array.js';
// import { scaleLinear, scaleSequentialLog } from '../node_modules/d3-scale/dist/d3-scale.js';
// import { interpolatePlasma } from '../node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.js';
//
// const d3 = {
//     scaleLinear,
//     scaleSequentialLog,
//     range,
//     interpolatePlasma
// };

/**
 PLUGIN CORE API
     beforeInit
     afterInit
     beforeUpdate (cancellable)
     afterUpdate
     beforeLayout (cancellable)
     afterLayout
     beforeDatasetsUpdate (cancellable)
     afterDatasetsUpdate
     beforeDatasetUpdate (cancellable)
     afterDatasetUpdate
     beforeRender (cancellable)
     afterRender
     beforeDraw (cancellable)
     afterDraw
     beforeDatasetsDraw (cancellable)
     afterDatasetsDraw
     beforeDatasetDraw (cancellable)
     afterDatasetDraw
     beforeEvent (cancellable)
     afterEvent
     resize
     destroy
 */
const colorScalePlugin = {
    beforeInit: function (chartInstance) {
        const ns = chartInstance.stanfordDiagramPlugin = {};

        ns.colorScale = undefined;

        // add space for scale
        chartInstance.options.layout.padding.right += 65;
    },
    beforeDraw: function (chartInstance) {
        const ns = chartInstance.stanfordDiagramPlugin;

        // Avoid infinite cycle
        if (!ns.colorScale) {
            ns.colorScale = createColorScale(chartInstance, false);

            console.log('update');

            chartInstance.update();
        } else {

            console.log('beforeDraw');
            ns.colorScale = createColorScale(chartInstance, true);
        }
    },
    beforeDatasetsUpdate: function (chartInstance) {
        const ns = chartInstance.stanfordDiagramPlugin;

        if (ns.colorScale) {
            chartInstance.data.datasets[0].pointBackgroundColor = [];

            for (let i = 0; i < chartInstance.data.datasets[0].data.length; i++) {
                chartInstance.data.datasets[0].pointBackgroundColor[i] = ns.colorScale(chartInstance.data.datasets[0].data[i].samples);
            }
        }

    },
};

function createColorScale (chart, draw) {
    const ctx = chart.ctx;

    const minSamples = 1;
    const maxSamples = Math.max(...chart.data.datasets[0].data.map(o => o.samples), 0);

    const barWidth = 25;
    const barHeight = 5;

    const startValue = chart.chartArea.top;
    const intervalValue = barHeight;
    let endValue = chart.chartArea.bottom;

    const colorScale = d3.scaleSequentialLog(d3.interpolatePlasma).domain([startValue, endValue]);
    // const colorScale = d3.scaleSequentialPow(d3.interpolatePlasma).domain([startValue, endValue]);
    // const colorScale = d3.scaleSequential([startValue, endValue], d3.interpolatePlasma);

    const valueScale = d3.scaleLinear()
        .domain([minSamples, maxSamples])
        .range([startValue, endValue]);

    if(draw) {
        const startPoint = chart.chartArea.right + 10;

        const points = d3.range(startValue, endValue, intervalValue);

        const axisX = chart.scales['x-axis-1'];
        const axisY = chart.scales['y-axis-1'];

        ctx.save();

        points.forEach(p => {
            ctx.fillStyle = colorScale(endValue - p);
            ctx.fillRect(startPoint, p, barWidth, barHeight);
        });

        // get rounded end value
        endValue = points[points.length - 1] + intervalValue;

        drawLegendAxis(ctx, startPoint + barWidth, startValue, endValue, minSamples, maxSamples, valueScale);

        // Draw XY line
        const minMaxXY = Math.min(axisX.max, axisY.max);

        ctx.beginPath();
        ctx.moveTo(axisX.getPixelForValue(axisX.min), axisY.getPixelForValue(axisY.min));
        ctx.lineTo(axisX.getPixelForValue(minMaxXY), axisY.getPixelForValue(minMaxXY));
        ctx.stroke();

        ctx.restore();
    }

    return (value) => { return colorScale(valueScale(value)); };
}

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
function drawLegendAxis(ctx, startPointLeft, startValue, endValue, minSamples, maxSamples, scale) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";

    // Vertical Line
    ctx.beginPath();
    ctx.moveTo(startPointLeft + 0.5, startValue);
    ctx.lineTo(startPointLeft + 0.5, endValue);
    ctx.stroke();

    // Text value at that point
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = "middle";

    // Ticks marks along the positive Y-axis
    // Positive Y-axis of graph is negative Y-axis of the canvas
    const ratio = (maxSamples - 1) / (endValue - startValue);
    const roundedRatio = ratio.toFixed(1) * 20 || 1;

    console.log(endValue);

    for (let i = minSamples; i < maxSamples; i += roundedRatio) {
        ctx.beginPath();

        // Draw a tick mark 6px long (-3 to 3)
        ctx.moveTo(startPointLeft, endValue - scale(i) + startValue);
        ctx.lineTo(startPointLeft + 6, endValue - scale(i) + startValue);
        ctx.stroke();

        ctx.fillText(`${i}`, startPointLeft + 9, endValue - scale(i) + startValue);
    }
}

export default colorScalePlugin;
