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
 * @fileoverview Utility functions for generating executable code from
 * Blockly code.
 * @author fraser@google.com (Neil Fraser)
 */

goog.provide('Blockly.Generator');

goog.require('Blockly.Block');
goog.require('goog.asserts');


/**
 * Class for a code generator that translates the blocks into a language.
 * @param {string} name Language name of this generator.
 * @constructor
 */
Blockly.Generator = function(name) {
  this.name_ = name;
  this.FUNCTION_NAME_PLACEHOLDER_REGEXP_ =
    new RegExp(this.FUNCTION_NAME_PLACEHOLDER_, 'g');
};

/**
 * Category to separate generated function names from variables and procedures.
 */
Blockly.Generator.NAME_TYPE = 'generated_function';

/**
 * Arbitrary code to inject into locations that risk causing infinite loops.
 * Any instances of '%1' will be replaced by the block ID that failed.
 * E.g. '  checkTimeout(%1);\n'
 * @type {?string}
 */
Blockly.Generator.prototype.INFINITE_LOOP_TRAP = null;

/**
 * Arbitrary code to inject before every statement.
 * Any instances of '%1' will be replaced by the block ID of the statement.
 * E.g. 'highlight(%1);\n'
 * @type {?string}
 */
Blockly.Generator.prototype.STATEMENT_PREFIX = null;

/**
 * Stash of generate lines to output before generating a statement.  This allows
 * for any code generator to output prep lines (such as assignment statements
 * or even local definitions) while generating inline code to be used by an
 * upper level block
 */
Blockly.Generator.prototype.STATEMENT_STASH = '';
/**
 * Pending stash of lines to output.  It will be output if anything else is
 * output in the meantime
 */
Blockly.Generator.prototype.STATEMENT_STASH_PEND = '';
/**
 * Generate code for all blocks in the workspace to the specified language.
 * @param {Blockly.Workspace} workspace Workspace to generate code from.
 * @param {string} parms Any extra parameters to pass to the lower level block
 * @return {string} Generated code.
 */
Blockly.Generator.prototype.workspaceToCode = function(workspace, parms) {
  if (!workspace) {
    // Backwards compatability from before there could be multiple workspaces.
    console.warn('No workspace specified in workspaceToCode call.  Guessing.');
    workspace = Blockly.getMainWorkspace();
  }
  var codearray = [];
  this.init(workspace);
  var blocks = workspace.getTopBlocks(true);
  for (var x = 0, block; block = blocks[x]; x++) {
    var line = this.blockToCode(block, parms);
    // If the intervening code generated any statement stash, now is a good
    // time to flush it
    var stash = this.getStatementStash();
    if (stash !== '') {
      codearray.push(stash);
    }
    if (typeof line === "array") {
      // Value blocks return tuples of code and operator order.
      // Top-level blocks don't care about operator order.
      line = line[0] + ";\n";
    }
    if (line) {
      if (block.outputConnection && this.scrubNakedValue) {
        // This block is a naked value.  Ask the language's code generator if
        // it wants to append a semicolon, or something.
        line = this.scrubNakedValue(line);
      }
      codearray.push(line);
    }
  }
  var code = codearray.join('\n');  // Blank line between each section.
  code = this.finish(code);
  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  return code;
};

// The following are some helpful functions which can be used by multiple
// languages.

/**
 * Prepend a common prefix onto each line of code.
 * @param {string} text The lines of code.
 * @param {string} prefix The common prefix.
 * @return {string} The prefixed lines of code.
 */
Blockly.Generator.prototype.prefixLines = function(text, prefix) {
  if (Array.isArray(text)) {
    text = text[0] +";\n";
  }
  console.log(text);
  return prefix + text.replace(/\n(.)/g, '\n' + prefix + '$1');
};

/**
 * Recursively spider a tree of blocks, returning all their comments.
 * @param {!Blockly.Block} block The block from which to start spidering.
 * @return {string} Concatenated list of comments.
 */
Blockly.Generator.prototype.allNestedComments = function(block) {
  var comments = [];
  var blocks = block.getDescendants();
  for (var x = 0; x < blocks.length; x++) {
    var comment = blocks[x].getCommentText();
    if (comment) {
      comments.push(comment);
    }
  }
  // Append an empty string to create a trailing line break when joined.
  if (comments.length) {
    comments.push('');
  }
  return comments.join('\n');
};

