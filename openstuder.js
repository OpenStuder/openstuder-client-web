"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGatewayClient = exports.SIProtocolError = exports.SIWriteFlags = exports.SIDescriptionFlags = exports.SIAccessLevel = exports.SIConnectionState = exports.SIStatus = void 0;
/**
 * Status of operations on the OpenStuder gateway.
 */
var SIStatus;
(function (SIStatus) {
    /**
     * Operation was successfully completed.
     */
    SIStatus[SIStatus["SUCCESS"] = 0] = "SUCCESS";
    /**
     * Operation is already in progress or another operation is occupying the resource.
     */
    SIStatus[SIStatus["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    /**
     * General (unspecified) error.
     */
    SIStatus[SIStatus["ERROR"] = -1] = "ERROR";
    /**
     * The property does not exist or the user's access level does not allow to access the property.
     */
    SIStatus[SIStatus["NO_PROPERTY"] = -2] = "NO_PROPERTY";
    /**
     * The device does not exist.
     */
    SIStatus[SIStatus["NO_DEVICE"] = -3] = "NO_DEVICE";
    /**
     * The device access instance does not exist.
     */
    SIStatus[SIStatus["NO_DEVICE_ACCESS"] = -4] = "NO_DEVICE_ACCESS";
    /**
     * A timeout occurred when waiting for the completion of the operation.
     */
    SIStatus[SIStatus["TIMEOUT"] = -5] = "TIMEOUT";
    /**
     * A invalid value was passed.
     */
    SIStatus[SIStatus["INVALID_VALUE"] = -6] = "INVALID_VALUE";
})(SIStatus = exports.SIStatus || (exports.SIStatus = {}));
function statusFromString(str) {
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
var SIConnectionState;
(function (SIConnectionState) {
    /**
     * The client is not connected.
     */
    SIConnectionState[SIConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
    /**
     * The client is establishing the WebSocket connection to the gateway.
     */
    SIConnectionState[SIConnectionState["CONNECTING"] = 1] = "CONNECTING";
    /**
     * The WebSocket connection to the gateway has been established and the client is authorizing.
     */
    SIConnectionState[SIConnectionState["AUTHORIZING"] = 2] = "AUTHORIZING";
    /**
     * The WebSocket connection is established and the client is authorized, ready to use.
     */
    SIConnectionState[SIConnectionState["CONNECTED"] = 3] = "CONNECTED";
})(SIConnectionState = exports.SIConnectionState || (exports.SIConnectionState = {}));
/**
 * Level of access granted to a client from the OpenStuder gateway.
 */
var SIAccessLevel;
(function (SIAccessLevel) {
    /**
     * No access at all.
     */
    SIAccessLevel[SIAccessLevel["NONE"] = 0] = "NONE";
    /**
     * Basic access to device information properties (configuration excluded).
     */
    SIAccessLevel[SIAccessLevel["BASIC"] = 1] = "BASIC";
    /**
     * Basic access + additional access to most common configuration properties.
     */
    SIAccessLevel[SIAccessLevel["INSTALLER"] = 2] = "INSTALLER";
    /**
     * Installer + additional advanced configuration properties.
     */
    SIAccessLevel[SIAccessLevel["EXPERT"] = 3] = "EXPERT";
    /**
     * Expert and all configuration and service properties only for qualified service personnel.
     */
    SIAccessLevel[SIAccessLevel["QUALIFIED_SERVICE_PERSONNEL"] = 4] = "QUALIFIED_SERVICE_PERSONNEL";
})(SIAccessLevel = exports.SIAccessLevel || (exports.SIAccessLevel = {}));
function accessLevelFromString(str) {
    switch (str) {
        case ("None"):
            return SIAccessLevel.NONE;
        case ("Basic"):
            return SIAccessLevel.BASIC;
        case ("Installer"):
            return SIAccessLevel.INSTALLER;
        case ("Expert"):
            return SIAccessLevel.EXPERT;
        case ("QSP"):
            return SIAccessLevel.QUALIFIED_SERVICE_PERSONNEL;
        default:
            return SIAccessLevel.NONE;
    }
}
/**
 * Flags to control the format of the "DESCRIBE" functionality.
 */
var SIDescriptionFlags;
(function (SIDescriptionFlags) {
    /**
     * No description flags.
     */
    SIDescriptionFlags[SIDescriptionFlags["NONE"] = 0] = "NONE";
    /**
     * Includes device access instances information.
     */
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_ACCESS_INFORMATION"] = 1] = "INCLUDE_ACCESS_INFORMATION";
    /**
     * Include device information.
     */
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_PROPERTY_INFORMATION"] = 2] = "INCLUDE_PROPERTY_INFORMATION";
    /**
     * Include device property information.
     */
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_DEVICE_INFORMATION"] = 3] = "INCLUDE_DEVICE_INFORMATION";
    /**
     * Include device access driver information.
     */
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_DRIVER_INFORMATION"] = 4] = "INCLUDE_DRIVER_INFORMATION";
})(SIDescriptionFlags = exports.SIDescriptionFlags || (exports.SIDescriptionFlags = {}));
/**
 * Flags to control write property operation.
 */
var SIWriteFlags;
(function (SIWriteFlags) {
    /**
     * No write flags.
     */
    SIWriteFlags[SIWriteFlags["NONE"] = 0] = "NONE";
    /**
     * Write the change to the persistent storage, eg the change lasts reboots.
     */
    SIWriteFlags[SIWriteFlags["PERMANENT"] = 1] = "PERMANENT";
})(SIWriteFlags = exports.SIWriteFlags || (exports.SIWriteFlags = {}));
/**
 * Class for reporting all OpenStuder protocol errors.
 */
class SIProtocolError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, SIProtocolError.prototype);
    }
    static raise(message) {
        throw new SIProtocolError(message);
    }
}
exports.SIProtocolError = SIProtocolError;
class SIAbstractGatewayClient {
    static decodeFrame(frame) {
        let command = "INVALID";
        let headers = new Map();
        const lines = frame.split("\n");
        if (lines.length > 1) {
            command = lines[0];
        }
        else {
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
        return { body: body, headers: headers, command: command };
    }
    static encodeAuthorizeFrame(user, password) {
        if (user !== "" || password !== "") {
            return "AUTHORIZE\nuser:" + user + "\npassword:" + password + "\nprotocol_version:1\n\n";
        }
        else {
            return 'AUTHORIZE\nprotocol_version:1\n\n';
        }
    }
    static decodeAuthorizedFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "AUTHORIZED" && decodedFrame.headers.has("access_level") && decodedFrame.headers.has("protocol_version")) {
            if (decodedFrame.headers.get("protocol_version") === "1") {
                return {
                    accessLevel: decodedFrame.headers.get("access_level"),
                    gatewayVersion: decodedFrame.headers.get("gateway_version")
                };
            }
            else {
                SIProtocolError.raise("protocol version 1 not supported by server");
            }
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during authorization");
        }
        return {};
    }
    static encodeEnumerateFrame() {
        return "ENUMERATE\n\n";
    }
    static decodeEnumerateFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "ENUMERATED") {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                count: +(decodedFrame.headers.get("device_count") || 0)
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return {};
    }
    static encodeDescribeFrame(deviceAccessId, deviceId, propertyId, flags) {
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
        if ((flags === null || flags === void 0 ? void 0 : flags.length) !== 0 && flags !== undefined) {
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
    static decodeDescriptionFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DESCRIPTION" && decodedFrame.headers.has("status")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                body: status === SIStatus.SUCCESS ? decodedFrame.body : undefined
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during description");
        }
        return {};
    }
    static encodeFindPropertiesFrame(propertyId) {
        return "FIND PROPERTIES\nid:" + propertyId + "\n\n";
    }
    static decodePropertiesFoundFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES FOUND" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id") && decodedFrame.headers.has("count")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                count: +(decodedFrame.headers.get("count") || 0),
                properties: status === SIStatus.SUCCESS ? JSON.parse(decodedFrame.body) : undefined
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during find properties");
        }
        return {};
    }
    static encodeReadPropertyFrame(propertyId) {
        return "READ PROPERTY\nid:" + propertyId + "\n\n";
    }
    static decodePropertyReadFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            return {
                status: status,
                id: decodedFrame.headers.get("id"),
                value: status == SIStatus.SUCCESS ? decodedFrame.headers.get("value") : undefined
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return {};
    }
    static encodeReadPropertiesFrame(propertyIds) {
        let frame = "READ PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }
    static decodePropertiesReadFrame(frame) {
        let results = [];
        const decodedFrame = this.decodeFrame(frame);
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
            }
            else {
                SIProtocolError.raise("error during property read, status=" + decodedFrame.headers.get("status"));
            }
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return results;
    }
    static encodeWritePropertyFrame(propertyId, value, flags) {
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
    static decodePropertyWrittenFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY WRITTEN" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property write");
        }
        return {};
    }
    static encodeSubscribePropertyFrame(propertyId) {
        return "SUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }
    static decodePropertySubscribedFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY SUBSCRIBED" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return {};
    }
    static encodeSubscribePropertiesFrame(propertyIds) {
        let frame = "SUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }
    static decodePropertiesSubscribedFrame(frame) {
        let results = [];
        const decodedFrame = this.decodeFrame(frame);
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
            }
            else {
                SIProtocolError.raise("error during properties subscribe, status=" + decodedFrame.headers.get("status"));
            }
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during properties subscribe");
        }
        return results;
    }
    static encodeUnsubscribePropertyFrame(propertyId) {
        return "UNSUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }
    static decodePropertyUnsubscribedFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UNSUBSCRIBED" && decodedFrame.headers.has("status") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id")
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property unsubscribe");
        }
        return {};
    }
    static encodeUnsubscribePropertiesFrame(propertyIds) {
        let frame = "UNSUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }
    static decodePropertiesUnsubscribedFrame(frame) {
        let result = [];
        const decodedFrame = this.decodeFrame(frame);
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
            }
            else {
                SIProtocolError.raise("error during properties unsubscribe, status=" + decodedFrame.headers.get("status"));
            }
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during properties unsubscribe");
        }
        return result;
    }
    static decodePropertyUpdateFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UPDATE" && decodedFrame.headers.has("value") && decodedFrame.headers.has("id")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id"),
                value: decodedFrame.headers.get("value")
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving property update");
        }
        return {};
    }
    static encodeReadDatalogFrame(propertyId, dateFrom, dateTo, limit) {
        let frame = 'READ DATALOG\n';
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
    static decodeDatalogReadFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DATALOG READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("count")) {
            return {
                status: statusFromString(decodedFrame.headers.get("status")),
                id: decodedFrame.headers.get("id"),
                count: +(decodedFrame.headers.get("count") || 0),
                body: decodedFrame.body
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving datalog read");
        }
        return {};
    }
    static encodeReadMessagesFrame(dateFrom, dateTo, limit) {
        let frame = 'READ MESSAGES\n';
        frame += SIAbstractGatewayClient.getTimestampHeaderIfPresent('from', dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeaderIfPresent('to', dateTo);
        if (limit) {
            frame += 'limit:' + limit + '\n';
        }
        frame += '\n';
        return frame;
    }
    static decodeMessagesReadFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "MESSAGES READ" && decodedFrame.headers.has("status") && decodedFrame.headers.has("count")) {
            const status = statusFromString(decodedFrame.headers.get("status"));
            if (status === SIStatus.SUCCESS) {
                let messages = [];
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
            }
            else {
                return {
                    status: status,
                    count: +(decodedFrame.headers.get("count") || 0),
                    messages: []
                };
            }
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving messages");
        }
        return {};
    }
    static decodeDeviceMessageFrame(frame) {
        const decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DEVICE MESSAGE" && decodedFrame.headers.has("access_id") && decodedFrame.headers.has("device_id") &&
            decodedFrame.headers.has("message_id") && decodedFrame.headers.has("message") && decodedFrame.headers.has("timestamp")) {
            return {
                timestamp: new Date(decodedFrame.headers.get("timestamp")),
                accessId: decodedFrame.headers.get("access_id"),
                deviceId: decodedFrame.headers.get("device_id"),
                messageId: decodedFrame.headers.get("message_id"),
                message: decodedFrame.headers.get("message")
            };
        }
        else if (decodedFrame.command === "ERROR" && decodedFrame.headers.has("reason")) {
            SIProtocolError.raise(decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving device message");
        }
        return { accessId: "", deviceId: "", message: "", messageId: "", timestamp: new Date(0) };
    }
    static getTimestampHeaderIfPresent(key, timestamp) {
        if (timestamp) {
            return key + ':' + timestamp.toISOString() + '\n';
        }
        else {
            return '';
        }
    }
    static peekFrameCommand(frame) {
        return (frame.split("\n"))[0];
    }
}
/**
 * Complete, asynchronous (non-blocking) OpenStuder gateway client.
 * This client uses an asynchronous model which has the disadvantage to be a bit harder to use than the synchronous
 * version. The advantages are that long operations do not block the main thread as all results are reported
 * using callbacks, device message indications are supported and subscriptions to property changes are possible.
 */
