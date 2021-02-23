import Devices from "./Devices";
import OpenStuderInterface from "./OpenStuderInterface";

export enum SIDescriptionFlags{
    INCLUDE_ACCESS_INFORMATION,
    INCLUDE_PROPERTY_INFORMATION,
    INCLUDE_DEVICE_INFORMATION,
    INCLUDE_DRIVER_INFORMATION ,
}

export enum SIWriteFlags{
    NONE=0,
    PERMANENT=1,
}

export enum SIStatus{
    SUCCESS = 0,
    IN_PROGRESS = 1,
    ERROR = -1,
    NO_PROPERTY = -2,
    NO_DEVICE = -3,
    NO_DEVICE_ACCESS = -4,
    TIMEOUT = -5,
    INVALID_VALUE = -6
}

type DecodedFrame={
    command:string,
    body:string,
    headers:Map<string,string>
}

export type SIDeviceMessage={
    body?:string,
    status?:string,
    deviceCount?:string,
    id?:string,
    value?:string,
    accessId?:string,
    messageId?:string,
    deviceId?:string,
    message?:string,
    access_level?:string,
    count?:string,
    timestamp?:string,
    gatewayVersion?:string,
}

class SIProtocolError{
    static raise(error:string){
        console.log(error);
    }
}

export enum SIConnectionState{
    DISCONNECTED,
    CONNECTING,
    AUTHORIZING,
    CONNECTED,
}

export enum SIAccessLevel{
    NONE,
    BASIC,
    INSTALLER,
    EXPERT,
    QUALIFIED_SERVICE_PERSONNEL
}

function SIAccessLevelFromString(str:string):SIAccessLevel{
    switch(str){
        case 'None':
            return SIAccessLevel.NONE;
        case 'Basic':
            return SIAccessLevel.BASIC;
        case 'INSTALLER':
            return SIAccessLevel.INSTALLER;
        case 'EXPERT':
            return SIAccessLevel.EXPERT;
        case 'QSP':
            return SIAccessLevel.QUALIFIED_SERVICE_PERSONNEL;
        default:
            return SIAccessLevel.NONE;
    }
}

class SIAbstractGatewayClient {
    static decodeFrame(frame:string):DecodedFrame{
        let command:string="INVALID";
        let headers:Map<string,string>=new Map<string, string>();

        let lines:string[]=frame.split("\n");
        if(lines.length>1){
            command=lines[0];
        }

        let line=1;
        while (line<lines.length){
            let components = lines[line].split(":");
            if (components.length===2){
                headers.set(components[0],components[1]);
            }
            line +=1;
        }
        line -=1;
        let body = lines[line];

        let decodedFrame:DecodedFrame={body:body,headers:headers,command:command};
        return decodedFrame;

    }

    static encodeAuthorizeFrame(user?:string, password?:string):string{
        if(user===undefined || password === undefined) {
            return "AUTHORIZE\nuser:" + user + "\npassword:" + password + "\nprotocol_version:1\n\n";
        }
        else{
            return 'AUTHORIZE\nprotocol_version:1\n\n';
        }
    }

    static decodeAuthorizedFrame(frame:string):SIDeviceMessage{
        let decodedFrame:DecodedFrame = this.decodeFrame(frame);
        let retVal:SIDeviceMessage= {
            access_level:undefined,
            gatewayVersion:undefined,
        };

        if(decodedFrame.command==="AUTHORIZED" && decodedFrame.headers.has("access_level") &&
            decodedFrame.headers.has("protocol_version")){
            if (decodedFrame.headers.get("protocol_version")==="1"){
                retVal.access_level=decodedFrame.headers.get("access_level");
                retVal.gatewayVersion=decodedFrame.headers.get("gateway_version")
                return retVal;
            }
            else{
                SIProtocolError.raise("protocol version 1 not supported by server");
            }
        }
        else if(decodedFrame.command==="Error" && decodedFrame.headers.has("reason")){
            let reason:string=""+decodedFrame.headers.get("reason");
            SIProtocolError.raise(reason);
        }
        else{
            SIProtocolError.raise("unknown error during authorization");
        }
        return retVal;
    }

    static encodeEnumerateFrame(){
        return "ENUMERATE\n\n";
    }

