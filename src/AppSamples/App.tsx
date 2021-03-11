import React from 'react';
import './App.css';
import logo from "./logo-studer.png"

import {
    SIGatewayCallback,
    SIDescriptionFlags,
    SIWriteFlags,
    SIConnectionState,
    SIDeviceMessage,
    SIGatewayClient,
    SIAccessLevel,
    SIStatus,
    SIPropertyReadResult,
    SISubscriptionsResult
} from "../OpenStuder/OpenStuder";

type AppState={
  testAuthorize:string,
  testEnumerate:string,
  testRead:string,
}

class App extends React.Component<{ }, AppState> implements SIGatewayCallback{

    siGatewayClient:SIGatewayClient;

    constructor(props:any) {
        super(props);
        this.state={testAuthorize:"-",testEnumerate:"-",testRead:"-"};
        this.siGatewayClient = new SIGatewayClient();
    }

    public componentDidMount() {
        this.siGatewayClient.setCallback(this);
        //ws://153.109.24.113
        this.siGatewayClient.connect("ws://172.22.22.50",1987, "qsp", "qsp");
    }

    public render() {
    return (
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span></div>
            </h1>
            <p>Protocol version : {this.state.testAuthorize}</p>
            <p>Device count : {this.state.testEnumerate}</p>
            <p>Read value : {this.state.testRead}</p>
          </header>
        </div>
    );
    }

    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void {
        this.siGatewayClient.enumerate();
    }

    onConnectionStateChanged(state: SIConnectionState): void {
        if(state===SIConnectionState.CONNECTED) {
            //this.siGatewayClient.readProperty("xcom.10.3023");
        }
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
            this.setState({testEnumerate:""+ deviceCount});
            this.siGatewayClient.readMessages();
    }

    onError(reason: string): void {
    }

    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void {
        this.siGatewayClient.readProperty('demo.sol.11004');
        this.siGatewayClient.readProperties(['demo.sol.11004','demo.sol.11005']);
    }

    onPropertyRead(status: SIStatus, propertyId: string, value?: string): void {
        this.setState({testRead: ""+value});
    }

    onPropertySubscribed(status: SIStatus, propertyId: string): void {
        this.siGatewayClient.unsubscribeFromProperty('demo.sol.11004');
    }

    onPropertiesSubscribed(statuses: SISubscriptionsResult[]) {
        this.siGatewayClient.unsubscribeFromProperties(['demo.sol.11004'])
    }

    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void {
        this.siGatewayClient.subscribeToProperties(['demo.sol.11004']);
    }

    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]) {
        this.siGatewayClient.writeProperty('demo.inv.1415');
    }

    onPropertyUpdated(propertyId: string, value: any): void {
    }

    onPropertyWritten(status: SIStatus, propertyId: string): void {
        this.setState({testRead:"Property written with status:" + status});
    }

    onPropertiesRead(results: SIPropertyReadResult[]) {
        this.siGatewayClient.subscribeToProperty('demo.sol.11004');
    }

}

export default App;