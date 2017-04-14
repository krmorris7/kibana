import _ from 'lodash';
import 'ui/vislib';
import 'plugins/kbn_vislib_vis_types/controls/vislib_basic_options';
import 'plugins/kbn_vislib_vis_types/controls/point_series_options';
import 'plugins/kbn_vislib_vis_types/controls/line_interpolation_option';
import 'plugins/kbn_vislib_vis_types/controls/heatmap_options';
import 'plugins/kbn_vislib_vis_types/controls/point_series';
import { VisVisTypeProvider } from 'ui/vis/vis_type';
import VislibProvider from 'ui/vislib';

export function VislibVisTypeVislibVisTypeProvider(Private) {
  const VisType = Private(VisVisTypeProvider);
  const vislib = Private(VislibProvider);

  const updateParams = function (params) {
    if (!params.seriesParams || !params.seriesParams.length) return;

    const updateIfSet = (from, to, prop, func) => {
      if (from[prop]) {
        to[prop] = func ? func(from[prop]) : from[prop];
      }
    };

    updateIfSet(params, params.seriesParams[0], 'drawLinesBetweenPoints');
    updateIfSet(params, params.seriesParams[0], 'showCircles');
    updateIfSet(params, params.seriesParams[0], 'radiusRatio');
    updateIfSet(params, params.seriesParams[0], 'interpolate');
    updateIfSet(params, params.seriesParams[0], 'type');

    if (params.mode) {
      const stacked = ['stacked', 'percentage', 'wiggle', 'silhouette'].includes(params.mode);
      params.seriesParams[0].mode = stacked ? 'stacked' : 'normal';
      const axisMode = ['stacked', 'overlap'].includes(params.mode) ? 'normal' : params.mode;
      params.valueAxes[0].scale.mode = axisMode;
      delete params.mode;
    }

    if (params.smoothLines) {
      params.seriesParams[0].interpolate = 'cardinal';
      delete params.smoothLines;
    }

    updateIfSet(params, params.valueAxes[0].scale, 'setYExtents');
    updateIfSet(params, params.valueAxes[0].scale, 'defaultYExtents');

    if (params.scale) {
      params.valueAxes[0].scale.type = params.scale;
      delete params.scale;
    }

    updateIfSet(params, params.categoryAxes[0], 'expandLastBucket');
  };

  class VislibVisType extends VisType {
    constructor(opts) {
      super(opts);
    }

    render(vis, $el, uiState, esResponse) {
      updateParams(vis.params);
      if (!this.vislibVis) {
        this.vislibVis = new vislib.Vis($el[0], vis.params);

        _.each(vis.listeners, (listener, event) => {
          this.vislibVis.on(event, listener);
        });
      }

      this.vislibVis.render(esResponse, uiState);
      this.refreshLegend++;
    }

    destroy() {
      _.forOwn(self.vis.listeners, (listener, event) => {
        this.vislibVis.off(event, listener);
      });

      this.vislibVis.destroy();
    }
  }



  return VislibVisType;
}