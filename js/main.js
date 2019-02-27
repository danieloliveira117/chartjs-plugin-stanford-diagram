import horizontalData from '../dataset/horizontalData.js';
import createColorScale from './testeCanvas.js';

function compareSamples(a, b) {
    if (a.samples < b.samples)
        return -1;
    if (a.samples > b.samples)
        return 1;

    return 0;
}

function getColorScale(scale, maxSamples, invertColor) {
    const legendFullHeight = 420;

    const legendMargin = { top: 10, bottom: 10, left: 50, right: 0 };

    const legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;

    const startData = 1;
    const endData = maxSamples + 1;

    const colorScale = d3.scaleSequentialPow(scale)
        .domain(invertColor ? [1, legendHeight] : [1, legendHeight]);

    // Scale Legend Axis
    const logScale = d3.scaleLog()
        .domain([startData, endData])
        .range([legendHeight, 1]);

    return [colorScale, logScale];
}

window.onload = () => {
    let originalData = horizontalData.filter((value) => { return value.samples >= 0 });

    originalData.sort(compareSamples); // draw bigger samples later

    const maxSamples = d3.max(originalData, (data) => { return data.samples });
    const maxXPE = d3.max(originalData, (data) => { return data.HPE });
    const maxYPL = d3.max(originalData, (data) => { return data.HPL });
    const totalSamples = originalData.reduce((a, b) => { return a + b.samples }, 0);

    console.log(`generating graph with ${originalData.length} points`);
    console.log(`totalSamples: ${totalSamples}, maxSamples: ${maxSamples}, maxHPE: ${maxXPE}, maxHPL: ${maxYPL}`);

    const [colorScale, logScale] = getColorScale(d3.interpolateInferno, maxSamples, true);

    let pointColor = [];

    const chartData = originalData.map(function(e) {
        pointColor.push(colorScale(logScale(e.samples)));

        return {x: e.HPE, y: e.HPL };
    });

    const ctx = document.getElementById("myChart").getContext('2d');

    Chart.pluginService.register({
        beforeDraw: function (chartInstance) {
            createColorScale(chartInstance, maxSamples);
        }
    });

    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            labels: 'Horizontal Data Set',
            datasets: [
                {
                    data: chartData,
                    pointBackgroundColor: pointColor,
                    pointBorderColor: pointColor,
                    radius: 1,
                },
            ]
        },
        options: {
            maintainAspectRatio: true,
            layout: {
                padding: {
                    left: 0,
                    right: 110,
                    top: 0,
                    bottom: 0
                }
            },
            animation: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        suggestedMax: 60,
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMax: 60,
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {
                enabled: false
            },
            hover: {
                mode: null
            },
            annotation: { // https://github.com/chartjs/chartjs-plugin-annotation
                annotations: [{
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'y-axis-0',
                    value: 1,
                    borderColor: 'red',
                    borderWidth: 1,
                    label: {
                        enabled: true,
                        backgroundColor: 'rgba(0,0,0,0.0)',
                        fontColor: 'red',
                        content: 'Horizontal Position Error (95%)',
                        position: 'top',
                        yAdjust: 0,
                        xAdjust: 50
                    }
                }]
            }
        }
    });
};
