export default function (chart, maxSamples, draw) {
    const ctx = chart.ctx;

    const canvas_width = chart.width;
    const canvas_height = chart.height;

    const barWidth = 25;
    const barHeight = 5;

    const start_value = 1;
    const interval_value = barHeight;

    const end_value = canvas_height;
    const startPoint = canvas_width - 100;

    const points = d3.range(start_value, end_value, interval_value);

    const colorScale = d3.scaleSequentialLog(d3.interpolatePlasma).domain([1, canvas_height]);
    // const colorScale = d3.scaleSequentialPow(d3.interpolatePlasma).domain([1, canvas_height]);
    // const colorScale = d3.scaleSequential([1, canvas_height], d3.interpolatePlasma);

    if(draw) {
        ctx.save();

        points.forEach(p => {
            ctx.fillStyle = colorScale(end_value - p);
            ctx.fillRect(startPoint, p - 0.5, barWidth, barHeight);
        });

        ctx.restore();
    }

    const valueScale = drawLegendAxis(ctx, startPoint, barWidth, barHeight, canvas_height, start_value, interval_value, end_value, maxSamples, draw);

    // return [valueScale, colorScale];

    return (value) => { return colorScale(valueScale(value)); };
};

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
function drawLegendAxis(ctx, startPoint, barWidth, barHeight, canvas_height, start_value, interval_value, end_value, maxSamples, draw) {
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
        ctx.moveTo(startPoint + barWidth + 0.5, 0);
        ctx.lineTo(startPoint + barWidth + 0.5, canvas_height);
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
            ctx.moveTo(startPoint + barWidth, canvas_height - scale(i) + 0.5);
            ctx.lineTo(startPoint + barWidth + 6, canvas_height - scale(i) + 0.5);
            ctx.stroke();

            ctx.fillText(`${i}`, startPoint + barWidth + 8, canvas_height - scale(i));
        }

        ctx.restore();
    }

    return scale;
}
