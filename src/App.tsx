import React from 'react';
import './App.css';

import logo from "./logo-studer.png"

import SIAbstractGatewayClient, {SIDescriptionFlags} from "./SIAbstractGatewayClient"
import {Response} from "./SIAbstractGatewayClient"

import Devices from "./Devices"
import DeviceRender from "./DeviceRender";

enum SIConnectionState{
  DISCONNECTED,
  CONNECTING,
  AUTHORIZING,
  CONNECTED,
}

type AppProps={

}

type AppState={
  testAuthorize:string,
  testEnumerate:string,
  testRead:string,
  testDescription:string,
  devices:Devices,
  stateSI:SIConnectionState;
}

let ws:WebSocket;

class App extends React.Component<AppProps, AppState> {
  //SINGLETON PATTERN
  private static appInstance:App;
  public static getInstance():App{
    if(!App.appInstance){
      App.appInstance= new App({});
    }
    return App.appInstance;
  }

  constructor(props:any) {
    super(props);
    this.state={testAuthorize:"-",testEnumerate:"-",testRead:"-",testDescription:"-",
      devices:new Devices(),stateSI:SIConnectionState.DISCONNECTED};
  }

  public componentDidMount(){
    ws=new WebSocket('ws://153.109.24.113:1987');
    this.setStateSI(SIConnectionState.CONNECTING);
    let frame:string;
    ws.onmessage = (evt: MessageEvent)=>{
      let command:string = SIAbstractGatewayClient.peek_frame_command(evt.data);
      this.setState({testDescription:evt.data});
      switch(command){
        case "AUTHORIZED":
          this.setStateSI(SIConnectionState.CONNECTED);
          this.setState({testAuthorize:""+SIAbstractGatewayClient.decode_authorized_frame(evt.data)});
          frame = SIAbstractGatewayClient.encode_enumerate_frame();
          ws.send(frame);
        break;
        case "ENUMERATED":
          this.setState({testEnumerate:""+SIAbstractGatewayClient.decode_enumerate_frame(evt.data).device_count});
          let flags:SIDescriptionFlags[]=[SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION,SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION,
          SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION,SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION];
          frame = SIAbstractGatewayClient.encode_describe_frame(undefined,undefined,flags);
          ws.send(frame);
          break;
        case "PROPERTY READ":
          let responseProperty:Response = SIAbstractGatewayClient.decode_property_read_frame(evt.data);
          this.setState({testRead:""+responseProperty.value});
          break;
        case "DESCRIPTION":
          let responseDescription:Response = SIAbstractGatewayClient.decode_description_frame(evt.data);
          let devicesTemp:Devices=new Devices();
          devicesTemp.jsonToDevices(""+responseDescription.description);
          this.setState({testDescription:""+responseDescription.description,devices:devicesTemp});
          frame= SIAbstractGatewayClient.encode_subscribe_property_frame("xcom.11.3000");
          ws.send(frame);
          break;
        case "PROPERTY SUBSCRIBED":
          let responseSubscription:Response = SIAbstractGatewayClient.decode_property_subscribed_frame(evt.data);
          break;
      }
    };
    ws.onopen = function (event) {
      let frame = SIAbstractGatewayClient.encode_authorize_frame("expert","expert");
      App.getInstance().setStateSI(SIConnectionState.AUTHORIZING);
      ws.send(frame);
    };
  }

  public setStateSI(state:SIConnectionState){
    this.setState({stateSI:state});
  }

  public onClick(){
    let frame = SIAbstractGatewayClient.encode_read_property_frame("xcom.10.3023");
    ws.send(frame);
  }

  public onSubscribeClick(){

  }

  public renderConnecting(){
    return(
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span></div>
            </h1>
            <p>Connecting...</p>
          </header>
        </div>
    );
  }

  public renderDisconnected(){
    return(
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span></div>
            </h1>
            <p>Disconnected.</p>
          </header>
        </div>
    );
  }

  public renderAuthorizing(){
    return(
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span></div>
            </h1>
            <p>Authorizing...</p>
          </header>
        </div>
    );
  }

  public renderConnected(){
    const deviceRender = this.state.devices.devices.map(device =>{
      return(
          <DeviceRender device={device} subscribeStatus={false} onClick={this.onSubscribeClick}/>
      );
    });
    return (
        <div className="App">
          <header className="App-header">
            <h1 className="Title">
              <div><img src={logo} alt="" className="App-logo"/><span className="marge">StuderNext</span></div>
            </h1>
            <p>Protocol version : {this.state.testAuthorize}</p>
            <p>Device count : {this.state.testEnumerate}</p>
            <button onClick={()=>this.onClick()}>Read command</button>
            <p>Read value : {this.state.testRead}</p>
            <p>Last message is : {this.state.testDescription}</p>
            <p>{deviceRender}</p>
          </header>
        </div>
    );
  }

  public render() {
    switch (this.state.stateSI){
      case SIConnectionState.DISCONNECTED:
        return(
            <div>
              {this.renderDisconnected()}
            </div>
        );
      case SIConnectionState.CONNECTING:
        return(
            <div>
              {this.renderConnecting()}
            </div>
        );
      case SIConnectionState.AUTHORIZING:
        return(
            <div>
              {this.renderAuthorizing()}
            </div>
        );
      case SIConnectionState.CONNECTED:
        return(
            <div>
              {this.renderConnected()}
            </div>
        );
    }
  }
}

export default App;