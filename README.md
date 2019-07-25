# Chart.js Stanford Diagram plugin

Adds support for [Stanford Diagrams](https://gssc.esa.int/navipedia/index.php/The_Stanford_%E2%80%93_ESA_Integrity_Diagram:_Focusing_on_SBAS_Integrity) to Chart.js.

![Screenshot](https://i.imgur.com/ObA1s7Y.png)

## Configuration

### Data

Use an array of objects as shown bellow:

```js
{
  x: VALUE,
  y: VALUE,
  epochs: VALUE
}
```

### Regions

You can regions to your chart (any type of polygon).

A region can be a polygon outline, a filled polygon or both. **WARN:** You need to add a color to `fillColor` or `strokeColor`.

You can also add text associated to the polygon, as show in the object below.

**Region Object**

```js
{
  points: [ // Add any number of points counterclockwise
    { x: VALUE1, y: VALUE1 },
    { x: VALUE2, y: VALUE2 },
    { x: VALUE3, y: VALUE3 }
  ],
  fillColor: 'anycolor', // Optional. Add a color to fill the region
  strokeColor: 'anycolor', // Optional. Add a color to stroke the region
  text: { // Optional
    x: VALUE,
    y: VALUE,
    color: 'anycolor',
    format: function (count, percentage) {
      // Count: The number of epochs in the region
      // Percentage: The percentage of epochs in the region

      return 'anystring';
    }
  }
}
```

### Other Configurations

#### Tooltip

You can get the epoch value by using the item index:

```js
let epochs = data.datasets[0].data[item.index].epochs;
```

#### Epochs tooltip name 
```js
stanfordDiagram: {
  epochsLabel: 'Samples' // Change the name of 'epochs' on the tooltip
}
```

#### Scale Legend
```js
stanfordDiagram: {
  legendLabel: 'Number of samples (epochs) per point', // Change the color scale label text
}
```

#### Max scale value
```js
stanfordDiagram: {
  maxEpochs: 10000 // Change the max value on the scale
}
```

## Example

```js
import { stanfordDiagramPlugin } from 'chartjs-plugin-stanford-diagram';

const ctx = document.getElementById('myChart')
  .getContext('2d');

new Chart(ctx, {
  type: 'stanford',
  data: {
    labels: 'Custom Data Set',
    datasets: [
      {
        data: [
          { x: 1, y: 3, epochs: 5 },
          { x: 5, y: 9, epochs: 15 }
        ]
      }
    ]
  },
  options: {
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'HPE (m)'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'HPL (m)'
        }
      }]
    },
    plugins: {
      stanfordDiagram: {
        epochsLabel: 'Samples', // Change the name of 'epochs' on the tooltip
        legendLabel: 'Number of samples (epochs) per point', // Change the color scale label text
        maxEpochs: 10000, // Change the max value on the scale
        regions: [
          {
            points: [ // Add points counter-clockwise
              { x: 0, y: 0 },
              { x: 40, y: 40 },
              { x: 0, y: 40 },
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
    }
  },
  plugins: [stanfordDiagramPlugin]
});
```

## Building

To build the plugin run:

```sh
npm install
npm run build
```
