
/**
 * Status of operations on the OpenStuder gateway.
 */
export enum SIStatus {
    /**
     * Operation was successfully completed.
     */
    SUCCESS = 0,

    /**
     * Operation is already in progress or another operation is occupying the resource.
     */
    IN_PROGRESS = 1,

    /**
     * General (unspecified) error.
     */
    ERROR = -1,

    /**
     * The property does not exist or the user's access level does not allow to access the property.
     */
    NO_PROPERTY = -2,

    /**
     * The device does not exist.
     */
    NO_DEVICE = -3,

    /**
     * The device access instance does not exist.
     */
    NO_DEVICE_ACCESS = -4,

    /**
     * A timeout occurred when waiting for the completion of the operation.
     */
    TIMEOUT = -5,

    /**
     * A invalid value was passed.
     */
    INVALID_VALUE = -6
}

function statusFromString(str?: string): SIStatus {
    switch (str) {
        case "Success":
            return SIStatus.SUCCESS;
        case "InProgress":
            return SIStatus.IN_PROGRESS;
        case "Error":
            return SIStatus.ERROR;
        case "NoProperty":
            return SIStatus.NO_PROPERTY;
        case "NoDevice":
            return SIStatus.NO_DEVICE;
        case "NoDeviceAccess":
            return SIStatus.NO_DEVICE_ACCESS;
        case "Timeout":
            return SIStatus.TIMEOUT;
        case "InvalidValue":
            return SIStatus.INVALID_VALUE;
        default:
            return SIStatus.ERROR;
    }
}

/**
 * State of the connection to the OpenStuder gateway.
 */
export enum SIConnectionState {
    /**
     * The client is not connected.
     */
    DISCONNECTED,

    /**
     * The client is establishing the WebSocket connection to the gateway.
     */
    CONNECTING,

    /**
     * The WebSocket connection to the gateway has been established and the client is authorizing.
     */
    AUTHORIZING,

    /**
     * The WebSocket connection is established and the client is authorized, ready to use.
     */
    CONNECTED
}

/**
 * Level of access granted to a client from the OpenStuder gateway.
 */
export enum SIAccessLevel {
    /**
     * No access at all.
     */
    NONE = 0,

    /**
     * Basic access to device information properties (configuration excluded).
     */
    BASIC,

    /**
     * Basic access + additional access to most common configuration properties.
     */
    INSTALLER,

    /**
     * Installer + additional advanced configuration properties.
     */
    EXPERT,

    /**
     * Expert and all configuration and service properties only for qualified service personnel.
     */
    QUALIFIED_SERVICE_PERSONNEL
}

function accessLevelFromString(str: string): SIAccessLevel {
    switch (str) {
        case("None"):
            return SIAccessLevel.NONE;
        case("Basic"):
            return SIAccessLevel.BASIC;
        case("Installer"):
            return SIAccessLevel.INSTALLER;
        case("Expert"):
            return SIAccessLevel.EXPERT;
        case("QSP"):
            return SIAccessLevel.QUALIFIED_SERVICE_PERSONNEL;
        default:
            return SIAccessLevel.NONE;
    }
}

/**
 * Flags to control the format of the "DESCRIBE" functionality.
 */
export enum SIDescriptionFlags {
    /**
     * No description flags.
     */
    NONE = 0,

    /**
     * Includes device access instances information.
     */
    INCLUDE_ACCESS_INFORMATION,

    /**
     * Include device information.
     */
    INCLUDE_PROPERTY_INFORMATION,

    /**
     * Include device property information.
     */
    INCLUDE_DEVICE_INFORMATION,

    /**
     * Include device access driver information.
     */
    INCLUDE_DRIVER_INFORMATION
}

/**
 * Flags to control write property operation.
 */
export enum SIWriteFlags {
    /**
     * No write flags.
     */
    NONE = 0,

    /**
     * Write the change to the persistent storage, eg the change lasts reboots.
     */
    PERMANENT
}

/**
 * Class for reporting all OpenStuder protocol errors.
 */
class SIProtocolError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, SIProtocolError.prototype);
    }

    static raise(message: string) {
        throw new SIProtocolError(message);
    }
}

/**
 * The SIDeviceMessage class represents a message a device connected to the OpenStuder gateway has broadcast.
 */
export type SIDeviceMessage = { // TODO: Create class.
    /**
     * Timestamp when the device message was received by the gateway.
     */
    timestamp: string // TODO: Better type would be Date.

    /**
     * ID of the device access driver that received the message.
     */
    accessId: string,

    /**
     * ID of the device that broadcast the message.
     */
    deviceId: string,

    /**
     * Message ID.
     */
    messageId: string,

    /**
     * String representation of the message.
     */
    message: string
}

/**
 * The SIDPropertyReadResult class represents the status of a property read result.
 */
export type SIPropertyReadResult = {
    /**
     * Status of the property read operation.
     */
    status: SIStatus,

    /**
     * ID of the property read.
     */
    id: string,

    /**
     * Value that was read from the property, optional.
     */
    value?: any
}

