// import {interpolatePlasma, interpolateCustom, scaleLinear, range, scaleSequential, scaleSequentialLog, interpolateHsl, interpolateHslLong, hsl} from './d3-extract.js';
//
// const d3 = {
//     scaleLinear,
//     scaleSequential,
//     scaleSequentialLog,
//     range,
//     interpolatePlasma,
//     interpolateCustom,
//     interpolateHsl,
//     interpolateHslLong,
//     hsl
// };

// import * as d3 from '../node_modules/d3/dist/d3.js';

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
const stanfordDiagramPlugin = {
    beforeInit: function (chartInstance) {
        const ns = chartInstance.stanfordDiagramPlugin = {
            options: getStanfordConfig(chartInstance.options),
        };

        ns.colorScale = undefined;

        // add space for scale
        chartInstance.options.layout.padding.right += 65;
    },
    afterRender: function (chartInstance) {
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

// function initConfig(chartInstance, config) {
//     const chartHelpers = chartInstance.helpers;
//
//     config = chartHelpers.configMerge(Chart.Annotation.defaults, config);
//
//     if (chartHelpers.isArray(config.annotations)) {
//         config.stanfordChart.forEach(function(annotation) {
//             annotation.label = chartHelpers.configMerge(Chart.Annotation.labelDefaults, annotation.label);
//         });
//     }
//
//     return config;
// }

function getStanfordConfig(chartOptions) {
    const plugins = chartOptions.plugins;
    const pluginAnnotation = plugins && plugins.stanfordChart ? plugins.stanfordChart : null;

    return pluginAnnotation || chartOptions.stanfordChart || {};
}

function drawRegions(chart, regions) {
    const ctx = chart.ctx;

    regions.forEach(function (element) {
        ctx.polygon(getPixelValue(chart, element.points), element.fillColor, element.strokeColor);

        if(element.text) {
            drawRegionText(chart, element.text, element.points);
        }
    });
}

function drawRegionText(chart, text, points) {
    const ctx = chart.ctx;
    const axisX = chart.scales['x-axis-1'];
    const axisY = chart.scales['y-axis-1'];

    const total = chart.data.datasets[0].data.reduce((accumulator, currentValue) => accumulator + Number(currentValue.samples), 0);

    // Count how many points are in Region
    const count = chart.data.datasets[0].data.reduce((accumulator, currentValue) => {
        if(pointInPolygon(currentValue, points)) {
            return accumulator + Number(currentValue.samples);
        }

        return accumulator;
    }, 0);

    const percentage = count !== 0 ? (count / total * 100).toFixed(1) : 0;

    // Get text
    const content = text.format ? text.format(count, percentage) : `${count} (${percentage})`;

    console.log(total, count, percentage, content);

    ctx.save();
    ctx.font = text.font ? text.font : "11px Arial, sans-serif";
    ctx.fillStyle = text.color;
    ctx.fillText(content, axisX.getPixelForValue(text.x), axisY.getPixelForValue(text.y));
    ctx.restore();
}

function getPixelValue(chart, points) {
    const axisX = chart.scales['x-axis-1'];
    const axisY = chart.scales['y-axis-1'];

    return points.map(p => {
        return {x: axisX.getPixelForValue(p.x), y: axisY.getPixelForValue(p.y)}
    });
}

function pointInPolygon(point, polygon) { // thanks to: http://bl.ocks.org/bycoffe/5575904
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    let xi, yi, yj, xj, intersect,
        x = point.x,
        y = point.y,
        inside = false;

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

function createColorScale(chart, draw) {
    const ctx = chart.ctx;

    const minSamples = 1;
    const maxSamples = Math.max(...chart.data.datasets[0].data.map(o => o.samples), 0);

    const barWidth = 25;
    const barHeight = 5;

    const startValue = chart.chartArea.top + 15;
    const intervalValue = barHeight;
    let endValue = chart.chartArea.bottom - 15;

    const colorScale = d3.scaleSequential(d3.interpolateHslLong(d3.hsl(250, 1, 0.5), d3.hsl(0, 1, 0.5)))
        .domain([startValue, endValue]);
    // const colorScale = d3.scaleSequentialPow(d3.interpolatePlasma).domain([startValue, endValue]);
    // const colorScale = d3.scaleSequential([startValue, endValue], d3.interpolatePlasma);

    const valueScale = d3.scaleLog()
        .domain([1, 10000])
        .range([startValue, endValue]);

    if (draw) {
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

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";

        ctx.beginPath();
        ctx.moveTo(axisX.getPixelForValue(axisX.min), axisY.getPixelForValue(axisY.min));
        ctx.lineTo(axisX.getPixelForValue(minMaxXY), axisY.getPixelForValue(minMaxXY));
        ctx.stroke();

        ctx.restore();
    }

    return (value) => {
        return colorScale(valueScale(value));
    };
}

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
function drawLegendAxis(ctx, startPointLeft, startValue, endValue, minSamples, maxSamples, valueScale) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";

    // Vertical Line
    ctx.beginPath();
    ctx.moveTo(startPointLeft + 0.5, startValue);
    ctx.lineTo(startPointLeft + 0.5, endValue);
    ctx.stroke();

    // Text value at that point
    // ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = "middle";

    // Ticks marks along the positive Y-axis
    // Positive Y-axis of graph is negative Y-axis of the canvas
    for (let i = 0; i < 5; i++) {
        const posY = endValue - ((endValue - startValue) / 4 * i);

        ctx.beginPath();

        ctx.moveTo(startPointLeft, posY);
        ctx.lineTo(startPointLeft + 6, posY);
        ctx.stroke();

        ctx.font = '10px Arial';
        ctx.fillText(`${'10 '}`, startPointLeft + 9, posY);

        ctx.font = '9px Arial';
        ctx.fillText(`${i}`, startPointLeft + 20, posY - 7);
    }
}

CanvasRenderingContext2D.prototype.polygon = function (pointsArray, fillColor, strokeColor) {
    if (pointsArray.length <= 0)
        return;

    this.save();
    this.globalCompositeOperation = 'destination-over'; // draw behind existing pixels https://stackoverflow.com/questions/9165766/html5-canvas-set-z-index/26064753

    this.beginPath();
    this.moveTo(pointsArray[0].x, pointsArray[0].y)

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

export default stanfordDiagramPlugin;