/**
 * Generate code for the specified block (and attached blocks).
 * @param {Blockly.Block} block The block to generate code for.
 * @param {string} parms Any extra parameters to pass to the lower level block
 * @param {boolean} nostash Don't process the stashed code
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
Blockly.Generator.prototype.blockToCode = function(block,parms,nostash) {
  if (!block) {
    return '';
  }
  if (block.disabled || block.getInheritedDisabled()) {
    // Skip past this block if it is disabled.
    return this.blockToCode(block.getNextBlock(),parms,nostash);
  }

  var func = this[block.type];
  console.log("Function");
  console.log(func);
  goog.asserts.assertFunction(func,
    'Language "%s" does not know how to generate code for block type "%s".',
    this.name_, block.type);
  // First argument to func.call is the value of 'this' in the generator.
  // Prior to 24 September 2013 'this' was the only way to access the block.
  // The current prefered method of accessing the block is through the second
  // argument to func.call, which becomes the first parameter to the generator.
  var code = func.call(block, block, parms);
  console.log(code);
  var stash = '';
  if (!nostash) {
    stash = this.getStatementStash();
  }
  console.log(Array.isArray(code));
  if (Array.isArray(code)) {
    console.log([this.scrub_(block, stash + code[0], parms), code[1]]);
    // Value blocks return tuples of code and operator order.
    return [this.scrub_(block, stash + code[0], parms), code[1]];
  } else if (typeof code == 'string') {
    if (this.STATEMENT_PREFIX) {
      code = this.STATEMENT_PREFIX.replace(/%1/g, '\'' + block.id + '\'') +
        code;
    }
    return this.scrub_(block, stash + code, parms);
  } else if (code === null) {
    console.log("Stash:");
    console.log(stash);
    // Block has handled code generation itself.
    return stash;
  } else {
    throw new Error('Invalid code generated: ' + code);
  }
};

/**
 * Generate code representing the specified value input.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {number} order The maximum binding strength (minimum order value)
 *     of any operators adjacent to "block".
 * @param {string} parms Any extra parameters to pass to the lower level block
 * @return {string} Generated code or '' if no blocks are connected or the
 *     specified input does not exist.
 */
Blockly.Generator.prototype.valueToCode = function(block, name, order, parms) {
  if (isNaN(order)) {
    goog.asserts.fail('Expecting valid order from block "%s".', block.type);
  }
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return '';
  }
  var tuple = this.blockToCode(targetBlock, parms, true);
  console.log(tuple);
  if (tuple === '') {
    // Disabled block.
    return '';
  }
  // Value blocks must return code and order of operations info.
  // Statement blocks must only return code.
  goog.asserts.assertArray(tuple,
    'Expecting tuple from value block "%s".', targetBlock.type);
  var code = tuple[0];
  var innerOrder = tuple[1];
  if (isNaN(innerOrder)) {
    goog.asserts.fail('Expecting valid order from value block "%s".',
      targetBlock.type);
  }
  if (code && order <= innerOrder) {
    if (order == innerOrder && (order == 0 || order == 99)) {
      // Don't generate parens around NONE-NONE and ATOMIC-ATOMIC pairs.
      // 0 is the atomic order, 99 is the none order.  No parentheses needed.
      // In all known languages multiple such code blocks are not order
      // sensitive.  In fact in Python ('a' 'b') 'c' would fail.
    } else {
      // The operators outside this code are stonger than the operators
      // inside this code.  To prevent the code from being pulled apart,
      // wrap the code in parentheses.
      // Technically, this should be handled on a language-by-language basis.
      // However all known (sane) languages use parentheses for grouping.
      code = '(' + code + ')';
    }
  }
  return code;
};

/**
 * Generate code representing the statement.  Indent the code.
 * @param {!Blockly.Block} block The block containing the input.
 * @param {string} name The name of the input.
 * @param {string} parms Any extra parameters to pass to the lower level block
 * @return {string} Generated code or '' if no blocks are connected.
 */