/**
 * The SIDSubscriptionsResult class represents the status of a property subscription/unsubscription.
 */
export type SISubscriptionsResult = {
    /**
     * Status of the property subscribe or unsubscribe operation.
     */
    status: SIStatus,

    /**
     * ID of the property.
     */
    id: string
}

type SIFrameContent = {
    accessLevel?: string,
    gatewayVersion?: string,
    status?: SIStatus,
    id?: string,
    value?: string,
    count?: number,

    body?: string,

    properties?: string[]
    messages?: SIDeviceMessage[]
}

type SIDecodedFrame = {
    command: string,
    body: string,
    headers: Map<string, string>
}

class SIAbstractGatewayClient {
    protected static decodeFrame(frame: string): SIDecodedFrame {
        let command = "INVALID";
        let headers = new Map<string, string>();

        const lines = frame.split("\n");
        if (lines.length > 1) {
            command = lines[0];
        } else {
            SIProtocolError.raise("Invalid frame");
        }

        let line = 1;
        while (line < lines.length) {
            const components = lines[line].split(":");
            // General case
            if (components.length === 2) {
                headers.set(components[0], components[1]);
            }
            // If our components has a timestamp, it will have several ':'
            if (components.length > 2) {
                let value = "";
                for (let i = 1; i < components.length; i++) {
                    value += ":" + components[i];
                }
                headers.set(components[0], value);
            }
            line += 1;
            // We don't want to treat the body here, we need to break before
            if (lines[line] === "") {
                line += 1;
                break;
            }
        }
        let body = lines[line];
        line += 1;
        while (line < lines.length) {
            if (lines[line] !== "") {
                body += "\n" + lines[line];
            }
            line++;
        }

        return {body: body, headers: headers, command: command};
    }

    protected static encodeAuthorizeFrame(user?: string, password?: string): string {
        if (user !== "" || password !== "") {
            return "AUTHORIZE\nuser:" + user + "\npassword:" + password + "\nprotocol_version:1\n\n";
        } else {
            return 'AUTHORIZE\nprotocol_version:1\n\n';
        }
    }