    static decodeEnumerateFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            status:undefined,
            deviceCount:undefined,
        };
        let decodedFrame:DecodedFrame=this.decodeFrame(frame);
        if(decodedFrame.command==="ENUMERATED"){
            retVal.status=decodedFrame.headers.get("status");
            retVal.deviceCount=decodedFrame.headers.get("device_count");
        }
        else if(decodedFrame.command==="ERROR"){
            SIProtocolError.raise(""+decodedFrame.headers.get("reason"));
        }
        else{
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }

    static encodeDescribeFrame(deviceAccessId:string|undefined, deviceId:string|undefined,
                               flags:SIDescriptionFlags[]|undefined):string{
        let frame="DESCRIBE\n";
        if(deviceAccessId){
            frame+="id:"+deviceAccessId;
            if(deviceId){
                frame+="."+deviceId;
            }
            frame+="\n";
        }
        if(flags?.length!==0 && flags!==undefined){
            frame+="flags:";
            flags?.map(flag =>{
                if (flag === SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION) {
                    frame+="IncludeAccessInformation,";
                }
                if (flag === SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION) {
                    frame+="IncludePropertyInformation,";
                }
                if (flag === SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION) {
                    frame+="IncludeDeviceInformation,";
                }
                if (flag === SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION) {
                    frame+="IncludeDriverInformation,";
                }
            });
            //Suppress the last ',' or \n if no flag
            frame = frame.substring(0, frame.length - 1);
            frame+="\n";
        }
        frame+="\n";
        return frame;
    }

    static decodeDescriptionFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            body:undefined,
            status:undefined,
        };
        let decodedFrame:DecodedFrame=this.decodeFrame(frame);
        if(decodedFrame.command==="DESCRIPTION" && decodedFrame.headers.has("status")) {
            let status = decodedFrame.headers.get("status");
            retVal.status=status;
            if (status === "Success") {
                retVal.body=decodedFrame.body;
            }
        }
        else if(decodedFrame.command==="ERROR"){
            SIProtocolError.raise(""+decodedFrame.headers.get("reason"));
        }
        else{
            SIProtocolError.raise("unknown error during description");
        }
        if(decodedFrame.headers.has("id")){
            retVal.id=decodedFrame.headers.get("id");
        }
        return retVal;
    }

    static encodeReadPropertyFrame(propertyId:string):string{
        return "READ PROPERTY\nid:"+propertyId+"\n\n";
    }

    static decodePropertyReadFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            status:undefined,
            id:undefined,
            value:undefined,
        };
        let decodedFrame:DecodedFrame=this.decodeFrame(frame);
        if(decodedFrame.command==="PROPERTY READ" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            let status = decodedFrame.headers.get("status");
            retVal.status=status;
            retVal.id=decodedFrame.headers.get("id");
            if(status==="Success" && decodedFrame.headers.has("value")){
                retVal.value=decodedFrame.headers.get("value");
            }
        }
        else if(decodedFrame.command==="ERROR"){
            SIProtocolError.raise(""+decodedFrame.headers.get("reason"));
        }
        else{
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }

    static encodeWritePropertyFrame(propertyId:string, value?:string, flags?:SIWriteFlags):string{
        let frame = "WRITE PROPERTY\nid:" + propertyId + "\n";
        if(flags){
            frame+="flags:";
            if(flags === SIWriteFlags.PERMANENT){
                frame+="Permanent";
            }
            frame+="\n";
        }
        if(value){
            frame+="value:"+value+"\n";
        }
        frame+="\n";
        return frame;
    }

    static decodePropertyWrittenFrame(frame:string):SIDeviceMessage {
        let retVal:SIDeviceMessage= {
            status:undefined,
            id:undefined,
        };
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY WRITTEN" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            retVal.status=decodedFrame.headers.get("status");
            retVal.id=decodedFrame.headers.get("id");
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error during property write");
        }
        return retVal;
    }

    static encodeSubscribePropertyFrame(propertyId:string):string{
        return "SUBSCRIBE PROPERTY\nid:"+propertyId+"\n\n";
    }

    static decodePropertySubscribedFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            status:undefined,
            id:undefined,
        };
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY SUBSCRIBED" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            retVal.status=decodedFrame.headers.get("status");
            retVal.id=decodedFrame.headers.get("id");
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return retVal;
    }

    static encodeUnsubscribePropertyFrame(propertyId:string):string{
        return "UNSUBSCRIBE PROPERTY\nid:"+propertyId+"\n\n";
    }

    static decodePropertyUnsubscribedFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            status:undefined,
            id:undefined,
        };
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UNSUBSCRIBED" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            retVal.status=decodedFrame.headers.get("status");
            retVal.id=decodedFrame.headers.get("id");
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return retVal;
    }

    static decodePropertyUpdateFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            status:undefined,
            id:undefined,
        };
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UPDATE" && decodedFrame.headers.has("value")
            && decodedFrame.headers.has("id")) {
            retVal.status=decodedFrame.headers.get("status");
            retVal.id=decodedFrame.headers.get("id");
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error receiving property update");
        }
        return retVal;
    }

    static encodeReadDatalogFrame(propertyId:string, dateFrom?:Date, dateTo?:Date, limit?:number){
        let frame:string = 'READ DATALOG\nid:' + propertyId + '\n';
        frame += SIAbstractGatewayClient.getTimestampHeader('from',dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeader('to',dateTo);
        if(limit){
            frame += 'limit'+limit;
        }
        frame += '\n';
        return frame;
    }

    static decodeDatalogReadFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            status:undefined,
            id:undefined,
            count:undefined,
        };
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DATALOG READ" && decodedFrame.headers.has("status" )
            && decodedFrame.headers.has("id")&& decodedFrame.headers.has("count"))
        {
            retVal.id=decodedFrame.headers.get("id");
            retVal.status=decodedFrame.headers.get("status");
            retVal.count=decodedFrame.headers.get("count");
            retVal.body=decodedFrame.body;
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error receiving datalog read");
        }
        return retVal;
    }

    static encodeReadMessagesFrame(dateFrom?:Date, dateTo?:Date, limit?:number){
        let frame:string = 'READ MESSAGES\n';
        frame += SIAbstractGatewayClient.getTimestampHeader('from',dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeader('to',dateTo);
        if(limit){
            frame += 'limit:'+limit;
        }
        frame += '\n';
        return frame;
    }

    static decodeMessagesReadFrame(frame:string):SIDeviceMessage[]{
        let retVal:SIDeviceMessage[]=[];
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "MESSAGES READ" && decodedFrame.headers.has("status" )
            && decodedFrame.headers.has("count"))
        {
            retVal=JSON.parse(decodedFrame.body);
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error receiving messages");
        }
        return retVal;
    }

    static decodeDeviceMessageFrame(frame:string):SIDeviceMessage{
        let retVal:SIDeviceMessage= {
            id:undefined,
            accessId:undefined,
            messageId:undefined,
            message:undefined,
            timestamp:undefined,
            };
        let decodedFrame: DecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DEVICE MESSAGE" && decodedFrame.headers.has("access_id")
            && decodedFrame.headers.has("device_id")&& decodedFrame.headers.has("message_id")&&
            decodedFrame.headers.has("message") && decodedFrame.headers.has("timestamp"))
        {
            retVal.accessId=decodedFrame.headers.get("access_id");
            retVal.messageId=decodedFrame.headers.get("message_id");
            retVal.message=decodedFrame.headers.get("message");
            retVal.deviceId=decodedFrame.headers.get("device_id");
            retVal.timestamp=decodedFrame.headers.get("timestamp");
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error receiving device message");
        }
        return retVal;
    }

    static getTimestampHeader(key:string, timestamp?:Date):string{
        if(timestamp){
            return key + ':' + timestamp.toISOString();
        }
        else{
            return '';
        }
    }
    //Get the command of the frame received
    static peekFrameCommand(frame:string):string{
        //Return the first line of the received frame
        return (frame.split("\n"))[0];
    }
}

