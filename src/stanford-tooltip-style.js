export function customTooltipStyle(tooltipModel) {
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
  if (tooltipModel.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  // Set caret Position
  tooltipEl.classList.remove('above', 'below', 'no-transform');
  if (tooltipModel.yAlign) {
    tooltipEl.classList.add(tooltipModel.yAlign);
  } else {
    tooltipEl.classList.add('no-transform');
  }

  // Set Text
  if (tooltipModel.body) {
    const titleLines = tooltipModel.title || [];
    const bodyLines = tooltipModel.body.map((bodyItem) => {
      return bodyItem.lines;
    });

    let innerHtml = '<thead>';

    titleLines.forEach(title => {
      innerHtml += '<tr><th style="text-align: left">' + title.label + '</th><th style="text-align: right">' + title.value + '</th></tr>';
    });

    innerHtml += '</thead><tbody>';

    bodyLines.forEach((body, i) => {
      const colors = tooltipModel.labelColors[i];

      let style = 'background: ' + colors.backgroundColor + ';';
      style += 'width: 10px; height: 10px; display: inline-block; margin-right: 5px;';

      const span = '<span style="' + style + '"></span>';
      innerHtml += '<tr><td>' + span + body[0].label + '</td><td style="text-align: right">' + body[0].value + '</td></tr>';
    });

    innerHtml += '</tbody>';

    const tableRoot = tooltipEl.querySelector('table');

    tableRoot.innerHTML = innerHtml;
  }

  // `this` will be the overall tooltip
  const position = this._chart.canvas.getBoundingClientRect();

  // Display, position, and set styles for font
  tooltipEl.style.opacity = '1';
  tooltipEl.style.position = 'absolute';
  tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
  tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
  tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
  tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
  tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
  tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
  tooltipEl.style.pointerEvents = 'none';
  tooltipEl.style.background = tooltipModel.backgroundColor;
  tooltipEl.style.color = tooltipModel.bodyFontColor;
  tooltipEl.style.borderRadius = tooltipModel.cornerRadius + 'px';
}
