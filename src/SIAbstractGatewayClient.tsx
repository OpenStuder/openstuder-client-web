export enum SIDescriptionFlags{
    INCLUDE_ACCESS_INFORMATION,
    INCLUDE_PROPERTY_INFORMATION,
    INCLUDE_DEVICE_INFORMATION,
    INCLUDE_DRIVER_INFORMATION ,
}

type DecodedFrame={
    command:string,
    body:string,
    headers:Map<string,string>
}

export type Response={
    description:string|undefined,
    status:string|undefined,
    device_count:string|undefined,
    id:string|undefined,
    value:string|undefined,
    access_id:string|undefined,
    message_id:string|undefined,
    message:string|undefined,
    access_level:string|undefined
}

class SIProtocolError{
    static raise(error:string){
        console.log(error);
    }
}

class SIAbstractGatewayClient {
    static decode_frame(frame:string):DecodedFrame{
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

    static encode_authorize_frame(user:string,password:string):string{
        return "AUTHORIZE\nuser:"+user+"\npassword:"+password+"\nprotocol_version:1\n\n";
    }

    static decode_authorized_frame(frame:string):Response{
        let decodedFrame:DecodedFrame = this.decode_frame(frame);
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};

        if(decodedFrame.command==="AUTHORIZED" && decodedFrame.headers.has("access_level") &&
            decodedFrame.headers.has("protocol_version")){
            if (decodedFrame.headers.get("protocol_version")==="1"){
                retVal.access_level=decodedFrame.headers.get("access_level");
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

    static encode_enumerate_frame(){
        return "ENUMERATE\n\n";
    }

    static decode_enumerate_frame(frame:string):Response{
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame:DecodedFrame=this.decode_frame(frame);
        if(decodedFrame.command==="ENUMERATED"){
            retVal.status=decodedFrame.headers.get("status");
            retVal.device_count=decodedFrame.headers.get("device_count");
        }
        else if(decodedFrame.command==="ERROR"){
            SIProtocolError.raise(""+decodedFrame.headers.get("reason"));
        }
        else{
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }

    static encode_describe_frame(device_access_id:string|undefined,device_id:string|undefined,
                                 flags:SIDescriptionFlags[]|undefined):string{
        let frame="DESCRIBE\n";
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
        if(device_access_id){
            frame+="id:"+device_access_id;
            if(device_id){
                frame+="."+device_id;
            }
            frame+="\n";
        }
        frame+="\n";
        return frame;
    }

    static decode_description_frame(frame:string):Response{
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame:DecodedFrame=this.decode_frame(frame);
        if(decodedFrame.command==="DESCRIPTION" && decodedFrame.headers.has("status")) {
            let status = decodedFrame.headers.get("status");
            retVal.status=status;
            if (status === "Success") {
                retVal.description=decodedFrame.body;
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

    static encode_read_property_frame(property_id:string):string{
        return "READ PROPERTY\nid:"+property_id+"\n\n";
    }

    static decode_property_read_frame(frame:string):Response{
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame:DecodedFrame=this.decode_frame(frame);
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

    static encode_write_property_frame(property_id:string,value?:string):string{
        let frame = "WRITE PROPERTY\nid:" + property_id + "\n";
        if(value){
            frame+="value:"+value+"\n";
        }
        frame+="\n";
        return frame;
    }

    static decode_property_written_frame(frame:string):Response {
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame: DecodedFrame = this.decode_frame(frame);
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

    static encode_subscribe_property_frame(property_id:string):string{
        return "SUBSCRIBE PROPERTY\nid:"+property_id+"\n\n";
    }

    static decode_property_subscribed_frame(frame:string):Response{
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame: DecodedFrame = this.decode_frame(frame);
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

    static decode_property_update_frame(frame:string):Response{
        let retVal:Response= {
            description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame: DecodedFrame = this.decode_frame(frame);
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

    static decode_device_message_frame(frame:string):Response{
        let retVal:Response= {description:undefined,
            status:undefined,
            device_count:undefined,
            id:undefined,
            value:undefined,
            access_id:undefined,
            message_id:undefined,
            message:undefined,
            access_level:undefined};
        let decodedFrame: DecodedFrame = this.decode_frame(frame);
        if (decodedFrame.command === "DEVICE MESSAGE" && decodedFrame.headers.has("access_id")
            && decodedFrame.headers.has("device_id")&& decodedFrame.headers.has("message_id")&&
            decodedFrame.headers.has("message")) {
            retVal.access_id=decodedFrame.headers.get("access_id");
            retVal.message_id=decodedFrame.headers.get("message_id");
            retVal.message=decodedFrame.headers.get("message");
        } else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error receiving device message");
        }
        return retVal;
    }

    static peek_frame_command(frame:string):string{
        return (frame.split("\n"))[0];
    }
}

export default SIAbstractGatewayClient;