/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Loop blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.loops');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.loops.HUE = "#EF6C00";

Blockly.Blocks['controls_repeat_ext'] = {
  /**
   * Block for repeat n times (external number).
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "TIMES",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
    });
    this.appendStatementInput('DO')
      .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  },
  isLoop: true,
  typeblock: [{entry: Blockly.Msg.CONTROLS_REPEAT_TYPEBLOCK,
    values: {'TIMES' : 10 }}]
};

Blockly.Blocks['controls_repeat'] = {
  /**
   * Block for repeat n times (internal number).
   * The 'controls_repeat_ext' block is preferred as it is more flexible.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [
        {
          "type": "field_input",
          "name": "TIMES",
          "text": "10"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
    });
    this.appendStatementInput('DO')
      .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.getField('TIMES').setChangeHandler(
      Blockly.FieldTextInput.nonnegativeIntegerValidator);
  },
  isLoop: true//,
// No typeblock because this is deprecated in
//     favor of controls_repeat_ext
//  typeblock: [{entry: Blockly.Msg.CONTROLS_REPEAT_TYPEBLOCK,
//               fields: {'TIMES' : 10 }}]
};

Blockly.Blocks['controls_whileUntil'] = {
  /**
   * Block for 'do while/until' loop.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
      [[Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE, 'WHILE'],
        [Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL, 'UNTIL']];
    this.setHelpUrl(Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendValueInput('BOOL')
      .setCheck('Boolean')
      .appendField(new Blockly.FieldDropdown(OPERATORS), 'MODE');
    this.appendStatementInput('DO')
      .appendField(Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('MODE');
      var TOOLTIPS = {
        'WHILE': Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE,
        'UNTIL': Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL
      };
      return TOOLTIPS[op];
    });
  },
  isLoop: true,
  typeblock: [{entry: Blockly.Msg.CONTROLS_WHILEUNTIL_WHILE_TYPEBLOCK,
    fields: {'MODE' : 'WHILE' }},
    {entry: Blockly.Msg.CONTROLS_WHILEUNTIL_UNTIL_TYPEBLOCK,
      fields: {'MODE' : 'UNTIL' }}]
};

Blockly.Blocks['controls_for'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOR_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "BY",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    this.appendStatementInput('DO')
      .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
        thisBlock.getFieldValue('VAR'));
    });
  },
  isLoop: true,
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('VAR')];
  },
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    vartypes[this.getFieldValue('VAR')] = ['Number'];
    return vartypes;
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  },
  /**
   * Add menu option to create getter block for loop variable.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    if (!this.isCollapsed()) {
      var option = {enabled: true};
      var name = this.getFieldValue('VAR');
      option.text = Blockly.Msg.	VARIABLES_SET_CREATE_GET.replace('%1', name);
      var xmlField = goog.dom.createDom('field', null, name);
      xmlField.setAttribute('name', 'VAR');
      var xmlBlock = goog.dom.createDom('block', null, xmlField);
      xmlBlock.setAttribute('type', 'variables_get');
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  },
  typeblock: [{entry: Blockly.Msg.CONTROLS_FOR_TYPEBLOCK,
    values: {'FROM': 1, 'TO': 10, 'BY': 1}}]
};

Blockly.Blocks['controls_forEach'] = {
  /**
   * Block for 'for each' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOREACH_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "LIST",
          "check": "Array"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOREACH_HELPURL
    });
    this.appendStatementInput('DO')
      .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOREACH_TOOLTIP.replace('%1',
        thisBlock.getFieldValue('VAR'));
    });
  },
  isLoop: true,
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('VAR')];
  },
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    var foundtypes = {};
    var listblock = this.getInputTargetBlock('LIST');
    var looptypes = listblock.getOutput();
    if (looptypes) {
      for (var i = 0; i < looptypes.length; i++) {
        var type = looptypes[i];
        var x = type.split(':');
        foundtypes[x[1]] = 1;
      }
    }

    vartypes[this.getFieldValue('VAR')] = Object.keys(foundtypes);
    return vartypes;
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  },
  customContextMenu: Blockly.Blocks['controls_for'].customContextMenu,
  typeblock: Blockly.Msg.CONTROLS_FOREACH_TYPEBLOCK
};

Blockly.Blocks['controls_flow_statements'] = {
  /**
   * Block for flow statements: continue, break.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
      [[Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK, 'BREAK'],
        [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE, 'CONTINUE']];
    this.setHelpUrl(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(OPERATORS), 'FLOW');
    this.setPreviousStatement(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('FLOW');
      var TOOLTIPS = {
        'BREAK': Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK,
        'CONTINUE': Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE
      };
      return TOOLTIPS[op];
    });
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @this Blockly.Block
   */
  onchange: function() {
    var legal = false;
    // Is the block nested in a loop?
    var block = this;
    do {
      if (block.isLoop) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      this.setWarningText(null);
    } else {
      this.setWarningText(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING);
    }
  },
  typeblock: [{entry: Blockly.Msg.CONTROLS_FLOW_STATEMENTS_BREAK_TYPEBLOCK,
    fields: {'FLOW' : 'BREAK' }},
    {entry: Blockly.Msg.CONTROLS_FLOW_STATEMENTS_CONTINUE_TYPEBLOCK,
      fields: {'FLOW' : 'CONTINUE' }}]
};

Blockly.Blocks['controls_try_catch'] = {
  // Try
  init: function() {
    this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendStatementInput('TRY')
      .appendField('try');
    this.appendStatementInput('CATCH')
      .appendField('catch');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Standard try { } catch (Exception err) {..} you must provide an error handler to consume the error message');
  }
};
