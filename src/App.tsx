import React from 'react';
import './App.css';

import logo from "./logo-studer.png"

import {SIConnectionState, SIDeviceMessage} from "./SIGatewayClient"

import Devices from "./Devices"
import DeviceRender from "./DeviceRender";
import OpenStuderInterface from "./OpenStuderInterface";

let oui;

class WebClientEnumerateTest extends OpenStuderInterface{
  callbackProvider:App;
  public constructor(callbackProvider:App, host:string,port:number=1987, user?:string, password?:string) {
      super(host,port,user,password);
      this.callbackProvider=callbackProvider;
  }

  public onEnumerateCallback(deviceMessage: SIDeviceMessage) {
      super.onEnumerateCallback(deviceMessage);
      if(deviceMessage.deviceCount) {
          this.callbackProvider.enumerateCallback(deviceMessage.deviceCount);
      }
  }

  public onChangeConnectionState(state: SIConnectionState) {
      super.onChangeConnectionState(state);
      if(state===SIConnectionState.CONNECTED){
          this.enumerate();
      }
  }
}

class WebClientReadTest extends OpenStuderInterface{
  callbackProvider:App;
  public constructor(callbackProvider:App, host:string,port:number=1987, user?:string, password?:string) {
    super(host,port,user,password);
    this.callbackProvider=callbackProvider;
  }

  public onPropertyReadCallback(deviceMessage: SIDeviceMessage) {
      super.onPropertyReadCallback(deviceMessage);
    if(deviceMessage.value) {
      this.callbackProvider.readPropertyCallback(deviceMessage.value);
    }
  }

  public onChangeConnectionState(state: SIConnectionState) {
    super.onChangeConnectionState(state);
    if(state===SIConnectionState.CONNECTED){
      this.readProperty("xcom.10.3023");
    }
  }
}

type AppState={
  testAuthorize:string,
  testEnumerate:string,
  testRead:string,
}

class App extends React.Component<{ }, AppState> {
  wcet:WebClientEnumerateTest;
  wcrt:WebClientReadTest;
  constructor(props:any) {
    super(props);
    this.state={testAuthorize:"-",testEnumerate:"-",testRead:"-"};
    this.wcet = new WebClientEnumerateTest(this,'ws://153.109.24.113',1987, "installer","installer");
    this.wcrt = new WebClientReadTest(this,'ws://153.109.24.113',1987, "installer","installer");
  }

  public enumerateCallback(deviceCount:string){
    this.setState({testEnumerate:deviceCount});
  }

  public readPropertyCallback(value:string){
      this.setState({testRead:value});
  }

  public componentDidMount() {
    this.wcet.connect();
    this.wcrt.connect();
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
}

export default App;