import React from "react";
import {SIDeviceMessage} from "../OpenStuder/OpenStuder"
import Devices, {DeviceProperty} from "./Devices";

type DMRprops={
    messages:SIDeviceMessage[],
    onSubmit:(dateFrom?:Date,dateTo?:Date)=>void,
}

class DeviceMessagesRender extends React.Component<DMRprops, {}>{
    dateFrom:string;
    dateTo:string;
    dateToValidity:string;
    dateFromValidity:string;
    constructor(props:any) {
        super(props);
        this.dateFrom="";
        this.dateTo="";
        this.dateToValidity="";
        this.dateFromValidity="";
    }

    public onSubmit(){
        let valid:boolean=true;
        this.dateToValidity="";
        this.dateFromValidity="";
        let dateFrom:Date|undefined;
        let dateTo:Date|undefined;
        dateFrom=new Date(this.dateFrom);
        dateTo=new Date(this.dateTo);
        if(isNaN(dateFrom.getTime())){
            dateFrom=undefined;
            if(this.dateFrom!=="") {
                this.dateFromValidity = "Invalid date \"from\"";
                valid=false;
            }
        }
        if(isNaN(dateTo.getTime())){
            dateTo=undefined;
            if(this.dateTo!=="") {
                this.dateFromValidity = "Invalid date \"until\"";
                valid=false;
            }
        }
        if(valid) {
            this.props.onSubmit(dateFrom, dateTo);
        }
    }

    public onChangeFrom(event:React.ChangeEvent<HTMLInputElement>){
        this.dateFrom=event.target.value;
    }

    public onChangeTo(event:React.ChangeEvent<HTMLInputElement>){
        this.dateTo=event.target.value;
    }

    public renderMessage(message:SIDeviceMessage){
        return(
            <tr>
                <td>
                    {""+message.accessId}
                </td>
                <td>
                    {""+message.deviceId}
                </td>
                <td>
                    {""+message.message}
                </td>
                <td>
                    {""+message.timestamp}
                </td>
            </tr>
        );
    }

    public renderRequest(){
        return(
            <div>
                <h2>Request stored messages :</h2><br/>
                <p> Format : yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss</p><br/>
                <p>From:</p>
                <input type="text" name="value" form="form" onChange={(event => this.onChangeFrom(event))}/><br/>
                <p>Until:</p>
                <input type="text" name="value" form="form" onChange={(event => this.onChangeTo(event))}/><br/>
                <input type="submit" value="send" form="form" onClick={()=>this.onSubmit()}/><br/>
                <p className="error">{this.dateFromValidity}</p>
                <p className="error">{this.dateToValidity}</p>
            </div>
        );
    }

    public render() {
        if(this.props.messages.length>0) {
            return (
                <div>
                    <h2 className="content">
                        Notification Center
                    </h2>
                    <tr>
                        <th scope="col">
                            Source
                        </th>
                        <th scope="col">
                            Device ID
                        </th>
                        <th scope="col">
                            Message
                        </th>
                        <th scope="col">
                            Date
                        </th>
                    </tr>
                    {this.props.messages.map(message => {
                        return this.renderMessage(message);
                    })}
                    {this.renderRequest()}
                </div>);
        }
        else{
            return (
                <div>
                    <h2>
                        Notification Center
                    </h2>
                    <p className="content">
                        No messages
                    </p>
                    {this.renderRequest()}
                </div>
            );
        }
    }
}

export default DeviceMessagesRender;