    protected static decodeAuthorizedFrame(frame: string): SIFrameContent {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "AUTHORIZED" && decodedFrame.headers.has("access_level") && decodedFrame.headers.has("protocol_version")) {
            if (decodedFrame.headers.get("protocol_version") === "1") {
                return {
                    accessLevel: decodedFrame.headers.get("access_level"),
                    gatewayVersion: decodedFrame.headers.get("gateway_version")
                };
            } else {
                SIProtocolError.raise("protocol version 1 not supported by server");
            }
        } else if (decodedFrame.command === "Error" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during authorization");
        }
        return {}
    }

    protected static encodeEnumerateFrame() {
        return "ENUMERATE\n\n";
    }

    protected static decodeEnumerateFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "ENUMERATED") {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                count: +(decodedFrame.headers.get("device_count") || 0)
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property read");
        }
        return {};
    }

    protected static encodeDescribeFrame(deviceAccessId?: string, deviceId?: string, propertyId?: number, flags?: SIDescriptionFlags[]): string {
        let frame = "DESCRIBE\n";
        if (deviceAccessId) {
            frame += "id:" + deviceAccessId;
            if (deviceId) {
                frame += "." + deviceId;
                if (propertyId) {
                    frame += "." + propertyId;
                }
            }
            frame += "\n";
        }
        if (flags?.length !== 0 && flags !== undefined) {
            frame += "flags:";
            flags.map(flag => {
                if (flag === SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION) {
                    frame += "IncludeAccessInformation,";
                }
                if (flag === SIDescriptionFlags.INCLUDE_PROPERTY_INFORMATION) {
                    frame += "IncludePropertyInformation,";
                }
                if (flag === SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION) {
                    frame += "IncludeDeviceInformation,";
                }
                if (flag === SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION) {
                    frame += "IncludeDriverInformation,";
                }
            });
            //Suppress the last ',' or \n if no flag
            frame = frame.substring(0, frame.length - 1);
            frame += "\n";
        }
        frame += "\n";
        return frame;
    }

    protected static decodeDescriptionFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DESCRIPTION" && decodedFrame.headers.has("status")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                body: status === SIStatus.SUCCESS ? decodedFrame.body : undefined
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during description");
        }
        return {};
    }

    protected static encodeFindPropertiesFrame(propertyId: string) {
        return "FIND PROPERTIES\nid:" + propertyId + "\n\n";
    }

    protected static decodePropertiesFoundFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES FOUND" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id") && decodedFrame.headers.has("count")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                count: +(decodedFrame.headers.get("count") || 0),
                properties: status === SIStatus.SUCCESS ? JSON.parse(decodedFrame.body) : undefined
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during find properties");
        }
        return {};
    }

    protected static encodeReadPropertyFrame(propertyId: string): string {
        return "READ PROPERTY\nid:" + propertyId + "\n\n";
    }

    protected static decodePropertyReadFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                value: status == SIStatus.SUCCESS ? decodedFrame.headers.get("value") : undefined
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property read");
        }
        return {};
    }

    protected static encodeReadPropertiesFrame(propertyIds: string[]): string {
        let frame = "READ PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }

    protected static decodePropertiesReadFrame(frame: string): SIPropertyReadResult[] {
        let results: SIPropertyReadResult[] = [];
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES READ" && decodedFrame.headers.has("status")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            if (status === SIStatus.SUCCESS) {
                const jsonBody = JSON.parse(decodedFrame.body);
                for (let i = 0; i < jsonBody.length; i++) {
                    results.push({
                        status: statusFromString(jsonBody[i].status),
                        id: jsonBody[i].id,
                        value: jsonBody[i].value
                    });
                }
            } else {
                SIProtocolError.raise("error during property read, status=" + decodedFrame.headers.get("status"));
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property read");
        }
        return results;
    }

    protected static encodeWritePropertyFrame(propertyId: string, value?: string, flags?: SIWriteFlags): string {
        let frame = "WRITE PROPERTY\nid:" + propertyId + "\n";
        if (flags) {
            frame += "flags:";
            if (flags === SIWriteFlags.PERMANENT) {
                frame += "Permanent";
            }
            frame += "\n";
        }
        if (value) {
            frame += "value:" + value + "\n"; // TODO: Value should not be string.
        }
        frame += "\n";
        return frame;
    }

    protected static decodePropertyWrittenFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY WRITTEN" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property write");
        }
        return {};
    }

    protected static encodeSubscribePropertyFrame(propertyId: string): string {
        return "SUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }

    protected static decodePropertySubscribedFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY SUBSCRIBED" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return {};
    }

    protected static encodeSubscribePropertiesFrame(propertyIds: string[]): string {
        let frame = "SUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }

    protected static decodePropertiesSubscribedFrame(frame: string): SISubscriptionsResult[] {
        let results: SISubscriptionsResult[] = [];
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES SUBSCRIBED" && decodedFrame.headers.has("status")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            if (status === SIStatus.SUCCESS) {
                const jsonBody = JSON.parse(decodedFrame.body);
                for (let i = 0; i < jsonBody.length; i++) {
                    results.push({
                        status: statusFromString(jsonBody[i].status),
                        id: jsonBody[i].id
                    });
                }
            } else {
                SIProtocolError.raise("error during properties subscribe, status=" + decodedFrame.headers.get("status"));
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        } else {
            SIProtocolError.raise("unknown error during properties subscribe");
        }
        return results;
    }

    protected static encodeUnsubscribePropertyFrame(propertyId: string): string {
        return "UNSUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }

    protected static decodePropertyUnsubscribedFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UNSUBSCRIBED" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property unsubscribe");
        }
        return {};
    }

    protected static encodeUnsubscribePropertiesFrame(propertyIds: string[]): string {
        let frame = "UNSUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }

    protected static decodePropertiesUnsubscribedFrame(frame: string): SISubscriptionsResult[] {
        let result: SISubscriptionsResult[] = [];
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES UNSUBSCRIBED" && decodedFrame.headers.has("status")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            if (status === SIStatus.SUCCESS) {
                const jsonBody = JSON.parse(decodedFrame.body);
                for (let i = 0; i < jsonBody.length; i++) {
                    result.push({
                        status: statusFromString(jsonBody[i].status),
                        id: jsonBody[i].id
                    });
                }
            } else {
                SIProtocolError.raise("error during properties unsubscribe, status=" + decodedFrame.headers.get("status"));
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during properties unsubscribe");
        }
        return result;
    }

    protected static decodePropertyUpdateFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UPDATE" && decodedFrame.headers.has("value") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id"),
                value: decodedFrame.headers.get("value")
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error receiving property update");
        }
        return {};
    }

    protected static encodeReadDatalogFrame(propertyId?: string, dateFrom?: Date, dateTo?: Date, limit?: number) {
        let frame: string = 'READ DATALOG\n';
        if (propertyId) {
            frame += "id:" + propertyId + "\n";
        }
        frame += SIAbstractGatewayClient.getTimestampHeaderIfPresent('from', dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeaderIfPresent('to', dateTo);
        if (limit) {
            frame += 'limit:' + limit + '\n';
        }
        frame += '\n';
        return frame;
    }

    protected static decodeDatalogReadFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DATALOG READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("count")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id"),
                count: +(decodedFrame.headers.get("count") || 0),
                body: decodedFrame.body
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error receiving datalog read");
        }
        return {};
    }

    protected static encodeReadMessagesFrame(dateFrom?: Date, dateTo?: Date, limit?: number) {
        let frame: string = 'READ MESSAGES\n';
        frame += SIAbstractGatewayClient.getTimestampHeaderIfPresent('from', dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeaderIfPresent('to', dateTo);
        if (limit) {
            frame += 'limit:' + limit + '\n';
        }
        frame += '\n';
        return frame;
    }

    protected static decodeMessagesReadFrame(frame: string): SIFrameContent {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "MESSAGES READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("count")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            if (status === SIStatus.SUCCESS) {
                let messages: SIDeviceMessage[] = [];
                const jsonBody = JSON.parse(decodedFrame.body);
                for (let i = 0; i < jsonBody.length; i++) {
                    messages.push({
                        timestamp: jsonBody[i].timestamp,
                        accessId: jsonBody[i].access_id,
                        deviceId: jsonBody[i].device_id,
                        messageId: jsonBody[i].message_id,
                        message: jsonBody[i].message
                    });
                }
                return {
                    status: status,
                    count: +(decodedFrame.headers.get("count") || 0),
                    messages: messages
                };
            } else {
                return {
                    status: status,
                    count: +(decodedFrame.headers.get("count") || 0),
                    messages: []
                };
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error receiving messages");
        }
        return {};
    }

    protected static decodeDeviceMessageFrame(frame: string): SIDeviceMessage {
        const decodedFrame: SIDecodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DEVICE MESSAGE" && decodedFrame.headers.has("access_id") && decodedFrame.headers.has("device_id") &&
            decodedFrame.headers.has("message_id") && decodedFrame.headers.has("message") && decodedFrame.headers.has("timestamp")) {
            return {
                timestamp: decodedFrame.headers.get("timestamp")!,
                accessId: decodedFrame.headers.get("access_id")!,
                deviceId: decodedFrame.headers.get("device_id")!,
                messageId: decodedFrame.headers.get("message_id")!,
                message: decodedFrame.headers.get("message")!
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error receiving device message");
        }
        return {accessId: "", deviceId: "", message: "", messageId: "", timestamp: ""};
    }

    protected static getTimestampHeaderIfPresent(key: string, timestamp?: Date): string {
        if (timestamp) {
            return key + ':' + timestamp.toISOString() + '\n';
        } else {
            return '';
        }
    }

    protected static peekFrameCommand(frame: string): string {
        return (frame.split("\n"))[0];
    }
}

