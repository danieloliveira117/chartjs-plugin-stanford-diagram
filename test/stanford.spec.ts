import { CategoryScale, Chart, LinearScale, LineElement, PointElement } from 'chart.js';
import { calculatePercentageValue, countEpochsInRegion, pointInPolygon } from '../src/stanford-regions';
import { StanfordDiagramPluginOptions, StanfordDiagramRegionPointGroup } from '../src/stanford-diagram.options';
import { StanfordDiagramController, stanfordDiagramPlugin } from '../src';

describe('pointInPolygon', () => {
  const chart: Chart<'stanford'> = {
    type: 'stanford',
    scales: {
      x: {},
      y: {}
    }
  } as any;

  const polygon = [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 20 },
    { x: 20, y: 20 }
  ];

  const pointInside = { x: 0, y: 0 };
  const pointOutInside = { x: 21, y: 0 };

  it('should return true if point is inside region', () => {
    expect(pointInPolygon(chart, pointInside, polygon)).toBe(true);
  });

  it('should return false if point is outside region', () => {
    expect(pointInPolygon(chart, pointOutInside, polygon)).toBe(false);
  });
});

describe('countEpochsInRegion', () => {
  let chart: Chart<'stanford'>;

  beforeAll(() => {
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, StanfordDiagramController);

    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';

    chart = new Chart(canvas, {
      type: StanfordDiagramController.id,
      data: {
        labels: [],
        datasets: [
          {
            label: 'Horizontal Data',
            data: [
              {
                x: 25,
                y: 25,
                epochs: 30
              },
              {
                x: 35,
                y: 33,
                epochs: 35
              },
              {
                x: 65,
                y: 3,
                epochs: 10
              },
              {
                x: 5,
                y: 73,
                epochs: 10
              },
              {
                x: 85,
                y: 83,
                epochs: 10
              }
            ]
          }
        ]
      },
      options: {
        parsing: false,
        scales: {
          x: {
            max: 60
          },
          y: {
            max: 60
          }
        }
      },
      plugins: [stanfordDiagramPlugin]
    });

    // FIXME: Find another way to test in canvas in JEST
    chart.ensureScalesHaveIDs();
    chart.buildOrUpdateScales();
    chart.scales.x.max = 60;
    chart.scales.y.max = 60;
  });

  it('should return 0 if the region has no epochs', () => {
    const region: StanfordDiagramRegionPointGroup[] = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
      { x: 0, y: 20 }
    ];

    const result = countEpochsInRegion(chart, {}, region);

    expect(Number(result.percentage)).toBe(0);
    expect(result.count).toBe(0);
  });

  it('should return 100% if the region has all the epochs', () => {
    const region: StanfordDiagramRegionPointGroup[] = [
      { x: 0, y: 0 },
      { x: 'MAX_X', y: 0 },
      { x: 'MAX_X', y: 'MAX_Y' },
      { x: 0, y: 'MAX_Y' }
    ];

    const result = countEpochsInRegion(chart, {}, region);

    expect(Number(result.percentage)).toBe(100);
    expect(result.count).toBe(95);
  });
});

describe('calculatePercentageValue', () => {
  it('should return 0 when the count value is 0', () => {
    const options: StanfordDiagramPluginOptions = {};

    expect(calculatePercentageValue(options, 100, 0)).toBe('0.0');
  });

  it('should round to 1 decimal case by default', () => {
    const options: StanfordDiagramPluginOptions = {};

    expect(calculatePercentageValue(options, 10000, 25)).toBe('0.3'); // 0.025 rounded to 0.3
  });

  it('should round to 2 decimal cases', () => {
    const options: StanfordDiagramPluginOptions = {
      percentage: {
        decimalPlaces: 2
      }
    };

    expect(calculatePercentageValue(options, 100000, 2)).toBe('0.00'); // 0.002 rounded to 0.00
  });

  it('should round to 2 decimal cases', () => {
    const options: StanfordDiagramPluginOptions = {
      percentage: {
        roundingMethod: 'ceil'
      }
    };

    expect(calculatePercentageValue(options, 100000, 2)).toBe('0.1'); // 0.002 ceil to 0.1
  });

  it('should round to 2 decimal cases', () => {
    const options: StanfordDiagramPluginOptions = {
      percentage: {
        roundingMethod: 'floor'
      }
    };

    expect(calculatePercentageValue(options, 100000, 2)).toBe('0.0'); // 0.002 ceil to 0.1
  });
});
