# Stanford Diagram on Chartjs

## Data

Use an array of objects like one shown bellow:

* **Object**
    ```javascript
    {
      x: VALUE,
      y: VALUE,
      epochs: VALUE
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
    { x: VALUE1, y: VALUE1 },
    { x: VALUE2, y: VALUE2 },
    { x: VALUE3, y: VALUE3 }
  ],
  fillColor: 'anycolor', // Optional. Add a color if you want the region to be filled
  strokeColor: 'anycolor', // Optional. Add a color if you want the region to have a stroke
  text: { // Text is Optional
    x: VALUE,
    y: VALUE,
    color: 'anycolor',
    format: function (count, percentage) {
    // Count - Number of epochs in the region
    // Percentage - Percentage of epochs in the region

    return 'anystring';
    }
  }
}
```

## Other Configurations

* **Tooltip**
    - You can get the epoch value by using the item index, for example:
        ```javascript
            let epochs = data.datasets[0].data[item.index].epochs;
        ```

## Example

```javascript
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
        regions: [
          {
            points: [ // add points counter-clockwise
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
