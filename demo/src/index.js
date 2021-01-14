import { CategoryScale, Chart, LinearScale, LineElement, PointElement, registry } from 'chart.js';
import { StanfordDiagramController, stanfordDiagramPlugin } from '../../dist/chartjs-plugin-stanford-diagram.esm';
import originalData from './data.js';
import { logDataValues } from './utils.js';

registry.addControllers(StanfordDiagramController);

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, StanfordDiagramController);

logDataValues(originalData);
const chartData = originalData.map((e) => ({ x: e.HPE, y: e.HPL, epochs: e.epochs }));

const canvas = document.getElementById('myChart');
const myChart = new Chart(canvas, {
  type: StanfordDiagramController.id,
  data: {
    labels: [],
    datasets: [
      {
        label: 'Horizontal Data',
        data: chartData
      }
    ]
  },
  options: {
    parsing: false,
    scales: {
      x: {
        scaleLabel: {
          display: true,
          labelString: 'HPE (m)'
        }
      },
      y: {
        scaleLabel: {
          display: true,
          labelString: 'HPL (m)'
        }
      }
    },
    plugins: {
      stanford: {
        epochsLabel: 'Samples',
        legendLabel: 'Number of samples (epochs) per point',
        maxEpochs: 10000,
        countOnlyVisible: false,
        percentage: new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 5
        }),
        regions: [
          {
            points: [
              // add points counter-clockwise
              { x: 0, y: 0 },
              { x: 40, y: 40 },
              { x: 0, y: 40 }
            ],
            strokeColor: 'rgba(0, 0, 0, 0.5)',
            text: {
              x: 10,
              y: 35,
              color: 'black',
              format: function(value, percentage) {
                return `Normal Operations:\n${value} (${percentage})`;
              }
            }
          },
          {
            points: [
              { x: 0, y: 0 },
              { x: 40, y: 0 },
              { x: 40, y: 40 }
            ],
            fillColor: 'rgba(255, 165, 0, 0.2)',
            strokeColor: 'rgba(0, 0, 0, 0.5)',
            text: {
              x: 25,
              y: 15,
              color: 'black',
              format: function(value, percentage) {
                return `MI:\n${value} (${percentage})`;
              }
            }
          },
          {
            points: [
              { x: 40, y: 0 },
              { x: 'MAX_X', y: 0 },
              { x: 'MAX_X', y: 40 },
              { x: 40, y: 40 }
            ],
            fillColor: 'rgba(255, 0, 0, 0.2)',
            strokeColor: 'rgba(0, 0, 0, 0.5)',
            text: {
              x: 44,
              y: 32,
              color: 'black',
              format: function(value, percentage) {
                return `HMI:\n${value} (${percentage})`;
              }
            }
          },
          {
            points: [
              { x: 0, y: 40 },
              { x: 40, y: 40 },
              { x: 'MAX_XY', y: 'MAX_XY' },
              { x: 'MAX_X', y: 'MAX_Y' },
              { x: 0, y: 'MAX_Y' }
            ],
            fillColor: 'rgba(128, 128, 128, 0.2)',
            strokeColor: 'rgba(0, 0, 0, 0.5)',
            text: {
              x: 25,
              y: 52,
              color: 'black',
              format: function(value, percentage) {
                return `Unavailable Epochs:\n${value} (${percentage})`;
              }
            }
          },
          {
            points: [
              { x: 40, y: 40 },
              { x: 'MAX_X', y: 40 },
              { x: 'MAX_X', y: 'MAX_Y' },
              { x: 'MAX_XY', y: 'MAX_XY' }
            ],
            fillColor: 'rgba(255, 165, 0, 0.2)',
            strokeColor: 'rgba(0, 0, 0, 0.5)',
            text: {
              x: 50,
              y: 45,
              color: 'black',
              format: function(value, percentage) {
                return `MI:\n${value} (${percentage})`;
              }
            }
          }
        ]
      }
    }
  },
  plugins: [stanfordDiagramPlugin]
});
