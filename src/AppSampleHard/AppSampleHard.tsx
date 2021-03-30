import React from 'react';
import './AppSampleHard.css';
import logo from "../OpenStuder.svg";

import {
    SIAccessLevel,
    SIConnectionState,
    SIDescriptionFlags,
    SIDeviceMessage,
    SIGatewayCallback,
    SIGatewayClient,
    SIPropertyReadResult,
    SIStatus,
    SISubscriptionsResult
} from "../OpenStuder/OpenStuder";

import Devices, {Device, DeviceRender} from "./Devices";
import DeviceMessagesRender from "./DeviceMessageRender";
import SystemInfo from "./SystemInfo";

const host:string="ws://153.109.24.113";
const port:number=1987;
const user:string="basic";
const password:string="basic";

enum VIEW{
    SystemInfo,
    EventsRecord,
    Battery,
    VarioTrack,
    XTender
}

type AppState={
    devices:Devices,
    currentView:VIEW,
    messages:SIDeviceMessage[]
}

class AppSampleHard extends React.Component<{ }, AppState> implements SIGatewayCallback{

    siGatewayClient:SIGatewayClient;
    driverId:string;

    constructor(props:any) {
        super(props);
        this.siGatewayClient = new SIGatewayClient();
        this.driverId="";
        this.state={
            currentView:VIEW.SystemInfo,
            devices: new Devices(),
            messages:[]
        };
    }

    public componentDidMount() {
        //Set the callback that the SIGatewayClient will call
        this.siGatewayClient.setCallback(this);
        //Try to connect with the server
        this.siGatewayClient.connect(host,port, user, password);
    }

    public onClick(id:string){
        this.siGatewayClient.readProperty(this.driverId+"."+id);
    }

    public onSubmit(id:string, value:string){
        this.siGatewayClient.writeProperty(this.driverId+"."+id);
    }

    public onSubscribeTask(id:string, subscribing:boolean){
        if(subscribing){
            this.siGatewayClient.subscribeToProperty(this.driverId+"."+id);
        }
        else{
            this.siGatewayClient.unsubscribeFromProperty(this.driverId+"."+id);
        }
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {
        let newDevices=this.state.devices;
        let newProperty = newDevices.findPropertyFromString(propertyId);
        if(newDevices.hasPropertyFromString(propertyId) && status===SIStatus.SUCCESS) {
            // @ts-ignore function hasProperty has value true
            newDevices.findPropertyFromString(propertyId).value=value;
            this.setState({devices:newDevices});
        }
    }

    onConnectionStateChanged(state: SIConnectionState): void {
        if(state===SIConnectionState.DISCONNECTED){
            this.siGatewayClient.connect(host,port, user, password);
        }
    }


    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        let flags:SIDescriptionFlags[]=[SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION,
            SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION,
            SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION,SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION]
        this.siGatewayClient.describe(undefined,undefined,undefined,flags);
    }

    onDatalogPropertiesRead(status: SIStatus, properties: string[]):void {
    }

    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {
    }

    onDescription(status: SIStatus, description: string, id?: string): void {
        let newDevices:Devices=new Devices(Devices.jsonToDevices(description));
        this.setState({devices:newDevices});
        let pJSON = JSON.parse(description);
        this.driverId = pJSON.instances[0].id;
    }

    onDeviceMessage(message: SIDeviceMessage): void {
        let messages = this.state.messages;
        messages.push(message);
        this.setState({messages:messages});
    }

    onDisconnected(): void {
    }

    onEnumerated(status: SIStatus, deviceCount: number): void {
    }