/**
 * @interface SIGatewayClientCallbacks
 * Base Interface containing all callback methods that can be called by the SIGatewayClient.
 * You can implement this class to your application.
 */
export interface SIGatewayClientCallbacks {

    /**
     * This method is called once the connection to the gateway could be established and
     * the user has been successfully authorized.
     * @param accessLevel Access level that was granted to the user during authorization.
     * @param gatewayVersion Version of the OpenStuder software running on the gateway.
     */
    onConnected(accessLevel:SIAccessLevel, gatewayVersion:string):void;

    /**
     * Called when the connection to the OpenStuder gateway has
     * been gracefully closed by either side or the connection was lost by any other reason.
     */
    onDisconnected():void;

    /**
     * Called when the state of the connection changed
     * @param state new state of the connection
     */
    onConnectionStateChanged(state:SIConnectionState):void;

    /**
     * Called when the enumeration operation started using enumerate() has completed on the gateway.
     * @param status Operation status.
     * @param deviceCount Number of devices present
     */
    onEnumerated(status:SIStatus, deviceCount:number):void;

    /**
     * Called on severe errors.
     * @param reason Exception that caused the erroneous behavior
     */
    onError(reason:string):void;

    /**
     * Called when the gateway returned the description requested using the describe() method.
     * @param status Status of the operation.
     * @param description Description object.
     * @param id Subject's ID.
     */
    onDescription(status:SIStatus, description:string, id?:string):void;

    /**
     * Called when the gateway returned the list of found properties requested using the findProperties() method.
     * @param status Status of the find operation.
     * @param id The searched ID (including wildcard character).
     * @param count The number of properties found.
     * @param properties List of the property IDs
     */
    onPropertiesFound(status:SIStatus, id:string, count:number, properties:string[]): void;

    /**
     * Called when the property read operation started using read_property() has completed on the gateway.
     * @param status Status of the read operation.
     * @param propertyId ID of the property read.
     * @param value The value read.
     */
    onPropertyRead(status:SIStatus, propertyId:string, value?:string):void;

    /**
     * Called when the multiple properties read operation started using readProperties() has completed on the gateway.
     * @param results List of all results of the operation.
     */
    onPropertiesRead(results:SIPropertyReadResult[]):void;

    /**
     * Called when the property write operation started using write_property() has completed on the gateway.
     * @param status Status of the write operation.
     * @param propertyId ID of the property written.
     */
    onPropertyWritten(status:SIStatus, propertyId:string):void;

    /**
     * Called when the gateway returned the status of the property subscription requested
     * using the property_subscribe() method.
     * @param status The status of the subscription.
     * @param propertyId ID of the property.
     */
    onPropertySubscribed(status:SIStatus, propertyId:string):void;

    /**
     * Called when the gateway returned the status of the properties subscription requested using
     * the subscribeToProperties() method.
     * @param statuses The statuses of the individual subscriptions
     */
    onPropertiesSubscribed(statuses:SISubscriptionsResult[]):void;

