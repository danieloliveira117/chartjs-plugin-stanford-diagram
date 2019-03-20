# Stanford Diagram on Chartjs

## Data

Use an array of objects like one shown bellow:

* **Object**
    ```javascript
    {
        x: VALUE,
        y: VALUE,
        samples: VALUE
    }
    ```

## Regions
You can regions to your chart (any type of polygon).

A region can be only a polygon outline, a filled polygon or both. (Don't forget to add a color to *fillColor* or/and *strokeColor*)

You can add text associated to the polygon, as show in the object below.

**Region Object**
```javascript
    {
        points: [ // add any number of points counterclockwise
            {x: VALUE1, y: VALUE1},
            {x: VALUE2, y: VALUE2},
            {x: VALUE3, y: VALUE3}
        ],
        fillColor: 'anycolor', // Optional. Add a color if you want the region to be filled
        strokeColor: 'anycolor', // Optional. Add a color if you want the region to have a stroke
        text: { // Text is Optional
            x: VALUE,
            y: VALUE,
            color: 'anycolor',
            format: function (count, percentage) {
                // Count - Number of samples in the region
                // Percentage - Percentage of samples in the region

                return 'anystring';
            }
        }
    }
```

## Other Configurations

* **Type**
    - Set to 'scatter'

* **Recommended Scale Ticks**
    - set `beginAtZero` as true
    - Change `suggestedMax` of each axis to 60

* **Tooltip**
    - You can get the sample value by using the item index, for example:
        ```javascript
            let samples = data.datasets[0].data[item.index].samples;
        ```

## Example

```javascript
new Chart(ctx, {
    type: 'scatter',
    data: {
        labels: 'Custom Data Set',
        datasets: [
            {
                data: [
                    {x: 1, y: 3, samples: 5},
                    {x: 5, y: 9, samples: 15}
                ],
                radius: 4,
                pointStyle: 'rect'
            }
        ]
    },
    options: {
            aspectRatio: 1.12,
            animation: false,
            legend: {
                display: false
            },
            scales: {
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
                    label: function (item, data) {
                        return `S: ${data.datasets[0].data[item.index].samples}   (${item.xLabel}, ${item.yLabel})`;
                    }
                }
            },
            hover: {
                mode: null
            },
            stanfordChart: {
                regions: [
                    {
                        points: [ // add points counter-clockwise
                            {x: 0, y: 0},
                            {x: 40, y: 40},
                            {x: 0, y: 40},
                        ],
                        strokeColor: 'rgba(0, 0, 0, 0.5)',
                        fillcolor: 'rgba(0, 0, 0, 0.3)',
                        text: {
                            x: 15,
                            y: 35,
                            color: 'black',
                            format: function (value, percentage) {
                                return `Normal Operations: ${value} (${percentage}%)`;
                            }
                        }
                    }
                ]
            }
        },
        plugins: [stanfordDiagramPlugin]
    });
};
```