Blockly.Generator.prototype.statementToCode = function(block, name, parms) {
  var targetBlock = block.getInputTargetBlock(name);
  var code = this.blockToCode(targetBlock, parms);
  // Value blocks must return code and order of operations info.
  // Statement blocks must only return code.
  goog.asserts.assertString(code,
    'Expecting code from statement block "%s".',
    targetBlock && targetBlock.type);
  if (code) {
    code = this.prefixLines(/** @type {string} */ (code), this.INDENT);
  }
  return code;
};

/**
 * Add an infinite loop trap to the contents of a loop.
 * If loop is empty, add a statment prefix for the loop block.
 * @param {string} branch Code for loop contents.
 * @param {string} id ID of enclosing block.
 * @return {string} Loop contents, with infinite loop trap added.
 */
Blockly.Generator.prototype.addLoopTrap = function(branch, id) {
  if (this.INFINITE_LOOP_TRAP) {
    branch = this.INFINITE_LOOP_TRAP.replace(/%1/g, '\'' + id + '\'') + branch;
  }
  if (this.STATEMENT_PREFIX) {
    branch += this.prefixLines(this.STATEMENT_PREFIX.replace(/%1/g,
      '\'' + id + '\''), this.INDENT);
  }
  return branch;
};

/**
 * The method of indenting.  Defaults to two spaces, but language generators
 * may override this to increase indent or change to tabs.
 * @type {string}
 */
Blockly.Generator.prototype.INDENT = '  ';

/**
 * Comma-separated list of reserved words.
 * @type {string}
 * @private
 */
Blockly.Generator.prototype.RESERVED_WORDS_ = '';

/**
 * Add one or more words to the list of reserved words for this language.
 * @param {string} words Comma-separated list of words to add to the list.
 *     No spaces.  Duplicates are ok.
 */
Blockly.Generator.prototype.addReservedWords = function(words) {
  this.RESERVED_WORDS_ += words + ',';
};

/**
 * This is used as a placeholder in functions defined using
 * Blockly.Generator.provideFunction_.  It must not be legal code that could
 * legitimately appear in a function definition (or comment), and it must
 * not confuse the regular expression parser.
 * @type {string}
 * @private
 */
Blockly.Generator.prototype.FUNCTION_NAME_PLACEHOLDER_ = '{leCUI8hutHZI4480Dc}';

/**
 * Define a function to be included in the generated code.
 * The first time this is called with a given desiredName, the code is
 * saved and an actual name is generated.  Subsequent calls with the
 * same desiredName have no effect but have the same return value.
 *
 * It is up to the caller to make sure the same desiredName is not
 * used for different code values.
 *
 * The code gets output when Blockly.Generator.finish() is called.
 *
 * @param {string} desiredName The desired name of the function (e.g., isPrime).
 * @param {!Array.<string>} code A list of statements.
 * @return {string} The actual name of the new function.  This may differ
 *     from desiredName if the former has already been taken by the user.
 * @private
 */
Blockly.Generator.prototype.provideFunction_ = function(desiredName, code) {
  if (!this.definitions_[desiredName]) {
    var functionName =
      this.variableDB_.getDistinctName(desiredName, this.NAME_TYPE);
    this.functionNames_[desiredName] = functionName;
    this.definitions_[desiredName] = code.join('\n').replace(
      this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
  }
  return this.functionNames_[desiredName];
};

/**
 * Returns the current stash of statements to be output before the current
 * line is generated.  Note that the stash is cleared upon return
 * @return {string} Any stashed code
 */
Blockly.Generator.prototype.getStatementStash = function() {
  var result = this.STATEMENT_STASH;
  this.STATEMENT_STASH = '';
  return result;
};

/**
 * Saves away lines of code to insert before the current statement
 * @param {string} code any lines of code to stash away
 * @param {string} pending any lines of code to pend for stashing.
 */
Blockly.Generator.prototype.stashStatement = function(code, pending) {
  if (pending != null) {
    this.STATEMENT_STASH_PEND = pending;
  }
  if (code) {
    if (this.STATEMENT_STASH_PEND != '') {
      this.STATEMENT_STASH += this.STATEMENT_STASH_PEND;
      this.STATEMENT_STASH_PEND = '';
    }
    this.STATEMENT_STASH += code;
  }
};
