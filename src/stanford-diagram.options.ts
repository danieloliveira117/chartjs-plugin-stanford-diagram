import { CartesianScaleTypeRegistry, Color, CoreChartOptions, LineControllerDatasetOptions, Point } from 'chart.js';

export type StanfordDiagramRegionPoint = 'MAX_X' | 'MAX_Y' | 'MAX_XY' | number;

export interface StanfordDiagramRegionPointGroup {
  x: StanfordDiagramRegionPoint;
  y: StanfordDiagramRegionPoint;
}

export interface StanfordDiagramRegionText extends Point {
  /**
   * The text color.
   */
  color: Color;

  /**
   * Font Configuration.
   * @example '12px Arial'
   */
  font: string;

  /**
   * The text format callback.
   */
  format: (count: number, percentage: string) => string;
}

export interface StanfordDiagramRegion {
  /**
   * The regions points.
   * TIP: Add points counter-clockwise.
   */
  points: StanfordDiagramRegionPointGroup[];

  /**
   * The region stroke color.
   */
  strokeColor: Color;

  /**
   * The region fill color.
   */
  fillColor: Color;

  /**
   * The region text options.
   */
  text: StanfordDiagramRegionText;
}

export interface StanfordDiagramPercentageConfig {
  /**
   * The number of decimal places to round by.
   */
  decimalPlaces?: number;

  /**
   * The rounding method.
   */
  roundingMethod?: 'round' | 'ceil' | 'floor';
}

export interface StanfordDiagramPluginOptions {
  /**
   * The epochs tooltip label.
   * @default 'Epochs'
   */
  epochsLabel?: string;

  /**
   * The scale text legend.
   * @default 'Number of samples (epochs) per point'
   */
  legendLabel?: string;

  /**
   * The max number of epochs to show in the scale.
   * @default 1000
   */
  maxEpochs?: number;

  /**
   * If only the visible points should be counted.
   */
  countOnlyVisible?: boolean;

  /**
   * The percentage format.
   * @default
   */
  percentage?: Intl.NumberFormat | StanfordDiagramPercentageConfig;

  /**
   * The colored regions array.
   */
  regions?: StanfordDiagramRegion[];
}

export interface StanfordDiagramDataPoint {
  x: number;
  y: number;
  epochs: number;
}

declare module 'chart.js' {
  interface ChartTypeRegistry {
    stanford: {
      chartOptions: CoreChartOptions;
      datasetOptions: LineControllerDatasetOptions & { pointBackgroundColor: string[] };
      defaultDataPoint: StanfordDiagramDataPoint;
      scales: keyof CartesianScaleTypeRegistry;
    };
  }

  interface PluginOptions {
    stanford: StanfordDiagramPluginOptions;
  }
}
