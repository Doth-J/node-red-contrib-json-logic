import * as logic from "json-logic-engine";
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
        const options = {
          mode: config.mode,
          rule: config.ruleType == 'msg' ? msg[config.rule] : JSON.parse(config.rule),
          data: msg.payload,
        }
        const operation = engine.run(options.rule,options.data);
        if(config.check=='y'){
          Array.isArray(msg.check) && msg.check.length > 0 ? 
            msg.check.push({id:config.id,rule:options.rule,result:operation,timestamp:new Date(Date.now()).toString()}) :
            msg.check = new Array({id:config.id,rule:options.rule,result:operation,timestamp:new Date(Date.now()).toString()})  
        }
        switch(config.mode){
          case "rule":{
            typeof operation == 'boolean' ?
            operation ? send([msg,null]) : send([null,msg]) :
            this.warn('Rule must be a logical operator!')
            break;
          }
          case "operator":{
            typeof operation != 'boolean' ? send({result:operation,...msg}) :
            this.warn('Operation must not be a logical operator!')
            break;
          }
        }
        if(done) done();
      });
    }

    RED.nodes.registerType('logic',LogicNode);
      
}