import { Chart, DeepPartial, LinearScaleOptions, TooltipItem, TooltipModel, TooltipOptions } from 'chart.js';
import { StanfordDiagramDataPoint } from './stanford-diagram.options';

export const stanfordDiagramTooltip: DeepPartial<TooltipOptions> = {
  // Disable the on-canvas tooltip
  enabled: false,
  callbacks: {
    title(tooltipItems: TooltipItem[]): string[] {
      const chart = tooltipItems[0].chart;
      const xLabel = (chart.scales.x.options as LinearScaleOptions).scaleLabel.labelString;
      const yLabel = (chart.scales.y.options as LinearScaleOptions).scaleLabel.labelString;

      const dataPoint: StanfordDiagramDataPoint = tooltipItems[0].dataPoint;

      return [xLabel, `${dataPoint.x}`, yLabel, `${dataPoint.y}`];
    },
    label(tooltipItem: TooltipItem): string[] {
      const bodyLabel = tooltipItem.chart.options.plugins?.stanford?.epochsLabel || 'Epochs';
      const dataPoint: StanfordDiagramDataPoint = tooltipItem.dataPoint;

      return [bodyLabel, `${dataPoint.epochs}`];
    }
  },
  custom({ chart, tooltip }: { chart: Chart; tooltip: TooltipModel }) {
    // Tooltip Element
    let tooltipEl = document.getElementById('chartjs-tooltip');

    // Create element on first render
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.innerHTML = '<table></table>';
      document.body.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
      tooltipEl.classList.add(tooltip.yAlign);
    } else {
      tooltipEl.classList.add('no-transform');
    }

    // Set Text
    if (tooltip.body) {
      const titleLines: string[] = tooltip.title || [];

      let innerHtml = '<thead>';

      titleLines.forEach((title: string, index: number) => {
        if (index % 2 === 0) {
          innerHtml += '<tr>';
          innerHtml += `<th style="text-align: left">${title}</th>`;
        } else {
          innerHtml += `<th style="text-align: right">${title}</th>`;
          innerHtml += '</tr>';
        }
      });

      innerHtml += '</thead><tbody>';

      const bodyLines = tooltip.body.map((bodyItem) => bodyItem.lines);

      bodyLines.forEach((body: string[], i: number) => {
        const color = (tooltip.labelColors[i] as any).backgroundColor;
        const style = `background: ${color}; width: 10px; height: 10px; display: inline-block; margin-right: 5px;`;

        const span = `<span style="${style}"></span>`;
        innerHtml += `<tr><td>${span}${body[0]}</td><td style="text-align: right">${body[1]}</td></tr>`;
      });

      innerHtml += '</tbody>';

      const tableRoot = tooltipEl.querySelector('table')!;
      tableRoot.innerHTML = innerHtml;
    }

    // `this` will be the overall tooltip
    const position = chart.canvas.getBoundingClientRect();

    const tooltipOptions: DeepPartial<TooltipOptions> = chart.options.plugins!.tooltip!;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = '1';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = position.left + window.pageXOffset + tooltip.caretX + 'px';
    tooltipEl.style.top = position.top + window.pageYOffset + tooltip.caretY + 'px';
    tooltipEl.style.fontFamily = chart.options.font!.family!;
    tooltipEl.style.fontSize = tooltipOptions.bodyFont!.size! + 'px';
    tooltipEl.style.fontStyle = tooltipOptions.bodyFont!.style!;
    tooltipEl.style.padding = tooltipOptions.yPadding + 'px ' + tooltipOptions.xPadding + 'px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.background = tooltipOptions.backgroundColor as string;
    tooltipEl.style.color = tooltipOptions.bodyColor as string;
    tooltipEl.style.borderRadius = tooltipOptions.cornerRadius + 'px';
  }
};
