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


// If block comments aren't required, then Blockly.inject's "comments"
// configuration must be false, and no blocks may be loaded from XML which
// define comments.
goog.require('Blockly.Comment');
// If there is code generation into any language, then the generator is needed.
// Should not be required when using advanced compilation since
// individual generator files should already have this require.
goog.require('Blockly.Generator');
// If the toolbox does not have categories and only has a simple flyout, then
// 'Blockly.Toolbox' is not needed.
goog.require('Blockly.Toolbox');
// If a trashcan on the workspace isn't required, then Blockly.inject's
// "trashcan" configuration must be false.
goog.require('Blockly.Trashcan');
// Only need to require these two if you're using workspace comments.
// goog.require('Blockly.WorkspaceCommentSvg');
// goog.require('Blockly.WorkspaceCommentSvg.render');
// If zoom controls aren't required, then Blockly.inject's
// "zoom"/"controls" configuration must be false.
goog.require('Blockly.ZoomControls');


// Block dependencies.
// None of these should be required when using advanced compilation since
// individual block files should include the requirements they depend on.
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
