import { ChartOptions, LineController, UpdateMode } from 'chart.js';

export class StanfordDiagramController extends LineController {
  static readonly id = 'stanford';
  static readonly defaults: ChartOptions = {
    animation: false,
    aspectRatio: 1.12,
    showLine: false,
    elements: {
      point: {
        radius: 2.5,
        pointStyle: 'rect'
      }
    },
    // hover: {
    //   mode:
    // },
    scales: {
      x: {
        axis: 'x',
        type: 'linear',
        position: 'bottom',
        suggestedMax: 60,
        beginAtZero: true
      },
      y: {
        axis: 'y',
        type: 'linear', // stanford should not use a category axis
        position: 'left',
        suggestedMax: 60,
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        // TODO: add tooltips
        enabled: true
      }
    }
    // tooltips: {
    //   // Disable the on-canvas tooltip
    //   enabled: false,
    //   custom: customTooltipStyle,
    //   callbacks: {
    //     title: function(item) {
    //       return [
    //         {
    //           label: this._chart.scales['x-axis-1'].options.scaleLabel.labelString,
    //           value: item[0].xLabel
    //         },
    //         {
    //           label: this._chart.scales['y-axis-1'].options.scaleLabel.labelString,
    //           value: item[0].yLabel
    //         }
    //       ];
    //     },
    //     label: function(item, data) {
    //       return {
    //         label: this._chart.options.plugins.stanfordDiagram.epochsLabel || 'Epochs',
    //         value: data.datasets[0].data[item.index].epochs
    //       };
    //     }
    //   }
    // }
  };

  update(mode: UpdateMode) {
    this.chart.options.elements!.point!.radius = Math.max(Math.round(this.chart.height / 200), 1);

    super.update(mode);
    // Chart.controllers.line.prototype.update.apply(this, arguments);
  }
}
