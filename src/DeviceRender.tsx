import React from "react";

import {Device} from "./Devices";
import {DeviceProperty} from "./Devices";

type DRprops ={
    device:Device,
    subscribeStatus:boolean,
    onClick:(id:number)=>void
}

class DeviceRender extends React.Component<DRprops, {}>{
    constructor(props:any) {
        super(props);
    }

    public onClick(id:number){
        this.props.onClick(id);
    }

    public render(){
        const propertyRender = this.props.device.properties.map(property =>{
            return (
                <tr>
                    <td>
                        {property.id}
                    </td>
                    <td>
                        {property.value}
                    </td>
                    <td>
                        {property.readable}
                    </td>
                    <td>
                        {property.writeable}
                    </td>
                    <td>
                        {property.description}
                    </td>
                </tr>
            );
        });
        let btnLabel = this.props.subscribeStatus?"unsubscribe":"subscribe";
        return(
            <div>
                <table>
                    <thead>
                    <tr>
                        <th colSpan={5}>{this.props.device.model}</th>
                    </tr>
                    </thead>
                    <tbody>
                            {propertyRender}
                    </tbody>
                </table>
            </div>)
    }

}

export default DeviceRender;