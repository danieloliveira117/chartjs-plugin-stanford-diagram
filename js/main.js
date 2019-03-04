import horizontalData from '../dataset/horizontalData.js';
import stanfordDiagramPlugin from './stanford-diagram-plugin.js';

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

    const maxSamples = Math.max(...originalData.map(o => o.samples), 0);
    const maxXPE = Math.max(...originalData.map(o => o.HPE), 0);
    const maxYPL = Math.max(...originalData.map(o => o.HPL), 0);
    const totalSamples = originalData.reduce((a, b) => {
        return a + b.samples
    }, 0);

    console.log(`generating graph with ${originalData.length} points`);
    console.log(`totalSamples: ${totalSamples}, maxSamples: ${maxSamples}, maxHPE: ${maxXPE}, maxHPL: ${maxYPL}`);

    const chartData = originalData.map(function (e) {
        return {x: e.HPE, y: e.HPL, samples: e.samples};
    });

    // const chartData = originalData.map(function (e) {
    //     return {x: e.VPE, y: e.VPL, samples: e.samples};
    // });

    const ctx = document.getElementById("myChart")
        .getContext('2d');

    new Chart(ctx, {
        type: 'scatter',
        data: {
            labels: 'Horizontal Data Set',
            datasets: [
                {
                    data: chartData,
                    radius: 1,
                },
            ]
        },
        options: {
            aspectRatio: 1.12,
            // maintainAspectRatio: true,
            animation: false,
            legend: {
                display: false
            },
            scales: { // https://www.chartjs.org/docs/latest/axes/labelling.html#scale-title-configuration
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'HPE (m)'
                    },
                    ticks: {
                        suggestedMax: 60,
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'HPL (m)'
                    },
                    ticks: {
                        suggestedMax: 60,
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function(item, data) {
                        return `S: ${data.datasets[0].data[item.index].samples}   (${item.xLabel}, ${item.yLabel})`;
                    }
                }
            },
            hover: {
                mode: null
            },
            annotation: { // https://github.com/chartjs/chartjs-plugin-annotation
                annotations: [{
                    type: 'line',
                    scaleID: 'x-axis-1',
                    mode: 'vertical',
                    value: 40,
                    endValue: 40,
                    borderColor: 'rgba(0, 120, 220, 0.5)',
                    borderWidth: 1,
                    label: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 120, 220, 0.5)',
                        fontColor: 'rgba(255, 255, 255, 0.5)',
                        content: 'Accuracy',
                        position: 'top',
                        yAdjust: 0,
                        xAdjust: 0,
                        xPadding: 6,
                        yPadding: 6
                    }
                },
                {
                    type: 'line',
                    scaleID: 'y-axis-1',
                    mode: 'horizontal',
                    value: 40,
                    borderColor: 'rgba(220, 0, 0, 0.5)',
                    borderWidth: 1,
                    label: {
                        enabled: true,
                        backgroundColor: 'rgba(220, 0, 0, 0.5)',
                        fontColor: 'rgba(255, 255, 255, 0.5)',
                        content: 'Accuracy',
                        position: 'right',
                        yAdjust: 0,
                        xAdjust: 0,
                        xPadding: 6,
                        yPadding: 6
                    }
                }]
            }
        },
        plugins: [stanfordDiagramPlugin]
    });
};
