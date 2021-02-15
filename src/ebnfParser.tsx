import { Grammars, Parser, IToken } from 'ebnf';

const messageGrammar= `
    grammar ::= request | response

    request ::= authorize_request | enumerate_request | describe_request | read_property_request | write_property_request | subscribe_property_request | unsubscribe_property_request
    
    authorize_request ::= "AUTHORIZE" nl ("user:" authorize_user nl "password:" authorize_password nl)? ("protocol_version:" authorize_version nl)? nl
    authorize_user ::= string
    authorize_password ::= string
    authorize_version ::= integer
    
    enumerate_request ::= "ENUMERATE" nl nl
    
    describe_request ::= "DESCRIBE" nl ("id:" describe_id nl)? ("flags:" describe_flags? nl)? nl
    describe_flags ::= describe_flag ("," describe_flag)*
    describe_flag ::= "IncludeAccessInformation" | "IncludeAccessDetails" | "IncludeDeviceDetails" | "IncludeDriverInformation"
    
    read_property_request ::= "READ PROPERTY" nl "id:" property_id nl nl
    
    write_property_request ::= "WRITE PROPERTY" nl "id:" property_id nl ("value:" property_value nl)? nl
    
    subscribe_property_request ::= "SUBSCRIBE PROPERTY" nl "id:" property_id nl nl
    
    unsubscribe_property_request ::= "UNSUBSCRIBE PROPERTY" nl "id:" property_id nl nl
    
    
    response ::= error_response | authorize_response | enumerate_response | describe_response | read_property_response | write_property_response | subscribe_property_response | unsubscribe_property_response | property_update_indication | device_message
    
    error_response ::= "ERROR" nl "reason:" error_reason nl nl
    error_reason ::= string
    
    authorize_response ::= "AUTHORIZED" nl "access_level:" authorize_access_level nl "protocol_version:" authorize_version nl nl
    authorize_access_level ::= "Basic" | "Installer" | "Expert" | "QSP"
    
    enumerate_response ::= "ENUMERATED" nl "status:" status nl "device_count:" enumerate_device_count nl nl
    enumerate_device_count ::= integer
    
    describe_response ::= "DESCRIPTION" nl "status:" status nl ("id:" describe_id nl)? nl (json)?
    
    read_property_response ::= "PROPERTY READ" nl "status:" status nl "id:" property_id nl ("value:" property_value nl)? nl
    
    write_property_response ::= "PROPERTY WRITTEN" nl "status:" status nl "id:" property_id nl nl
    
    subscribe_property_response ::= "PROPERTY SUBSCRIBED" nl "status:" status nl "id:" property_id nl nl
    
    unsubscribe_property_response ::= "PROPERTY UNSUBSCRIBED" nl "status:" status nl "id:" property_id nl nl
    
    property_update_indication ::= "PROPERTY UPDATE" nl "id:" property_id nl "value:" property_value nl nl
    
    device_message ::= "DEVICE MESSAGE" nl "access_id:" access_id nl "device_id:" device_id nl "message_id:" message_id nl "message:" message_text nl nl
    message_id ::= integer
    message_text ::= (string | sp)+
    
    
    status ::= "SISuccess" | "InProgress" | "Error" | "NoProperty" | "NoDevice" | "NoDeviceAccess" | "Timeout" | "InvalidValue"
    property_value ::= (string | ".")*
    
    describe_id ::= access_id | device_id
    access_id ::= device_access_selector
    device_id ::= device_access_selector "." device_selector
    property_id ::= device_id "." property_selector
    
    device_access_selector ::= (digit | char)+
    device_selector ::= (digit | char)+
    property_selector ::= digit+
    
    json ::= "{" ([.] | nl)* "}"
    string ::= (char | digit | [_-])*
    char ::= lower_char | upper_char
    lower_char ::= [a-z]
    upper_char ::= [A-Z]
    integer ::= "-"? digit+
    digit ::= [0-9]
    nl ::= "\\n"
    sp ::= " "
    `;

let bnfParser = new Grammars.W3C.Parser(messageGrammar);

export enum ResponseType {
    //error_response | authorize_response | enumerate_response | describe_response | read_property_response |
    // write_property_response | subscribe_property_response | property_update_indication | message_indication
    error_response,
    authorize_response,
    enumerate_response,
    describe_response,
    read_property_response,
    write_property_response,
    subscribe_property_response,
    property_update_indication,
    message_indication,
    bad_message=-1,
}

export type Message ={
    type:ResponseType,
    data:string,
    propertyID:string,
    value:number,
}

class ebnfParser {

    static parse(message: string):Message {

        let target:string="";
        let token = bnfParser.getAST(message,target);
        let retVal:Message={type:ResponseType.bad_message,data:"",propertyID:"",value:-1};

        if(token != null) {
            token.children.map(child => {
                if (child.type === "response") {
                    retVal= (ebnfParser.parseResponse(child));
                }
            });
            return retVal;
        }
        else{
            if(message.includes("DESCRIPTION")){
                //let temp:string[]=message.split("{");
                //jsonData.concat(temp[1]);
                //Find beginning of the JSON part of the message
                let temp:number=message.indexOf("{");
                let jsonData:string=message.substring(temp);
                let retVal: Message = {
                    type: ResponseType.describe_response,
                    data: jsonData,
                    propertyID: "",
                    value: -1
                };
                return retVal;
            }
            else {
                let retVal: Message = {
                    type: ResponseType.bad_message,
                    data: "",
                    propertyID: "",
                    value: -1
                };
                return retVal;
            }
        }
    }

