"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(RED) {
    function LogicSwitchNode(config) {
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
            }, data = getData(), getOperation = (switchOperation) => {
                let operation;
                switch (switchOperation.tp) {
                    case "json": {
                        operation = switchOperation.op;
                        break;
                    }
                    case "msg": {
                        operation = switchOperation.op.split(".").reduce((path, curr) => path[curr], msg);
                        break;
                    }
                    case "flow": {
                        operation = this.context().flow.get(switchOperation.op);
                        break;
                    }
                    case "global": {
                        operation = this.context().global.get(switchOperation.op);
                        break;
                    }
                    case "env": {
                        operation = RED.util.evaluateNodeProperty(switchOperation.op, switchOperation.tp, this, msg);
                        break;
                    }
                }
                return typeof operation == "string" ? JSON.parse(operation) : operation;
            }, operations = config.operations.map(getOperation), results = operations.map((operation) => engine.run(operation, data));
            const outputs = [];
            results.forEach((result) => {
                config.block ?
                    outputs.push(result ? Object.assign({ result }, msg) : null) :
                    outputs.push(Object.assign({ result }, msg));
            });
            if (config.checkpoints) {
                const nodeCheckpoint = {
                    id: config.id,
                    engine: configNode.id,
                    data: config.dataType + "." + config.data,
                    timestamp: new Date(Date.now()).toString()
                };
                outputs.forEach((ouput, index) => {
                    if (ouput == null)
                        return;
                    const checkpoints = [];
                    if (msg.checkpoints)
                        checkpoints.push(...msg.checkpoints);
                    checkpoints.push(Object.assign({ operation: operations[index], result: results[index] }, nodeCheckpoint));
                    Object.assign(outputs[index], { checkpoints });
                });
                this.status({ fill: "blue", shape: "dot", text: outputs.map((output, index) => output !== null ? (index + 1) : undefined).filter((value) => value != undefined).join(',') });
            }
            send(outputs);
            if (done)
                done();
        });
    }
    RED.nodes.registerType('jsonlogic_switcher', LogicSwitchNode);
}
exports.default = default_1;
