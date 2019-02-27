export default function (chart, maxSamples) {
    const ctx = chart.ctx;
    const c = chart.canvas;

    // const dpi = window.devicePixelRatio;
    // fix_dpi(dpi, c);

    const canvas_width = chart.width;
    const canvas_height = chart.height;

    const barWidth = 25;
    const barHeight = 5;

    const paddingVertical = 25;

    const start_value = 1;
    const interval_value = barHeight;

    const end_value = canvas_height;
    const startPoint = canvas_width - 100;

    const points = d3.range(start_value, end_value, interval_value)

    const colorScale = d3.scaleSequentialPow(d3.interpolateInferno)
        .domain([canvas_height, 1]);

    ctx.save();

    points.forEach(p => {
        ctx.fillStyle = colorScale(p);
        ctx.fillRect(startPoint, p, barWidth, barHeight);
    });

    ctx.stroke();

    drawLegendAxis(ctx, startPoint, barWidth, barHeight, canvas_height, start_value, interval_value, end_value, maxSamples);

    ctx.restore();
};

// // Fixing HTML5 2d Canvas Blur: https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
// function fix_dpi(dpi, canvas) {
//     //get CSS height
//     //the + prefix casts it to an integer
//     //the slice method gets rid of "px"
//     const style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
//
//     //get CSS width
//     const style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
//
//     //scale the canvas
//     canvas.setAttribute('height', style_height * dpi);
//     canvas.setAttribute('width', style_width * dpi);
// }

// http://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
// http://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
function drawLegendAxis(ctx, startPoint, barWidth, barHeight, canvas_height, start_value, interval_value, end_value, maxSamples) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";

    ctx.beginPath();
    ctx.moveTo(startPoint + barWidth + 0.5, 0);
    ctx.lineTo(startPoint + barWidth + 0.5, canvas_height);
    ctx.stroke();

    const logScale = d3.scaleLog()
        .domain([1, maxSamples])
        .range([canvas_height, 1]);

    console.log(logScale);

    // Ticks marks along the positive Y-axis
    // Positive Y-axis of graph is negative Y-axis of the canvas
    for (let i = 0; i < end_value; i += interval_value) {
        ctx.beginPath();

        // Draw a tick mark 6px long (-3 to 3)
        ctx.moveTo(startPoint + barWidth, canvas_height - (barHeight * i + 0.5));
        ctx.lineTo(startPoint + barWidth + 6, canvas_height - (barHeight * i + 0.5));
        ctx.stroke();

        // Text value at that point
        ctx.font = '10px Arial';
        ctx.textAlign = 'start';
        ctx.fillText(`${start_value + i}`, startPoint + barWidth + 8, canvas_height - (barHeight * i + 3));
    }
}
