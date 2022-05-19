import {encode as CBOR_encode} from "cbor-x/encode";
import {decodeMultiple as CBOR_decodeMultiple} from "cbor-x/decode";


/**************************************************************************************************************************************************************
 * Common section.
 */

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
     * Write the change to the persistent storage, e.g. the change lasts reboots.
     */
    PERMANENT
}

/**
 * Device functions, these can be used to filter results during the find property operation. Note that a device can hold multiple functions.
 */
export enum SIDeviceFunctions {
    /**
     * No function.
     */
    NONE = 0,

    /**
     * Inverter function.
     */
    INVERTER,

    /**
     * Battery charger function.
     */
    CHARGER,

    /**
     * Solar charger function.
     */
    SOLAR,

    /**
     * AC charger function.
     */
    TRANSFER,

    /**
     * Battery monitor function.
     */
    BATTERY,

    /**
     * All functions.
     */
    ALL
}

function deviceFunctionsFromString(str?: string): Set<SIDeviceFunctions> {
    if (str == null) return new Set([SIDeviceFunctions.ALL]);

    let functions = new Set<SIDeviceFunctions>();
    if (str.indexOf('all') >= 0) {
        functions.add(SIDeviceFunctions.ALL);
    } else {
        if (str.indexOf('inverter') >= 0) functions.add(SIDeviceFunctions.INVERTER);
        if (str.indexOf('charger') >= 0) functions.add(SIDeviceFunctions.CHARGER);
        if (str.indexOf('solar') >= 0) functions.add(SIDeviceFunctions.SOLAR);
        if (str.indexOf('transfer') >= 0) functions.add(SIDeviceFunctions.TRANSFER);
        if (str.indexOf('battery') >= 0) functions.add(SIDeviceFunctions.BATTERY);
    }
    return functions;
}

/**
 * Class for reporting all OpenStuder protocol errors.
 */
