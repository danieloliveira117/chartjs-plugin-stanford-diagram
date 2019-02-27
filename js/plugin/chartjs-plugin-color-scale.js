import ColorScaleElement from "./element.js";

(function () {
    'use strict';

    let Chart = window.Chart;

    if (typeof Chart === 'undefined') {
        console.error('Can not find Chart object.');
        return;
    }

    Chart.colorscale = Chart.colorscale || {};

    Chart.colorscale.defaults = {};

    Chart.colorscale.Element = ColorScaleElement;

    function drawLegend(chart, ctx, canvas, chartArea) {
        console.log('drawLegend');
        Chart.helpers.canvas.clipArea(ctx, chartArea);

        const canvas_height = chartArea.bottom - chartArea.top;
        const barWidth = 25;
        const barHeight = 5;
        const start_value = 1;
        const interval_value = barHeight;
        const end_value = canvas_height;

        const points = d3.range(start_value, end_value, interval_value);

        const colorScale = d3.scaleSequentialPow(d3.interpolateInferno)
            .domain([canvas_height, start_value]);

        points.forEach(p => {
            ctx.fillStyle = colorScale(p);
            ctx.fillRect(chartArea.right, chartArea.top + p, barWidth, barHeight);
        });

        ctx.stroke();

        Chart.helpers.canvas.unclipArea(ctx);

        let availableWidth = chartArea.right - chartArea.left;
        let availableHeight = chartArea.bottom - chartArea.top;

        return {
            width: 0,
            height: 0
        };
    }

    /**
     * Plugin extension hooks.
     * @class colorscalePlugin
     * @implements IPlugin
     */
    let colorscalePlugin = {
        id: 'chartjs-plugin-color-scale',
        beforeInit: function (chart, options) {
            console.log(chart);
            // const ctx = chart.ctx;
            // const canvas = chart.canvas;
            //
            // const ns = chart.colorscale = {
            //     elements: [],
            //     options: {},
            //     onDestroy: [],
            //     firstRun: true
            // };
            //
            // ns.elements.push(new Chart.Element.extend({
            //     draw: function(chartArea) {
            //         drawLegend(chart, ctx, canvas, chartArea);
            //     }
            // }));
            //
            // chart.ensureScalesHaveIDs();
            //
            // console.log(chart);
        },
        afterDatasetsDraw: function (chart, easingDecimal) {
            chart
        },
        afterDatasetsUpdate: function (chart, options) {
        //     const ns = chart.colorscale;
        //
        //     console.log(ns);
        //
        //     ns.elements.forEach(function (element) {
        //         element.prototype.draw();
        //     });
        },
    };

    Chart.plugins.register(colorscalePlugin);
})();
