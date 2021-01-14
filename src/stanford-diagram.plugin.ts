import { Chart, ChartArea, Plugin, UpdateMode } from 'chart.js';
import { drawColorScale } from './stanford-scale';
import { drawRegions } from './stanford-regions';
import { interpolateHSL, sequentialLog } from './stanford-utils';
import { StanfordDiagramPluginOptions } from './stanford-diagram.options';

/**
 * Stanford Diagram Plugin
 */
export class StanfordDiagramPlugin implements Plugin<StanfordDiagramPluginOptions> {
  /**
   * Plugin id.
   */
  id = 'stanford';

  /**
   * The color scale function.
   */
  colorScale?: (value: number) => string;

  /**
   * Max epochs in the scale.
   */
  maxEpochs: number = 100000;

  /**
   * Called before initializing `chart`.
   */
  beforeInit(chart: Chart<'stanford'>, _args: {}, options: StanfordDiagramPluginOptions): void {
    if (options.maxEpochs) {
      this.maxEpochs = options.maxEpochs;
    }

    // @ts-ignore
    this.colorScale = sequentialLog((value: number) => interpolateHSL([0.7, 1, 0.5], [0, 1, 0.5], value)).domain([
      1,
      this.maxEpochs
    ]);

    // add space for scale
    (chart.options.layout!.padding as ChartArea).right += 100;
  }

  /**
   * Called before updating the `chart` datasets. If any plugin returns `false`,
   * the datasets update is cancelled until another `update` is triggered.
   */
  beforeDatasetsUpdate(
    chart: Chart<'stanford'>,
    args: { mode: UpdateMode },
    _options: StanfordDiagramPluginOptions
  ): boolean | void {
    if (this.colorScale && args.mode !== 'resize') {
      chart.data.datasets[0].pointBackgroundColor = [];

      for (let i = 0; i < chart.data.datasets[0].data.length; i++) {
        chart.data.datasets[0].pointBackgroundColor[i] = this.colorScale(chart.data.datasets[0].data[i].epochs);
      }
    }
  }

  /**
   * Called before updating `chart`. If any plugin returns `false`, the update
   * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
   */
  beforeUpdate(
    chart: Chart<'stanford'>,
    _args: { mode: UpdateMode },
    _options: StanfordDiagramPluginOptions
  ): boolean | void {
    // "Responsive" font-size with a min size of 8px
    chart.options.font!.size = Math.max(Math.round(chart.height / 50), 8);
  }

  /**
   * Called after the `chart` has been fully rendered (and animation completed). Note
   * that this hook will not be called if the rendering has been previously cancelled.
   */
  afterRender(chart: Chart<'stanford'>, _args: {}, options: StanfordDiagramPluginOptions) {
    drawColorScale(chart, options, this.maxEpochs);
    drawRegions(chart, options);
  }
}

export const stanfordDiagramPlugin = new StanfordDiagramPlugin();
