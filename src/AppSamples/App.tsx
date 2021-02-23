import React from 'react';
import './App.css';

import logo from "./logo-studer.png"

import {OpenStuderInterface, SIConnectionState, SIDeviceMessage, SIGatewayClient} from "../OpenStuder/OpenStuder";

let oui;

type AppState={
  testAuthorize:string,
  testEnumerate:string,
  testRead:string,
}

class App extends React.Component<{ }, AppState> implements OpenStuderInterface{

    sigc:SIGatewayClient;
    constructor(props:any) {
    super(props);
    this.state={testAuthorize:"-",testEnumerate:"-",testRead:"-"};
    this.sigc = new SIGatewayClient(this);
    }

    public componentDidMount() {
        this.sigc.connect("ws://153.109.24.113",1987, "installer", "installer");
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

    onDatalogReadCallback(deviceMessage: SIDeviceMessage): void {
    }

    onDescriptionCallback(deviceMessage: SIDeviceMessage): void {
    }

    onDeviceMessageCallback(deviceMessage: SIDeviceMessage): void {
    }

    onEnumerateCallback(deviceMessage: SIDeviceMessage): void {
        if(deviceMessage.deviceCount) {
            this.setState({testEnumerate: deviceMessage.deviceCount});
        }
    }

    onErrorCallback(deviceMessage: SIDeviceMessage): void {
    }

    onMessageReadCallback(devicesMessage: SIDeviceMessage[]): void {
    }

    onPropertyReadCallback(deviceMessage: SIDeviceMessage): void {
        if(deviceMessage.value) {
            this.setState({testRead: deviceMessage.value});
        }
    }

    onPropertySubscribeCallback(deviceMessage: SIDeviceMessage): void {
    }

    onPropertyUnsubscribeCallback(deviceMessage: SIDeviceMessage): void {
    }

    onPropertyUpdateCallback(deviceMessage: SIDeviceMessage): void {
    }

    onPropertyWrittenCallback(deviceMessage: SIDeviceMessage): void {
    }
}

export default App;