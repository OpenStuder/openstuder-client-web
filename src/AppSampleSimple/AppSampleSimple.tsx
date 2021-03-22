import React from 'react';
import './AppSampleSimple.css';
import logo from "../OpenStuder.svg";

import {
    SIAccessLevel,
    SIConnectionState,
    SIDeviceMessage,
    SIGatewayCallback,
    SIGatewayClient,
    SIPropertyReadResult,
    SIStatus,
    SISubscriptionsResult
} from "../OpenStuder/OpenStuder";

type Device={
    powerId:string,
    value:string|undefined,
}

type AppState={
    connectionState:SIConnectionState;
    xTenderXTS:Device;
    bsp:Device;
    varioTrackVT65:Device;
}

class AppSampleSimple extends React.Component<{ }, AppState> implements SIGatewayCallback{

    siGatewayClient:SIGatewayClient;

    constructor(props:any) {
        super(props);
        this.state={
            connectionState:SIConnectionState.DISCONNECTED,
            xTenderXTS:{powerId:"xcom.11.3023",value:undefined},
            varioTrackVT65:{powerId:"xcom.21.11004",value:undefined},
            bsp:{powerId:"xcom.61.7003",value:undefined},
        };
        this.siGatewayClient = new SIGatewayClient();
    }

    public componentDidMount() {
        //Set the callback that the SIGatewayClient will call
        this.siGatewayClient.setCallback(this);
        //Try to connect with the server
        this.siGatewayClient.connect("ws://153.109.24.113",1987, "basic", "basic");
    }

    public onClick() {
        //When button is pressed : read all wanted properties
        let propertyIds:string[] = [this.state.xTenderXTS.powerId, this.state.bsp.powerId, this.state.varioTrackVT65.powerId];
        this.siGatewayClient.readProperties(propertyIds);
    }

    public render() {
        //Display the values and the read button when we are connected
        if(this.state.connectionState===SIConnectionState.CONNECTED) {
            return (
                <div className="App">
                    <header className="App-header">
                        <h1 className="Title">
                            <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
                            </div>
                        </h1>
                        <button onClick={()=> this.onClick()}>Read Property</button>
                        <p>XTender power : {this.state.xTenderXTS.value}</p>
                        <p>BSP power : {this.state.bsp.value}</p>
                        <p>VarioTrack power : {this.state.varioTrackVT65.value}</p>
                    </header>
                </div>
            );
        }
        //Display that the client tries to connect
        else{
            return(
                <div className="App">
                    <header className="App-header">
                        <h1 className="Title">
                            <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
                            </div>
                        </h1>
                        <p>
                            Connecting...
                        </p>
                    </header>
                </div>
            );
        }
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {

    }

    onConnectionStateChanged(state: SIConnectionState): void {
        this.setState({connectionState:state});
    }


    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        this.siGatewayClient.readDatalog("xcom.11.3023",undefined,undefined,10);
    }

    onDatalogPropertiesRead(status: SIStatus, properties: string[]):void {
    }

    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void {
    }

    onDescription(status: SIStatus, description: string, id?: string): void {
    }

    onDeviceMessage(message: SIDeviceMessage): void {
    }

    onDisconnected(): void {
    }

    onEnumerated(status: SIStatus, deviceCount: number): void {
    }

    onError(reason: string): void {
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {

    }

    onPropertySubscribed(status: SIStatus, propertyId: string): void {
    }

    onPropertiesSubscribed(statuses: SISubscriptionsResult[]) {
    }

    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {
    }

    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]) {
    }

    onPropertyUpdated(propertyId: string, value: any): void {
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        results.map(property =>{
            if(property.status===SIStatus.SUCCESS){
                //Construct Device with the new value
                let temp: Device = {powerId: property.id, value: property.value};
                //Select the good Device to change
                switch (property.id){
                    case this.state.xTenderXTS.powerId:
                        this.setState({xTenderXTS:temp});
                        break;
                    case this.state.bsp.powerId :
                        this.setState({bsp:temp});
                        break;
                    case this.state.varioTrackVT65.powerId :
                        this.setState({varioTrackVT65:temp});
                        break;
                }
            }
        });
    }
}

export default AppSampleSimple;