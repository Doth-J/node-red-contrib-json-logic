import { LogicEngine } from 'json-logic-engine'
import * as NodeRED from "node-red";

export interface LogicEngineNodeConfig extends NodeRED.NodeDef{
  engine: LogicEngine,
  methods: string
}

export default function(RED:NodeRED.NodeAPI){
    
    function LogicEngineNode(this:any,config:LogicEngineNodeConfig){
      RED.nodes.createNode(this,config);
      this.engine = new LogicEngine()
      if(config.methods) {
        try {
          const methodsFunction = new Function( 'engine', config.methods);
          methodsFunction(this.engine);
        } catch (err) {
          this.error(err);
        }
      }
    }
    
    RED.nodes.registerType('jsonlogic_engine',LogicEngineNode);
}