export class SIProtocolError extends Error {
    public constructor(message: string) {
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
export type SIDeviceMessage = {
    /**
     * Timestamp when the device message was received by the gateway.
     */
    timestamp: Date

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


/**************************************************************************************************************************************************************
 * WebSocket client implementation.
 */

type SIDecodedWebSocketFrame = {
    command: string,
    body: string,
    headers: Map<string, string>
}

type SIAuthorizedWSFrameContent = {
    accessLevel: SIAccessLevel,
    protocolVersion: string,
    gatewayVersion: string
}

type SIEnumeratedWSFrameContent = {
    status: SIStatus,
    deviceCount: number
}

type SIDescribeWSFrameContent = {
    status: SIStatus,
    id: string | undefined,
    description: string | undefined
}

type SIPropertiesFoundWSFrameContent = {
    status: SIStatus,
    id: string | undefined,
    count: number,
    virtual: boolean,
    functions: Set<SIDeviceFunctions>
    properties: Array<string> | undefined
}

type SIPropertyReadWSFrameContent = {
    status: SIStatus,
    id: string,
    value: boolean | number | string | undefined
}

type SIPropertyWrittenWSFrameContent = {
    status: SIStatus,
    id: string
}

type SIPropertySubscribedWSFrameContent = {
    status: SIStatus,
    id: string
}

type SIPropertyUpdateWSFrameContent = {
    id: string,
    value: boolean | number | string | undefined
}

// TODO: remove.
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

class SIAbstractGatewayClient {
    protected static decodeFrame(frame: string): SIDecodedWebSocketFrame {
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
                let value = components[1];
                for (let i = 2; i < components.length; i++) {
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

    protected static decodeAuthorizedFrame(frame: string): SIAuthorizedWSFrameContent {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "AUTHORIZED" && decodedFrame.headers.has("access_level") && decodedFrame.headers.has("protocol_version")) {
            if (decodedFrame.headers.get("protocol_version") === "1") {
                return {
                    accessLevel: accessLevelFromString(decodedFrame.headers.get("access_level")!),
                    protocolVersion: decodedFrame.headers.get("protocol_version")!,
                    gatewayVersion: decodedFrame.headers.get("gateway_version")!
                };
            } else {
                SIProtocolError.raise("protocol version 1 not supported by server");
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during authorization");
        }
        return {accessLevel: SIAccessLevel.NONE, gatewayVersion: "", protocolVersion: ""}
    }

    protected static encodeEnumerateFrame(): string {
        return "ENUMERATE\n\n";
    }

    protected static decodeEnumerateFrame(frame: string): SIEnumeratedWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "ENUMERATED") {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                deviceCount: +(decodedFrame.headers.get("device_count") || 0)
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property read");
        }
        return {deviceCount: 0, status: SIStatus.ERROR};
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
            flags.forEach(flag => {
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

    protected static decodeDescriptionFrame(frame: string): SIDescribeWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DESCRIPTION" && decodedFrame.headers.has("status")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                description: status === SIStatus.SUCCESS ? decodedFrame.body : undefined
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during description");
        }
        return {description: undefined, id: undefined, status: SIStatus.ERROR};
    }

    protected static encodeFindPropertiesFrame(propertyId: string, virtual?: boolean, functionMask?: Array<SIDeviceFunctions>) {
        let frame = "FIND PROPERTIES\nid:" + propertyId + "\n";
        if (virtual !== null && virtual !== undefined) {
            frame += "virtual:" + (virtual ? "true\n" : "false\n");
        }
        if (functionMask !== undefined && functionMask?.length !== 0) {
            frame += "functions:";
            functionMask.forEach(func => {
                if (func === SIDeviceFunctions.INVERTER) frame += "inverter,";
                if (func === SIDeviceFunctions.CHARGER) frame += "charger,";
                if (func === SIDeviceFunctions.SOLAR) frame += "solar,";
                if (func === SIDeviceFunctions.TRANSFER) frame += "transfer,";
                if (func === SIDeviceFunctions.BATTERY) frame += "battery,";
                if (func === SIDeviceFunctions.ALL) frame += "all,";
            });
            frame = frame.substring(0, frame.length - 1);
            frame += "\n";
        }
        frame += "\n";
        return frame;
    }

    protected static decodePropertiesFoundFrame(frame: string): SIPropertiesFoundWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES FOUND" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id") && decodedFrame.headers.has("count")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                count: +(decodedFrame.headers.get("count") || 0),
                virtual: decodedFrame.headers.get('virtual') === 'true',
                functions: deviceFunctionsFromString(decodedFrame.headers.get('functions')),
                properties: status === SIStatus.SUCCESS ? JSON.parse(decodedFrame.body) as Array<string> : undefined
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during find properties");
        }
        return {count: 0, functions: new Set([SIDeviceFunctions.ALL]), id: undefined, properties: undefined, status: SIStatus.ERROR, virtual: false};
    }

    protected static encodeReadPropertyFrame(propertyId: string): string {
        return "READ PROPERTY\nid:" + propertyId + "\n\n";
    }

    protected static decodePropertyReadFrame(frame: string): SIPropertyReadWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id")!,
                value: status === SIStatus.SUCCESS ? decodedFrame.headers.get("value") || '' : undefined
            }
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property read");
        }
        return {id: "", status: SIStatus.ERROR, value: undefined};
    }

    protected static encodeReadPropertiesFrame(propertyIds: string[]): string {
        let frame = "READ PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }

    protected static decodePropertiesReadFrame(frame: string): SIPropertyReadResult[] {
        let results: SIPropertyReadResult[] = [];
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
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

    protected static decodePropertyWrittenFrame(frame: string): SIPropertyWrittenWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY WRITTEN" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")!
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property write");
        }
        return {id: "", status: SIStatus.ERROR};
    }

    protected static encodeSubscribePropertyFrame(propertyId: string): string {
        return "SUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }

    protected static decodePropertySubscribedFrame(frame: string): SIPropertySubscribedWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY SUBSCRIBED" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")!
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return {id: "", status: SIStatus.ERROR};
    }

    protected static encodeSubscribePropertiesFrame(propertyIds: string[]): string {
        let frame = "SUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }

    protected static decodePropertiesSubscribedFrame(frame: string): SISubscriptionsResult[] {
        let results: SISubscriptionsResult[] = [];
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
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
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
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
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
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

    protected static decodePropertyUpdateFrame(frame: string): SIPropertyUpdateWSFrameContent {
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UPDATE" && decodedFrame.headers.has("value") && decodedFrame.headers.has("id")) {
            return {
                id: decodedFrame.headers.get("id")!,
                value: decodedFrame.headers.get("value")
            };
        } else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason")!);
        } else {
            SIProtocolError.raise("unknown error receiving property update");
        }
        return {id: "", value: undefined};
    }

    protected static encodeReadDatalogFrame(propertyId?: string, dateFrom?: Date, dateTo?: Date, limit?: number): string {
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
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
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

    protected static encodeReadMessagesFrame(dateFrom?: Date, dateTo?: Date, limit?: number): string {
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
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "MESSAGES READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("count")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            if (status === SIStatus.SUCCESS) {
                let messages: SIDeviceMessage[] = [];
                const jsonBody = JSON.parse(decodedFrame.body);
                for (let i = 0; i < jsonBody.length; i++) {
                    messages.push({
                        timestamp: new Date(jsonBody[i].timestamp),
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
        const decodedFrame: SIDecodedWebSocketFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DEVICE MESSAGE" && decodedFrame.headers.has("access_id") && decodedFrame.headers.has("device_id") &&
            decodedFrame.headers.has("message_id") && decodedFrame.headers.has("message") && decodedFrame.headers.has("timestamp")) {
            return {
                timestamp: new Date(decodedFrame.headers.get("timestamp")!),
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
        return {accessId: "", deviceId: "", message: "", messageId: "", timestamp: new Date(0)};
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
     * This method is called once the connection to the gateway could be established and the user has been successfully authorized.
     *
     * @param accessLevel Access level that was granted to the user during authorization.
     * @param gatewayVersion Version of the OpenStuder software running on the gateway.
     */
    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void;

    /**
     * Called when the connection to the OpenStuder gateway has been gracefully closed by either side or the connection was lost by any other reason.
     */
    onDisconnected(): void;

    /**
     * Called when the enumeration operation started using enumerate() has completed on the gateway.
     *
     * @param status Operation status.
     * @param deviceCount Number of devices present
     */
    onEnumerated(status: SIStatus, deviceCount: number): void;

    /**
     * Called on severe errors.
     *
     * @param reason Exception that caused the erroneous behavior
     */
    onError(reason: string): void;

    /**
     * Called when the gateway returned the description requested using the method describe().
     *
     * @param status Status of the operation.
     * @param description Description object.
     * @param id Subject's ID.
     */
    onDescription(status: SIStatus, description: string, id?: string): void;

    /**
     * Called when the gateway returned the list of found properties requested using the findProperties() method.
     *
     * @param status Status of the find operation.
     * @param id The searched ID (including wildcard character).
     * @param count The number of properties found.
     * @param virtual True if list contains only virtual devices, false if it contains only real devices.
     * @param functions Function list mask.
     * @param properties List of the property IDs
     */
    onPropertiesFound(status: SIStatus, id: string, count: number, virtual: boolean, functions: Set<SIDeviceFunctions>, properties: string[]): void;

    /**
     * Called when the property read operation started using read_property() has completed on the gateway.
     *
     * @param status Status of the read operation.
     * @param propertyId ID of the property read.
     * @param value The value read.
     */
    onPropertyRead(status: SIStatus, propertyId: string, value?: string | number  | boolean): void;

    /**
     * Called when the multiple properties read operation started using readProperties() has completed on the gateway.
     *
     * @param results List of all results of the operation.
     */
    onPropertiesRead(results: SIPropertyReadResult[]): void;

    /**
     * Called when the property write operation started using write_property() has completed on the gateway.
     *
     * @param status Status of the write operation.
     * @param propertyId ID of the property written.
     */
    onPropertyWritten(status: SIStatus, propertyId: string): void;

    /**
     * Called when the gateway returned the status of the property subscription requested
     * using the property_subscribe() method.
     * @param status The status of the subscription.
     * @param propertyId ID of the property.
     */
    onPropertySubscribed(status: SIStatus, propertyId: string): void;

    /**
     * Called when the gateway returned the status of the properties subscription requested using the subscribeToProperties() method.
     *
     * @param statuses The statuses of the individual subscriptions
     */
    onPropertiesSubscribed(statuses: SISubscriptionsResult[]): void;

    /**
     * Called when the gateway returned the status of the property unsubscription requested
     * using the property_unsubscribe() method.
     * @param status The status of the unsubscription.
     * @param propertyId ID of the property
     */
    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void;

    /**
     * Called when the gateway returned the status of the properties unsubscription requested using the unsubscribeFromProperties() method.
     *
     * @param statuses The statuses of the individual subscriptions
     */
    onPropertiesUnsubscribed(statuses: SISubscriptionsResult[]): void;

    /**
     * This callback is called whenever the gateway send a property update.
     *
     * @param propertyId ID of the updated property.
     * @param value The current value of the property.
     */
    onPropertyUpdated(propertyId: string, value: any): void;

    /**
     * Called when the datalog property list operation started using read_datalog_properties() has completed on the gateway.
     *
     * @param status Status of the operation.
     * @param properties List of the IDs of the properties for whom data is available in the data log.
     */
    onDatalogPropertiesRead(status: SIStatus, properties: string[]): void;

    /**
     * Called when the datalog read operation started using read_datalog() has completed on the gateway.
     *
     * @param status Status of the operation.
     * @param propertyId ID of the property.
     * @param count Number of entries.
     * @param values Properties data in CSV format whereas the first column is the date and time in ISO 8601 extended
     * format and the second column contains the actual values.
     */
    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: string): void;

    /**
     * This callback is called whenever the gateway send a device message indication.
     *
     * @param message The device message received.
     */
    onDeviceMessage(message: SIDeviceMessage): void;

    /**
     * Called when the gateway returned the status of the read messages operation using the read_messages() method.
     *
     * @param status The status of the operation.
     * @param count Number of messages retrieved.
     * @param messages List of retrieved messages.
     */
    onMessageRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void;
}

/**
 * Complete, asynchronous (non-blocking) OpenStuder gateway client.
 * This client uses an asynchronous model which has the disadvantage to be a bit harder to use than the synchronous
 * version. The advantages are that long operations do not block the main thread as all results are reported
 * using callbacks, device message indications are supported and subscriptions to property changes are possible.
 */
export class SIGatewayClient extends SIAbstractGatewayClient {
    private state: SIConnectionState;
    private accessLevel: SIAccessLevel;
    private gatewayVersion: string;
    private ws: WebSocket | null;
    private connectionTimeout: number = -1;

    private user?: string;
    private password?: string;

    private siGatewayCallback: SIGatewayClientCallbacks | undefined;

    public constructor() {
        super();
        this.state = SIConnectionState.DISCONNECTED;
        this.ws = null;
        this.accessLevel = SIAccessLevel.NONE;
        this.gatewayVersion = '';

        this.user = undefined;
        this.password = undefined;
    }

    /**
     * Configures the client to use the callbacks of the passed object.
     *
     * @param siGatewayCallback Object implementing the SIGatewayClientCallbacks interface to be used for all callbacks.
     */
    public setCallback(siGatewayCallback: SIGatewayClientCallbacks | undefined) {
        this.siGatewayCallback = siGatewayCallback;
    }

    /**
     * Establishes the WebSocket connection to the OpenStuder gateway and executes the user authorization process once the connection has been established.
     * The status of the connection attempt is reported either by the on_connected() callback on success or the on_error() callback if the connection could not be established or the authorization
     * for the given user was rejected by the gateway.
     *
     * @param host Hostname or IP address of the OpenStuder gateway to connect to.
     * @param port TCP port used for the connection to the OpenStuder gateway, defaults to 1987
     * @param user Username send to the gateway used for authorization.
     * @param password Password send to the gateway used for authorization.
     * @param connectionTimeout Connection timeout in milliseconds, defaults to 5000 if not provided.
     */
    public connect(host: string, port: number = 1987, user?: string, password?: string, connectionTimeout: number = 5000) {
        // Ensure that the client is in the DISCONNECTED state.
        this.ensureInState(SIConnectionState.DISCONNECTED);

        // Save parameter for later use.
        this.user = user || "";
        this.password = password || "";

        // Connect to WebSocket server.
        this.state = SIConnectionState.CONNECTING;
        this.ws = new WebSocket(host + ':' + port);
        this.ws.onopen = this.onOpen;
        this.ws.onmessage = this.onMessage;
        this.ws.onerror = this.onError;
        this.ws.onclose = this.onClose;

        // Start connection timeout.
        this.connectionTimeout = window.setTimeout(this.onConnectTimeout, connectionTimeout);
    }

    /**
     * Returns the current state of the client. See "SIConnectionState" for details.
     * @return Current state of the client
     */
    public getState(): SIConnectionState {
        return this.state;
    }

    /**
     * Return the access level the client has gained on the gateway connected. See "SIAccessLevel" for details.
     * @return Access level granted to client
     */
    public getAccessLevel(): SIAccessLevel {
        return this.accessLevel;
    }

    /**
     * Returns the version of the OpenStuder gateway software running on the host the client is connected to.
     * @return Version of the gateway software
     */
    public getGatewayVersion(): string {
        return this.gatewayVersion;
    }

    /**
     * Instructs the gateway to scan every configured and functional device access driver for new devices and remove devices that do not respond anymore.
     * The status of the operation and the number of devices present are reported using the onEnumerated() method of the SIGatewayClientCallbacks interface.
     *
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public enumerate() {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send ENUMERATE message to gateway.
        this.ws?.send(SIGatewayClient.encodeEnumerateFrame());
    }

    /**
     * This method can be used to retrieve information about the available devices and their properties from the connected gateway. Using the optional deviceAccessId, deviceId and propertyId
     * parameters, the method can either request information about the whole topology, a particular device access instance, a device or a property.
     *
     * The flags control the level of detail in the gateway's response.
     *
     * The description is reported using the onDescription() method of the SIGatewayClientCallbacks interface.
     *
     * @param deviceAccessId: Device access ID for which the description should be retrieved.
     * @param deviceId Device ID for which the description should be retrieved. Note that device_access_id must be present too.
     * @param propertyId Property ID for which the description should be retrieved. Note that device_access_id and device_id must be present too.
     * @param flags Flags to control level of detail of the response.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public describe(deviceAccessId?: string, deviceId?: string, propertyId?: number, flags?: SIDescriptionFlags[]) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send DESCRIBE message to gateway.
        this.ws?.send(SIGatewayClient.encodeDescribeFrame(deviceAccessId, deviceId, propertyId, flags));
    }

    /**
     * This method is used to retrieve a list of existing properties that match the given property ID in the form "<device access ID>.<device ID>.<property ID>". The wildcard character "*" is
     * supported for <device access ID> and <device ID> fields.
     *
     * For example "*.inv.3136" represents all properties with ID 3136 on the device with ID "inv" connected through any device access, "demo.*.3136" represents all properties with ID 3136 on any
     * device that disposes that property connected through the device access "demo" and finally "*.*.3136" represents all properties with ID 3136 on any device that disposes that property connected
     * through any device access.
     *
     * @param propertyId: The search wildcard ID.
     * @param virtual: Optional to filter for virtual devices (true) or non-virtual devices (false, default).
     * @param functionMask: Optional to filter for device functions. See SIDeviceFunctions for details. Defaults to all functions (SIDeviceFunctions.ALL).
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public findProperties(propertyId: string, virtual?: boolean, functionMask?: Array<SIDeviceFunctions>) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send FIND PROPERTIES message to gateway.
        this.ws?.send(SIGatewayClient.encodeFindPropertiesFrame(propertyId, virtual, functionMask));
    }

    /**
     * This method is used to retrieve the actual value of a given property from the connected gateway. The property is identified by the propertyId parameter.
     * The status of the read operation and the actual value of the property are reported using the onPropertyRead() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to read in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readProperty(propertyId: string) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ PROPERTY message to gateway.
        this.ws?.send(SIGatewayClient.encodeReadPropertyFrame(propertyId));
    }

    /**
     * This method is used to retrieve the actual value of multiple property at the same time from the connected gateway. The properties are identified by the propertyIds parameter.
     * The status of the multiple read operations and the actual value of the properties are reported using the onPropertiesRead() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyIds The IDs of the properties to read in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readProperties(propertyIds: string[]) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ PROPERTIES message to gateway.
        this.ws?.send(SIGatewayClient.encodeReadPropertiesFrame(propertyIds));
    }

    /**
     * The writeProperty() method is used to change the actual value of a given property. The property is identified by the propertyId parameter and the new value is passed by the optional value
     * parameter.
     *
     * This value parameter is optional as it is possible to write to properties with the data type "Signal" where there is no actual value written, the write operation rather triggers an action
     * on the device.
     *
     * The status of the write operation is reported using the onPropertyWritten() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to write in the form '{device access ID}.{<device ID}.{<property ID}'.
     * @param value Optional value to write.
     * @param flags Write flags, See SIWriteFlags for details, if not provided the flags are not send by the client and the gateway uses the default flags.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public writeProperty(propertyId: string, value?: any, flags?: SIWriteFlags) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send WRITE PROPERTY message to gateway.
        this.ws?.send(SIGatewayClient.encodeWritePropertyFrame(propertyId, value, flags));
    }

    /**
     * This method can be used to subscribe to a property on the connected gateway. The property is identified by the propertyId parameter.
     *
     * The status of the subscribe request is reported using the onPropertySubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to subscribe to in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public subscribeToProperty(propertyId: string) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send SUBSCRIBE PROPERTY message to gateway.
        this.ws?.send(SIGatewayClient.encodeSubscribePropertyFrame(propertyId));
    }

    /**
     * This method can be used to subscribe to multiple properties on the connected gateway. The properties are identified by the propertyIds parameter.
     *
     * The status of the subscribe request is reported using the onPropertiesSubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyIds The list of IDs of the properties to subscribe to in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public subscribeToProperties(propertyIds: string[]) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send SUBSCRIBE PROPERTIES message to gateway.
        this.ws?.send(SIGatewayClient.encodeSubscribePropertiesFrame(propertyIds));

    }

    /**
     * This method can be used to unsubscribe from a property on the connected gateway. The property is identified by the propertyId parameter.
     *
     * The status of the unsubscribe request is reported using the onPropertyUnsubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to unsubscribe from in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public unsubscribeFromProperty(propertyId: string) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send UNSUBSCRIBE PROPERTY message to gateway.
        this.ws?.send(SIGatewayClient.encodeUnsubscribePropertyFrame(propertyId));
    }

    /**
     * This method can be used to unsubscribe from multiple properties on the connected gateway. The properties are identified by the propertyIds parameter.
     *
     * The status of the unsubscribe request is reported using the onPropertiesUnsubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The list of IDs of the properties to unsubscribe from in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public unsubscribeFromProperties(propertyId: string[]) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send UNSUBSCRIBE PROPERTY message to gateway.
        this.ws?.send(SIGatewayClient.encodeUnsubscribePropertiesFrame(propertyId));
    }

    /**
     * This method is used to retrieve the list of IDs of all properties for whom data is logged on the gateway. If a time window is given using from and to, only data in this time windows is
     * considered.
     *
     * The status of the operation is the list of properties for whom logged data is available are reported using the onDatalogPropertiesRead() method of the SIGatewayClientCallbacks interface.

     * @param dateFrom Optional date and time of the start of the time window to be considered.
     * @param dateTo Optional date and time of the end of the time window to be considered.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readDatalogProperties(dateFrom?: Date, dateTo?: Date) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ DATALOG message to gateway.
        this.ws?.send(SIGatewayClient.encodeReadDatalogFrame(undefined, dateFrom, dateTo, undefined))
    }

    /**
     * This method is used to retrieve all or a subset of logged data of a given property from the gateway.
     *
     * The status of this operation and the respective values are reported using the onDatalogRead() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId Global ID of the property for which the logged data should be retrieved. It has to be in the form '{device access ID}.{device ID}.{property ID}'.
     * @param dateFrom Optional date and time from which the data has to be retrieved, defaults to the oldest value logged.
     * @param dateTo Optional date and time to which the data has to be retrieved, defaults to the current time on the gateway.
     * @param limit Using this optional parameter you can limit the number of results retrieved in total.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readDatalog(propertyId: string, dateFrom?: Date, dateTo?: Date, limit?: number) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ DATALOG message to gateway.
        this.ws?.send(SIGatewayClient.encodeReadDatalogFrame(propertyId, dateFrom, dateTo, limit));
    }

    /**
     * The readMessages() method can be used to retrieve all or a subset of stored messages send by device on all buses in the past from the gateway.
     *
     * The status of this operation and the retrieved messages are reported using the onMessagesRead() method of the SIGatewayClientCallbacks interface.
     *
     * @param dateFrom Optional date and time from which the messages have to be retrieved, defaults to the oldest message saved.
     * @param dateTo Optional date and time to which the messages have to be retrieved, defaults to the current time on the gateway.
     * @param limit Using this optional parameter you can limit the number of messages retrieved in total.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readMessages(dateFrom?: Date, dateTo?: Date, limit?: number) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ MESSAGES message to gateway.
        this.ws?.send(SIGatewayClient.encodeReadMessagesFrame(dateFrom, dateTo, limit));
    }

    /**
     * Disconnects the client from the gateway.
     */
    public disconnect() {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Close the WebSocket.
        this.ws?.close();
    }

    private ensureInState(state: SIConnectionState) {
        if (state !== this.state) {
            throw new SIProtocolError("invalid client state");
        }
    }

    private onConnectTimeout = () => {
        if (this.state === SIConnectionState.CONNECTING) {
            this.ws?.close();
            this.siGatewayCallback?.onError("connect timeout");
        }
    };

    private onOpen = () => {
        clearTimeout(this.connectionTimeout);
        this.state = SIConnectionState.AUTHORIZING;
        let frame = SIGatewayClient.encodeAuthorizeFrame(this.user, this.password);
        if (this.ws) {
            this.ws.send(frame);
        }
    };

    private onMessage = (event: MessageEvent) => {
        // Determine the actual command.
        let command: string = SIGatewayClient.peekFrameCommand(event.data);

        try {
            let receivedMessage: SIFrameContent; // TODO: Remove

            // In AUTHORIZE state, we only handle AUTHORIZED messages
            if (this.state === SIConnectionState.AUTHORIZING) {
                const decoded = SIGatewayClient.decodeAuthorizedFrame(event.data);
                this.accessLevel = decoded.accessLevel;
                this.gatewayVersion = decoded.gatewayVersion;

                // Change state to CONNECTED.
                this.state = SIConnectionState.CONNECTED;

                // Call callback if present.
                if (this.siGatewayCallback) {
                    this.siGatewayCallback.onConnected(this.accessLevel, this.gatewayVersion);
                }
            }

            // In CONNECTED state we handle all messages except the AUTHORIZED message.
            else if (this.state === SIConnectionState.CONNECTED) {
                switch (command) {
                    case "ERROR":
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onError(SIGatewayClient.decodeFrame(event.data).headers.get("reason") || '')
                        }
                        break;

                    case "ENUMERATED": {
                        const decoded = SIGatewayClient.decodeEnumerateFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onEnumerated(decoded.status, decoded.deviceCount);
                        }
                        break;
                    }


                    case "DESCRIPTION": {
                        const decoded = SIGatewayClient.decodeDescriptionFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onDescription(decoded.status, decoded.description || '', decoded.id);
                        }
                        break;
                    }

                    case "PROPERTIES FOUND": {
                        const decoded = SIGatewayClient.decodePropertiesFoundFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertiesFound(decoded.status, decoded.id || '', decoded.count, decoded.virtual, decoded.functions, decoded.properties || []);
                        }
                        break;
                    }

                    case "PROPERTY READ": {
                        const decoded = SIGatewayClient.decodePropertyReadFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertyRead(decoded.status, decoded.id, decoded.value);
                        }
                        break;
                    }

                    case "PROPERTIES READ":
                        let receivedPropertyResult = SIGatewayClient.decodePropertiesReadFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertiesRead(receivedPropertyResult);
                        }
                        break;

                    case "PROPERTY WRITTEN": {
                        const decoded = SIGatewayClient.decodePropertyWrittenFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertyWritten(decoded.status, decoded.id);
                        }
                        break;
                    }

                    case "PROPERTY SUBSCRIBED": {
                        const decoded = SIGatewayClient.decodePropertySubscribedFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertySubscribed(decoded.status, decoded.id);
                        }
                        break;
                    }

                    case "PROPERTIES SUBSCRIBED":
                        let receivedSubscriptionResult: SISubscriptionsResult[] = SIGatewayClient.decodePropertiesSubscribedFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertiesSubscribed(receivedSubscriptionResult);
                        }
                        break;

                    case "PROPERTY UNSUBSCRIBED":
                        receivedMessage = SIGatewayClient.decodePropertyUnsubscribedFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined) {
                            this.siGatewayCallback.onPropertyUnsubscribed(receivedMessage.status, receivedMessage.id);
                        }
                        break;

                    case "PROPERTIES UNSUBSCRIBED":
                        let receivedUnsubscriptionResult: SISubscriptionsResult[] = SIGatewayClient.decodePropertiesUnsubscribedFrame(event.data);
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onPropertiesUnsubscribed(receivedUnsubscriptionResult);
                        }
                        break;

                    case "PROPERTY UPDATE": {
                        const decoded = SIGatewayClient.decodePropertyUpdateFrame(event.data);
                        if (this.siGatewayCallback && decoded.id !== '') {
                            this.siGatewayCallback.onPropertyUpdated(decoded.id, decoded.value);
                        }
                        break;
                    }

                    case "DATALOG READ":
                        receivedMessage = SIGatewayClient.decodeDatalogReadFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.body !== undefined && receivedMessage.count !== undefined) {
                            if (receivedMessage.id) {
                                this.siGatewayCallback.onDatalogRead(receivedMessage.status, receivedMessage.id, receivedMessage.count, receivedMessage.body);
                            } else {
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
                        SIProtocolError.raise("unsupported frame command :" + command);
                }
            }
        } catch (error) {
            if (error instanceof SIProtocolError) {
                this.siGatewayCallback?.onError(error.message);
            }
            if (this.state === SIConnectionState.AUTHORIZING) {
                this.ws?.close();
                this.state = SIConnectionState.DISCONNECTED;
            }
        }
    };

    private onError = (event: Event) => {
        this.siGatewayCallback?.onError('' + event);
    };

    private onClose = () => {
        // Change state to DISCONNECTED.
        this.state = SIConnectionState.DISCONNECTED;

        // Change access level to NONE.
        this.accessLevel = SIAccessLevel.NONE;

        // Call callback.
        this.siGatewayCallback?.onDisconnected();
    };
}


