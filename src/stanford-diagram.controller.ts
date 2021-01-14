import { ChartOptions, LineController, UpdateMode } from 'chart.js';
import { stanfordDiagramTooltip } from './stanford-diagram.tooltip';

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
      tooltip: stanfordDiagramTooltip
    }
  };

  update(mode: UpdateMode) {
    this.chart.options.elements!.point!.radius = Math.max(Math.round(this.chart.height / 200), 1);

    super.update(mode);
    // Chart.controllers.line.prototype.update.apply(this, arguments);
  }
}
