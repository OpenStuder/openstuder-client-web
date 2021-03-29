import React, {ChangeEvent, FormEvent} from "react";

export type DeviceProperty = {
    value: string|undefined,
    id: number,
    description: string,
    readable: boolean,
    writeable: boolean,
    type: string,
    unit: string|undefined,
}

export type Device = {
    model: string,
    properties: DeviceProperty[],
    id: number,
}

class Devices{
    devices: Device[];
    constructor(devices?:Device[]) {
        if(devices) {
            this.devices = devices;
        }
        else{
            this.devices = [];
        }
    }
    public static jsonToDevices(json:string):Device[]{
        let devices:Device[];
        let pJSON = JSON.parse(json);
        let instances = pJSON.instances;
        if(instances) {
            let devicesList = instances[0].devices;
            let tempDevices: Device[] = [];
            for (const elementDevice of devicesList) {
                let tempDevice: Device = {model: elementDevice.model, properties: [], id: elementDevice.id};
                for (const elementProperty of elementDevice.properties) {
                    let tempProperty: DeviceProperty = {
                        value: undefined,
                        id: elementProperty.id,
                        description: elementProperty.description,
                        readable: elementProperty.readable,
                        writeable: elementProperty.writeable,
                        type: elementProperty.type,
                        unit: elementProperty.unit
                    };
                    tempDevice.properties.push(tempProperty);
                }
                tempDevices.push(tempDevice);
            }
            devices=tempDevices;
        }
        else{
            devices=[];
        }
        return devices;
    }

    public findDevice(id:number):Device|undefined{
        let deviceFound:Device|undefined;
        this.devices.map(device=>{
           if(id===+device.id){
               deviceFound=device;
           }
        });
        return deviceFound;
    }

    public hasDevice(id:number):boolean{
        return this.findDevice(id) !== undefined;

    }

    public findPropertyFromString(idProperty:string):DeviceProperty|undefined{
        let ids:string[] = (idProperty.split("."));
        return this.findProperty(+ids[ids.length-2], +ids[ids.length-1]);
    }
    public findProperty(idDevice:number, idProperty:number):DeviceProperty|undefined{
        let device = this.findDevice(idDevice);
        let propertyFound:DeviceProperty|undefined;
        if(device!==undefined){
            device.properties.map(property=>{
                if(property.id===+idProperty){
                    propertyFound = property;
                }
            });
        }
        return propertyFound;
    }

    public hasProperty(idDevice:number, idProperty:number):boolean{
        return this.findProperty(idDevice, idProperty) !== undefined;
    }

    public hasPropertyFromString(ids:string):boolean{
        return this.findPropertyFromString(ids) !==undefined;
    }
}

enum typeWidget{
    NONE,
    BUTTON,
    TEXTBOX
}

type DWprops={
    type:typeWidget,
    id:string,
    onClick:(id:string)=>void,
    onSubmit:(id:string, value:string)=>void,
}
class DeviceWidget extends React.Component<DWprops, {}>{
    inputValue:string;
    constructor(props:any){
        super(props);
        this.inputValue="";
    }

    public onClick(){
        this.props.onClick(this.props.id);
    }

    public onSubmit(){
        this.props.onSubmit(this.props.id, this.inputValue);
    }

    public onChange(event:React.ChangeEvent<HTMLInputElement>){
        this.inputValue=event.target.value;
    }

    public render(){
        if(this.props.type===typeWidget.BUTTON){
            return(<button onClick={()=>this.onClick()}> Read </button>);
        }

        if(this.props.type===typeWidget.TEXTBOX){
            /*
                    <input type="text" form={this.props.id} value={this.inputValue} onChange={this.handleChange}> </input>
                    <input type="submit" value="send"/>
            */
            console.log("trying to display the input now:");
            return(
                <div>
                    <input type="text" name="value" form="form" onChange={(event => this.onChange(event))}/>
                    <input type="submit" value="send" form="form" onClick={()=>this.onSubmit()}/>
                </div>

        );
        }

        else{
                return(<div>-</div>);
            }
        }
}

type DRprops ={
    device:Device,
    onClick:(id:string)=>void,
    onSubmit:(id:string, value:string)=>void
}

export class DeviceRender extends React.Component<DRprops, {}>{
    inputValue:string;
    constructor(props:any) {
        super(props);
        this.inputValue="";
    }

    public onClick(id:string){
        this.props.onClick(id);
    }

    public onSubmit(id:string,value:string){
        this.props.onSubmit(id,value);
    }

    public renderProperty(property:DeviceProperty, id:string){
        let readButton:typeWidget;
        let writeTextBox:typeWidget;
        if(property.readable===true){
            readButton = typeWidget.BUTTON;
        }
        else{
            readButton = typeWidget.NONE;
        }
        if(property.writeable===true){
            writeTextBox = typeWidget.TEXTBOX;
        }
        else{
            writeTextBox = typeWidget.NONE;
        }
        return(
            <tr>
                <td>
                    {property.id}
                </td>
                <td>
                    {property.description}
                </td>
                <td>
                    {""+property.value}
                </td>
                <td>
                    <DeviceWidget type={readButton} id={this.props.device.id+"."+property.id} onClick={(id)=>this.onClick(id)} onSubmit={(id,value) => this.onSubmit(id, value)}/>
                </td>
                <td>
                    <DeviceWidget type={writeTextBox} id={this.props.device.id+"."+property.id} onClick={(id)=>this.onClick(id)} onSubmit={(id,value) => this.onSubmit(id, value)}/>
                </td>
            </tr>
    );
    }
    public render() {
        return (
            <div>
                <h2>
                    {this.props.device.model} with ID {this.props.device.id}
                </h2>
                <tr>
                    <th scope="col">
                        Property ID
                    </th>
                    <th scope="col">
                        Property Description
                    </th>
                    <th scope="col">
                        Actual value
                    </th >
                    <th scope="col">
                        Read Property
                    </th>
                    <th scope="col">
                        Write Property
                    </th>
                </tr>
                {this.props.device.properties.map(property => {
                    let id:string = this.props.device.id+"."+property.id;
                    return this.renderProperty(property, id);
                })}
            </div>);
    }
}

export default Devices;

/*
*               <td>
                    <DeviceWidget type={readButton} id={id} onClick={this.onClick} onSubmit={this.onSubmit}/>
                </td>
                <td>
                    <DeviceWidget type={writeTextBox} id={this.props.device.id+"."+property.id} onClick={(id)=>this.onClick(id)} onSubmit={(id,value)=>this.onSubmit(id,value)}/>
                </td>



*/