/**************************************************************************************************************************************************************
 * Bluetooth client implementation.
 */

type SIDecodedBluetoothFrame = {
    command: number,
    sequence: Array<any>
}

type SIAuthorizedBTFrameContent = {
    accessLevel: SIAccessLevel,
    protocolVersion: number,
    gatewayVersion: string
}

type SIEnumeratedBTFrameContent = {
    status: SIStatus,
    deviceCount: number
}

type SIDescribeBTFrameContent = {
    status: SIStatus,
    id: string | undefined,
    description: Map<string,string> | Array<string> | null
}

type SIPropertyReadBTFrameContent = {
    status: SIStatus,
    id: string,
    value: boolean | number | string | null
}

type SIPropertyWrittenBTFrameContent = {
    status: SIStatus,
    id: string
}

type SIPropertySubscribedBTFrameContent = {
    status: SIStatus,
    id: string
}

type SIPropertyUpdateBTFrameContent = {
    id: string,
    value: boolean | number | string | null
}

type SIPropertyUnsubscribedFrameContent = {
    status: SIStatus,
    id: string
}

type SIDataLogReadFrameContent = {
    status: SIStatus,
    id: string | null,
    count: number,
    results: Array<any>
}

type SIDMessagesReadFrameContent = {
    status: SIStatus,
    count: number,
    messages: Array<SIDeviceMessage>
}

