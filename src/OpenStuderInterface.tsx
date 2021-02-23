import SIGatewayClient, {SIAccessLevel, SIConnectionState, SIDescriptionFlags, SIDeviceMessage} from "./SIGatewayClient"

import Devices from "./Devices"
import DeviceRender from "./DeviceRender";

class OpenStuderInterface{
    host:string;
    port:number;
    user?:string;
    password?:string;
    sigc:SIGatewayClient;
    public constructor(host:string,port:number=1987, user?:string, password?:string){
        this.host=host;
        this.port=port;
        this.user=user;
        this.password=password;
        this.sigc = new SIGatewayClient(this);
    }
    public connect(){
        this.sigc.connect(this.host,this.port, this.user,this.password);
    }

    public getConnectionState():SIConnectionState{
        return this.sigc.getState();
    }

    public getAccessLevel():SIAccessLevel{
        return this.sigc.getAccessLevel();
    }

    public getGatewayVersion():string{
        return this.sigc.getGatewayVersion();
    }

    public enumerate(){
        this.sigc.enumerate();
    }

    public describe(deviceAccessId:string, deviceId?:string,flags?:SIDescriptionFlags[]){
        this.sigc.describe(deviceAccessId,deviceId,flags);
    }

    public readProperty(propertyId:string){
        this.sigc.readProperty(propertyId);
    }

    public writeProperty(propertyId:string,value?:any){
        this.sigc.writeProperty(propertyId,value);
    }

    public subscribeProperty(propertyId:string){
        this.sigc.subscribeProperty(propertyId);
    }

    public unsubscribeFromProperty(propertyId:string){
        this.sigc.unsubscribeFromProperty(propertyId);
    }

    public readDatalog(propertyId:string,dateFrom?:Date,dateTo?:Date,limit?:number){
        this.sigc.readDatalog(propertyId,dateFrom,dateTo,limit);
    }

    public readMessages(dateFrom?:Date, dateTo?:Date, limit?:number){
        this.sigc.readMessages(dateFrom,dateTo,limit);
    }

    public disconnect(){
        this.sigc.disconnect();
    }

    public onChangeConnectionState(state:SIConnectionState){

    }

    public onEnumerateCallback(deviceMessage:SIDeviceMessage){

    }

    public onErrorCallback(deviceMessage:SIDeviceMessage){

    }
    public onDescriptionCallback(deviceMessage:SIDeviceMessage){

    }

    public onPropertyReadCallback(deviceMessage:SIDeviceMessage){

    }

    public onPropertyWrittenCallback(deviceMessage:SIDeviceMessage){

    }

    public onPropertySubscribeCallback(deviceMessage:SIDeviceMessage){

    }

    public onPropertyUnsubscribeCallback(deviceMessage:SIDeviceMessage){

    }

    public onPropertyUpdateCallback(deviceMessage:SIDeviceMessage){

    }

    public onDatalogReadCallback(deviceMessage:SIDeviceMessage){

    }

    public onDeviceMessageCallback(deviceMessage:SIDeviceMessage){

    }

    public onMessageReadCallback(devicesMessage:SIDeviceMessage[]){

    }
}

export default OpenStuderInterface;