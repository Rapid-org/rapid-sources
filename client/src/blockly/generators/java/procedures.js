/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview Generating Java for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */

goog.provide('Blockly.Java.procedures');

goog.require('Blockly.Java');


Blockly.Java['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcPrefix = block.getFieldValue('NAME');
  var funcName = Blockly.Java.variableDB_.getName(funcPrefix,
    Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Java.statementToCode(block, 'STACK');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
      Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
      '"' + block.id + '"') + branch;
  }
  var retType = 'void';
  if (this.hasReturnValue_) {
    retType = getJavaType(block.getFieldValue('PROCEDURE_RETURN_TYPE'));
    console.log(retType);
  }

  var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
    Blockly.Java.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  } else if (!branch) {
    branch = Blockly.Java.PASS;
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    var type = Blockly.Java.GetVariableType(funcPrefix + '.' +
      block.arguments_[x]['name']);
    args[x] = 'final '+ type + ' ' +
      Blockly.Java.variableDB_.getName(block.arguments_[x]['name'],
        Blockly.Variables.NAME_TYPE);
  }

  var code = 'public ' + retType + ' ' +
    funcName + '(' + args.join(', ') + '){\n' +
    branch + returnValue + "}";
  code = Blockly.Java.scrub_(block, code);
  Blockly.Java.definitions_[funcName] = code;
  return null;
};

function getJavaType(type) {
  type = type.toLowerCase();
  if (type === 'string') {
    return 'String';
  }
  if (type === 'number') {
    return 'double';
  }
  if (type === 'array') {
    return 'YailList';
  }
  if (type === 'boolean') {
    return 'boolean';
  }
  if (type === 'colour') {
    return 'String';
  }
}

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Java['procedures_defnoreturn'] =
  Blockly.Java['procedures_defreturn'];
Blockly.Java['procedures_deftrycatchnoreturn'] =
  Blockly.Java['procedures_defreturn'];
Blockly.Java['procedures_definitnoreturn'] =
  Blockly.Java['procedures_defreturn'];

Blockly.Java['procedures_deffunctionnoreturn'] = function (block) {
  // Define a procedure with a return value.
  var funcPrefix = block.getFieldValue('NAME');
  var funcName = Blockly.Java.variableDB_.getName(funcPrefix,
    Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Java.statementToCode(block, 'STACK');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
      Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
      '"' + block.id + '"') + branch;
  }
  var retType = 'void';
  if (this.hasReturnValue_) {
    retType = getJavaType(block.getFieldValue('PROCEDURE_RETURN_TYPE'));
    console.log(retType);
  }

  var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
    Blockly.Java.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '    return ' + returnValue + ';\n';
  } else if (!branch) {
    branch = Blockly.Java.PASS;
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    var type = Blockly.Java.GetVariableType(funcPrefix + '.' +
      block.arguments_[x]['name']);
    args[x] = 'final '+ type + ' ' +
      Blockly.Java.variableDB_.getName(block.arguments_[x]['name'],
        Blockly.Variables.NAME_TYPE);
  }

  var code = '  @SimpleFunction(description="'  + block.getFieldValue("DESCRIPTION") + "\")\n  public " + retType + ' ' +
    funcName + '(' + args.join(', ') + ') {\n' +
    branch + returnValue + "  }";
  Blockly.Java.addImport("com.google.appinventor.components.annotations.SimpleFunction");
  code = Blockly.Java.scrub_(block, code);
  Blockly.Java.definitions_[funcName] = code;
  return null;
};

Blockly.Java['procedures_defeventnoreturn'] = function (block) {
  // Define a procedure with a return value.
  var funcPrefix = block.getFieldValue('NAME');
  var funcName = Blockly.Java.variableDB_.getName(funcPrefix,
    Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Java.statementToCode(block, 'STACK');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
      Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
      '"' + block.id + '"') + branch;
  }
  var retType = 'void';
  if (this.hasReturnValue_) {
    retType = getJavaType(block.getFieldValue('PROCEDURE_RETURN_TYPE'));
    console.log(retType);
  }

  var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
    Blockly.Java.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '    return ' + returnValue + ';\n';
  } else if (!branch) {
    branch = Blockly.Java.PASS;
  }
  var args = [];
  var argsNoTypes = [];
  for (let x = 0; x < block.arguments_.length; x++) {
    var type = Blockly.Java.GetVariableType(funcPrefix + '.' +
      block.arguments_[x]['name']);
    args[x] = 'final '+ type + ' ' +
      Blockly.Java.variableDB_.getName(block.arguments_[x]['name'],
        Blockly.Variables.NAME_TYPE);
    argsNoTypes[x] = Blockly.Java.variableDB_.getName(block.arguments_[x]['name'],
      Blockly.Variables.NAME_TYPE);
  }
  console.log("args", args)
  console.log("argsNoTypes", argsNoTypes)

  var code = '  @SimpleEvent(description="' + block.getFieldValue("DESCRIPTION") + "\")\n  public " + retType + " " +
    funcName + '(' + args.join(', ') + ') {\n' +
    "EventDispatcher.dispatchEvent(this, \"" + funcName + "\"" + (argsNoTypes.length ? (", " + argsNoTypes.join(', ')) : "") + ");\n" +
    branch + returnValue + "  }";
  Blockly.Java.addImport("com.google.appinventor.components.annotations.SimpleEvent");
  Blockly.Java.addImport("com.google.appinventor.components.runtime.EventDispatcher");
  code = Blockly.Java.scrub_(block, code);
  Blockly.Java.definitions_[funcName] = code;
  return null;
};