export type SIDataLogEntry = {
    timestamp: Date,
    value: any
}

class SIAbstractBluetoothGatewayClient {
    protected static decodeFrame(frame: Uint8Array): SIDecodedBluetoothFrame {
        try {
            let decoded = CBOR_decodeMultiple(frame) as Array<any>;
                return {
                    command: decoded[0],
                    sequence: decoded.slice(1)
                }
        } catch (error: any) {
            throw new SIProtocolError("invalid frame");
        }
    }

    protected static encodeAuthorizeFrame(user?: string, password?: string): Uint8Array {
        return SIAbstractBluetoothGatewayClient.join(
            CBOR_encode(0x01),
            CBOR_encode(user),
            CBOR_encode(password),
            CBOR_encode(1)
        );
    }

    protected static decodeAuthorizedFrame(frame: Uint8Array): SIAuthorizedBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x81 && decoded.sequence.length === 3 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "number" &&
            typeof decoded.sequence[2] === "string") {
            if (decoded.sequence[1] === 1) {
                return {
                    accessLevel: decoded.sequence[0],
                    protocolVersion: decoded.sequence[1],
                    gatewayVersion: decoded.sequence[2]
                }
            } else {
                throw new SIProtocolError("protocol version 1 not supported by server")
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during authorization");
        }
    }

    protected static encodeEnumerateFrame(): Uint8Array {
        return new Uint8Array(
            CBOR_encode(0x02)
        );
    }

    protected static decodeEnumerateFrame(frame: Uint8Array): SIEnumeratedBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x82 && decoded.sequence.length === 2 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "number") {
            return {
                status: decoded.sequence[0],
                deviceCount: decoded.sequence[1]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during device enumeration");
        }
    }

    protected static encodeDescribeFrame(deviceAccessId?: string, deviceId?: string, propertyId?: number): Uint8Array {
        let id = null
        if (deviceAccessId !== null && deviceAccessId !== undefined) {
            id = deviceAccessId;
            if (deviceId !== null && deviceId !== undefined) {
                id += "." + deviceId;
                if (propertyId !== null && propertyId !== undefined) {
                    id += "." + propertyId
                }
            }
        }
        return this.join(CBOR_encode(0x03), CBOR_encode(id))
    }

    protected static decodeDescriptionFrame(frame: Uint8Array): SIDescribeBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x83 && decoded.sequence.length === 3 &&
            typeof decoded.sequence[0] === "number" && (decoded.sequence[1] == null || typeof decoded.sequence[1] === "string")) {
            return {
                status: decoded.sequence[0],
                id: decoded.sequence[1],
                description: decoded.sequence[2]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during description");
        }
    }

    protected static encodeReadPropertyFrame(propertyId: string): Uint8Array {
        return this.join(
            CBOR_encode(0x04),
            CBOR_encode(propertyId)
        );
    }

    protected static decodePropertyReadFrame(frame: Uint8Array): SIPropertyReadBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x84 && decoded.sequence.length >= 2 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "string") {
            return {
                status: decoded.sequence[0],
                id: decoded.sequence[1],
                value: decoded.sequence[2]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during property read");
        }
    }

    protected static encodeWritePropertyFrame(propertyId: string, value?: string, flags?: SIWriteFlags): Uint8Array {
        return this.join(
            CBOR_encode(0x05),
            CBOR_encode(propertyId),
            CBOR_encode(flags !== undefined ? flags : null),
            CBOR_encode(value !== undefined ? value : null)
        );
    }

    protected static decodePropertyWrittenFrame(frame: Uint8Array): SIPropertyWrittenBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x85 && decoded.sequence.length === 2 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "string") {
            return {
                status: decoded.sequence[0],
                id: decoded.sequence[1]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during property write");
        }
    }

    protected static encodeSubscribePropertyFrame(propertyId: string): Uint8Array {
        return this.join(
            CBOR_encode(0x06),
            CBOR_encode(propertyId)
        );
    }

    protected static decodePropertySubscribedFrame(frame: Uint8Array): SIPropertySubscribedBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x86 && decoded.sequence.length === 2 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "string") {
            return {
                status: decoded.sequence[0],
                id: decoded.sequence[1]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during property subscribe");
        }
    }

    protected static encodeUnsubscribePropertyFrame(propertyId: string): Uint8Array {
        return this.join(
            CBOR_encode(0x07),
            CBOR_encode(propertyId)
        );
    }

    protected static decodePropertyUnsubscribedFrame(frame: Uint8Array): SIPropertyUnsubscribedFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x87 && decoded.sequence.length === 2 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "string") {
            return {
                status: decoded.sequence[0],
                id: decoded.sequence[1]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 &&
            typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during property subscribe");
        }
    }

    protected static decodePropertyUpdateFrame(frame: Uint8Array): SIPropertyUpdateBTFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0xFE && decoded.sequence.length === 2 &&
            typeof decoded.sequence[0] === "string") {
            return {
                id: decoded.sequence[0],
                value: decoded.sequence[1]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error receiving property update");
        }
    }

    protected static encodeReadDatalogFrame(propertyId?: string, dateFrom?: Date, dateTo?: Date, limit?: number): Uint8Array {
        return this.join(
            CBOR_encode(0x08),
            CBOR_encode(propertyId !== undefined ? propertyId : null),
            CBOR_encode(dateFrom !== undefined ? dateFrom?.getTime() : null),
            CBOR_encode(dateTo !== undefined ? dateTo?.getTime() : null),
            CBOR_encode(limit !== undefined ? limit : null)
        )
    }

    protected static decodeDatalogReadFrame(frame: Uint8Array): SIDataLogReadFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x88 && decoded.sequence.length === 4 &&
            typeof decoded.sequence[0] === "number" && (typeof decoded.sequence[1] === "string" || decoded.sequence[1] == null) &&
            typeof decoded.sequence[2] ===  "number" && Array.isArray(decoded.sequence[3])) {
            return {
                status: decoded.sequence[0],
                id: decoded.sequence[1],
                count: decoded.sequence[2],
                results: decoded.sequence[3]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error receiving datalog read");
        }
    }

    protected static encodeReadMessagesFrame(dateFrom?: Date, dateTo?: Date, limit?: number): Uint8Array {
        return this.join(
            CBOR_encode(0x09),
            CBOR_encode(dateFrom !== undefined ? dateFrom?.getTime() : null),
            CBOR_encode(dateTo !== undefined ? dateTo?.getTime() : null),
            CBOR_encode(limit !== undefined ? limit : null)
        );
    }

    protected static decodeMessagesReadFrame(frame: Uint8Array): SIDMessagesReadFrameContent {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0x89 && decoded.sequence.length === 3 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "number" &&
            Array.isArray(decoded.sequence[2])) {
            const count = decoded.sequence[1];
            let array = decoded.sequence[2];
            if (array.length === 5 * count) {
                let messages = new Array<SIDeviceMessage>();
                for (let i = 0; i < count; ++i) {
                    messages.push({
                        timestamp: new Date(array[5 * i] * 1000),
                        accessId: array[5 * i + 1],
                        deviceId: array[5 * i + 2],
                        messageId: array[5 * i + 3].toString(), // TODO: This should not be a string!
                        message: array[5 * i + 4]
                    });
                }
                return {
                    status: decoded.sequence[0],
                    count: count,
                    messages: messages
                }
            } else {
                return {
                    status: decoded.sequence[0],
                    count: count,
                    messages: []
                }
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 &&
            typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error during messages read");
        }
    }

    protected static decodeDeviceMessageFrame(frame: Uint8Array): SIDeviceMessage {
        const decoded = this.decodeFrame(frame);
        if (decoded.command === 0xFD && decoded.sequence.length === 5 &&
            typeof decoded.sequence[0] === "number" && typeof decoded.sequence[1] === "string" &&
            typeof decoded.sequence[2] === "string" && typeof decoded.sequence[3] === "number" &&
            typeof decoded.sequence[4] === "string") {
            return {
                timestamp: new Date(decoded.sequence[0] * 1000),
                accessId: decoded.sequence[1],
                deviceId: decoded.sequence[2],
                messageId: decoded.sequence[3].toString(), // TODO: This should not be a string!
                message: decoded.sequence[4]
            }
        } else if (decoded.command === 0xFF && decoded.sequence.length === 1 && typeof decoded.sequence[0] === "string") {
            throw new SIProtocolError(decoded.sequence[0]);
        } else {
            throw new SIProtocolError("unknown error receiving property update");
        }
    }

    protected static peekFrameCommand(frame: Uint8Array): number {
        return (CBOR_decodeMultiple(frame) as Array<any>)[0] as number;
    }

    protected static join(...arrays: Array<ArrayBuffer>): Uint8Array {
        const length = arrays.reduce((sum, array) => sum + array.byteLength, 0)
        let joined = new Uint8Array(length);
        let position = 0;
        arrays.forEach((array => {
            joined.set(new Uint8Array(array), position);
            position += array.byteLength
        }));
        return joined;
    }
}

