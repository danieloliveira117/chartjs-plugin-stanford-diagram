import horizontalData from '../dataset/horizontalData.5.js';
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
                    radius: 4,
                    pointStyle: 'rect'
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
            // annotation: { // https://github.com/chartjs/chartjs-plugin-annotation
            //     annotations: [{
            //         type: 'line',
            //         scaleID: 'x-axis-1',
            //         mode: 'vertical',
            //         value: 40,
            //         borderColor: 'rgba(0, 120, 220, 0.5)',
            //         borderWidth: 1
            //     },
            //     {
            //         type: 'line',
            //         scaleID: 'y-axis-1',
            //         mode: 'horizontal',
            //         value: 40,
            //         borderColor: 'rgba(220, 0, 0, 0.5)',
            //         borderWidth: 1
            //     }]
            // },
            stanfordChart: {
                regions: [
                    {
                        points: [ // add points counter-clockwise
                            {x: 0, y: 0},
                            {x: 40, y: 40},
                            {x: 0, y: 40},
                        ],
                        // fillColor: 'rgba(255, 0, 0, 0.2)',
                        strokeColor: 'rgba(0, 0, 0, 0.5)',
                        text: {
                            x: 15,
                            y: 35,
                            color: 'black',
                            format: function (value, percentage) {
                                return `Normal Operations:\n${value} (${percentage}%)`;
                            }
                        }
                    }, {
                        points: [
                            {x: 0, y: 0},
                            {x: 40, y: 0},
                            {x: 40, y: 40},
                        ],
                        fillColor: 'rgba(255, 165, 0, 0.2)',
                        strokeColor: 'rgba(0, 0, 0, 0.5)',
                        text: {
                            x: 25,
                            y: 15,
                            color: 'black',
                            format: function (value, percentage) {
                                return `MI:\n${value} (${percentage}%)`;
                            }
                        }
                    }, {
                        points: [
                            {x: 40, y: 0},
                            {x: 60, y: 0},
                            {x: 60, y: 40},
                            {x: 40, y: 40},
                        ],
                        fillColor: 'rgba(255, 0, 0, 0.2)',
                        strokeColor: 'rgba(0, 0, 0, 0.5)',
                        text: {
                            x: 44,
                            y: 32,
                            color: 'black',
                            format: function (value, percentage) {
                                return `HMI:\n${value} (${percentage}%)`;
                            }
                        }
                    },
                    {
                        points: [
                            {x: 0, y: 40},
                            {x: 40, y: 40},
                            {x: 60, y: 60},
                            {x: 0, y: 60},
                        ],
                        fillColor: 'rgba(128, 128, 128, 0.2)',
                        strokeColor: 'rgba(0, 0, 0, 0.5)',
                        text: {
                            x: 25,
                            y: 52,
                            color: 'black',
                            format: function (value, percentage) {
                                return `Unavailable Epochs:\n${value} (${percentage}%)`;
                            }
                        }
                    },
                    {
                        points: [
                            {x: 40, y: 40},
                            {x: 60, y: 40},
                            {x: 60, y: 60}
                        ],
                        fillColor: 'rgba(255, 165, 0, 0.2)',
                        strokeColor: 'rgba(0, 0, 0, 0.5)',
                        text: {
                            x: 50,
                            y: 45,
                            color: 'black',
                            format: function (value, percentage) {
                                return `MI:\n${value} (${percentage}%)`;
                            }
                        }
                    },
                ]
            }
        },
        plugins: [stanfordDiagramPlugin]
    });
};

// label: {
//     enabled: false,
//     backgroundColor: 'rgba(220, 0, 0, 0.5)',
//     fontColor: 'rgba(255, 255, 255, 0.5)',
//     content: 'Accuracy',
//     position: 'right',
//     yAdjust: 0,
//     xAdjust: 0,
//     xPadding: 6,
//     yPadding: 6
// }