class SIGatewayClient extends SIAbstractGatewayClient{
    //Attributes
    state: SIConnectionState;
    accessLevel: SIAccessLevel;
    gatewayVersion: string;
    ws:WebSocket|null;
    deviceCount:number;
    osi:OpenStuderInterface;

    public constructor(osi:OpenStuderInterface){
        super();
        this.state = SIConnectionState.DISCONNECTED;
        this.gatewayVersion='';
        this.accessLevel=SIAccessLevel.NONE;
        this.deviceCount=0;
        this.ws=null;
        this.osi=osi;
    }

    public connect(host:string,port:number = 1987,user?:string,password?:string ) {
        this.ensureInState(SIConnectionState.DISCONNECTED);
        this.ws = new WebSocket(host + ':' + port);
        this.setStateSI(SIConnectionState.CONNECTING);
        this.ws.onopen = (event:Event)=>{
          this.setStateSI(SIConnectionState.AUTHORIZING);
          let frame = SIGatewayClient.encodeAuthorizeFrame(user,password);
          if(this.ws){
              this.ws.send(frame);
          }
        };
        this.ws.onmessage = (event:MessageEvent)=>{
            let command: string = SIGatewayClient.peekFrameCommand(event.data);
            let frame:string="";
            let receivedMessage:SIDeviceMessage;
            let receivedMessagesRead:SIDeviceMessage[];
            if(this.state===SIConnectionState.AUTHORIZING && command ==="AUTHORIZED"){
                this.setStateSI(SIConnectionState.CONNECTED);
                let flags: SIDescriptionFlags[] = [SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION, SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION,
                    SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION, SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION];
                frame = SIGatewayClient.encodeDescribeFrame(undefined, undefined, flags);
                if(this.ws) {
                    this.ws.send(frame);
                }
            }
            else if(this.state===SIConnectionState.CONNECTED){
                switch (command) {
                    case "ERROR":
                        SIProtocolError.raise(""+SIGatewayClient.decodeFrame(event.data).headers.get("reason"));
                        break;
                    case "ENUMERATED":
                        receivedMessage = SIGatewayClient.decodeEnumerateFrame(event.data);
                        if(receivedMessage.deviceCount) {
                            this.deviceCount = +receivedMessage.deviceCount;
                        }
                        this.osi.onEnumerateCallback(receivedMessage);
                        break;
                    case "DESCRIPTION":
                        receivedMessage = SIGatewayClient.decodeDescriptionFrame(event.data);
                        this.osi.onDescriptionCallback(receivedMessage);
                        break;
                    case "PROPERTY READ":
                        receivedMessage = SIGatewayClient.decodePropertyReadFrame(event.data);
                        this.osi.onPropertyReadCallback(receivedMessage);
                        break;
                    case "PROPERTY WRITTEN":
                        receivedMessage = SIGatewayClient.decodePropertyWrittenFrame(event.data);
                        this.osi.onPropertyWrittenCallback(receivedMessage);
                        break;
                    case "PROPERTY SUBSCRIBED":
                        receivedMessage = SIGatewayClient.decodePropertySubscribedFrame(event.data);
                        this.osi.onPropertySubscribeCallback(receivedMessage);
                        break;
                    case "PROPERTY UNSUBSCRIBED":
                        receivedMessage = SIGatewayClient.decodePropertyUnsubscribedFrame(event.data);
                        this.osi.onPropertyUnsubscribeCallback(receivedMessage);
                        break;
                    case "PROPERTY UPDATE":
                        receivedMessage = SIGatewayClient.decodePropertyUpdateFrame(event.data);
                        this.osi.onPropertyUpdateCallback(receivedMessage);
                        break;
                    case "DATALOG READ":
                        receivedMessage = SIGatewayClient.decodeDatalogReadFrame(event.data);
                        this.osi.onDatalogReadCallback(receivedMessage);
                        break;
                    case "DEVICE MESSAGE":
                        receivedMessage = SIGatewayClient.decodeDeviceMessageFrame(event.data);
                        this.osi.onDeviceMessageCallback(receivedMessage);
                        break;
                    case "MESSAGES READ":
                        receivedMessagesRead = SIGatewayClient.decodeMessagesReadFrame(event.data);
                        this.osi.onMessageReadCallback(receivedMessagesRead);
                        break;
                    default:
                        SIProtocolError.raise("unsupported frame command :"+command);
                }
            }
        }
        this.ws.onclose = (event:Event)=>{
            this.setStateSI(SIConnectionState.DISCONNECTED);
            this.accessLevel = SIAccessLevel.NONE;
        }
        this.ws.onerror = (event:Event)=>{
            SIProtocolError.raise("Error occurs on the websocket");
        }
    }