/**
 * @interface SIBluetoothGatewayClientCallbacks
 * Base Interface containing all callback methods that can be called by the SIBluetoothGatewayClient.
 * You can implement this class to your application.
 */
export interface SIBluetoothGatewayClientCallbacks {

    /**
     * This method is called once the connection to the gateway could be established and the user has been successfully authorized.
     *
     * @param accessLevel Access level that was granted to the user during authorization.
     * @param gatewayVersion Version of the OpenStuder software running on the gateway.
     */
    onConnected(accessLevel: SIAccessLevel, gatewayVersion: string): void;

    /**
     * Called when the connection to the OpenStuder gateway has been gracefully closed by either side or the connection was lost by any other reason.
     */
    onDisconnected(): void;

    /**
     * Called on severe errors.
     *
     * @param reason Exception that caused the erroneous behavior
     */
    onError(reason: string): void;

    /**
     * Called when the enumeration operation started using enumerate() has completed on the gateway.
     *
     * @param status Operation status.
     * @param deviceCount Number of devices present
     */
    onEnumerated(status: SIStatus, deviceCount: number): void;

    /**
     * Called when the gateway returned the description requested using the method describe().
     *
     * @param status Status of the operation.
     * @param description Description object.
     * @param id Subject's ID.
     */
    onDescription(status: SIStatus, description: any, id?: string): void;

