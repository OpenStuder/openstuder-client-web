export type DeviceProperty = {
    value: string|undefined,
    id: number,
    description: string,
    readable: boolean,
    writeable: boolean,
    type: string,
    unit: string,
}

export type Device = {
    model: string,
    properties: DeviceProperty[],
    id: number,
}

class Devices{
    devices: Device[];
    constructor() {
        this.devices=[];
    }
    public jsonToDevices(json:string){
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
                        unit: elementProperty.unit
                    };
                    tempDevice.properties.push(tempProperty);
                }
                tempDevices.push(tempDevice);
            }
            this.devices=tempDevices;
        }
        else{
            this.devices=[];
        }
    }
}

export default Devices;