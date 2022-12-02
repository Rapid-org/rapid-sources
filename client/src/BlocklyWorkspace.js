import Blockly from './blockly/blockly_compressed';
import './blockly/blocks_compressed';
import './blockly/closure/goog/base';
import './blockly/java_compressed';
import JSZip from 'jszip';
import $ from "jquery";
import firebase from 'firebase/compat';

/**
 * @type {Blockly.WorkspaceSvg}
 */
let project;
let projectIcon;
let projectLibraries;
let user;

class BlocklyWorkspace {

    constructor(project_, projectIcon_, projectLibraries_, projectManager, user_) {
        console.log(project_);
        project = project_;
        projectIcon = projectIcon_;
        projectLibraries = projectLibraries_;
        user = user_;
        this.projectManager = projectManager;
    }

    updateToolboxCategories() {
        let toolbox = $('#toolbox');
        let toolboxCats = document.querySelectorAll("category[id^='cat']");
        console.log(toolboxCats)
        for (let i = 0; i < toolboxCats.length; i++) {
                toolboxCats.item(i).remove();
        }
      let projectClasses = project.classes;
        window.top['classes'] = project.classes
      Blockly.updateScopeVariableTypes(project.classes)
      let allBlocks = this.workspace.getAllBlocks()
      for (let blockIndex in allBlocks) {
        let block = allBlocks[blockIndex]
        if (block.updateParams_) {
          console.log("calling update parms for block ", block)
          block.updateParams_()
        }
      }
        console.log(projectClasses);
        console.log(projectClasses && projectClasses.length !== 0);
        if (projectClasses && projectClasses.length !== 0) {
            for (let classIndex in projectClasses) {
                let classObj = projectClasses[classIndex];
                if (classIndex === 0) {
                    toolbox.append('<sep></sep>');
                }
                if (classObj.implemented !== true) {
                  toolbox.append(`<category colour='#4527A0' id='cat${classObj.displayName}' name='${classObj.displayName}'></category>`);
                }
                let constructors = classObj.constructors;
                for (let constructorIndex in constructors) {
                    let constructor = constructors[constructorIndex];
                    let params = constructor.parameters;
                    let constructorName = 'Create' + constructorIndex;
                    Blockly.Blocks[classObj.displayName + "" + constructorName] = {
                        init: function () {
                            this.setColour(Blockly.Blocks.procedures.HUE );
                            this.setTooltip(constructor.description ? constructor.description : "");
                            this.setHelpUrl('');
                            this.appendDummyInput()
                                .appendField(classObj.displayName + '. Create');
                            this.setOutput(true);
                            this.class = classObj;
                            for (let paramIndex in params) {
                                let param = params[paramIndex];
                                this.appendValueInput('PARAM-' + paramIndex)
                                    .setAlign(Blockly.ALIGN_RIGHT)
                                    .appendField(param.name, 'ARGn' + paramIndex);
                            }
                            this.arguments_ = params;
                        }
                    };

                    Blockly.Java[classObj.displayName + "" + constructorName] = function (block) {
                      const args = [];
                      if (block.arguments_) {
                        for (let x = 0; x < block.arguments_.length; x++) {
                          args[x] = resolveTypeConflicts(block.arguments_[x]['type'], Blockly.Java.valueToCode(block, 'PARAM-' + x,
                            Blockly.Java.ORDER_NONE));
                          if (!args[x].length) {
                            args.splice(x, 1)
                          }
                        }
                      }
                        return ['new ' + block.class.simpleName + '(' + args.join(', ') + ')', Blockly.Java.ORDER_FUNCTION_CALL];
                    };
                    const block_name = classObj.displayName + "" + constructorName;
                    const block_categoryName = classObj.displayName;

                    let xml;
                    xml = '<block type=' + block_name + '></block>';
                  if (classObj.implemented !== true) {
                    toolbox.find("[name='" + block_categoryName + "']").append(xml);
                  }
                }
                let methods = classObj.methods;
                for (let methodIndex in methods) {
                    let method = methods[methodIndex];
                    let params = method.parameters;
                    let methodName = method.name + methodIndex;
                  if (classObj.implemented !== true) {
                    Blockly.Blocks[classObj.displayName + methodName] = {
                      init: function() {
                        this.setColour(Blockly.Blocks.procedures.HUE);
                        this.setTooltip(method.description ? method.description : "");
                        this.setHelpUrl('');
                        this.appendDummyInput()
                          .appendField(classObj.displayName + '. ' + method.name);
                        let returnType = method.type;
                        if (returnType !== "void") {

                          this.setOutput(true, translateToBlockly(returnType));
                        } else {
                          this.setPreviousStatement(true);
                          this.setNextStatement(true);
                        }
                        let isStatic = method.isStatic;
                        if (!isStatic) {
                          this.appendValueInput('PARAM-INSTANCE')
                            .setAlign(Blockly.ALIGN_RIGHT)
                            .appendField('instance', 'ARGnInstance');
                          // .setCheck(translateToBlockly(classObj.name));
                        }
                        this.class = classObj;
                        this.isStatic = isStatic;
                        this.returnType = method.type;
                        for (let paramIndex in params) {
                          let param = params[paramIndex];
                          if (param.name.startsWith("param")) {
                            let newParamName = param.name || "";
                            console.log(param.type)
                            newParamName = param.type.split(".")[param.type.split(".").length-1]
                            newParamName = newParamName.charAt(0).toLowerCase() + newParamName.substring(1)
                            param.name =  newParamName + paramIndex;
                          }
                          this.appendValueInput('PARAM-' + paramIndex)
                            .setAlign(Blockly.ALIGN_RIGHT)
                            .appendField(param.name, 'ARGn' + paramIndex)
                          //.setCheck(translateToBlockly(param.type));
                        }
                        this.arguments_ = params;
                      }
                    };
                    Blockly.Java[classObj.displayName + "" + methodName] = function (block) {
                      const args = [];
                      if (block.arguments_) {
                        for (let x = 0; x < block.arguments_.length; x++) {
                          args[x] = resolveTypeConflicts(block.arguments_[x]['type'], Blockly.Java.valueToCode(block, 'PARAM-' +x,
                            Blockly.Java.ORDER_NONE));
                          if (!args[x].length) {
                            args.splice(x, 1)
                          }
                        }
                      }
                      let classOrInstance;
                      if (block.isStatic) {
                        classOrInstance = block.class.simpleName;
                      } else {
                        classOrInstance = resolveTypeConflicts(block.class.simpleName,Blockly.Java.valueToCode(block, 'PARAM-INSTANCE',
                          Blockly.Java.ORDER_NONE) || 'null');
                      }
                      if (block.returnType === "void" ) {
                        return classOrInstance + "." + method.name + '(' + args.join(', ') + ');';
                      } else {
                        return [classOrInstance + "." + method.name + '(' + args.join(', ') + ')', Blockly.Java.ORDER_FUNCTION_CALL];
                      }
                    };
                  } else {
                    Blockly.Blocks[classObj.displayName + methodName] = {
                      /**
                       * Block for defining a procedure with a return value.
                       * @this Blockly.Block
                       */
                      init: function() {
                        this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
                        this.setColour(Blockly.Blocks.loops.HUE);
                        var addField = '';
                        var addName = 'PARAMS';
                        if (!this.workspace.options.useMutators) {
                          addField = new Blockly.FieldClickImage(this.addPng, 17, 17);
                          addField.setChangeHandler(this.doAddField);
                          addName = null;
                        } else {
                          this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
                        }
                        this.appendDummyInput()
                          .appendField("Override")
                          .appendField(classObj.displayName + '. ' + method.name, "NAME");
                        this.setTooltip("");
                        this.setInputsInline(false);
                        this.argid = 0;
                        this.methodName = method.name;
                        this.setStatements_(true);
                        let returnType = method.type;
                        this.statementConnection_ = null;
                        this.class = classObj;
                        this.returnType = method.type;
                        this.hasReturnValue_ = this.returnType !== "void";
                        this.arguments_ = params;
                        this.updateParams_();
                        if (returnType !== "void") {
                          this.appendValueInput('RETURN')
                            .setAlign(Blockly.ALIGN_RIGHT)
                            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
                        }
                      },
                      isTopLevel: true,
                      doAddField: Blockly.Blocks['procedures_defnoreturn'].doAddField,
                      doRemoveField: function() {
                        console.log("Attempt to remove constructor single parameter.")
                      },
                      updateParam: Blockly.Blocks['procedures_defnoreturn'].updateParam,
                      updateType: Blockly.Blocks['procedures_defnoreturn'].updateType,
                      setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
                      validate: Blockly.Blocks['procedures_defnoreturn'].validate,
                      updateParams_: function() {
                        //
                        // Now go through and eliminate any parameters that we have deleted
                        //
                        var pos = this.arguments_.length;
                        while (this.getInput('PARAM' + pos) != null) {
                          this.removeInput('PARAM' + pos);
                          pos++;
                        }
                        for (var i = 0; i < this.arguments_.length; i++) {
                          var nameFieldText = 'PARAM' + i + '_NAME';
                          var subFieldText = 'PARAM' + i + '_SUB';
                          var typeFieldText = 'PARAM'+i+'_TYPE';
                          var jsonData = {
                            "message0":  "with %1 as %2%3%4",
                            "args0": [
                              {
                                "type": "field_input",
                                "text": this.arguments_[i]['name'],
                                "spellcheck": false,
                                "name": nameFieldText
                              },
                              {
                                "type": "field_label",
                                "scope": 'Types',
                                "name": typeFieldText
                              },
                              {
                                "type": "field_clickimage",
                                "src": this.subPng,
                                "width": 17,
                                "height": 17,
                                "alt": Blockly.Msg.CLICK_REMOVE_TOOLTIP,
                                "name": subFieldText
                              },
                              {
                                "type": "input_dummy",
                                "align": "RIGHT",
                                "name": 'PARAM' + i
                              }
                            ],
                            "colour": Blockly.Blocks.procedures.HUE
                          };

                          if (this.workspace.options.useMutators) {
                            // If we are using mutators, then we need to eliminate the click image
                            // for removing the field.
                            var msg = jsonData["message0"];
                            msg = msg.replace('%3', '');
                            msg = msg.replace('%4', '%3');
                            jsonData["message0"] = msg;
                            jsonData["args0"].splice(2, 1);  // Delete the field_clickimage
                          }
                          if (!this.getInput('PARAM' + i)) {
                            this.jsonInit(jsonData);

                            var nameField = this.getField(nameFieldText);
                            nameField.setSerializable(false);
                            nameField.argPos_ = i;
                            nameField.setChangeHandler(this.updateParam);

                            var subField = this.getField(subFieldText);
                            if (subField != null) {
                              subField.setSerializable(false);
                              subField.setPrivate({ name: 'param', pos: i });
                              subField.setChangeHandler(this.doRemoveField);
                            }

                            const typeField = this.getField(typeFieldText);
                            if (typeField != null) {
                              typeField.setSerializable(false);
                              //typeField.setVisible(false)
                              typeField.setChangeHandler(this.updateType);
                              typeField.argPos_ = i;
                              let type = this.arguments_[i]['type'];
                              if (!type) {
                                type = 'Any';
                              }
                              typeField.setValue(type);
                            }

                            this.moveNumberedInputBefore(this.inputList.length - 1, i + 1);
                          } else {
                            // We need to update the field
                            this.setFieldValue(this.arguments_[i]['name'], nameFieldText);
                            this.setFieldValue(this.arguments_[i]['type'], typeFieldText);

                          }
                        }
                        // Initialize procedure's callers with blank IDs.
                        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
                          this.workspace, this.arguments_);
                        this.workspace.fireChangeEvent();
                      },
                        mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
                          domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
                          decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
                          compose: Blockly.Blocks['procedures_defnoreturn'].compose,
                          dispose: Blockly.Blocks['procedures_defnoreturn'].dispose,
                          getProcedureDef:Blockly.Blocks['procedures_defnoreturn'].getProcedureDef,
                          getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
                          getVarsTypes: Blockly.Blocks['procedures_defnoreturn'].getVarsTypes,
                          renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
                          customContextMenu: Blockly.Blocks['procedures_defnoreturn'].customContextMenu,
                          isCallable: false
                    };
                    Blockly.Java[classObj.displayName + methodName] = function(block) {
                      // Define a procedure with a return value.
                      var funcName = this.methodName;
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
                        retType = block.returnType;
                        console.log(retType);
                      }

                      var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
                        Blockly.Java.ORDER_NONE) || '';
                      if (returnValue) {
                        returnValue = '  return ' + returnValue + ';\n';
                      } else if (!branch) {
                        branch = Blockly.Java.PASS;
                      }
                      const args = [];
                      if (block.arguments_) {
                        for (let x = 0; x < block.arguments_.length; x++) {
                          args[x] = block.arguments_[x]['type'] + " " + block.arguments_[x]['name'];
                          if (!args[x].length) {
                            args.splice(x, 1)
                          }
                        }
                      }

                      var code = '@Override\n    public ' + retType + ' ' +
                        funcName + '(' + args.join(', ') + '){\n' +
                        branch + returnValue + "}";
                      code = Blockly.Java.scrub_(block, code);
                      Blockly.Java.definitions_[funcName] = code;
                      return null;
                    };
                  }

                    const block_name = classObj.displayName + "" + methodName;
                    const block_categoryName = classObj.displayName;

                    let xml;
                    xml = '<block type=' + block_name + '></block>';
                  if (classObj.implemented !== true) {
                    toolbox.find("[name='" + block_categoryName + "']").append(xml);
                  }
                  Blockly.Blocks['controls_do_result'] = {
                    // Try
                    init: function() {
                      this.setHelpUrl(Blockly.Msg.CONTROLS_REPEAT_HELPURL);
                      this.setColour(Blockly.Blocks.procedures.HUE);
                      this.appendStatementInput('DO')
                        .appendField('do');
                      this.appendValueInput("RETURN")
                        .setAlign(Blockly.ALIGN_RIGHT)
                        .appendField("returns");
                      this.setTooltip('');
                      this.setOutput(true)
                    },
                    onchange: function() {
                      let parentBlock = this.getParent();
                      if (parentBlock&& parentBlock.arguments_) {
                        console.log("arggs", this.arguments_)
                        var pos1 = 0;
                        while(this.getInput('PARAM-'+pos1) != null) {
                          this.removeInput('PARAM-'+pos1);
                          pos1++;
                        }
                        this.arguments_ = parentBlock.arguments_;
                        this.currentParams = []
                        for (let z in this.arguments_) {
                          console.log("out connect", parentBlock.getInputTargetBlock("PARAM-" + z))
                          console.log("out connect id", this.id)
                          if (parentBlock.getInputTargetBlock("PARAM-" + z).id === this.id) {
                            console.log(this.arguments_[z])
                            this.currentParams = this.arguments_[z]['parameters']
                            for (let y in this.arguments_[z]['parameters']) {
                              this.appendDummyInput('PARAM-'+y)
                                .setAlign(Blockly.ALIGN_RIGHT)
                                .appendField(this.arguments_[z]['parameters'][y].name + " with " + this.arguments_[z]['parameters'][y].type)
                            }
                            break;
                          }
                        }
                      } else {
                        var pos = 0;
                        while(this.getInput('PARAM-'+pos) != null) {
                          this.removeInput('PARAM-'+pos);
                          pos++;
                        }
                      }
                    },
                    customContextMenu: function(options) {
                      // Add options to create getters for each parameter.
                      if (!this.isCollapsed()) {
                        console.log(this.currentParams)
                        for (var i = 0; i < this.currentParams.length; i++) {
                          var option = {enabled: true};
                          var name = this.currentParams[i]['name'];
                          option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
                          var xmlField = document.createElement("field")
                          xmlField.innerHTML = name;
                          xmlField.setAttribute('name', 'VAR');
                          var xmlBlock = document.createElement("block")
                          xmlBlock.appendChild(xmlField)
                          xmlBlock.setAttribute('type', 'variables_get');
                          console.log("xml block", xmlBlock)
                          option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
                          options.push(option);
                        }
                      }
                    },
                  };
                  Blockly.Java['controls_do_result'] = function(block) {

                    // try catch
                    var tryblock = Blockly.Java.statementToCode(block, 'DO');
                    var code = '\n' + tryblock + '\n';
                    var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
                      Blockly.Java.ORDER_NONE);
                    if (returnValue && returnValue.trim().length) {
                      code += 'return ' + returnValue  + ';\n';
                    }
                    return [code];
                  };
                }

                  Blockly.Blocks[classObj.displayName + "anonymousImplement"] = {
                    init: function() {
                      this.setColour(Blockly.Blocks.procedures.HUE);
                      this.setTooltip("Allows anonymous implementation of all methods in the interface.");
                      this.setHelpUrl('');
                      this.appendDummyInput()
                        .appendField(classObj.displayName + '. Implement');
                      let returnType = classObj.type;
                        this.setOutput(true, translateToBlockly(returnType));
                      this.class = classObj;
                      this.returnType = classObj.type;
                      for (let methodIndex in classObj.methods) {
                        let method = classObj.methods[methodIndex];
                        this.appendValueInput('PARAM-' + methodIndex)
                          .setAlign(Blockly.ALIGN_RIGHT)
                          .appendField(method.name, 'ARGn' + methodIndex)
                        //.setCheck(translateToBlockly(param.type));
                      }
                      this.arguments_ = classObj.methods;
                    }
                  };

              Blockly.Java[classObj.displayName + "anonymousImplement"] = function (block) {
                const args = [];
                console.log("args", block.arguments_)
                if (block.arguments_) {
                  for (let x = 0; x < block.arguments_.length; x++) {
                    console.log(block.arguments_[x])
                    const methodArgs = []
                    for (let i in block.arguments_[x]['parameters']) {
                      methodArgs[i] = block.arguments_[x]['parameters'][i]['type'] + " " + block.arguments_[x]['parameters'][i]['name'];
                    }
                      args[x] = `@Override\n public ${block.arguments_[x].type} ${block.arguments_[x].name}(` + methodArgs.join(", ") + `) {` + Blockly.Java.valueToCode(block, 'PARAM-' + x,
                        Blockly.Java.ORDER_NONE) + "}";
                      if (!args[x].length) {
                        args.splice(x, 1)
                      }
                    }
                  }
                return ['new ' + block.class.simpleName + '(){' + args.join("\n") + '}'];
              };

              const block_name = classObj.displayName + "anonymousImplement";
              const block_categoryName = classObj.displayName;

              let xml;
              xml = '<block type=' + block_name + '></block><block type="controls_do_result"></block>';
              if (classObj.implemented !== true) {
                toolbox.find("[name='" + block_categoryName + "']").append(xml);
              }


                // solve conflicts between different types ( ex.: float, long and double )
                function resolveTypeConflicts(actualType, arg) {
                  if (arg.length) {
                    // type cast the value
                    return "((" + actualType + ") " + arg + ")";
                  } else {
                    return ""
                  }
                }

                function translateToBlockly(javaClass) {
                    if (javaClass === 'java.lang.String') {
                        return 'String';
                    }
                    if (javaClass === 'int' || javaClass === 'double' || javaClass === 'long' || javaClass === 'java.lang.Double' || javaClass === 'java.lang.Integer' || javaClass === 'java.lang.Long') {
                        return 'Number';
                    }
                    if (javaClass === 'boolean' || javaClass === 'java.lang.Boolean') {
                        return 'Boolean';
                    }
                    if (javaClass === 'YailList' || javaClass.includes('[') || javaClass.includes('ArrayList')) {
                        return 'Array';
                    }
                    return javaClass;
                }
            }
        }
        this.workspace.updateToolbox(toolbox[0]);
    }

    injectBlocklyWorkspace(callback, opt_read_only) {
      opt_read_only = opt_read_only || false
        if (user.language === "en") {
            import('./en').then(() => {
                console.log("English Imported");
                this.doInjectBlocklyWorkspace(opt_read_only, callback);
            });
        } else {
            import('./ar').then(() => {
                console.log("Arabic Imported");
                this.doInjectBlocklyWorkspace(opt_read_only, callback);
            });
        }
    }

    doInjectBlocklyWorkspace(readOnly, callback) {
        this.workspace = Blockly.inject('project-view', {
            toolbox: document.getElementById('toolbox'),
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
                pinch: true
            },
            media: 'media/',
            trashcan: true
        });
      Blockly.Java.interfaces_ = []; // reset interfacesOver
      this.updateToolboxCategories();

        console.log(project);
        const xmlText = project.blocks;
        if (xmlText) {
            const xml = Blockly.Xml.textToDom(xmlText);
            Blockly.Xml.domToWorkspace(this.workspace, xml);
        }

        // don't show
        window.oncontextmenu = function (e) {
            if (!Blockly.isTargetInput_(e)) {
                e.preventDefault();
            }
        };


      this.workspace.addChangeListener(() => {
            // Show a warning for non-top-level blocks placed outside a parent.
        const newBlocks = this.workspace.getAllBlocks();
          if (this.blocks !== newBlocks) {
            this.blocks = newBlocks;
            if (!user.suppressWarnings) {
              for (let blockIndex in this.blocks) {
                const block = this.blocks[blockIndex];
                if (!block.parentBlock_ && !block.isTopLevel && !block.warning) {
                  block.setWarningText(Blockly.Msg["WARNING_BLOCK_WITHOUT_PARENT"]);
                  block.setDisabled(true)
                } else if (block.parentBlock_) {
                  if (block.warning && block.warning.text_[""] === Blockly.Msg["WARNING_BLOCK_WITHOUT_PARENT"]) {
                    block.setWarningText(null);
                  }
                  block.setDisabled(false)
                }
                const returnType = block.getFieldValue('PROCEDURE_RETURN_TYPE');
                const returnInput = block.getInputTargetBlock('RETURN');
                if (block.getProcedureDef) { // only for procedures
                  if (returnType && returnInput) {
                    block.setWarningText(null);
                    const type = returnInput.outputConnection.check_;
                    console.log('Type', type);
                    console.log('Return type', returnType);
                    if (type) {
                      const blockType = getBlocklyType(type[0]);
                      console.log('Block Type', blockType);
                      if (blockType) {
                        if (returnType.toUpperCase() !== blockType.toUpperCase()) {
                          block.setWarningText("The return type doesn't match the return value.")
                        } else {
                          block.setWarningText(null);
                        }
                      }
                    }
                  } else if (returnType && !returnInput) {
                    block.setWarningText("No return value set for block.");
                  }
                }
                console.log(block.type);
              }
            }
            this.renderAutoBlocks()
            // save the changes
            const xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
            project.blocks = Blockly.Xml.domToPrettyText(xmlDom);
            console.log(project);
            if (this.projectManager && !readOnly) {
              callback()
            }
          }
        });
        window.setInterval(() => {
          console.log("Saving..")
          const xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
          const newBlocks = Blockly.Xml.domToPrettyText(xmlDom);
          if (newBlocks !== project.blocks) {
            console.log(project);
            if (this.projectManager && !readOnly) {
              this.projectManager.updateProject(project, projectIcon, this, projectLibraries, callback);
            }
          } else {
            console.log("Ignoring to save identical content..")
          }
        }, 60000)

        function getBlocklyType(type) {
            if (type) {
                type = type.toLowerCase();
                if (type === 'string') {
                    return 'String';
                }
                if (type === 'number') {
                    return 'Number';
                }
                if (type === 'array') {
                    return 'Array';
                }
                if (type === 'colour') {
                    return 'String';
                }
                if (type === 'boolean') {
                    return 'Boolean';
                }
                return null;
            } else {
                return null;
            }
        }
    }

    renderAutoBlocks() {
      var handleErrorExists = this.workspace.getBlocksByType("procedures_deftrycatchnoreturn").length > 0;
      var tryCatchExists =  this.workspace.getBlocksByType("controls_try_catch").length > 0;
      var constructorExists = this.workspace.getBlocksByType("procedures_definitnoreturn").length > 0;
      let projectClasses = project.classes;
      console.log(projectClasses);
      console.log(projectClasses && projectClasses.length !== 0);
      if (projectClasses && projectClasses.length !== 0) {
        for (let classIndex in projectClasses) {
          let classz = projectClasses[classIndex]
          if (classz.implemented === true) {
            for (let methodIndex in classz.methods) {
              let method = classz.methods[methodIndex]
              const blockExists = this.workspace.getBlocksByType(classz.displayName + method.name + methodIndex).length > 0;
              if (!blockExists) {
                let block = Blockly.Block.obtain(this.workspace, classz.displayName + method.name + methodIndex);
                block.initSvg();
                block.render();
              }
            }
          }
        }
      }
      var childBlock;
      if (tryCatchExists && !handleErrorExists) {
        childBlock = Blockly.Block.obtain(this.workspace, 'procedures_deftrycatchnoreturn');
        childBlock.initSvg();
        childBlock.render();
      }
      if (!constructorExists) {
        childBlock = Blockly.Block.obtain(this.workspace, 'procedures_definitnoreturn');
        childBlock.initSvg();
        childBlock.render();
      }
    }

    getBlocksXml() {
        const xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
        return Blockly.Xml.domToPrettyText(xmlDom);
    }

    disposeBlocklyWorkspace() {
        if (this.workspace) {
          Blockly.Java.interfaces_ = []; // reset interfaces
          console.log("Emptying interfaces.")
            this.workspace.dispose();
            const toolboxDiv = document.getElementsByClassName("blocklyToolboxDiv")[0];
            if (toolboxDiv) {
                toolboxDiv.remove();
            }
            this.workspace = undefined;
        }
    }

    generateJavaCode(callback, forceNew) {
        if (!this.workspace || forceNew) {
            // create an invisible workspace for resolving the java code
          let isFirstTime = true;
            this.injectBlocklyWorkspace(() => {
              if (isFirstTime) {
                isFirstTime = false;
                this.updateWorkspaceBlocks(project.blocks)
                this.doGenerateJavaCode(callback)
              }
            }, true);
        } else {
            this.doGenerateJavaCode(callback)
        }
    }

    doGenerateJavaCode(callback) {
      console.log("Export project: " + JSON.stringify(project));
      Blockly.Java.Interfaces_ = [];
      Blockly.Java.imports_ = [];
      for (let i in project.classes) {
        let classz = project.classes[i];
        console.log(classz.name)
          Blockly.Java.addImport(classz.name.replaceAll("$", "."));
        if (classz.implemented === true) {
          Blockly.Java.addInterface(classz.name.replaceAll("$", "."));
        }
      }
      console.log(Blockly.Java.imports_)
      this.workspace.options.appTitle = project.name;
      Blockly.Java.setName(firebase.auth().currentUser.displayName)
      Blockly.Java.setPackage(project.packageName);
      Blockly.Java.setDescription(project.description);
      Blockly.Java.setVersionName(project.versionName);
      Blockly.Java.setVersionNumber(project.versionNumber);
      Blockly.Java.setHomeWebsite(project.homeWebsite);
      Blockly.Java.setMinSdk(project.minSdk);
      if (project.icon) {
        Blockly.Java.setIcon(`aiwebres/${project.icon}`);
      } else {
        Blockly.Java.setIcon(`aiwebres/logo.png`);
      }
      Blockly.Java.setLibraries(project.libraries.join(","))
      callback(Blockly.Java.workspaceToCode(this.workspace));
    }


    createProjectFile(project, icon, libraries, callback, opt_import) {
      opt_import = opt_import || false;
        console.log(project);
        const zip = new JSZip();
        const sourceDirectory = "src/main/java/" + project.packageName.replaceAll(".", "/");
        const blocksDirectory = "src/main/blocks";
        // holds the extension information, parsed in the buildserver or when importing a project
        let extensionJson = Object.assign({}, project);
        console.log(extensionJson);
        let manifest = extensionJson.androidManifest;
        // remove unneeded/private information
        delete extensionJson._id; // project id
        delete extensionJson.userId; // user id
        delete extensionJson.__v; // document revision key
        delete extensionJson.blocks; // project blocks ( they are available as src/main/blocks/Name.xml )
        delete extensionJson.androidManifest; // project manifest ( they are available as AndroidManifest.xml )
        delete extensionJson.classes // Imported Classes JSON ( they are available in classes.json)
        zip.file("extension.json", JSON.stringify(extensionJson));
        zip.file("classes.json", JSON.stringify({"classes": project.classes}));
        zip.file("AndroidManifest.xml", decodeURIComponent(manifest));
        zip.folder(sourceDirectory);
        zip.folder(blocksDirectory);
        zip.folder("aiwebres");
        zip.folder("libraries");
        zip.file("aiwebres/" + extensionJson.icon, icon);
        for (let i = 0; i < extensionJson.libraries.length; i++) {
          zip.file("libraries/" + extensionJson.libraries[i], libraries[i]);
        }
        this.generateJavaCode((code) => {
            zip.file(sourceDirectory + "/" + extensionJson['name'] + ".java", code);
            const xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
            const xmlText = Blockly.Xml.domToPrettyText(xmlDom);
            console.log("xmlDom", xmlDom);
            zip.file(blocksDirectory + "/" + extensionJson['name'] + ".xml", xmlText);
            zip.generateAsync({ type: "blob" }).then((content) => {
              if (opt_import) {
                this.disposeBlocklyWorkspace();
              }
                callback(content, project);
            });
        }, opt_import);
    }

    importClass(project_, classObj, callback) {
        let newProject = Object.assign({}, project_);
        let newProjectClasses = newProject.classes;
        let classDisplayName = classObj.simpleName;
        let duplicateNumber = 1;
        for (let i = 0; i < newProjectClasses.length; i++) {
            let classSimpleName = newProjectClasses[i].simpleName;
            if (classSimpleName === classDisplayName) {
                duplicateNumber++;
            }
        }
        classDisplayName = classDisplayName + duplicateNumber;
        classObj.displayName = classDisplayName;
        newProjectClasses.push(classObj);
        console.log(newProjectClasses);
        this.projectManager.updateProject(newProject, projectIcon, this, projectLibraries, (status) => {
            console.log(status);
            this.updateToolboxCategories()
          callback()
        });
    }


  implementInterface(project_, interfaceObj, callback) {
    let newProject = Object.assign({}, project_);
    let newProjectClasses = newProject.classes;
    let classDisplayName = interfaceObj.simpleName;
    let duplicateNumber = 1;
    for (let i = 0; i < newProjectClasses.length; i++) {
      let classSimpleName = newProjectClasses[i].simpleName;
      if (classSimpleName === classDisplayName) {
        duplicateNumber++;
      }
    }
    classDisplayName = classDisplayName + duplicateNumber;
    interfaceObj.displayName = classDisplayName;
    interfaceObj.implemented = true;
    newProjectClasses.push(interfaceObj);
    console.log(newProjectClasses);
    this.projectManager.updateProject(newProject, projectIcon, this, projectLibraries, (status) => {
      console.log(status);
      this.updateToolboxCategories()
      this.renderAutoBlocks()
      callback()
    });
  }

    updateWorkspaceBlocks(newBlocks) {
        console.log(newBlocks);
        this.workspace.clear();
        const xml = Blockly.Xml.textToDom(newBlocks);
        Blockly.Xml.domToWorkspace(this.workspace, xml);
    }
}

export default BlocklyWorkspace;