    /**
     * Called when the property read operation started using read_property() has completed on the gateway.
     *
     * @param status Status of the read operation.
     * @param propertyId ID of the property read.
     * @param value The value read.
     */
    onPropertyRead(status: SIStatus, propertyId: string, value?: any): void;

    /**
     * Called when the property write operation started using write_property() has completed on the gateway.
     *
     * @param status Status of the write operation.
     * @param propertyId ID of the property written.
     */
    onPropertyWritten(status: SIStatus, propertyId: string): void;

    /**
     * Called when the gateway returned the status of the property subscription requested
     * using the property_subscribe() method.
     * @param status The status of the subscription.
     * @param propertyId ID of the property.
     */
    onPropertySubscribed(status: SIStatus, propertyId: string): void;

    /**
     * Called when the gateway returned the status of the property unsubscription requested
     * using the property_unsubscribe() method.
     * @param status The status of the unsubscription.
     * @param propertyId ID of the property
     */
    onPropertyUnsubscribed(status: SIStatus, propertyId: string): void;

    /**
     * This callback is called whenever the gateway send a property update.
     *
     * @param propertyId ID of the updated property.
     * @param value The current value of the property.
     */
    onPropertyUpdated(propertyId: string, value: any): void;

    /**
     * Called when the datalog property list operation started using read_datalog_properties() has completed on the gateway.
     *
     * @param status Status of the operation.
     * @param properties List of the IDs of the properties for whom data is available in the data log.
     */
    onDatalogPropertiesRead(status: SIStatus, properties: Array<string>): void;

    /**
     * Called when the datalog read operation started using read_datalog() has completed on the gateway.
     *
     * @param status Status of the operation.
     * @param propertyId ID of the property.
     * @param count Number of entries.
     * @param values The values with their timestamps.
     */
    onDatalogRead(status: SIStatus, propertyId: string, count: number, values: Array<SIDataLogEntry>): void;