    onError(reason: string): void {
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {

    }

    public changeView(newView:VIEW){
        this.setState({currentView:newView});
    }

    onPropertySubscribed(status: SIStatus, propertyId: string): void {
        let newDevices=this.state.devices;
        let newProperty = newDevices.findPropertyFromString(propertyId);
        if(newDevices.hasPropertyFromString(propertyId) && status===SIStatus.SUCCESS) {
            // @ts-ignore function hasProperty has value true
            newDevices.findPropertyFromString(propertyId).subscribed=true;
            this.setState({devices:newDevices});
        }
    }

    onPropertiesSubscribed(statuses: SISubscriptionsResult[]) {
        let newDevices=this.state.devices;
        statuses.map(status =>{
            if(status.status===SIStatus.SUCCESS && newDevices.hasPropertyFromString(status.id)){
                // @ts-ignore function hasProperty has value true
                newDevices.findPropertyFromString(status.id).subscribed=true;
            }
        });
        this.setState({devices:newDevices});
    }

    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {
        let newDevices=this.state.devices;
        let newProperty = newDevices.findPropertyFromString(propertyId);
        if(newDevices.hasPropertyFromString(propertyId) && status===SIStatus.SUCCESS) {
            // @ts-ignore function hasProperty has value true
            newDevices.findPropertyFromString(propertyId).subscribed=false;
            this.setState({devices:newDevices});
        }
    }

    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]) {
        let newDevices=this.state.devices;
        statuses.map(status =>{
            if(status.status===SIStatus.SUCCESS && newDevices.hasPropertyFromString(status.id)){
                // @ts-ignore function hasProperty has value true
                newDevices.findPropertyFromString(status.id).subscribed=false;
            }
        });
        this.setState({devices:newDevices});
    }

    onPropertyUpdated(propertyId: string, value: any): void {
        let newDevices=this.state.devices;
        let newProperty = newDevices.findPropertyFromString(propertyId);
        if(newDevices.hasPropertyFromString(propertyId)) {
            // @ts-ignore function hasProperty has value true
            newDevices.findPropertyFromString(propertyId).value=value;
            this.setState({devices:newDevices});
        }
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        let newDevices=this.state.devices;
        results.map(result =>{
            if(result.status===SIStatus.SUCCESS && newDevices.hasPropertyFromString(result.id)){
                // @ts-ignore function hasProperty has value true
                newDevices.findPropertyFromString(result.id).value=result.value;
            }
        });
        this.setState({devices:newDevices});
    }

    public render() {
        if(this.state.devices.devices[0]!==undefined){
            return(this.renderConnected());
        }
        else{
            return(this.renderConnecting());
        }
    }

    public renderConnecting(){
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="Title">
                        <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
                        </div>
                    </h1>
                </header>
                <h2>
                    Connecting...
                </h2>
            </div>
        );
    }

    public renderConnected(){
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="Title">
                        <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
                        </div>
                    </h1>
                </header>
                {this.renderSidebar()}
                <div className="content">{this.renderContent()}</div>
            </div>
        );
    }

    public renderSidebar(){
        let varioTrackMCSubLink;
        let varioTrackVT65SubLink;
        let xTenderXTSSubLink;
        let xTenderMCSubLink;
        this.state.devices.devices.map(device=>{
            if(device.model.includes("VarioTrack VT-65")){
                varioTrackVT65SubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(VIEW.VarioTrack)}>-{device.model}</a>
            }
            if(device.model.includes("Xtender XTS")){
                xTenderXTSSubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(VIEW.XTender)}>-{device.model}</a>
            }
            if(device.model.includes("VarioTrack multicast")){
                varioTrackMCSubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(VIEW.VarioTrack)}>-{device.model}</a>
            }
            if(device.model.includes("Xtender multicast")){
                xTenderMCSubLink=<a className="subLink" href={"#"+device.model} onClick={()=>this.changeView(VIEW.XTender)}>-{device.model}</a>
            }
        });
        return(
            <div>
                <div className="sidenav">
                    <a href="#" onClick={()=>this.changeView(VIEW.SystemInfo)}>System info</a>
                    <a href="#" onClick={()=>this.changeView(VIEW.EventsRecord)}>Notification center</a>
                    <a href="#" onClick={()=>this.changeView(VIEW.Battery)}>Battery</a>
                    <a href="#" onClick={()=>this.changeView(VIEW.VarioTrack)}>VarioTrack</a>
                    {varioTrackVT65SubLink}
                    {varioTrackMCSubLink}
                    <a href="#" onClick={()=>this.changeView(VIEW.XTender)}>XTender</a>
                    {xTenderXTSSubLink}
                    {xTenderMCSubLink}
                </div>
            </div>
        );
    }

    public renderContent(){
        switch(this.state.currentView){
            case VIEW.SystemInfo:
                return(
                    <div>{this.renderSystemInfo()}</div>
                    );
            case VIEW.EventsRecord:
                return(
                    <div>{this.renderEventsRecord()}</div>
                );
            case VIEW.Battery:
                return(
                    <div>{this.renderBattery()}</div>
                );
            case VIEW.VarioTrack:
                return(
                    <div>{this.renderVarioTrack()}</div>
                );
            case VIEW.XTender:
                return(
                    <div>{this.renderXTender()}</div>
                );
        }
    }

    public renderSystemInfo(){
        let batteryDevice = this.state.devices.findDevice(61);
        let varioTrackDevice = this.state.devices.findDevice(21);
        let xTenderDevice = this.state.devices.findDevice(11);
        return(
            <SystemInfo  battery={batteryDevice} varioTrack={varioTrackDevice} xTender={xTenderDevice}/>
        );
    }

    public renderEventsRecord(){
        return(
            <div>
                <DeviceMessagesRender messages={this.state.messages}/>
            </div>
        );
    }

    public renderBattery(){
        let batteryDevice:Device|undefined=this.state.devices.findDevice(61);
        if(batteryDevice) {
            return (
                <DeviceRender device={batteryDevice} onClick={(id:string)=>this.onClick(id)} onSubmit={(id,value)=>this.onSubmit(id,value)}
                              onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
            );
        }
        else{
            return(
                <div>No BSP device found</div>
            );
        }
    }

    public renderVarioTrack(){
        return(
            <div>
                {this.state.devices.devices.map(device=>{
                    if(device.model.includes("VarioTrack")){
                        return <DeviceRender device={device} onClick={(id:string)=>this.onClick(id)} onSubmit={()=>this.onSubmit}
                                             onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
                    }
                })}
            </div>
        );
    }

    public renderXTender(){
        return(
            <div>
                {this.state.devices.devices.map(device=>{
                    if(device.model.includes("Xtender")){
                        return <DeviceRender device={device} onClick={(id:string)=>this.onClick(id)} onSubmit={()=>this.onSubmit}
                                             onSubscribeTask={(id,subscribing)=>this.onSubscribeTask(id,subscribing)}/>
                    }
                })}
            </div>
        );
    }
}

export default AppSampleHard;
