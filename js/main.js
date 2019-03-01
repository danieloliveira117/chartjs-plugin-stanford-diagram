import horizontalData from '../dataset/horizontalData.js';
import createColorScale from './stanford-diagram-canvas.js';

function compareSamples(a, b) {
    if (a.samples < b.samples)
        return -1;
    if (a.samples > b.samples)
        return 1;

    return 0;
}

window.onload = () => {
    let originalData = horizontalData.filter((value) => {
        return value.samples >= 0
    });

    originalData.sort(compareSamples); // draw bigger samples later

    const maxSamples = d3.max(originalData, (data) => {
        return data.samples
    });
    const maxXPE = d3.max(originalData, (data) => {
        return data.HPE
    });
    const maxYPL = d3.max(originalData, (data) => {
        return data.HPL
    });
    const totalSamples = originalData.reduce((a, b) => {
        return a + b.samples
    }, 0);

    console.log(`generating graph with ${originalData.length} points`);
    console.log(`totalSamples: ${totalSamples}, maxSamples: ${maxSamples}, maxHPE: ${maxXPE}, maxHPL: ${maxYPL}`);

    const chartData = originalData.map(function (e) {
        return {x: e.HPE, y: e.HPL, samples: e.samples};
    });

    const ctx = document.getElementById("myChart").getContext('2d');

    let plugin = {
        beforeInit: function (chartInstance) {

            chartInstance.colorScale = undefined;

        },
        beforeDatasetsUpdate: function (chartInstance) {

            if (chartInstance.colorScale) {
                chartInstance.data.datasets[0].pointBackgroundColor = [];
                // chartInstance.data.datasets[0].pointBorderColor = [];

                for (let i = 0; i < chartInstance.data.datasets[0].data.length; i++) {
                    chartInstance.data.datasets[0].pointBackgroundColor[i] = chartInstance.colorScale(chartInstance.data.datasets[0].data[i].samples);
                    // chartInstance.data.datasets[0].pointBorderColor[i] = chartInstance.colorScale(chartInstance.data.datasets[0].data[i].samples);
                }
            }
        },
        afterDatasetDraw: function (chartInstance) {

            // Avoid infinite cycle
            if (!chartInstance.colorScale) {
                chartInstance.colorScale = createColorScale(chartInstance, maxSamples, false);

                chartInstance.update();
            } else {
                chartInstance.colorScale = createColorScale(chartInstance, maxSamples, true);
            }

        }
    };

    Chart.pluginService.register(plugin);

    // const testFunction = d3.scaleSequential([50, 1], d3.interpolateCool);
    //
    // let colorArray = [];
    //
    // chartData.forEach((data) => {
    //     colorArray.push(testFunction(data.samples));
    // });
    //
    // console.log(colorArray);

    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            labels: 'Horizontal Data Set',
            datasets: [
                {
                    data: chartData,
                    // pointBackgroundColor: colorArray,
                    // pointBorderColor: colorArray,
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