    public getState():SIConnectionState{
        return this.state;
    }

    public getAccessLevel():SIAccessLevel{
        return this.accessLevel;
    }

    public getGatewayVersion():string{
        return this.gatewayVersion;
    }

    public enumerate(){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeEnumerateFrame());
        }
    }

    public describe(deviceAccessId:string, deviceId?:string,flags?:SIDescriptionFlags[]){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeDescribeFrame(deviceAccessId,deviceId,flags));
        }
    }

    public readProperty(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeReadPropertyFrame(propertyId));
        }
    }

    public writeProperty(propertyId:string,value?:any){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeWritePropertyFrame(propertyId,value));
        }
    }

    public subscribeProperty(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeSubscribePropertyFrame(propertyId));
        }
    }

    public unsubscribeFromProperty(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeUnsubscribePropertyFrame(propertyId));
        }
    }

    public readDatalog(propertyId:string,dateFrom?:Date,dateTo?:Date,limit?:number){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeReadDatalogFrame(propertyId,dateFrom, dateTo, limit));
        }
    }

    public readMessages(dateFrom?:Date, dateTo?:Date, limit?:number){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeReadMessagesFrame(dateFrom, dateTo, limit));
        }
    }

    public disconnect(){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.close();
        }
    }

    public ensureInState(state:SIConnectionState){
        if(state!==this.state){
            SIProtocolError.raise("invalid client state");
        }
    }

    public setStateSI(state:SIConnectionState){
        this.state=state;
        this.osi.onChangeConnectionState(this.state);
    }

}

export default SIGatewayClient;
