declare namespace OpenStuder {

    enum SIStatus {
        SUCCESS = 0, IN_PROGRESS = 1, ERROR = -1, NO_PROPERTY = -2, NO_DEVICE = -3, NO_DEVICE_ACCESS = -4,
        TIMEOUT = -5, INVALID_VALUE = -6
    }

    enum SIConnectionState {DISCONNECTED, CONNECTING, AUTHORIZING, CONNECTED}

    enum SIAccessLevel {NONE, BASIC, INSTALLER, EXPERT, QUALIFIED_SERVICE_PERSONNEL}

    enum SIDescriptionFlags {
        INCLUDE_ACCESS_INFORMATION, INCLUDE_PROPERTY_INFORMATION
        , INCLUDE_DEVICE_INFORMATION, INCLUDE_DRIVER_INFORMATION
    }

    enum SIWriteFlags {NONE, PERMANENT}

    type SIDeviceMessage = {
        timestamp: Date,
        accessId: string,
        deviceId: string,
        messageId: string,
        message: string
    };

    type SIPropertyReadResult = {
        status: SIStatus,
        id: string,
        value?: any,
    };

    type SISubscriptionsResult = {
        status: SIStatus,
        id: string,
    };

    class SIProtocolError {
        public constructor(message: string);

        static raise(message: string):void;
    }

    interface SIGatewayClientCallbacks {
        onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void;

        onDisconnected(): void;

        onEnumerated(status: SIStatus, deviceCount: number): void;

        onError(reason: string): void;

        onDescription(status: SIStatus, description: string, id?: string): void;

        onPropertiesFound(status:SIStatus, id:string, count:number, properties:string[]): void;

        onPropertyRead(status: SIStatus, propertyId: string, value?: string): void;

        onPropertiesRead(results: SIPropertyReadResult[]): void;

        onPropertyWritten(status: SIStatus, propertyId: string): void;

        onPropertySubscribed(status: SIStatus, propertyId: string): void;

        onPropertiesSubscribed(statuses: SISubscriptionsResult[]): void;

        onPropertyUnsubscribed(status: SIStatus, propertyId: string): void;

        onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]): void;

        onPropertyUpdated(propertyId: string, value: any): void;

        onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void;

        onDatalogPropertiesRead(status:SIStatus,properties:string[]):void;

        onDeviceMessage(message: SIDeviceMessage): void;

        onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void;

    }

    class SIGatewayClient {
        private state: SIConnectionState;
        private accessLevel: SIAccessLevel;
        private gatewayVersion: string;
        private ws: WebSocket | null;

        private user?: string;
        private password?: string;

        private siGatewayCallback: SIGatewayClientCallbacks | undefined;

        constructor();

        public connect(host: string, port?: number, user?: string, password?: string);

        public setCallback(siGatewayCallback: SIGatewayClientCallbacks);

        public getState(): SIConnectionState;

        public getAccessLevel(): SIAccessLevel;

        public getGatewayVersion(): string;

        public enumerate();

        public describe(deviceAccessId?: string, deviceId?: string, propertyId?: number, flags?: SIDescriptionFlags[]);

        public findProperties(propertyId:string);

        public readProperty(propertyId: string);

        public readProperties(propertyIds: string[]);

        public writeProperty(propertyId: string, value?: any, flags?: SIWriteFlags);

        public subscribeToProperty(propertyId: string);

        public subscribeToProperties(propertyIds: string[]);

        public unsubscribeFromProperty(propertyId: string);

        public unsubscribeFromProperties(propertyId: string[]);

        public readDatalogProperties(dateFrom?: Date, dateTo?: Date);

        public readDatalog(propertyId: string, dateFrom?: Date, dateTo?: Date, limit?: number);

        public readMessages(dateFrom?: Date, dateTo?: Date, limit?: number);

        public disconnect();
    }

}

export = OpenStuder