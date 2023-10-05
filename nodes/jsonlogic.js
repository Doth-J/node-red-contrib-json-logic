"use strict";
const json_logic_engine_1 = require("json-logic-engine");
module.exports = function (RED) {
    function LogicNode(config) {
        RED.nodes.createNode(this, config);
        const engine = new json_logic_engine_1.LogicEngine();
        this.on('input', (msg, send, done) => {
            this.status({});
            const rule = config.ruleType == 'msg' ? msg[config.rule] : JSON.parse(config.rule);
            const result = engine.run(rule, msg.payload);
            if (config.check == 'y') {
                Array.isArray(msg.checkpoints) && msg.checkpoints.length > 0 ?
                    msg.checkpoints.push({ id: config.id, mode: config.mode, rule: rule, result: result, timestamp: new Date(Date.now()).toString() }) :
                    msg.checkpoints = new Array({ id: config.id, mode: config.mode, rule: rule, result: result, timestamp: new Date(Date.now()).toString() });
            }
            switch (config.mode) {
                case "rule": {
                    typeof result == 'boolean' ?
                        result ? send([msg, null]) : send([null, msg]) :
                        this.warn('Rule must be a logical operator!');
                    break;
                }
                case "operator": {
                    typeof result != 'boolean' ? send(Object.assign({ result: result }, msg)) :
                        this.warn('Operation must not be a logical operator!');
                    break;
                }
            }
            this.status({ fill: result ? "green" : "red", shape: "dot", text: result ? "passed" : "failed" });
            if (done)
                done();
        });
    }
    RED.nodes.registerType('jsonlogic', LogicNode);
};