    /**
     * Called when the gateway returned the status of the property unsubscription requested
     * using the property_unsubscribe() method.
     * @param status The status of the unsubscription.
     * @param propertyId ID of the property
     */
    onPropertyUnsubscribed(status:SIStatus, propertyId:string):void;

    /**
     * Called when the gateway returned the status of the properties unsubscription requested using
     * the unsubscribeFromProperties() method.
     * @param statuses The statuses of the individual subscriptions
     */
    onPropertiesUnsubscribed(statuses:SISubscriptionsResult[]):void;

    /**
     * This callback is called whenever the gateway send a property update.
     * @param propertyId ID of the updated property.
     * @param value The current value of the property.
     */
    onPropertyUpdated(propertyId:string, value:any):void;

    /**
     * Called when the datalog property list operation started using read_datalog_properties() has completed on the gateway.
     * @param status Status of the operation.
     * @param properties List of the IDs of the properties for whom data is available in the data log.
     */
    onDatalogPropertiesRead(status:SIStatus,properties:string[]):void;

    /**
     * Called when the datalog read operation started using read_datalog() has completed on the gateway.
     * @param status Status of the operation.
     * @param propertyId ID of the property.
     * @param count Number of entries.
     * @param values Properties data in CSV format whereas the first column is the date and time in ISO 8601 extended
     * format and the second column contains the actual values.
     */
    onDatalogRead(status:SIStatus, propertyId:string, count:number, values:string):void;

    /**
     * This callback is called whenever the gateway send a device message indication.
     * @param message The device message received.
     */
    onDeviceMessage(message:SIDeviceMessage):void;

    /**
     * Called when the gateway returned the status of the read messages operation using the read_messages() method.
     * @param status The status of the operation.
     * @param count Number of messages retrieved.
     * @param messages List of retrieved messages.
     */
    onMessageRead(status:SIStatus, count:number, messages:SIDeviceMessage[]):void;
}

/**
 * Complete, asynchronous (non-blocking) OpenStuder gateway client.
 * This client uses an asynchronous model which has the disadvantage to be a bit harder to use than the synchronous
 * version. The advantages are that long operations do not block the main thread as all results are reported
 * using callbacks, device message indications are supported and subscriptions to property changes are possible.
 */
export class SIGatewayClient extends SIAbstractGatewayClient{
    //Attributes
    private state: SIConnectionState;
    private accessLevel: SIAccessLevel;
    private gatewayVersion: string;
    private ws: WebSocket|null;
    private connectionTimeout: number = -1;

    private user?:string;
    private password?:string;

    private siGatewayCallback:SIGatewayClientCallbacks | undefined;

    public constructor(){
        super();
        this.state = SIConnectionState.DISCONNECTED;
        this.gatewayVersion='';
        this.accessLevel=SIAccessLevel.NONE;
        this.ws=null;
    }

    protected ensureInState(state:SIConnectionState){
        if(state!==this.state){
            SIProtocolError.raise("invalid client state");
        }
    }

    protected setStateSI(state:SIConnectionState){
        this.state=state;
        if(this.siGatewayCallback) {
            this.siGatewayCallback.onConnectionStateChanged(this.state);
        }
    }

    public setCallback(siGatewayCallback: SIGatewayClientCallbacks | undefined) {
        this.siGatewayCallback = siGatewayCallback;
    }

