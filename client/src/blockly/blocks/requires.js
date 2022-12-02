/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Default Blockly entry point. Use this to pick and choose which
 * fields and renderers to include in your Blockly bundle.
 * @author samelh@google.com (Sam El-Husseini)
 * @suppress {extraRequire}
 */
'use strict';

goog.provide('Blockly.requires');

// Blockly Core (absolutely mandatory).
goog.require('Blockly');

goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Blocks.variables');
goog.require('Blockly.Blocks.colour');
goog.require('Blockly.Blocks.loops');
goog.require('Blockly.Blocks.lists');
goog.require('Blockly.Blocks.logic');
goog.require('Blockly.Blocks.math');
goog.require('Blockly.Blocks.maps');
goog.require('Blockly.Blocks.texts');
