"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(RED) {
    function LogicNode(config) {
        RED.nodes.createNode(this, config);
        this.on('input', (msg, send, done) => {
            this.status({});
            const configNode = RED.nodes.getNode(config.engine), engine = configNode.engine, getData = () => {
                let data;
                switch (config.dataType) {
                    case "msg": {
                        data = config.data.split(".").reduce((path, curr) => path[curr], msg);
                        break;
                    }
                    case "flow": {
                        data = this.context().flow.get(config.data);
                        break;
                    }
                    case "global": {
                        data = this.context().global.get(config.data);
                        break;
                    }
                }
                return typeof data == "string" ? JSON.parse(data) : data;
            }, data = getData(), getRule = () => {
                let rule;
                switch (config.ruleType) {
                    case "json": {
                        rule = config.rule;
                        break;
                    }
                    case "msg": {
                        rule = config.rule.split(".").reduce((path, curr) => path[curr], msg);
                        break;
                    }
                    case "flow": {
                        rule = this.context().flow.get(config.rule);
                        break;
                    }
                    case "global": {
                        rule = this.context().global.get(config.rule);
                        break;
                    }
                    case "env": {
                        rule = RED.util.evaluateNodeProperty(config.rule, config.ruleType, this, msg);
                        break;
                    }
                }
                return typeof rule == "string" ? JSON.parse(rule) : rule;
            }, rule = getRule(), result = engine.run(rule, data);
            if (config.checkpoint) {
                const checkpoint = {
                    id: config.id,
                    engine: configNode.id,
                    mode: config.mode,
                    [config.mode]: rule,
                    data: config.dataType + "." + config.data,
                    result: result,
                    timestamp: new Date(Date.now()).toString()
                };
                if (config.checkpointMessage)
                    Object.assign(checkpoint, { message: config.checkpointMessage });
                Array.isArray(msg.checkpoints) && msg.checkpoints.length > 0 ?
                    msg.checkpoints.push(checkpoint) :
                    msg.checkpoints = new Array(checkpoint);
            }
            if (config.mode == "rule") {
                if (typeof result == 'boolean') {
                    result ? send([msg, null]) : send([null, msg]);
                    this.status({ fill: result ? "green" : "red", shape: "dot", text: result ? "Pass" : "Fail" });
                }
                else {
                    this.error('Rule must be logical operator!');
                }
            }
            if (config.mode == "operator") {
                if (typeof result != 'boolean') {
                    msg.result = result;
                    send(msg);
                    this.status({ fill: "blue", shape: "dot", text: result });
                }
                else {
                    this.error('Operation must be non-logical operator!');
                }
            }
            if (done)
                done();
        });
    }
    RED.nodes.registerType('jsonlogic', LogicNode);
}
exports.default = default_1;
