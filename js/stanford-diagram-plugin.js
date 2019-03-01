// import d3-array, d3-scales, d3-scale-chromatic

const colorScalePlugin = {
    beforeInit: function (chartInstance) {
        const ns = chartInstance.stanfordDiagramPlugin = {};

        ns.colorScale = undefined;
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
    afterDatasetDraw: function (chartInstance) {
        const ns = chartInstance.stanfordDiagramPlugin;

        // Avoid infinite cycle
        if (!ns.colorScale) {
            ns.colorScale = createColorScale(chartInstance, false);

            chartInstance.update();
        } else {
            ns.colorScale = createColorScale(chartInstance, true);
        }

    }
};

function createColorScale (chart, draw) {
    const ctx = chart.ctx;

    const maxSamples = d3.max(chart.data.datasets[0].data, (data) => {
        return data.samples
    });

    const barWidth = 25;
    const barHeight = 5;

    const start_value = chart.chartArea.top;
    const interval_value = barHeight;
    const end_value = chart.chartArea.bottom;

    const startPoint = chart.chartArea.right + 10;

    console.log(chart);

    const points = d3.range(start_value, end_value, interval_value);

    const colorScale = d3.scaleSequentialLog(d3.interpolatePlasma).domain([start_value, end_value]);
    // const colorScale = d3.scaleSequentialPow(d3.interpolatePlasma).domain([start_value, end_value]);
    // const colorScale = d3.scaleSequential([start_value, end_value], d3.interpolatePlasma);

    if(draw) {
        ctx.save();

        points.forEach(p => {
            ctx.fillStyle = colorScale(end_value - p);
            ctx.fillRect(startPoint, p, barWidth, barHeight);
        });

        ctx.restore();
    }

    const valueScale = drawLegendAxis(ctx, startPoint, barWidth, barHeight, start_value, interval_value, end_value, maxSamples, draw);

    return (value) => { return colorScale(valueScale(value)); };
}

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
function drawLegendAxis(ctx, startPoint, barWidth, barHeight, start_value, interval_value, end_value, maxSamples, draw) {
    const ratio = (maxSamples - 1) / (end_value - start_value);

    const scale = d3.scaleLinear()
        .domain([1, maxSamples])
        .range([start_value, end_value]);

    if(draw) {
        ctx.save();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#000000";

        // Vertical Line
        ctx.beginPath();
        ctx.moveTo(startPoint + barWidth + 0.5, start_value);
        ctx.lineTo(startPoint + barWidth + 0.5, end_value);
        ctx.stroke();

        // Text value at that point
        // ctx.font = '10px Arial';
        // ctx.textAlign = 'start';
        ctx.textBaseline = "middle";

        // Ticks marks along the positive Y-axis
        // Positive Y-axis of graph is negative Y-axis of the canvas
        for (let i = 1; i < maxSamples; i += ratio.toFixed(1) * 20) {
            ctx.beginPath();

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(startPoint + barWidth, end_value - scale(i) + 0.5);
            ctx.lineTo(startPoint + barWidth + 6, end_value - scale(i) + 0.5);
            ctx.stroke();

            ctx.fillText(`${i}`, startPoint + barWidth + 8, end_value - scale(i));
        }

        ctx.restore();
    }

    return scale;
}

export default colorScalePlugin;