Blockly.Java['procedures_deffunctionreturn'] =
  Blockly.Java['procedures_deffunctionnoreturn'];

Blockly.Java['procedures_defpropertynoreturn'] = function (block) {
  // Define a procedure with a return value.
  var funcPrefix = block.getFieldValue('NAME');
  var funcName = Blockly.Java.variableDB_.getName(funcPrefix,
    Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Java.statementToCode(block, 'STACK');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
      Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
      '"' + block.id + '"') + branch;
  }
  var retType = 'void';
  if (this.hasReturnValue_) {
    retType = getJavaType(block.getFieldValue('PROCEDURE_RETURN_TYPE'));
    console.log(retType);
  }

  var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
    Blockly.Java.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '    return ' + returnValue + ';\n';
  } else if (!branch) {
    branch = Blockly.Java.PASS;
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    var type = Blockly.Java.GetVariableType(funcPrefix + '.' +
      block.arguments_[x]['name']);
    args[x] = 'final '+ type + ' ' +
      Blockly.Java.variableDB_.getName(block.arguments_[x]['name'],
        Blockly.Variables.NAME_TYPE);
  }

  var code = '';
  var designerProperty = block.getFieldValue("DESIGNER");
  if (designerProperty && designerProperty === "TRUE") {
    code += '@DesignerProperty(editorType = PropertyTypeConstants.';
    var propType = Blockly.Java.GetVariableType(funcPrefix + '.' +
      block.arguments_[0]['name']);
    var defaultVal = "";
    if (propType === "String") {
      code += "PROPERTY_TYPE_TEXT";
      defaultVal = "";
    } else if (propType === "boolean") {
      code += "PROPERTY_TYPE_BOOLEAN";
      defaultVal = "false";
    } else if (propType === "double") {
      code += "PROPERTY_TYPE_FLOAT ";
      defaultVal = "0.0";
    } else {
      code += "PROPERTY_TYPE_TEXT";
      defaultVal = "\"\""
    }
    code += ", defaultValue=\"" + defaultVal + "\")\n";
  }
  code += '  @SimpleProperty(description=\"' + block.getFieldValue("DESCRIPTION") + '\")\n    public ' + retType + ' ' +
    funcName + '(' + args.join(', ') + ') {\n' +
    branch + returnValue + "  }";
  Blockly.Java.addImport("com.google.appinventor.components.annotations.SimpleProperty");
  Blockly.Java.addImport("com.google.appinventor.components.annotations.DesignerProperty");
  Blockly.Java.addImport("com.google.appinventor.components.common.PropertyTypeConstants");
  code = Blockly.Java.scrub_(block, code);
  Blockly.Java.definitions_[funcName + ":" + args.join(",")] = code;
  return null;
};

Blockly.Java['procedures_defpropertyreturn'] =
  Blockly.Java['procedures_defpropertynoreturn'];

Blockly.Java['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Java.variableDB_.getName(block.getFieldValue('NAME'),
    Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Java.valueToCode(block, 'ARG' + x,
      Blockly.Java.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Java.variableDB_.getName(block.getFieldValue('NAME'),
    Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Java.valueToCode(block, 'ARG' + x,
      Blockly.Java.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.Java['procedures_callfunctionreturn']  = Blockly.Java['procedures_callreturn'];
Blockly.Java['procedures_callfunctionnoreturn']  = Blockly.Java['procedures_callnoreturn'];
Blockly.Java['procedures_callpropertynoreturn']  = Blockly.Java['procedures_callnoreturn'];
Blockly.Java['procedures_callpropertyreturn']  = Blockly.Java['procedures_callreturn'];
Blockly.Java['procedures_calleventnoreturn']  = Blockly.Java['procedures_callnoreturn'];
Blockly.Java['procedures_calleventreturn']  = Blockly.Java['procedures_callreturn'];

Blockly.Java['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Java.valueToCode(block, 'CONDITION',
    Blockly.Java.ORDER_NONE) || 'False';
  var code = 'if (' + condition + '){\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || 'None';
    code += '  return ' + value + ';\n}';
  } else {
    code += '  return;\n}';
  }
  return code;
};
