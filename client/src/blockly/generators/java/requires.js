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

goog.provide('Blockly.requires');

// Blockly Core (absolutely mandatory).
goog.require('Blockly');

goog.require('Blockly.Java');

goog.require('Blockly.Java.procedures');
goog.require('Blockly.Java.colour');
goog.require('Blockly.Java.lists');
goog.require('Blockly.Java.logic');
goog.require('Blockly.Java.loops');
goog.require('Blockly.Java.maps');
goog.require('Blockly.Java.math');
goog.require('Blockly.Java.texts');
goog.require('Blockly.Java.variables');