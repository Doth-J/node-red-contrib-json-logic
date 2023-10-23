import { LogicEngine } from 'json-logic-engine'
import * as NodeRED from "node-red";
import { env } from 'process';

interface LogicEngineNodeConfig extends NodeRED.NodeDef{
  engine: LogicEngine,
  methods: string
}

interface LogicNodeConfig extends NodeRED.NodeDef{
  engine:string,
  mode:string,
  rule:string,
  ruleType:string,
  checkpoint:boolean,
  checkpointMessage:string
}

export = function(RED:NodeRED.NodeAPI){
    
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
    
    RED.nodes.registerType('logic_engine',LogicEngineNode);

    function LogicNode(this:NodeRED.Node, config:LogicNodeConfig){
      RED.nodes.createNode(this,config);
      // const engine = new LogicEngine()
      this.on('input',(msg:any,send,done)=>{
        this.status({});
        const configNode = RED.nodes.getNode(config.engine) as any as LogicEngineNodeConfig, 
              engine = configNode.engine,
              getRule = () => {
                let rule;  
                switch(config.ruleType){
                  case "json":{
                    rule = config.rule
                    break;
                  }
                  case "msg":{
                    rule = config.rule.split(".").reduce((path,curr)=>path[curr],msg);
                    break;
                  }
                  case "flow":{
                    rule = this.context().flow.get(config.rule);
                    break;
                  }
                  case "global":{
                    rule = this.context().global.get(config.rule);
                    break;
                  }
                  case "env":{
                    rule = RED.util.evaluateNodeProperty(config.rule,config.ruleType,this,msg);
                    break;
                  }
                }
                return typeof rule == "string" ? JSON.parse(rule) : rule
              }, 
              rule = getRule(),
              result = engine.run(rule,msg.payload);

        if(config.checkpoint){
          const checkpoint = {
            id:config.id,
            mode:config.mode,
            [config.mode]:rule,
            result:result,
            timestamp:new Date(Date.now()).toString()
          }
          if(config.checkpointMessage) Object.assign(checkpoint,{message:config.checkpointMessage});
          Array.isArray(msg.checkpoints) && msg.checkpoints.length > 0 ? 
            msg.checkpoints.push(checkpoint) :
            msg.checkpoints = new Array(checkpoint)  
        }

        if(config.mode == "rule"){
          if(typeof result == 'boolean'){
            result ? send([msg,null]) : send([null,msg]);
            this.status({fill:result?"green":"red",shape:"dot",text:result?"Pass":"Fail"})
          }else{
            this.error('Rule must be a logical operator!')
          }
        }

        if(config.mode == "operator"){
          if(typeof result != 'boolean'){
            msg.payload.result = result;
            send(msg)
            this.status({fill:"blue",shape:"dot",text:result})
          }else{
            this.error('Operation must be non-logical operator!')
          }
        }

        if(done) done();
      });
    }

    RED.nodes.registerType('jsonlogic',LogicNode);
      
}