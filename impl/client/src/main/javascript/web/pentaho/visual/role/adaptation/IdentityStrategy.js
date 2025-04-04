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
  "./Strategy",
  "pentaho/util/object",
  "pentaho/data/util"
], function(module, Strategy, O, dataUtil) {

  /**
   * @name pentaho.visual.role.adaptation.IdentityStrategyType
   * @class
   * @extends pentaho.visual.role.adaptation.StrategyType
   *
   * @classDesc The type class of {@link pentaho.visual.role.adaptation.IdentityStrategy}.
   */

  var IdentityStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.IdentityStrategy# */{

    /**
     * @alias IdentityStrategy
     * @memberOf pentaho.visual.role.adaptation
     * @class
     * @extends pentaho.visual.role.adaptation.Strategy
     * @abstract
     *
     * @amd pentaho/visual/role/adaptation/IdentityStrategy
     *
     * @classDesc The `IdentityStrategy` class describes the strategy of adapting a single data field,
     * without modification, between the external and internal data space.
     *
     * The _identity_ strategy targets visual role mappings of a single field and exposes a single
     * and is [invertible]{@link pentaho.visual.role.adaptation.Strategy#isInvertible}.
     *
     * @description Creates an _identity_ mapping strategy instance.
     * @constructor
     * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] An adaptation strategy specification.
     */
    constructor: function(instSpec) {

      this.base(instSpec);

      this._setOutputFieldIndexes(this.inputFieldIndexes);

      // Created lazily by #__installIndex, when/if needed.
      this.__index = null;
      this.__keyFun = null;
    },

    /** @inheritDoc */
    get isInvertible() {
      return true;
    },

    /** @inheritDoc */
    map: function(inputValues) {

      var outputCell = this.__getCellByValue(inputValues[0]);

      return outputCell && [outputCell];
    },

    /** @inheritDoc */
    invert: function(outputValues) {

      var inputCell = this.__getCellByValue(outputValues[0]);

      return inputCell && [inputCell];
    },

    /**
     * Gets the cell given its value or cell
     *
     * @param {*|pentaho.data.ICell} valueOrCell - The value or cell.
     * @return {pentaho.data.ICell} The cell, if any exists; `null`, if not.
     * @private
     */
    __getCellByValue: function(valueOrCell) {

      // Must do upfront. Also creates this.__keyFun.
      var rowIndexByValueKey = this.__getRowIndexByValueKeyMap();

      // Accepts ICell or direct values.
      var valueKey = this.__keyFun(dataUtil.getCellValue(valueOrCell));

      var rowIndex = rowIndexByValueKey[valueKey];
      if(rowIndex === undefined) {
        return null;
      }

      return this.data.getCell(rowIndex, this.inputFieldIndexes[0]);
    },

    /**
     * Gets a map of row index by input/output value key.
     *
     * @return {Object.<string, number>} The map.
     * @private
     */
    __getRowIndexByValueKeyMap: function() {
      var index = this.__index;
      if(index === null) {
        this.__installIndex();
        index = this.__index;
      }

      return index;
    },

    /**
     * Builds the map of row indexes by input/output value key.
     * @private
     */
    __installIndex: function() {

      var index = this.__index = Object.create(null);

      var fieldIndex = this.outputFieldIndexes[0];
      var dataTable = this.data;
      var keyFun = this.__keyFun = O.getSameTypeKeyFun(dataTable.getColumnType(fieldIndex));

      var rowCount = dataTable.getNumberOfRows();
      var rowIndex = -1;
      while(++rowIndex < rowCount) {
        var value = dataTable.getValue(rowIndex, fieldIndex);
        var valueKey = keyFun(value);

        // Keep first row index.
        if(index[valueKey] === undefined) {
          index[valueKey] = rowIndex;
        }
      }
    },

    $type: /** @lends pentaho.visual.role.adaptation.IdentityStrategyType# */{
      id: module.id,

      /** @inheritDoc */
      get isIdentity() {
        return true;
      },

      /** @inheritDoc */
      getInputTypeFor: function(outputDataType, isVisualKeyEf) {

        // 1) Can handle a single column.
        if(outputDataType.isList) {
          return null;
        }

        return outputDataType;
      },

      /** @inheritDoc */
      validateApplication: function(schemaData, inputFieldIndexes) {
        return {isValid: true, addsFields: false};
      },

      /** @inheritDoc */
      apply: function(data, inputFieldIndexes) {
        return new IdentityStrategy({
          data: data,
          inputFieldIndexes: inputFieldIndexes
        });
      }
    }
  })
  .configure();

  return IdentityStrategy;
});
