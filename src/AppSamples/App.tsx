import React from 'react';
import './App.css';

import logo from "./logo-studer.png"

import {OpenStuderInterface, SIConnectionState, SIMessage, SIGatewayClient} from "../OpenStuder/OpenStuder";

type AppState={
  testAuthorize:string,
  testEnumerate:string,
  testRead:string,
}

let oui;

class App extends React.Component<{ }, AppState> implements OpenStuderInterface{

    sigc:SIGatewayClient;
    constructor(props:any) {
    super(props);
    this.state={testAuthorize:"-",testEnumerate:"-",testRead:"-"};
    this.sigc = new SIGatewayClient(this);
    }

    public componentDidMount() {
        this.sigc.connect("ws://172.22.22.55",1987, "installer", "installer");
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

    onChangeConnectionState(state: SIConnectionState): void {
        if(state===SIConnectionState.CONNECTED){
            this.sigc.enumerate();
             this.sigc.readProperty("xcom.10.3023");
        }
    }

    onDatalogRead(deviceMessage: SIMessage): void {
    }

    onDescription(deviceMessage: SIMessage): void {
    }

    onDeviceMessage(deviceMessage: SIMessage): void {
    }

    onEnumerate(deviceMessage: SIMessage): void {
        if(deviceMessage.deviceCount) {
            this.setState({testEnumerate: deviceMessage.deviceCount});
        }
    }

    onError(reason:string): void {
    }

    onMessageRead(devicesMessage: SIMessage[]): void {
    }

    onPropertyRead(deviceMessage: SIMessage): void {
        if(deviceMessage.value) {
            this.setState({testRead: deviceMessage.value});
        }
    }

    onPropertySubscribed(deviceMessage: SIMessage): void {
    }

    onPropertyUnsubscribed(deviceMessage: SIMessage): void {
    }

    onPropertyUpdate(deviceMessage: SIMessage): void {
    }

    onPropertyWritten(deviceMessage: SIMessage): void {
    }

    onConnect(deviceMessage: SIMessage):void {
    }

    onDisconnected():void {
    }
}

export default App;