    static parseResponse(token:IToken):Message{
        //error_response | authorize_response | enumerate_response | describe_response | read_property_response |
        // write_property_response | subscribe_property_response | property_update_indication | message_indication
        let retVal:Message={type:ResponseType.bad_message,data:"",propertyID:"",value:-1};
        if(token.children){
            token.children.map(child =>{
                switch(child.type){
                    case "error_response":
                        retVal=(ebnfParser.parseErrorResponse(child));
                        break;
                    case "authorize_response":
                        retVal=(ebnfParser.parseAuthorizeResponse(child));
                        break;
                    case "enumerate_response":
                        retVal=(ebnfParser.parseEnumerateResponse(child));
                        break;
                    case "describe_response":
                        retVal=(ebnfParser.parseDescribeResponse(child));
                        break;
                    case "read_property_response":
                        retVal=(ebnfParser.parseReadPropertyResponse(child));
                        break;
                    case "write_property_response":
                        retVal=(ebnfParser.parseWritePropertyResponse(child));
                        break;
                    case "subscribe_property_response":
                        retVal=(ebnfParser.parseSubscribePropertyResponse(child));
                        break;
                    case "property_update_indication":
                        retVal=(ebnfParser.parsePropertyUpdateIndication(child));
                        break;
                    case "message_indication":
                        retVal=(ebnfParser.parseMessageIndication(child));
                        break;
                    default:
                        retVal=(ebnfParser.badMessage(child));
                }
            })
        }
        return retVal;
    }

    static parseErrorResponse(token:IToken):Message{
        //"ERROR" nl "reason:" error_reason nl nl
        token.children.map(child =>{
            if(child.type==="error_reason"){
                let retVal:Message={type:ResponseType.error_response,data:child.text,propertyID:"",value:-1};
                return retVal;
            }
        });
        return ebnfParser.badMessage(token);
    }

    static parseAuthorizeResponse(token:IToken):Message{
        //"AUTHORIZED" nl "status:" status nl "version:" authorize_version nl nl
        //status and authorize version are integer
        let retVal={type:ResponseType.authorize_response,data:"not done",propertyID:"",value:-1}
        return retVal;
    }

    static parseEnumerateResponse(token:IToken):Message{
        //"ENUMERATED" nl "status:" status nl "device_count:" enumerate_device_count nl nl
        let retVal={type:ResponseType.enumerate_response, data:"not done",propertyID:"",value:-1}
        return retVal;
    }

    static parseDescribeResponse(token:IToken):Message{
        //"DESCRIPTION" nl ("id:" describe_id nl)? nl json

        //describe_id ::= (property_id | device_id | access_id)
        // access_id ::= device_access_selector
        // device_id ::= device_access_selector "." device_selector
        // property_id ::= device_id "." property_selector

        // device_access_selector ::= (digit | char)+
        // device_selector ::= (digit | char)+
        // property_selector ::= digit+
        // + => matches for all the type noted before
        let json:string="";
        token.children.map(child=>{
            if(child.type==="json"){
                json=child.text;
            }
        });
        let retVal = {type:ResponseType.describe_response, data:json,propertyID:"",value:-1}
        return retVal;
    }

    static parseReadPropertyResponse(token:IToken):Message{
        //read_property_response ::= "PROPERTY READ" nl "id:" property_id nl "status:" status nl "value:" property_value nl nl
        let retVal={type:ResponseType.read_property_response, data:"not done",propertyID:"",value:-1}
        return retVal;
    }

    static parseWritePropertyResponse(token:IToken):Message{
        //"PROPERTY WRITTEN" nl "id:" property_id nl "status:" status nl nl
        let retVal={type:ResponseType.write_property_response, data:"not done",propertyID:"",value:-1}
        return retVal;
    }

    static parseSubscribePropertyResponse(token:IToken):Message{
        //"PROPERTY SUBSCRIBED" nl "id:" property_id nl "status:" status nl nl
        let retVal={type:ResponseType.subscribe_property_response, data:"not done",propertyID:"",value:-1}
        return retVal;
    }

    static parsePropertyUpdateIndication(token:IToken):Message{
        //"PROPERTY UPDATE" nl "id:" property_id nl "value:" property_value nl nl
        let propertyID="";
        let value:number=0;
        token.children.map(child =>{
            if(child.type==="property_id"){
                propertyID=child.text;
            }
            if(child.type==="property_value"){
                // + is an operator to "parseInt()" apparently in typescript
                value=+child.text;
            }
        });

        let retVal={type:ResponseType.property_update_indication, data:"not done",propertyID:propertyID,value:value}
        return retVal;
    }
    private static parseMessageIndication(child: IToken):Message {
        //"DEVICE MESSAGE" nl "device_id:" device_id nl "message_id:" message_id nl "message:" message_text nl nl
        let retVal={type:ResponseType.message_indication, data:"not done",propertyID:"",value:-1}
        return retVal;

    }
    static badMessage(token:IToken):Message{
        /*
        let parent:IToken=token;
        let hasParent:boolean=true;
        do{
           if(parent.parent){
               parent=parent.parent;
           }
           else{
               hasParent=false;
           }
        }while(hasParent);
        console.log("Bad message : "+parent.text);
        let retVal:Message={type:ResponseType.bad_message, data:parent.text,propertyID:"",value:-1};
        return retVal;

         */
        let retVal:Message={type:ResponseType.bad_message,data:"",propertyID:"",value:-1};
        return retVal;
    }

}

export default ebnfParser;