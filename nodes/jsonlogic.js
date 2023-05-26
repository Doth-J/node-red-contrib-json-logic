"use strict";
const json_logic_engine_1 = require("json-logic-engine");
module.exports = function (RED) {
    function LogicNode(config) {
        RED.nodes.createNode(this, config);
        const engine = new json_logic_engine_1.LogicEngine();
        this.on('input', (msg, send, done) => {
            const options = {
                mode: config.mode,
                rule: config.ruleType == 'msg' ? msg[config.rule] : JSON.parse(config.rule),
                data: msg.payload,
            };
            const operation = engine.run(options.rule, options.data);
            if (config.check == 'y') {
                Array.isArray(msg.checkpoints) && msg.checkpoints.length > 0 ?
                    msg.checkpoints.push({ id: config.id, rule: options.rule, result: operation, timestamp: new Date(Date.now()).toString() }) :
                    msg.checkpoints = new Array({ id: config.id, rule: options.rule, result: operation, timestamp: new Date(Date.now()).toString() });
            }
            switch (config.mode) {
                case "rule": {
                    typeof operation == 'boolean' ?
                        operation ? send([msg, null]) : send([null, msg]) :
                        this.warn('Rule must be a logical operator!');
                    break;
                }
                case "operator": {
                    typeof operation != 'boolean' ? send(Object.assign({ result: operation }, msg)) :
                        this.warn('Operation must not be a logical operator!');
                    break;
                }
            }
            if (done)
                done();
        });
    }
    RED.nodes.registerType('jsonlogic', LogicNode);
};