class SIGatewayClient extends SIAbstractGatewayClient {
    constructor() {
        super();
        this.connectionTimeout = -1;
        this.onConnectTimeout = () => {
            var _a, _b;
            if (this.state === SIConnectionState.CONNECTING) {
                (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
                (_b = this.siGatewayCallback) === null || _b === void 0 ? void 0 : _b.onError("connect timeout");
            }
        };
        this.onOpen = () => {
            clearTimeout(this.connectionTimeout);
            this.state = SIConnectionState.AUTHORIZING;
            let frame = SIGatewayClient.encodeAuthorizeFrame(this.user, this.password);
            if (this.ws) {
                this.ws.send(frame);
            }
        };
        this.onMessage = (event) => {
            var _a, _b;
            // Determine the actual command.
            let command = SIGatewayClient.peekFrameCommand(event.data);
            try {
                let receivedMessage;
                // In AUTHORIZE state, we only handle AUTHORIZED messages
                if (this.state === SIConnectionState.AUTHORIZING) {
                    receivedMessage = SIGatewayClient.decodeAuthorizedFrame(event.data);
                    if (receivedMessage.accessLevel) {
                        this.accessLevel = accessLevelFromString(receivedMessage.accessLevel);
                    }
                    if (receivedMessage.gatewayVersion) {
                        this.gatewayVersion = receivedMessage.gatewayVersion;
                    }
                    // Change state to CONNECTED.
                    this.state = SIConnectionState.CONNECTED;
                    // Call callback if present.
                    if (this.siGatewayCallback && receivedMessage.accessLevel && receivedMessage.gatewayVersion) {
                        this.siGatewayCallback.onConnected(this.accessLevel, this.gatewayVersion);
                    }
                }
                // In CONNECTED state we handle all messages except the AUTHORIZED message.
                else if (this.state === SIConnectionState.CONNECTED) {
                    switch (command) {
                        case "ERROR":
                            if (this.siGatewayCallback) {
                                this.siGatewayCallback.onError(SIGatewayClient.decodeFrame(event.data).headers.get("reason") || '');
                            }
                            break;
                        case "ENUMERATED":
                            receivedMessage = SIGatewayClient.decodeEnumerateFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.count !== undefined) {
                                this.siGatewayCallback.onEnumerated(receivedMessage.status, receivedMessage.count);
                            }
                            break;
                        case "DESCRIPTION":
                            receivedMessage = SIGatewayClient.decodeDescriptionFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.body !== undefined) {
                                this.siGatewayCallback.onDescription(receivedMessage.status, receivedMessage.body, receivedMessage.id);
                            }
                            break;
                        case "PROPERTIES FOUND":
                            receivedMessage = SIGatewayClient.decodePropertiesFoundFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined && receivedMessage.count !== undefined &&
                                receivedMessage.properties !== undefined) {
                                this.siGatewayCallback.onPropertiesFound(receivedMessage.status, receivedMessage.id, receivedMessage.count, receivedMessage.properties);
                            }
                            break;
                        case "PROPERTY READ":
                            receivedMessage = SIGatewayClient.decodePropertyReadFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined) {
                                this.siGatewayCallback.onPropertyRead(receivedMessage.status, receivedMessage.id, receivedMessage.value);
                            }
                            break;
                        case "PROPERTIES READ":
                            let receivedPropertyResult = SIGatewayClient.decodePropertiesReadFrame(event.data);
                            if (this.siGatewayCallback) {
                                this.siGatewayCallback.onPropertiesRead(receivedPropertyResult);
                            }
                            break;
                        case "PROPERTY WRITTEN":
                            receivedMessage = SIGatewayClient.decodePropertyWrittenFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined) {
                                this.siGatewayCallback.onPropertyWritten(receivedMessage.status, receivedMessage.id);
                            }
                            break;
                        case "PROPERTY SUBSCRIBED":
                            receivedMessage = SIGatewayClient.decodePropertySubscribedFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.id !== undefined) {
                                this.siGatewayCallback.onPropertySubscribed(receivedMessage.status, receivedMessage.id);
                            }
                            break;
                        case "PROPERTIES SUBSCRIBED":
                            let receivedSubscriptionResult = SIGatewayClient.decodePropertiesSubscribedFrame(event.data);
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
                            let receivedUnsubscriptionResult = SIGatewayClient.decodePropertiesUnsubscribedFrame(event.data);
                            if (this.siGatewayCallback) {
                                this.siGatewayCallback.onPropertiesUnsubscribed(receivedUnsubscriptionResult);
                            }
                            break;
                        case "PROPERTY UPDATE":
                            receivedMessage = SIGatewayClient.decodePropertyUpdateFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.id !== undefined) {
                                this.siGatewayCallback.onPropertyUpdated(receivedMessage.id, receivedMessage.value);
                            }
                            break;
                        case "DATALOG READ":
                            receivedMessage = SIGatewayClient.decodeDatalogReadFrame(event.data);
                            if (this.siGatewayCallback && receivedMessage.status !== undefined && receivedMessage.body !== undefined && receivedMessage.count !== undefined) {
                                if (receivedMessage.id) {
                                    this.siGatewayCallback.onDatalogRead(receivedMessage.status, receivedMessage.id, receivedMessage.count, receivedMessage.body);
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
                            SIProtocolError.raise("unsupported frame command :" + command);
                    }
                }
            }
            catch (error) {
                if (error instanceof SIProtocolError) {
                    (_a = this.siGatewayCallback) === null || _a === void 0 ? void 0 : _a.onError(error.message);
                }
                if (this.state === SIConnectionState.AUTHORIZING) {
                    (_b = this.ws) === null || _b === void 0 ? void 0 : _b.close();
                    this.state = SIConnectionState.DISCONNECTED;
                }
            }
        };
        this.onError = (event) => {
            var _a;
            (_a = this.siGatewayCallback) === null || _a === void 0 ? void 0 : _a.onError('' + event);
        };
        this.onClose = () => {
            var _a;
            // Change state to DISCONNECTED.
            this.state = SIConnectionState.DISCONNECTED;
            // Change access level to NONE.
            this.accessLevel = SIAccessLevel.NONE;
            // Call callback.
            (_a = this.siGatewayCallback) === null || _a === void 0 ? void 0 : _a.onDisconnected();
        };
        this.state = SIConnectionState.DISCONNECTED;
        this.ws = null;
        this.accessLevel = SIAccessLevel.NONE;
        this.gatewayVersion = '';
        this.user = undefined;
        this.password = undefined;
    }
    /**
     * Establishes the WebSocket connection to the OpenStuder gateway and executes the user authorization process once the connection has been established.
     * The status of the connection attempt is reported either by the on_connected() callback on success or the on_error() callback if the connection could not be established or the authorisation
     * for the given user was rejected by the gateway.
     *
     * @param host Hostname or IP address of the OpenStuder gateway to connect to.
     * @param port TCP port used for the connection to the OpenStuder gateway, defaults to 1987
     * @param user Username send to the gateway used for authorization.
     * @param password Password send to the gateway used for authorization.
     * @param connectionTimeout Connection timeout in milliseconds, defaults to 5000 if not provided.
     */
    connect(host, port = 1987, user, password, connectionTimeout = 5000) {
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
     * Configures the client to use the callbacks of the passed object.
     *
     * @param siGatewayCallback Object implementing the SIAsyncGatewayClientCallbacks interface to be used for all callbacks.
     */
    setCallback(siGatewayCallback) {
        this.siGatewayCallback = siGatewayCallback;
    }
    /**
     * Returns the current state of the client. See "SIConnectionState" for details.
     * @return Current state of the client
     */
    getState() {
        return this.state;
    }
    /**
     * Return the access level the client has gained on the gateway connected. See "SIAccessLevel" for details.
     * @return Access level granted to client
     */
    getAccessLevel() {
        return this.accessLevel;
    }
    /**
     * Returns the version of the OpenStuder gateway software running on the host the client is connected to.
     * @return Version of the gateway software
     */
    getGatewayVersion() {
        return this.gatewayVersion;
    }
    /**
     * Instructs the gateway to scan every configured and functional device access driver for new devices and remove devices that do not respond anymore.
     * The status of the operation and the number of devices present are reported using the onEnumerated() method of the SIGatewayClientCallbacks interface.
     *
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    enumerate() {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send ENUMERATE message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeEnumerateFrame());
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
    describe(deviceAccessId, deviceId, propertyId, flags) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send DESCRIBE message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeDescribeFrame(deviceAccessId, deviceId, propertyId, flags));
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
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    findProperties(propertyId) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send FIND PROPERTIES message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeFindPropertiesFrame(propertyId));
    }
    /**
     * This method is used to retrieve the actual value of a given property from the connected gateway. The property is identified by the propertyId parameter.
     * The status of the read operation and the actual value of the property are reported using the onPropertyRead() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to read in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    readProperty(propertyId) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send READ PROPERTY message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeReadPropertyFrame(propertyId));
    }
    /**
     * This method is used to retrieve the actual value of multiple property at the same time from the connected gateway. The properties are identified by the propertyIds parameter.
     * The status of the multiple read operations and the actual value of the properties are reported using the onPropertiesRead() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyIds The IDs of the properties to read in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    readProperties(propertyIds) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send READ PROPERTIES message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeReadPropertiesFrame(propertyIds));
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
    writeProperty(propertyId, value, flags) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send WRITE PROPERTY message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeWritePropertyFrame(propertyId, value, flags));
    }
    /**
     * This method can be used to subscribe to a property on the connected gateway. The property is identified by the propertyId parameter.
     *
     * The status of the subscribe request is reported using the onPropertySubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to subscribe to in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    subscribeToProperty(propertyId) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send SUBSCRIBE PROPERTY message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeSubscribePropertyFrame(propertyId));
    }
    /**
     * This method can be used to subscribe to multiple properties on the connected gateway. The properties are identified by the propertyIds parameter.
     *
     * The status of the subscribe request is reported using the onPropertiesSubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyIds The list of IDs of the properties to subscribe to in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    subscribeToProperties(propertyIds) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send SUBSCRIBE PROPERTIES message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeSubscribePropertiesFrame(propertyIds));
    }
    /**
     * This method can be used to unsubscribe from a property on the connected gateway. The property is identified by the propertyId parameter.
     *
     * The status of the unsubscribe request is reported using the onPropertyUnsubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The ID of the property to unsubscribe from in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    unsubscribeFromProperty(propertyId) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send UNSUBSCRIBE PROPERTY message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeUnsubscribePropertyFrame(propertyId));
    }
    /**
     * This method can be used to unsubscribe from multiple properties on the connected gateway. The properties are identified by the propertyIds parameter.
     *
     * The status of the unsubscribe request is reported using the onPropertiesUnsubscribed() method of the SIGatewayClientCallbacks interface.
     *
     * @param propertyId The list of IDs of the properties to unsubscribe from in the form '{device access ID}.{device ID}.{property ID}'.
     * @raises SIProtocolError: On a connection, protocol of framing error.
     */
    unsubscribeFromProperties(propertyId) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send UNSUBSCRIBE PROPERTY message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeUnsubscribePropertiesFrame(propertyId));
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
    readDatalogProperties(dateFrom, dateTo) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send READ DATALOG message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeReadDatalogFrame(undefined, dateFrom, dateTo, undefined));
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
    readDatalog(propertyId, dateFrom, dateTo, limit) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send READ DATALOG message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeReadDatalogFrame(propertyId, dateFrom, dateTo, limit));
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
    readMessages(dateFrom, dateTo, limit) {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Encode and send READ MESSAGES message to gateway.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(SIGatewayClient.encodeReadMessagesFrame(dateFrom, dateTo, limit));
    }
    /**
     * Disconnects the client from the gateway.
     */
    disconnect() {
        var _a;
        // Ensure that the client is in the CONNECTED state.
        this.ensureInState(SIConnectionState.CONNECTED);
        // Close the WebSocket.
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
    }
    ensureInState(state) {
        if (state !== this.state) {
            throw new SIProtocolError("invalid client state");
        }
    }
}
exports.SIGatewayClient = SIGatewayClient;
