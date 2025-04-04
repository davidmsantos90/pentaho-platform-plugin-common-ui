/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/module!_",
  "pentaho/visual/color/Palette",
  "pentaho/util/spec"
], function(module, Palette, specUtil) {

  "use strict";

  /**
   * A quantitative color palette of 3 tones of gray.
   *
   * <table style="font-family:courier; width:120px;">
   * <colgroup><col width="20px"/><col />
   * <tr><td style="background-color:#E6E6E6"></td><td>#E6E6E6</td></tr>
   * <tr><td style="background-color:#999999"></td><td>#999999</td></tr>
   * <tr><td style="background-color:#333333"></td><td>#333333</td></tr>
   * </table>
   *
   * This palette's [colors]{@link pentaho.visual.color.spec.IPalette#colors} can be configured.
   *
   * @name pentaho.visual.color.palettes.quantitativeGray3
   * @type {pentaho.visual.color.Palette}
   * @amd pentaho/visual/color/palettes/quantitativeGray3
   */

  var spec = specUtil.merge({
    level: "quantitative",
    colors: [
      "#E6E6E6", "#999999", "#333333"
    ]
  }, module.config);

  return new Palette(spec);
});
