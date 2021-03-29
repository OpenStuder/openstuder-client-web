import React from "react";
import {SIDeviceMessage} from "../OpenStuder/OpenStuder"
import Devices, {DeviceProperty} from "./Devices";

type DMRprops={
    messages:SIDeviceMessage[]
}

class DeviceMessagesRender extends React.Component<DMRprops, {}>{
    constructor(props:any) {
        super(props);
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
                </div>
            );
        }
    }
}

export default DeviceMessagesRender;