    /**
     * This callback is called whenever the gateway send a device message indication.
     *
     * @param message The device message received.
     */
    onDeviceMessage(message: SIDeviceMessage): void;

    /**
     * Called when the gateway returned the status of the read messages operation using the read_messages() method.
     *
     * @param status The status of the operation.
     * @param count Number of messages retrieved.
     * @param messages List of retrieved messages.
     */
    onMessagesRead(status: SIStatus, count: number, messages: SIDeviceMessage[]): void;
}

export class SIBluetoothGatewayClient extends SIAbstractBluetoothGatewayClient {
    public static isBluetoothSupported(): Promise<Boolean> {
        if (navigator.bluetooth === undefined) {
            return new Promise<Boolean>((r) => r(false));
        }
        return navigator.bluetooth.getAvailability();
    }

    private state: SIConnectionState;
    private accessLevel: SIAccessLevel;
    private gatewayVersion: string;

    private device: BluetoothDevice | null;
    private service: BluetoothRemoteGATTService | null;
    private tx: BluetoothRemoteGATTCharacteristic | null;
    private frame: Uint8Array;

    private callbacks: SIBluetoothGatewayClientCallbacks | undefined;

    public constructor() {
        super();
        this.state = SIConnectionState.DISCONNECTED;
        this.device = null;
        this.service = null;
        this.tx = null;
        this.frame = new Uint8Array(0);
        this.accessLevel = SIAccessLevel.NONE;
        this.gatewayVersion = '';
    }

    /**
     * Configures the client to use the callbacks of the passed object.
     *
     * @param callbacks Object implementing the SIBluetoothGatewayClientCallbacks interface to be used for all callbacks.
     */
    public setCallback(callbacks: SIBluetoothGatewayClientCallbacks | undefined) {
        this.callbacks = callbacks;
    }