    /**
     * Establishes the WebSocket connection to the OpenStuder gateway and executes the user authorization
     * process once the connection has been established in the background. This method returns immediately
     * and does not block the current thread.
     * The status of the connection attempt is reported either by the on_connected() callback on success or
     * the on_error() callback if the connection could not be established or the authorisation for the given
     * user was rejected by the gateway.
     * @param host Hostname or IP address of the OpenStuder gateway to connect to.
     * @param port TCP port used for the connection to the OpenStuder gateway, defaults to 1987
     * @param user Username send to the gateway used for authorization.
     * @param password Password send to the gateway used for authorization.
     * @param connectionTimeout Connection timeout in milliseconds, defaults to 5000 if not provided.
     */
    public connect(host:string,port:number = 1987,user?:string,password?:string, connectionTimeout: number = 5000) {
        this.ensureInState(SIConnectionState.DISCONNECTED);
        this.user=user || "";
        this.password=password || "";
        this.ws = new WebSocket(host + ':' + port);
        this.setStateSI(SIConnectionState.CONNECTING);
        this.connectionTimeout = window.setTimeout(() => {
            if (this.state === SIConnectionState.CONNECTING) {
                this.ws?.close();
                this.siGatewayCallback?.onError("connect timeout");
            }

        }, connectionTimeout);
        this.ws.onopen = (/*event:Event*/)=>{
            clearTimeout(this.connectionTimeout);
            this.setStateSI(SIConnectionState.AUTHORIZING);
            let frame = SIGatewayClient.encodeAuthorizeFrame(this.user, this.password);
            if(this.ws){
                this.ws.send(frame);
            }
        };
        this.ws.onmessage = (event:MessageEvent)=>{
            let command: string = SIGatewayClient.peekFrameCommand(event.data);
            let receivedMessage:SIFrameContent;
            // In AUTHORIZE state, we only handle AUTHORIZED messages
            if(this.state===SIConnectionState.AUTHORIZING){
                if (command === "AUTHORIZED") {
                    this.setStateSI(SIConnectionState.CONNECTED);
                    receivedMessage = SIGatewayClient.decodeAuthorizedFrame(event.data);
                    if (receivedMessage.accessLevel) {
                        this.accessLevel = accessLevelFromString(receivedMessage.accessLevel);
                    }
                    if (receivedMessage.gatewayVersion) {
                        this.gatewayVersion = receivedMessage.gatewayVersion;
                    }
                    if (this.siGatewayCallback && receivedMessage.accessLevel && receivedMessage.gatewayVersion) {
                        this.siGatewayCallback.onConnected(accessLevelFromString(receivedMessage.accessLevel), receivedMessage.gatewayVersion);
                    }
                } else if (command === "ERROR") {
                    if(this.siGatewayCallback) {
                        this.siGatewayCallback.onError("" + SIGatewayClient.decodeFrame(event.data).headers.get("reason"))
                    }
                    this.ws?.close();
                    this.state = SIConnectionState.DISCONNECTED;
                }

            }
            else if(this.state===SIConnectionState.CONNECTED){
                switch (command) {
                    case "ERROR":
                        if(this.siGatewayCallback) {
                            this.siGatewayCallback.onError("" + SIGatewayClient.decodeFrame(event.data).headers.get("reason"))
                        }
                        SIProtocolError.raise(""+SIGatewayClient.decodeFrame(event.data).headers.get("reason"));
                        break;
                    case "ENUMERATED":
                        receivedMessage = SIGatewayClient.decodeEnumerateFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.count !== undefined) {
                            this.siGatewayCallback.onEnumerated(receivedMessage.status, receivedMessage.count);
                        }
                        break;

                    case "DESCRIPTION":
                        receivedMessage = SIGatewayClient.decodeDescriptionFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.body !== undefined ) {
                            this.siGatewayCallback.onDescription(receivedMessage.status,receivedMessage.body,receivedMessage.id);
                        }
                        break;

                    case "PROPERTIES FOUND":
                        receivedMessage = SIGatewayClient.decodePropertiesFoundFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined  && receivedMessage.count !== undefined &&
                            receivedMessage.properties !== undefined ){
                            this.siGatewayCallback.onPropertiesFound(receivedMessage.status, receivedMessage.id, receivedMessage.count, receivedMessage.properties);
                        }
                        break;

                    case "PROPERTY READ":
                        receivedMessage = SIGatewayClient.decodePropertyReadFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined ) {
                            this.siGatewayCallback.onPropertyRead(receivedMessage.status,receivedMessage.id,receivedMessage.value);
                        }
                        break;

                    case "PROPERTIES READ":
                        let receivedPropertyResult = SIGatewayClient.decodePropertiesReadFrame(event.data);
                        if(this.siGatewayCallback){
                            this.siGatewayCallback.onPropertiesRead(receivedPropertyResult);
                        }
                        break;

