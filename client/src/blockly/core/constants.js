/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Blockly constants.
 * @author fenichel@google.com (Rachel Fenichel)
 */
 'use strict';

 goog.provide('Blockly.constants');
 
/**
 * String for use in the "custom" attribute of a category in toolbox xml.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * @const {string}
 */
 Blockly.VARIABLE_CATEGORY_NAME = 'VARIABLE';

 /**
  * String for use in the "custom" attribute of a category in toolbox xml.
  * This string indicates that the category should be dynamically populated with
  * procedure blocks.
  * @const {string}
  */
 Blockly.PROCEDURE_CATEGORY_NAME = 'PROCEDURE';