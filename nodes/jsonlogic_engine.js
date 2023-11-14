"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_logic_engine_1 = require("json-logic-engine");
function default_1(RED) {
    function LogicEngineNode(config) {
        RED.nodes.createNode(this, config);
        this.engine = new json_logic_engine_1.LogicEngine();
        if (config.methods) {
            try {
                const methodsFunction = new Function('engine', config.methods);
                methodsFunction(this.engine);
            }
            catch (err) {
                this.error(err);
            }
        }
    }
    RED.nodes.registerType('jsonlogic_engine', LogicEngineNode);
}
exports.default = default_1;
