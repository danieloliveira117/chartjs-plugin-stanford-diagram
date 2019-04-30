import {pointInPolygon, countEpochsInRegion} from "../src/stanford.js";

describe('pointInPolygon', () => {
  const polygon = [
    {x: 0, y: 0},
    {x: 20, y: 0},
    {x: 20, y: 20},
    {x: 20, y: 20}
  ];

  const pointInside = {x: 0, y: 0};
  const pointOutInside = {x: 21, y: 0};

  it("should return true if point is inside region", () => {
    expect(pointInPolygon(pointInside, polygon)).toBe(true);
  });

  it("should return false if point is outside region", () => {
    expect(pointInPolygon(pointOutInside, polygon)).toBe(false);
  });
});

describe("countEpochsInRegion", () => {
  let chart;

  beforeAll(() => {
    const ctx = document.createElement('canvas').getContext("2d");

    chart = new Chart(ctx, {
      type: 'stanford',
      data: {
        labels: 'Data Set',
        datasets: [{
          data: [
            {
              x: 25,
              y: 25,
              epochs: 30
            }, {
              x: 35,
              y: 33,
              epochs: 35
            }
          ]
        }]
      }
    });
  });

  it("should return 0 if the region has no epochs", () => {
    const region = [
      {x: 0, y: 0},
      {x: 20, y: 0},
      {x: 20, y: 20},
      {x: 0, y: 20}
    ];

    const result = countEpochsInRegion(chart, region);

    expect(result.percentage).toBe(0);
    expect(result.count).toBe(0);
  });

  it("should return 100% if the region has all the epochs", () => {
    const region = [
      {x: 0, y: 0},
      {x: 60, y: 0},
      {x: 60, y: 60},
      {x: 0, y: 60}
    ];

    const result = countEpochsInRegion(chart, region);

    expect(Number(result.percentage)).toBe(100);
    expect(result.count).toBe(65);
  });
});
