import { LogicEngine } from 'json-logic-engine'
import * as NodeRED from "node-red";

interface LogicNodeConfig extends NodeRED.NodeDef{
  mode:string,
  rule:string,
  ruleType:string,
  check:string
}

export = function(RED:NodeRED.NodeAPI){

    function LogicNode(this:NodeRED.Node, config:LogicNodeConfig){
      RED.nodes.createNode(this,config);
      const engine = new LogicEngine()
      this.on('input',(msg:any,send,done)=>{
        const rule = config.ruleType == 'msg' ? msg[config.rule] : JSON.parse(config.rule);
        const result = engine.run(rule,msg.payload);
        if(config.check=='y'){
          Array.isArray(msg.checkpoints) && msg.checkpoints.length > 0 ? 
            msg.checkpoints.push({id:config.id,mode:config.mode,rule:rule,result:result,timestamp:new Date(Date.now()).toString()}) :
            msg.checkpoints = new Array({id:config.id,mode:config.mode,rule:rule,result:result,timestamp:new Date(Date.now()).toString()})  
        }
        switch(config.mode){
          case "rule":{
            typeof result == 'boolean' ?
            result ? send([msg,null]) : send([null,msg]) :
            this.warn('Rule must be a logical operator!')
            break;
          }
          case "operator":{
            typeof result != 'boolean' ? send({result:result,...msg}) :
            this.warn('Operation must not be a logical operator!')
            break;
          }
        }
        if(done) done();
      });
    }

    RED.nodes.registerType('jsonlogic',LogicNode);
      
}