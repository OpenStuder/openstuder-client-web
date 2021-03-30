import React from "react";
import {Device} from "./Devices";
import icn_gen from "./ressources/icn_gen_62x62.svg";

type SysInfoProps={
    battery:Device|undefined,
    varioTrack:Device|undefined,
    xTender:Device|undefined
}

class SystemInfo extends React.Component<SysInfoProps, {}>{
    constructor(props:any) {
        super(props);
    }

    public render(){
        if(this.props.battery&&this.props.varioTrack&&this.props.xTender) {
            let value = this.props.varioTrack.properties.map(property=>{
               if(property.id===11004){
                   return "id found";
               }
            });
            return (
                <div className="content">
                    <figure>
                        <img src={icn_gen} height="62" width="62" alt="meh"/>
                        <figcaption>{value}</figcaption>
                    </figure>
                </div>
            );
        }
        else{
            return(
                <div></div>
            );
        }
    }
}

export default SystemInfo;