                    case "PROPERTY WRITTEN":
                        receivedMessage = SIGatewayClient.decodePropertyWrittenFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined ) {
                            //status:SIStatus, propertyId:string
                            this.siGatewayCallback.onPropertyWritten(receivedMessage.status,receivedMessage.id);
                        }
                        break;

                    case "PROPERTY SUBSCRIBED":
                        receivedMessage = SIGatewayClient.decodePropertySubscribedFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined ) {
                            this.siGatewayCallback.onPropertySubscribed(receivedMessage.status,receivedMessage.id);
                        }
                        break;

                    case "PROPERTIES SUBSCRIBED":
                        let receivedSubscriptionResult:SISubscriptionsResult[]=SIGatewayClient.decodePropertiesSubscribedFrame(event.data);
                        if(this.siGatewayCallback){
                            this.siGatewayCallback.onPropertiesSubscribed(receivedSubscriptionResult);
                        }
                        break;

                    case "PROPERTY UNSUBSCRIBED":
                        receivedMessage = SIGatewayClient.decodePropertyUnsubscribedFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined ) {
                            this.siGatewayCallback.onPropertyUnsubscribed(receivedMessage.status,receivedMessage.id);
                        }
                        break;

                    case "PROPERTIES UNSUBSCRIBED":
                        let receivedUnsubscriptionResult:SISubscriptionsResult[]=SIGatewayClient.decodePropertiesUnsubscribedFrame(event.data);
                        if(this.siGatewayCallback){
                            this.siGatewayCallback.onPropertiesUnsubscribed(receivedUnsubscriptionResult);
                        }
                        break;

                    case "PROPERTY UPDATE":
                        receivedMessage = SIGatewayClient.decodePropertyUpdateFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.id !== undefined ) {
                            this.siGatewayCallback.onPropertyUpdated(receivedMessage.id, receivedMessage.value);
                        }
                        break;

                    case "DATALOG READ":
                        receivedMessage = SIGatewayClient.decodeDatalogReadFrame(event.data);
                        if(this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.body !== undefined  && receivedMessage.count !== undefined) {
                            if(receivedMessage.id){
                                this.siGatewayCallback.onDatalogRead(receivedMessage.status,receivedMessage.id, receivedMessage.count, receivedMessage.body);
                            }
                            else {
                                let properties = receivedMessage.body.split("\n");
                                this.siGatewayCallback.onDatalogPropertiesRead(receivedMessage.status, properties);
                            }
                        }
                        break;

                    case "DEVICE MESSAGE":
                        const message = SIGatewayClient.decodeDeviceMessageFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onDeviceMessage(message);
                        }
                        break;

                    case "MESSAGES READ":
                        const content = SIGatewayClient.decodeMessagesReadFrame(event.data);
                        if (this.siGatewayCallback && content.status !== undefined && content.count !== undefined && content.messages !== undefined) {
                            this.siGatewayCallback.onMessageRead(content.status, content.count, content.messages);
                        }
                        break;

                    default:
                        SIProtocolError.raise("unsupported frame command :"+command);
                }
            }
        };
        this.ws.onclose = (/*event:Event*/)=>{
            this.setStateSI(SIConnectionState.DISCONNECTED);
            this.accessLevel = SIAccessLevel.NONE;
            this.siGatewayCallback?.onDisconnected();
        };
        this.ws.onerror = (/*event:Event*/)=>{
            this.siGatewayCallback?.onError("Error occurs on the websocket");
        }
    }

    /**
     * Returns the current state of the client. See "SIConnectionState" for details.
     * @return Current state of the client
     */
    public getState():SIConnectionState{
        return this.state;
    }

    /**
     * Return the access level the client has gained on the gateway connected. See "SIAccessLevel" for details.
     * @return Access level granted to client
     */
    public getAccessLevel():SIAccessLevel{
        return this.accessLevel;
    }

    /**
     * Returns the version of the OpenStuder gateway software running on the host the client is connected to.
     * @return Version of the gateway software
     */
    public getGatewayVersion():string{
        return this.gatewayVersion;
    }

    /**
     * Instructs the gateway to scan every configured and functional device access driver for new devices and remove
     * devices that do not respond anymore.
     * The status of the operation and the number of devices present are reported using the on_enumerated() callback.
     */
    public enumerate(){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeEnumerateFrame());
        }
    }

    /**
     * This method can be used to retrieve information about the available devices and their properties from the
     * connected gateway. Using the optional device_access_id, device_id and property_id parameters, the method can
     * either request information about the whole topology, a particular device access instance, a device or a property.
     * The flags control the level of detail in the gateway's response.
     * The description is reported using the on_description() callback.
     * @param deviceAccessId: Device access ID for which the description should be retrieved.
     * @param deviceId Device ID for which the description should be retrieved. Note that
     * device_access_id must be present too.
     * @param propertyId Property ID for which the description should be retrieved. Note that device_access_id and
     * device_id must be present too.
     * @param flags Flags to control level of detail of the response.
     */
    public describe(deviceAccessId?:string, deviceId?:string, propertyId?:number, flags?:SIDescriptionFlags[]){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeDescribeFrame(deviceAccessId,deviceId,propertyId, flags));
        }
    }
    /**
     * This method is used to retrieve a list of existing properties that match the given property ID in the form
     *"<device access ID>.<device ID>.<property ID>". The wildcard character "*" is supported for <device access ID> and
     * <device ID> fields.
     * For example "*.inv.3136" represents all properties with ID 3136 on the device with ID "inv" connected through any
     * device access, "demo.*.3136" represents all properties with ID 3136 on any device that disposes that property
     * connected through the device access "demo" and finally "*.*.3136" represents all properties with ID 3136 on any
     * device that disposes that property connected through any device access.
     * @param propertyId: The search wildcard ID.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public findProperties(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws){
            this.ws.send(SIGatewayClient.encodeFindPropertiesFrame(propertyId));
        }
    }

    /**
     * This method is used to retrieve the actual value of a given property from the connected gateway.
     * The property is identified by the property_id parameter.
     * The status of the read operation and the actual value of the property are reported using
     * the on_property_read() callback.
     * @param propertyId The ID of the property to read in the form '{device access ID}.{device ID}.{property ID}'.
     */
    public readProperty(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeReadPropertyFrame(propertyId));
        }
    }

    /**
     * This method is used to retrieve the actual value of multiple property at the same time from the connected
     * gateway. The properties are identified by the property_ids parameter.
     * The status of the multiple read operations and the actual value of the property are reported using the
     * onPropertiesRead() callback.
     * @param propertyIds The IDs of the properties to read in the form '{device access ID}.{device ID}.{property ID}'.
     */
    public readProperties(propertyIds:string[]){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws){
            this.ws.send(SIGatewayClient.encodeReadPropertiesFrame(propertyIds));
        }
    }

    /**
     * The write_property method is used to change the actual value of a given property. The property is identified
     * by the property_id parameter and the new value is passed by the optional value parameter.
     * This value parameter is optional as it is possible to write to properties with the data type "Signal" where
     * there is no actual value written, the write operation rather triggers an action on the device.
     * The status of the write operation is reported using the on_property_written() callback.
     * @param propertyId The ID of the property to write in the form '{device access ID}.{<device ID}.{<property ID}'.
     * @param value Optional value to write.
     * @param flags Write flags, See SIWriteFlags for details, if not provided the flags are not send by the client
     * and the gateway uses the default flags
     */
    public writeProperty(propertyId:string,value?:any, flags?:SIWriteFlags){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeWritePropertyFrame(propertyId,value,flags));
        }
    }

    /**
     * This method can be used to subscribe to a property on the connected gateway. The property is identified by
     * the property_id parameter.
     * The status of the subscribe request is reported using the on_property_subscribed() callback.
     * @param propertyId The ID of the property to subscribe to in the form
     * '{device access ID}.{device ID}.{property ID}'.
     */
    public subscribeToProperty(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeSubscribePropertyFrame(propertyId));
        }
    }

    /**
     *This method can be used to subscribe to multiple properties on the connected gateway.
     * The properties are identified by the property_ids parameter. The status of the subscribe request is
     * reported using the on_properties_subscribed() callback
     * @param propertyIds The list of IDs of the properties to subscribe to
     * in the form '{device access ID}.{device ID}.{property ID}'.
     */
    public subscribeToProperties(propertyIds:string[]){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeSubscribePropertiesFrame(propertyIds));
        }
    }

    /**
     * This method can be used to unsubscribe from a property on the connected gateway.
     * The property is identified by the property_id parameter.
     * The status of the unsubscribe request is reported using the on_property_unsubscribed() callback.
     * @param propertyId The ID of the property to unsubscribe from in the form
     * '{device access ID}.{device ID}.{property ID}'.
     */
    public unsubscribeFromProperty(propertyId:string){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeUnsubscribePropertyFrame(propertyId));
        }
    }

    /**
     * This method can be used to unsubscribe from multiple properties on the connected gateway.
     * The properties are identified by the property_ids parameter. The status of the unsubscribe request is reported
     * using the on_properties_unsubscribed() callback.
     * @param propertyId The list of IDs of the properties to unsubscribe from in the form
     * '{device access ID}.{device ID}.{property ID}'.
     */
    public unsubscribeFromProperties(propertyId:string[]){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeUnsubscribePropertiesFrame(propertyId));
        }
    }

    /**
     * This method is used to retrieve all or a subset of logged data of a given property from the gateway.
     * The status of this operation and the respective values are reported using the on_datalog_read_csv() callback.
     * @param propertyId Global ID of the property for which the logged data should be retrieved. It has to be in the
     * form '{device access ID}.{device ID}.{property ID}'.
     * @param dateFrom Optional date and time from which the data has to be retrieved, defaults
     * to the oldest value logged.
     * @param dateTo Optional date and time to which the data has to be retrieved, defaults to the current
     * time on the gateway.
     * @param limit Using this optional parameter you can limit the number of results retrieved in total.
     */
    public readDatalog(propertyId:string,dateFrom?:Date,dateTo?:Date,limit?:number){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeReadDatalogFrame(propertyId,dateFrom, dateTo, limit));
        }
    }

    /**
     * This method is used to retrieve the list of IDs of all properties for whom data is logged on the gateway.
     * If a time window is given using from and to, only data in this time windows is considered.
     * The status of the operation is the list of properties for whom logged data is available are reported
     * using the onDatalogPropertiesRead() callback.
     * @param dateFrom Optional date and time of the start of the time window to be considered.
     * @param dateTo Optional date and time of the end of the time window to be considered.
     */
    public readDatalogProperties(dateFrom?:Date,dateTo?:Date){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws){
            this.ws.send(SIGatewayClient.encodeReadDatalogFrame(undefined,dateFrom,dateTo,undefined))
        }
    }

    /**
     * The read_messages method can be used to retrieve all or a subset of stored messages send by devices
     * on all buses in the past from the gateway.
     * The status of this operation and the retrieved messages are reported using the on_messages_read() callback.
     * @param dateFrom Optional date and time from which the messages have to be retrieved, defaults
     * to the oldest message saved.
     * @param dateTo Optional date and time to which the messages have to be retrieved, defaults
     * to the current time on the gateway.
     * @param limit Using this optional parameter you can limit the number of messages retrieved in total.
     */
    public readMessages(dateFrom?:Date, dateTo?:Date, limit?:number){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.send(SIGatewayClient.encodeReadMessagesFrame(dateFrom, dateTo, limit));
        }
    }

    /**
     * Disconnects the client from the gateway.
     */
    public disconnect(){
        this.ensureInState(SIConnectionState.CONNECTED);
        if(this.ws) {
            this.ws.close();
        }
    }
}

/**
* @deprecated The method should not be used
*/
export type SIGatewayCallback = SIGatewayClientCallbacks;
