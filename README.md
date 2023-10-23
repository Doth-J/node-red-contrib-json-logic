# node-red-contrib-json-logic
This is a Node-RED node for working with [JsonLogic](https://jessemitchell.me/json-logic-engine/) rules and operations in your flow.

## Installation :zap:
To install the node execute the following command inside the `.node-red` directory:
```console
npm install node-red-contrib-json-logic
```

## Logic Node :vulcan_salute:
The `logic` node utilizes the [json-logic-engine](https://jessemitchell.me/json-logic-engine/) which makes it easy to write safe instructions for evaluating and operating on `json` data. These instructions can be persisted into a database, and shared between the front-end and back-end. This works very similar to having *access control lists* for the data traversing through your flow, if the node is set to [`rule mode`](#rule-mode), or applying custom logic to your json data, if the node is set to [`operator mode`](#operator-mode).

## Configuring the Logic Engine :gear:
  
  ![ConfigEngine](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/config_engine.png?raw=true) 

The config node for the logic node's `Logic Engine` is implemented to share the engine instance between logic nodes. This way your logic nodes can access the same `Logic Engine` across your flows for the rules and operations they perform.

### Adding Methods :nut_and_bolt:
The configuration node allows you to set the name (*optional*) and allows you to add new methods to the `Logic Engine`. 

  [![ConfigMethods](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/config_methods.png?raw=true)](https://jessemitchell.me/json-logic-engine/docs/methods)

The editor inside the `Logic Engine` config node gives you access to an **engine** variable that contains the instance of the `Logic Engine`. 

## Using the Logic Node :wrench:
The logic node provides two modes od usage:
- ### Rule Mode
  This mode is used to apply a rule on the data given, the node evaluates the rule against the `msg.payload` and forwards the `msg` object accordingly to the `pass` and `fail` outputs. Rules defined must be *logical operations* and in *json* format:

  [![RuleMode](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/rule.png?raw=true)](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/flows/rule_mode_flow.json) 
  
  Check [here](https://jessemitchell.me/json-logic-engine/docs/logic) for more info on **logical operations**.

- ### Operator Mode
  This mode is used to perform custom logic operations on the fly when a `msg.payload` is inbound, the node evaluates the operation and adds it to the `msg.result` field.

  [![OperatorMode](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/operator.png?raw=true)](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/flows/operator_mode_flow.json)
  
  Check [here](https://jessemitchell.me/json-logic-engine/docs/math) for more info on **math operations**.

You also can import this [example flow](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/flows/example_flow.json) which utilizes both node modes.

## Setting Rules & Operations :bookmark_tabs:
The rules used by the logic node must be in `JSON` format and they can be set by editing the `Rule(s)` property on the logic node's edit dialog window. There is also an option to set the rules using a `msg` field by clicking on the dropdown next to the node's property and selecting `msg`.   
    
  ![RuleModeEdit](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/rule_edit.png?raw=true)

Same is true for when using the logic node in the `operator` mode. The `Rule(s)` property transforms to `Operation(s)` property and a **non** logical operation is expected in the input field. 
  
  ![OperatorModeEdit](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/operator_edit.png?raw=true)

  ## Check please? :receipt:
  In the edit dialog of the logic node you can enable the `Checkpoint` property, this sets the node to append a checkpoint event to the `msg.checkpoints` array about the logical rule or operation performed.
  Optionally you can add a message on the checkpoint event in the input shown:

  ![CheckpointProperty](https://github.com/Doth-J/node-red-contrib-json-logic/blob/master/docs/checkpoint_edit.png?raw=true)

  ### Operator Mode node with Checkpoint property checked:  
  ```json
{
    "_msgid":"2a7c3f3134e4ed25",
    "payload":{
        "number":10,
        "result":20
    },
    "checkpoints":[
        {
            "id":"23b26db68d74a983",
            "mode":"operator",
            "operator":{
                "+":[
                    {
                        "var":"number"
                    },
                    10
                ]
            },
            "result":20,
            "message":"Operation Check",
            "timestamp":"Mon Oct 23 2023 17:34:36 GMT+0300 (Eastern European Summer Time)"
        }
    ]
}
  ```

  The `msg.checkpoints` is an array that keeps track of the rule(s) / operation(s) performed, the evaluated result, the node's id and mode, an optional message and a timestamp for the checkpoint event. Each logic node can be configured to append checkpoint event information about the rule(s) /operation(s) done and will push these events into the `msg.checkpoints` array.   
