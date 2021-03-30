import React from "react";

export type DeviceProperty = {
    value: string|undefined,
    id: number,
    description: string,
    readable: boolean,
    writeable: boolean,
    type: string,
    unit: string|undefined,
    subscribed:boolean,
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
                        unit: elementProperty.unit,
                        subscribed:false
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
    BUTTON_READ,
    BUTTON_SUBSCRIBE,
    TEXTBOX
}

type WRprops={
    type:typeWidget,
    id:string,
    onClick:(id:string)=>void,
}

class WidgetRead extends React.Component<WRprops,{}>{
    inputValue:string;
    constructor(props:any){
        super(props);
        this.inputValue="";
        this.state={subscribed:false};
    }

    public onClick(){
        this.props.onClick(this.props.id);
    }

    public render(){
        if(this.props.type===typeWidget.BUTTON_READ){
            return(<button onClick={()=>this.onClick()}> Read </button>);
        }

        else{
                return(<div>-</div>);
            }
        }
}

type WSprops={
    type:typeWidget,
    id:string,
    subscribed:boolean,
    onSubscribeTask:(id:string, subscribing:boolean)=>void
}

class WidgetSubscribe extends React.Component<WSprops,{}>{
    constructor(props:any){
        super(props);
    }

    public onSubscribeTask(){
        let subscribed:boolean = !this.props.subscribed;
        this.props.onSubscribeTask(this.props.id,subscribed);
    }

    public render(){
        if(this.props.type===typeWidget.BUTTON_SUBSCRIBE){
            let label:string= !this.props.subscribed?"Subscribe":"Unsubscribe";
            return(<button onClick={()=>this.onSubscribeTask()}> {label} </button>)
        }

        else{
            return(<div>-</div>);
        }
    }
}


type WWprops={
    type:typeWidget,
    id:string,
    onSubmit:(id:string, value:string)=>void,
}
class WidgetWrite extends React.Component<WWprops, { }>{
    inputValue:string;
    constructor(props:any){
        super(props);
        this.inputValue="";
        this.state={subscribed:false};
    }

    public onSubmit(){
        this.props.onSubmit(this.props.id, this.inputValue);
    }

    public onChange(event:React.ChangeEvent<HTMLInputElement>){
        this.inputValue=event.target.value;
    }

    public render(){
        if(this.props.type===typeWidget.TEXTBOX){
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
    onSubmit:(id:string, value:string)=>void,
    onSubscribeTask:(id:string, subscribing:boolean)=>void
}

export class DeviceRender extends React.Component<DRprops, {}>{
    constructor(props:any) {
        super(props);
    }

    public onClick(id:string){
        this.props.onClick(id);
    }

    public onSubmit(id:string,value:string){
        this.props.onSubmit(id,value);
    }

    public onSubscribeTask(id:string, subscribing:boolean){
        this.props.onSubscribeTask(id,subscribing);
    }

    public renderProperty(property:DeviceProperty, id:string){
        let readButton:typeWidget;
        let writeTextBox:typeWidget;
        let subscribeButton:typeWidget = typeWidget.BUTTON_SUBSCRIBE;
        if(property.readable===true){
            readButton = typeWidget.BUTTON_READ;
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
        let value:string=property.value?""+property.value:"-";
        value += property.unit?" ["+property.unit+"]":"";
        return(
            <tr>
                <td>
                    {property.id}
                </td>
                <td>
                    {property.description}
                </td>
                <td>
                    {value}
                </td>
                <td>
                    <WidgetRead type={readButton} id={this.props.device.id+"."+property.id}
                                onClick={(id)=>this.onClick(id)}/>
                </td>
                <td>
                    <WidgetWrite type={writeTextBox} id={this.props.device.id+"."+property.id}
                                  onSubmit={(id,value) => this.onSubmit(id, value)} />
                </td>
                <td>
                    <WidgetSubscribe type={subscribeButton} id={this.props.device.id+"."+property.id} subscribed={property.subscribed}
                                     onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
                </td>
            </tr>
    );
    }
    public render() {
        return (
            <div>
                <h2 id={this.props.device.model}>
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
                    <th scope="col">
                        Subscribe
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