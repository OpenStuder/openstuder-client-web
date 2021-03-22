import React from 'react';
import './AppSampleMedium.css';
import logo from "../OpenStuder.svg";

import HighchartsTimeSeries from "./HighchartsTimeSeries";

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

type Data = {
    readonly timestamp: number,
    readonly value: number,
}

type AppState={
    connectionState:SIConnectionState;
    xTenderMC:Device;
    bsp:Device;
    varioTrackMC:Device;
}

class AppSampleMedium extends React.Component<{ }, AppState> implements SIGatewayCallback{

    siGatewayClient:SIGatewayClient;

    constructor(props:any) {
        super(props);
        this.state={
            connectionState:SIConnectionState.DISCONNECTED,
            xTenderMC:{powerId:"xcom.10.3023",value:undefined},
            varioTrackMC:{powerId:"xcom.20.11004",value:undefined},
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

    public render() {
        //Display the values and the read button when we are connected
        let totalPower:number=0;
        if(this.state.xTenderMC.value){
            totalPower +=+ this.state.xTenderMC.value;
        }
        if(this.state.varioTrackMC.value){
            totalPower +=+ this.state.varioTrackMC.value;
        }
        if(this.state.bsp.value){
            totalPower +=+ this.state.bsp.value;
        }
        let dataPoint:Data = {timestamp:Date.now(), value:totalPower};
        if(this.state.connectionState===SIConnectionState.CONNECTED) {
            return (
                <div className="App">
                    <header className="App-header">
                        <h1 className="Title">
                            <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span>
                            </div>
                        </h1>
                        <p>XTender power : {this.state.xTenderMC.value}</p>
                        <p>BSP power : {this.state.bsp.value}</p>
                        <p>VarioTrack power : {this.state.varioTrackMC.value}</p>
                        <p>Total power : {totalPower}</p>
                        <HighchartsTimeSeries dataPoint={dataPoint}/>
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
        let propertyIds:string[] = [this.state.xTenderMC.powerId, this.state.bsp.powerId, this.state.varioTrackMC.powerId];
        this.siGatewayClient.subscribeToProperties(propertyIds);
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
        //Construct Device with the new value
        let temp: Device = {powerId: propertyId, value: value};
        //Select the good Device to change
        switch (propertyId) {
            case this.state.xTenderMC.powerId:
                this.setState({xTenderMC: temp});
                break;
            case this.state.bsp.powerId :
                this.setState({bsp: temp});
                break;
            case this.state.varioTrackMC.powerId :
                this.setState({varioTrackMC: temp});
                break;
        }
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {

    }
}

export default AppSampleMedium;