    /**
     * Discovers OpenStuder Bluetooth devices and establishes the connection to the user-selected gateway and executes the user authorization process once the connection has been established.
     * The status of the connection attempt is reported either by the on_connected() callback on success or the on_error() callback if the connection could not be established or the authorization
     * for the given user was rejected by the gateway.
     *
     * @param user Username send to the gateway used for authorization.
     * @param password Password send to the gateway used for authorization.
     */
    public connect(user?: string, password?: string) {
        this.ensureInState(SIConnectionState.DISCONNECTED);

        navigator.bluetooth.requestDevice({filters: [{services: ["f3c2d800-8421-44b1-9655-0951992f313b"]}]}).then(device => {
            this.state = SIConnectionState.CONNECTING;
            this.device = device;
            device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected);
            return device.gatt!.connect();
        }).then(gatt => {
            return gatt.getPrimaryService("f3c2d800-8421-44b1-9655-0951992f313b");
        }).then(service => {
            this.service = service;
            return this.service.getCharacteristic("f3c2d802-8421-44b1-9655-0951992f313b");
        }).then(tx => {
            this.tx = tx;
        }).then(_ => {
            return this.service!.getCharacteristic("f3c2d801-8421-44b1-9655-0951992f313b");
        }).then(rx => {
            rx.addEventListener('characteristicvaluechanged', this.onCharacteristicChanged);
            return rx.startNotifications();
        }).then(_ => {
            this.state = SIConnectionState.AUTHORIZING;
            this.txSend(SIBluetoothGatewayClient.encodeAuthorizeFrame(user, password));
        }).catch(error => {
            this.callbacks?.onError(error);
            this.onDeviceDisconnected();
        });
    }

    /**
     * Returns the current state of the client. See "SIConnectionState" for details.
     * @return Current state of the client
     */
    public getState(): SIConnectionState {
        return this.state;
    }

    /**
     * Return the access level the client has gained on the gateway connected. See "SIAccessLevel" for details.
     * @return Access level granted to client
     */
    public getAccessLevel(): SIAccessLevel {
        return this.accessLevel;
    }

    /**
     * Returns the version of the OpenStuder gateway software running on the host the client is connected to.
     * @return Version of the gateway software
     */
    public getGatewayVersion(): string {
        return this.gatewayVersion;
    }

    /**
     * Instructs the gateway to scan every configured and functional device access driver for new devices and remove devices that do not respond anymore.
     * The status of the operation and the number of devices present are reported using the onEnumerated() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public enumerate() {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send ENUMERATE message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeEnumerateFrame());
    }

    /**
     * This method can be used to retrieve information about the available devices and their properties from the connected gateway. Using the optional deviceAccessId, deviceId and propertyId
     * parameters, the method can either request information about the whole topology, a particular device access instance, a device or a property.
     *
     * The flags control the level of detail in the gateway's response.
     *
     * The description is reported using the onDescription() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param deviceAccessId: Device access ID for which the description should be retrieved.
     * @param deviceId Device ID for which the description should be retrieved. Note that device_access_id must be present too.
     * @param propertyId Property ID for which the description should be retrieved. Note that device_access_id and device_id must be present too.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public describe(deviceAccessId?: string, deviceId?: string, propertyId?: number) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send DESCRIBE message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeDescribeFrame(deviceAccessId, deviceId, propertyId));
    }

    /**
     * This method is used to retrieve the actual value of a given property from the connected gateway. The property is identified by the propertyId parameter.
     * The status of the read operation and the actual value of the property are reported using the onPropertyRead() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to read in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readProperty(propertyId: string) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ PROPERTY message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeReadPropertyFrame(propertyId));
    }

    /**
     * The writeProperty() method is used to change the actual value of a given property. The property is identified by the propertyId parameter and the new value is passed by the optional value
     * parameter.
     *
     * This value parameter is optional as it is possible to write to properties with the data type "Signal" where there is no actual value written, the write operation rather triggers an action
     * on the device.
     *
     * The status of the write operation is reported using the onPropertyWritten() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to write in the form '{device access ID}.{<device ID}.{<property ID}'.
     * @param value Optional value to write.
     * @param flags Write flags, See SIWriteFlags for details, if not provided the flags are not send by the client and the gateway uses the default flags.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public writeProperty(propertyId: string, value?: any, flags?: SIWriteFlags) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send WRITE PROPERTY message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeWritePropertyFrame(propertyId, value, flags));
    }

    /**
     * This method can be used to subscribe to a property on the connected gateway. The property is identified by the propertyId parameter.
     *
     * The status of the subscribe request is reported using the onPropertySubscribed() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to subscribe to in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public subscribeToProperty(propertyId: string) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send SUBSCRIBE PROPERTY message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeSubscribePropertyFrame(propertyId));
    }

    /**
     * This method can be used to unsubscribe from a property on the connected gateway. The property is identified by the propertyId parameter.
     *
     * The status of the unsubscribe request is reported using the onPropertyUnsubscribed() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to unsubscribe from in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public unsubscribeFromProperty(propertyId: string) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send UNSUBSCRIBE PROPERTY message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeUnsubscribePropertyFrame(propertyId));
    }

    /**
     * This method is used to retrieve the list of IDs of all properties for whom data is logged on the gateway. If a time window is given using from and to, only data in this time windows is
     * considered.
     *
     * The status of the operation is the list of properties for whom logged data is available are reported using the onDatalogPropertiesRead() method of the SIBluetoothGatewayClientCallbacks
     * interface.

     * @param dateFrom Optional date and time of the start of the time window to be considered.
     * @param dateTo Optional date and time of the end of the time window to be considered.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readDatalogProperties(dateFrom?: Date, dateTo?: Date) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ DATALOG message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeReadDatalogFrame(undefined, dateFrom, dateTo, undefined))
    }

    /**
     * This method is used to retrieve all or a subset of logged data of a given property from the gateway.
     *
     * The status of this operation and the respective values are reported using the onDatalogRead() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param propertyId Global ID of the property for which the logged data should be retrieved. It has to be in the form '{device access ID}.{device ID}.{property ID}'.
     * @param dateFrom Optional date and time from which the data has to be retrieved, defaults to the oldest value logged.
     * @param dateTo Optional date and time to which the data has to be retrieved, defaults to the current time on the gateway.
     * @param limit Using this optional parameter you can limit the number of results retrieved in total.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readDatalog(propertyId: string, dateFrom?: Date, dateTo?: Date, limit?: number) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ DATALOG message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeReadDatalogFrame(propertyId, dateFrom, dateTo, limit));
    }

    /**
     * The readMessages() method can be used to retrieve all or a subset of stored messages send by device on all buses in the past from the gateway.
     *
     * The status of this operation and the retrieved messages are reported using the onMessagesRead() method of the SIBluetoothGatewayClientCallbacks interface.
     *
     * @param dateFrom Optional date and time from which the messages have to be retrieved, defaults to the oldest message saved.
     * @param dateTo Optional date and time to which the messages have to be retrieved, defaults to the current time on the gateway.
     * @param limit Using this optional parameter you can limit the number of messages retrieved in total.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    public readMessages(dateFrom?: Date, dateTo?: Date, limit?: number) {
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);

        // Encode and send READ MESSAGES message to gateway.
        this.txSend(SIBluetoothGatewayClient.encodeReadMessagesFrame(dateFrom, dateTo, limit));
    }

    /**
     * Disconnects the client from the gateway.
     */
    public disconnect = () => {
        this.device!.gatt!.disconnect();
    }

    private onDeviceDisconnected = () => {
        this.state = SIConnectionState.DISCONNECTED;
        this.device = null;
        this.service = null;
        this.tx = null;
        this.callbacks?.onDisconnected();
    }

    private onCharacteristicChanged = (event: Event) => {
        let fragment = new Uint8Array((event.target as BluetoothRemoteGATTCharacteristic).value!.buffer);
        let remainingFragments = fragment[0];
        this.frame = SIBluetoothGatewayClient.join(this.frame, fragment.subarray(1));
        if (remainingFragments !== 0) return;

        let frame = this.frame;
        this.frame = new Uint8Array(0);

        try {
            const command = SIBluetoothGatewayClient.peekFrameCommand(frame);

            if (this.state === SIConnectionState.AUTHORIZING) {
                if (command !== 0x81) {
                    throw new SIProtocolError("Authorization failed");
                }
                const result = SIBluetoothGatewayClient.decodeAuthorizedFrame(frame);
                this.accessLevel = result.accessLevel;
                this.gatewayVersion = result.gatewayVersion;

                this.state = SIConnectionState.CONNECTED;
                this.callbacks?.onConnected(result.accessLevel, result.gatewayVersion);
             } else {
                switch (command) {
                    case 0xFF: {
                        const decoded = SIBluetoothGatewayClient.decodeFrame(frame);
                        this.callbacks?.onError(decoded.sequence.length > 0 ? decoded.sequence[0] : "unknown error");
                        break;
                    }

                    case 0x82: {
                        const decoded = SIBluetoothGatewayClient.decodeEnumerateFrame(frame);
                        this.callbacks?.onEnumerated(decoded.status, decoded.deviceCount);
                        break;
                    }

                    case 0x83: {
                        const decoded = SIBluetoothGatewayClient.decodeDescriptionFrame(frame);
                        this.callbacks?.onDescription(decoded.status, decoded.description, decoded.id);
                        break;
                    }

                    case 0x84: {
                        const decoded = SIBluetoothGatewayClient.decodePropertyReadFrame(frame);
                        this.callbacks?.onPropertyRead(decoded.status, decoded.id, decoded.value);
                        break;
                    }

                    case 0x85: {
                        const decoded = SIBluetoothGatewayClient.decodePropertyWrittenFrame(frame);
                        this.callbacks?.onPropertyWritten(decoded.status, decoded.id);
                        break;
                    }

                    case 0x86: {
                        const decoded = SIBluetoothGatewayClient.decodePropertySubscribedFrame(frame);
                        this.callbacks?.onPropertySubscribed(decoded.status, decoded.id);
                        break;
                    }

                    case 0x87: {
                        const decoded = SIBluetoothGatewayClient.decodePropertyUnsubscribedFrame(frame);
                        this.callbacks?.onPropertyUnsubscribed(decoded.status, decoded.id);
                        break;
                    }

                    case 0xFE: {
                        const decoded = SIBluetoothGatewayClient.decodePropertyUpdateFrame(frame);
                        this.callbacks?.onPropertyUpdated(decoded.id, decoded.value);
                        break;
                    }

                    case 0x88: {
                        const decoded = SIBluetoothGatewayClient.decodeDatalogReadFrame(frame);
                        if (decoded.id === null) {
                            this.callbacks?.onDatalogPropertiesRead(decoded.status, decoded.results);
                        } else {
                            let values = [];
                            for (let i = 0; i < decoded.count; ++i) {
                                values.push({
                                    timestamp: new Date(decoded.results[2 * i]),
                                    value: decoded.results[2 * i + 1]
                                });
                            }
                            this.callbacks?.onDatalogRead(decoded.status, decoded.id, decoded.count, values);
                        }
                        break;
                    }

                    case 0xFD: {
                        const message = SIBluetoothGatewayClient.decodeDeviceMessageFrame(frame);
                        this.callbacks?.onDeviceMessage(message);
                        break;
                    }

                    case 0x89: {
                        const decoded = SIBluetoothGatewayClient.decodeMessagesReadFrame(frame);
                        this.callbacks?.onMessagesRead(decoded.status, decoded.count, decoded.messages);
                        break;
                    }
                }
            }
        } catch (error: any) {
            if (error instanceof SIProtocolError) {
                this.callbacks?.onError(error.message);
            } else {
                this.callbacks?.onError(error.toString())
            }
            if (this.state === SIConnectionState.AUTHORIZING) {
                this.disconnect();
            }
        }
    }

    private txSend(payload: Uint8Array) {
        const MAX_FRAGMENT_SIZE = 508; // TODO: Detect or make configurable.
        let fragmentCount = Math.ceil(payload.length / MAX_FRAGMENT_SIZE);
        while (fragmentCount > 0) {
            fragmentCount -= 1
            let fragmentLength = Math.min(payload.length, MAX_FRAGMENT_SIZE)
            let fragment = new Uint8Array(fragmentLength + 1);
            fragment[0] = Math.min(fragmentCount, 255);
            fragment.set(payload.subarray(0, fragmentLength), 1);
            payload = payload.subarray(fragmentLength);
            this.tx!.writeValueWithoutResponse(fragment);
        }
    }

    private ensureInState(...states: Array<SIConnectionState>) {
        let ok = false;
        states.forEach((state) => {
            if (state === this.state) {
                ok = true;
            }
        });
        if (!ok) {
            throw new SIProtocolError("invalid client state");
        }
    }
}

function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    bytes.forEach(function(byte) {
        hex += ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return hex;
}