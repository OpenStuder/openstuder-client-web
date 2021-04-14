"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGatewayClient = exports.SIWriteFlags = exports.SIDescriptionFlags = exports.SIAccessLevel = exports.SIConnectionState = exports.SIStatus = void 0;
/**
 * Status of operations on the OpenStuder gateway.
 *
 * -SIStatus.SUCCESS: Operation was successfully completed.
 * -SIStatus.IN_PROGRESS: Operation is already in progress or another operation is occupying the resource.
 * -SIStatus.ERROR: General (unspecified) error.
 * -SIStatus.NO_PROPERTY: The property does not exist or the user's access level does not allow to access the property.
 * -SIStatus.NO_DEVICE: The device does not exist.
 * -SIStatus.NO_DEVICE_ACCESS: The device access instance does not exist.
 * -SIStatus.TIMEOUT: A timeout occurred when waiting for the completion of the operation.
 * -SIStatus.INVALID_VALUE: A invalid value was passed.
 */
var SIStatus;
(function (SIStatus) {
    SIStatus[SIStatus["SUCCESS"] = 0] = "SUCCESS";
    SIStatus[SIStatus["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    SIStatus[SIStatus["ERROR"] = -1] = "ERROR";
    SIStatus[SIStatus["NO_PROPERTY"] = -2] = "NO_PROPERTY";
    SIStatus[SIStatus["NO_DEVICE"] = -3] = "NO_DEVICE";
    SIStatus[SIStatus["NO_DEVICE_ACCESS"] = -4] = "NO_DEVICE_ACCESS";
    SIStatus[SIStatus["TIMEOUT"] = -5] = "TIMEOUT";
    SIStatus[SIStatus["INVALID_VALUE"] = -6] = "INVALID_VALUE";
})(SIStatus = exports.SIStatus || (exports.SIStatus = {}));
function SIStatusFromString(str) {
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
 *
 * -SIConnectionState.DISCONNECTED: The client is not connected.
 * -SIConnectionState.CONNECTING: The client is establishing the WebSocket connection to the gateway.
 * -SIConnectionState.AUTHORIZING: The WebSocket connection to the gateway has been established
 * and the client is authorizing.
 * -SIConnectionState.CONNECTED: The WebSocket connection is established and the client is authorized, ready to use.
 */
var SIConnectionState;
(function (SIConnectionState) {
    SIConnectionState[SIConnectionState["DISCONNECTED"] = 0] = "DISCONNECTED";
    SIConnectionState[SIConnectionState["CONNECTING"] = 1] = "CONNECTING";
    SIConnectionState[SIConnectionState["AUTHORIZING"] = 2] = "AUTHORIZING";
    SIConnectionState[SIConnectionState["CONNECTED"] = 3] = "CONNECTED";
})(SIConnectionState = exports.SIConnectionState || (exports.SIConnectionState = {}));
/**
 * Level of access granted to a client from the OpenStuder gateway.
 *
 * -NONE: No access at all.
 * -BASIC: Basic access to device information properties (configuration excluded).
 * -INSTALLER: Basic access + additional access to most common configuration properties.
 * -EXPERT: Installer + additional advanced configuration properties.
 * -QUALIFIED_SERVICE_PERSONNEL: Expert and all configuration and service properties
 * only for qualified service personnel.
 */
var SIAccessLevel;
(function (SIAccessLevel) {
    SIAccessLevel[SIAccessLevel["NONE"] = 0] = "NONE";
    SIAccessLevel[SIAccessLevel["BASIC"] = 1] = "BASIC";
    SIAccessLevel[SIAccessLevel["INSTALLER"] = 2] = "INSTALLER";
    SIAccessLevel[SIAccessLevel["EXPERT"] = 3] = "EXPERT";
    SIAccessLevel[SIAccessLevel["QUALIFIED_SERVICE_PERSONNEL"] = 4] = "QUALIFIED_SERVICE_PERSONNEL";
})(SIAccessLevel = exports.SIAccessLevel || (exports.SIAccessLevel = {}));
function SIAccessLevelFromString(str) {
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
 *
 * -SIDescriptionFlags.NONE: No description flags.
 * -SIDescriptionFlags.INCLUDE_ACCESS_INFORMATION: Includes device access instances information.
 * -SIDescriptionFlags.INCLUDE_DEVICE_INFORMATION: Include device information.
 * -SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION: Include device property information.
 * -SIDescriptionFlags.INCLUDE_DRIVER_INFORMATION: Include device access driver information.
 */
var SIDescriptionFlags;
(function (SIDescriptionFlags) {
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_ACCESS_INFORMATION"] = 0] = "INCLUDE_ACCESS_INFORMATION";
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_PROPERTY_INFORMATION"] = 1] = "INCLUDE_PROPERTY_INFORMATION";
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_DEVICE_INFORMATION"] = 2] = "INCLUDE_DEVICE_INFORMATION";
    SIDescriptionFlags[SIDescriptionFlags["INCLUDE_DRIVER_INFORMATION"] = 3] = "INCLUDE_DRIVER_INFORMATION";
})(SIDescriptionFlags = exports.SIDescriptionFlags || (exports.SIDescriptionFlags = {}));
/**
 * Flags to control write property operation.
 *
 * -SIWriteFlags.NONE: No write flags.
 * -SIWriteFlags.PERMANENT: Write the change to the persistent storage, eg the change lasts reboots.
 */
var SIWriteFlags;
(function (SIWriteFlags) {
    SIWriteFlags[SIWriteFlags["NONE"] = 0] = "NONE";
    SIWriteFlags[SIWriteFlags["PERMANENT"] = 1] = "PERMANENT";
})(SIWriteFlags = exports.SIWriteFlags || (exports.SIWriteFlags = {}));
/**
 * @class SIProtocolError
 * Class for reporting all OpenStuder protocol errors.
 */
class SIProtocolError {
    static raise(error) {
        throw new Error(error);
    }
}
/**
 * @class SIAbstractGatewayClient
 * Abstract gateway to gives mandatory function to treat the frame with the defined websocket protocol
 */
class SIAbstractGatewayClient {
    /**
     * Function used to separate the information into a "DecodedFrame" instance
     * @param frame FSrame to be decoded
     */
    static decodeFrame(frame) {
        let command = "INVALID";
        let headers = new Map();
        let lines = frame.split("\n");
        if (lines.length > 1) {
            command = lines[0];
        }
        else {
            SIProtocolError.raise("Invalid frame");
        }
        let line = 1;
        while (line < lines.length) {
            let components = lines[line].split(":");
            //General case
            if (components.length === 2) {
                headers.set(components[0], components[1]);
            }
            //if our components has a timestamp, it will have several ':'
            if (components.length > 2) {
                let value = "";
                for (let i = 1; i < components.length; i++) {
                    value += ":" + components[i];
                }
                headers.set(components[0], value);
            }
            line += 1;
            //We don't want to treat the body here, we need to break before
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
    /**
     * Encode a frame to be send to the gateway with the different credentials
     * @param user Name of the user
     * @param password Password for the user
     */
    static encodeAuthorizeFrame(user, password) {
        if (user === undefined || password === undefined) {
            return "AUTHORIZE\nuser:" + user + "\npassword:" + password + "\nprotocol_version:1\n\n";
        }
        else {
            return 'AUTHORIZE\nprotocol_version:1\n\n';
        }
    }
    /**
     * Decode an authorize frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodeAuthorizedFrame(frame) {
        let decodedFrame = this.decodeFrame(frame);
        let retVal = {
            accessLevel: undefined,
            gatewayVersion: undefined,
        };
        if (decodedFrame.command === "AUTHORIZED" && decodedFrame.headers.has("access_level") &&
            decodedFrame.headers.has("protocol_version")) {
            if (decodedFrame.headers.get("protocol_version") === "1") {
                retVal.accessLevel = decodedFrame.headers.get("access_level");
                retVal.gatewayVersion = decodedFrame.headers.get("gateway_version");
                return retVal;
            }
            else {
                SIProtocolError.raise("protocol version 1 not supported by server");
            }
        }
        else if (decodedFrame.command === "Error" && decodedFrame.headers.has("reason")) {
            let reason = "" + decodedFrame.headers.get("reason");
            SIProtocolError.raise(reason);
        }
        else {
            SIProtocolError.raise("unknown error during authorization");
        }
        return retVal;
    }
    /**
     * Encode a frame to be send to receive the number of device available
     */
    static encodeEnumerateFrame() {
        return "ENUMERATE\n\n";
    }
    /**
     * Decode an enumerate frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodeEnumerateFrame(frame) {
        let retVal = {
            status: undefined,
            deviceCount: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "ENUMERATED") {
            retVal.status = decodedFrame.headers.get("status");
            retVal.deviceCount = decodedFrame.headers.get("device_count");
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }
    /**
     * Encode a describe frame to be send to receive the description of the device(s)
     * @param deviceAccessId Select the accessor
     * @param deviceId Select the device, undefined will give all devices
     * @param propertyId Select the property of the selected device, undefined will give all properties
     * @param flags If present, gives additional information
     */
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
            flags === null || flags === void 0 ? void 0 : flags.map(flag => {
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
    /**
     * Decode a description frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodeDescriptionFrame(frame) {
        let retVal = {
            body: undefined,
            status: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DESCRIPTION" && decodedFrame.headers.has("status")) {
            let status = decodedFrame.headers.get("status");
            retVal.status = status;
            if (status === "Success") {
                retVal.body = decodedFrame.body;
            }
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during description");
        }
        if (decodedFrame.headers.has("id")) {
            retVal.id = decodedFrame.headers.get("id");
        }
        return retVal;
    }
    /**
     * Encode a read property frame to receive the current value of a property
     * @param propertyId Property to be read
     */
    static encodeReadPropertyFrame(propertyId) {
        return "READ PROPERTY\nid:" + propertyId + "\n\n";
    }
    /**
     * Decode a property read frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodePropertyReadFrame(frame) {
        let retVal = {
            status: undefined,
            id: undefined,
            value: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY READ" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            let status = decodedFrame.headers.get("status");
            retVal.status = status;
            retVal.id = decodedFrame.headers.get("id");
            if (status === "Success" && decodedFrame.headers.has("value")) {
                retVal.value = decodedFrame.headers.get("value");
            }
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }
    /**
     * Encode a read properties frame to receive the current value of the multiple properties
     * @param propertyIds Properties to be read
     */
    static encodeReadPropertiesFrame(propertyIds) {
        let frame = "READ PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }
    /**
     * Decode a properties read frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     * */
    static decodePropertiesReadFrame(frame) {
        let retVal = [];
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES READ" && decodedFrame.headers.has("status")) {
            let jsonBody = JSON.parse(decodedFrame.body);
            let status = decodedFrame.headers.get("status");
            if (status === "Success") {
                for (let i = 0; i < jsonBody.length; i++) {
                    let temp = {
                        status: SIStatus.ERROR,
                        id: "",
                        value: ""
                    };
                    temp.status = SIStatusFromString(jsonBody[i].status);
                    temp.id = jsonBody[i].id;
                    temp.value = jsonBody[i].value;
                    retVal.push(temp);
                }
            }
            else {
                SIProtocolError.raise("Error on status on read properties frame: " + status);
            }
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }
    /**
     * Encode a write property frame to write a new parameter for the system
     * @param propertyId Property to be written
     * @param value New value
     * @param flags dDetermine if the new value should be stocked in the database
     */
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
            frame += "value:" + value + "\n";
        }
        frame += "\n";
        return frame;
    }
    /**
     * Decode a property written frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodePropertyWrittenFrame(frame) {
        let retVal = {
            status: undefined,
            id: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY WRITTEN" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            retVal.status = decodedFrame.headers.get("status");
            retVal.id = decodedFrame.headers.get("id");
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property write");
        }
        return retVal;
    }
    /**
     * Encode a frame to be send to subscribe to a property
     * @param propertyId Property to subscribe
     */
    static encodeSubscribePropertyFrame(propertyId) {
        return "SUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }
    /**
     * Decode a property subscribe frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodePropertySubscribedFrame(frame) {
        let retVal = {
            status: undefined,
            id: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY SUBSCRIBED" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            retVal.status = decodedFrame.headers.get("status");
            retVal.id = decodedFrame.headers.get("id");
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return retVal;
    }
    /**
     * Encode a frame to be send to subscribe to multiple properties
     * @param propertyIds Properties to subscribe
     */
    static encodeSubscribePropertiesFrame(propertyIds) {
        let frame = "SUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }
    /**
     * Decode a properties subscribe frame into an array of SISubscriptionResult
     * @param frame Frame to be decoded
     */
    static decodePropertiesSubscribedFrame(frame) {
        let retVal = [];
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES SUBSCRIBED" && decodedFrame.headers.has("status")) {
            let jsonBody = JSON.parse(decodedFrame.body);
            let status = decodedFrame.headers.get("status");
            if (status === "Success") {
                for (let i = 0; i < jsonBody.length; i++) {
                    let temp = {
                        status: SIStatus.ERROR,
                        id: "",
                    };
                    temp.status = SIStatusFromString(jsonBody[i].status);
                    temp.id = jsonBody[i].id;
                    retVal.push(temp);
                }
            }
            else {
                SIProtocolError.raise("Error on status on properties subscribed: " + status);
            }
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }
    /**
     * Encode an unsubscribe frame to cancel the subscription to a property
     * @param propertyId Property to unsubscribe
     */
    static encodeUnsubscribePropertyFrame(propertyId) {
        return "UNSUBSCRIBE PROPERTY\nid:" + propertyId + "\n\n";
    }
    /**
     * Decode an unsubscribe frame into a "SIInformation" instance
     * @param frame Frame to be decoded
     */
    static decodePropertyUnsubscribedFrame(frame) {
        let retVal = {
            status: undefined,
            id: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UNSUBSCRIBED" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("id")) {
            retVal.status = decodedFrame.headers.get("status");
            retVal.id = decodedFrame.headers.get("id");
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property subscribe");
        }
        return retVal;
    }
    /**
     * Encode a frame to be send to unsubscribe to multiple properties
     * @param propertyIds Properties to unsubscribe
     */
    static encodeUnsubscribePropertiesFrame(propertyIds) {
        let frame = "UNSUBSCRIBE PROPERTIES\n\n";
        frame += JSON.stringify(propertyIds);
        return frame;
    }
    /**
     * Decode a properties unsubscribe frame into an array of SISubscriptionResult
     * @param frame Frame to be decoded
     */
    static decodePropertiesUnsubscribedFrame(frame) {
        let retVal = [];
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTIES UNSUBSCRIBED" && decodedFrame.headers.has("status")) {
            let jsonBody = JSON.parse(decodedFrame.body);
            let status = decodedFrame.headers.get("status");
            if (status === "Success") {
                for (let i = 0; i < jsonBody.length; i++) {
                    let temp = {
                        status: SIStatus.ERROR,
                        id: "",
                    };
                    temp.status = SIStatusFromString(jsonBody[i].status);
                    temp.id = jsonBody[i].id;
                    retVal.push(temp);
                }
            }
            else {
                SIProtocolError.raise("Error on status on properties unsubscribed frame: " + status);
            }
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error during property read");
        }
        return retVal;
    }
    /**
     * Decode a property update frame into a "SIInformation" instance, received because we are subscribed to this
     * property
     * @param frame Frame to be decoded
     */
    static decodePropertyUpdateFrame(frame) {
        let retVal = {
            status: undefined,
            id: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "PROPERTY UPDATE" && decodedFrame.headers.has("value")
            && decodedFrame.headers.has("id")) {
            retVal.status = decodedFrame.headers.get("status");
            retVal.id = decodedFrame.headers.get("id");
            retVal.value = decodedFrame.headers.get("value");
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving property update");
        }
        return retVal;
    }
    /**
     * Encode a read datalog frame to be send to get the datalog
     * @param propertyId Wanted property in the format <device access ID>.<device ID>.<property ID>
     * @param dateFrom Start date and time to get logged data from (ISO 8601 extended format)
     * @param dateTo End date and time to get the logged data to (ISO 8601 extended format)
     * @param limit Number of maximum received messages
     */
    static encodeReadDatalogFrame(propertyId, dateFrom, dateTo, limit) {
        let frame = 'READ DATALOG\n';
        if (propertyId) {
            frame += "id:" + propertyId + "\n";
        }
        frame += SIAbstractGatewayClient.getTimestampHeader('from', dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeader('to', dateTo);
        if (limit) {
            frame += 'limit:' + limit + '\n';
        }
        frame += '\n';
        return frame;
    }
    /**
     * Decode a datalog read frame into a "SIInformation" instance
     * @param frame frame to be decoded
     */
    static decodeDatalogReadFrame(frame) {
        let retVal = {
            status: undefined,
            id: undefined,
            count: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DATALOG READ" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("count")) {
            if (decodedFrame.headers.has("id")) {
                retVal.id = decodedFrame.headers.get("id");
            }
            retVal.status = decodedFrame.headers.get("status");
            retVal.count = decodedFrame.headers.get("count");
            retVal.body = decodedFrame.body;
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving datalog read");
        }
        return retVal;
    }
    /**
     * Encode a frame to be send to retrieve all or a subset of stored messages send by devices
     * @param dateFrom start date and time to get logged data from (ISO 8601 extended format)
     * @param dateTo end date and time to get the logged data to (ISO 8601 extended format)
     * @param limit number of maximum received messages
     */
    static encodeReadMessagesFrame(dateFrom, dateTo, limit) {
        let frame = 'READ MESSAGES\n';
        frame += SIAbstractGatewayClient.getTimestampHeader('from', dateFrom);
        frame += SIAbstractGatewayClient.getTimestampHeader('to', dateTo);
        if (limit) {
            frame += 'limit:' + limit + '\n';
        }
        frame += '\n';
        return frame;
    }
    /**
     * Decode the messages read into a "SIInformation" instance property
     * @param frame frame to be decoded
     */
    static decodeMessagesReadFrame(frame) {
        let retVal = [];
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "MESSAGES READ" && decodedFrame.headers.has("status")
            && decodedFrame.headers.has("count")) {
            let jsonBody = JSON.parse(decodedFrame.body);
            for (let i = 0; i < jsonBody.length; i++) {
                let message = {
                    timestamp: jsonBody[i].timestamp,
                    accessId: jsonBody[i].access_id,
                    deviceId: jsonBody[i].device_id,
                    messageId: jsonBody[i].message_id,
                    message: jsonBody[i].message
                };
                retVal.push(message);
            }
            if (retVal[0]) {
                retVal[0].status = decodedFrame.headers.get("status");
                retVal[0].count = decodedFrame.headers.get("count");
            }
            else {
                let temp = {
                    status: decodedFrame.headers.get("status"),
                    count: decodedFrame.headers.get("count")
                };
                retVal.push(temp);
            }
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving messages");
        }
        return retVal;
    }
    /**
     * Decode the message of the devices into a "SIInformation" instance
     * property
     * @param frame frame to be decoded
     */
    static decodeDeviceMessageFrame(frame) {
        let retVal = {
            id: undefined,
            accessId: undefined,
            messageId: undefined,
            message: undefined,
            timestamp: undefined,
        };
        let decodedFrame = this.decodeFrame(frame);
        if (decodedFrame.command === "DEVICE MESSAGE" && decodedFrame.headers.has("access_id")
            && decodedFrame.headers.has("device_id") && decodedFrame.headers.has("message_id") &&
            decodedFrame.headers.has("message") && decodedFrame.headers.has("timestamp")) {
            retVal.accessId = decodedFrame.headers.get("access_id");
            retVal.messageId = decodedFrame.headers.get("message_id");
            retVal.message = decodedFrame.headers.get("message");
            retVal.deviceId = decodedFrame.headers.get("device_id");
            retVal.timestamp = decodedFrame.headers.get("timestamp");
        }
        else if (decodedFrame.command === "ERROR") {
            SIProtocolError.raise("" + decodedFrame.headers.get("reason"));
        }
        else {
            SIProtocolError.raise("unknown error receiving device message");
        }
        return retVal;
    }
    /**
     * Convert a date time to a string for the encode of frames
     * @param key dateFrom (start) or dateTo (stop)
     * @param timestamp Wanted date
     */
    static getTimestampHeader(key, timestamp) {
        if (timestamp) {
            return key + ':' + timestamp.toISOString() + '\n';
        }
        else {
            return '';
        }
    }
    /**
     * Get the first line (the command of the frame)
     * @param frame Frame to be peeked
     */
    static peekFrameCommand(frame) {
        //Return the first line of the received frame
        return (frame.split("\n"))[0];
    }
}
/**
 * @class SIGatewayClient
 * Complete, asynchronous (non-blocking) OpenStuder gateway client.
 * This client uses an asynchronous model which has the disadvantage to be a bit harder to use than the synchronous
 * version. The advantages are that long operations do not block the main thread as all results are reported
 * using callbacks, device message indications are supported and subscriptions to property changes are possible.
 */
class SIGatewayClient extends SIAbstractGatewayClient {
    constructor() {
        super();
        this.state = SIConnectionState.DISCONNECTED;
        this.gatewayVersion = '';
        this.accessLevel = SIAccessLevel.NONE;
        this.ws = null;
    }
    ensureInState(state) {
        if (state !== this.state) {
            SIProtocolError.raise("invalid client state");
        }
    }
    setStateSI(state) {
        this.state = state;
        if (this.siGatewayCallback) {
            this.siGatewayCallback.onConnectionStateChanged(this.state);
        }
    }
    setCallback(siGatewayCallback) {
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
     */
    connect(host, port = 1987, user, password) {
        this.ensureInState(SIConnectionState.DISCONNECTED);
        if (user && password) {
            this.user = user;
            this.password = password;
        }
        this.ws = new WebSocket(host + ':' + port);
        this.setStateSI(SIConnectionState.CONNECTING);
        this.ws.onopen = ( /*event:Event*/) => {
            this.setStateSI(SIConnectionState.AUTHORIZING);
            let frame = SIGatewayClient.encodeAuthorizeFrame(user, password);
            if (this.ws) {
                this.ws.send(frame);
            }
        };
        this.ws.onmessage = (event) => {
            let command = SIGatewayClient.peekFrameCommand(event.data);
            let receivedMessage;
            // In AUTHORIZE state, we only handle AUTHORIZED messages
            if (this.state === SIConnectionState.AUTHORIZING && command === "AUTHORIZED") {
                this.setStateSI(SIConnectionState.CONNECTED);
                receivedMessage = SIGatewayClient.decodeAuthorizedFrame(event.data);
                if (receivedMessage.accessLevel) {
                    this.accessLevel = SIAccessLevelFromString(receivedMessage.accessLevel);
                }
                if (receivedMessage.gatewayVersion) {
                    this.gatewayVersion = receivedMessage.gatewayVersion;
                }
                if (this.siGatewayCallback && receivedMessage.accessLevel && receivedMessage.gatewayVersion) {
                    this.siGatewayCallback.onConnected(SIAccessLevelFromString(receivedMessage.accessLevel), receivedMessage.gatewayVersion);
                }
            }
            else if (this.state === SIConnectionState.CONNECTED) {
                switch (command) {
                    case "ERROR":
                        if (this.siGatewayCallback) {
                            this.siGatewayCallback.onError("" + SIGatewayClient.decodeFrame(event.data).headers.get("reason"));
                        }
                        SIProtocolError.raise("" + SIGatewayClient.decodeFrame(event.data).headers.get("reason"));
                        break;
                    case "ENUMERATED":
                        receivedMessage = SIGatewayClient.decodeEnumerateFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.deviceCount) {
                            this.siGatewayCallback.onEnumerated(SIStatusFromString(receivedMessage.status), +receivedMessage.deviceCount);
                        }
                        break;
                    case "DESCRIPTION":
                        receivedMessage = SIGatewayClient.decodeDescriptionFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.body) {
                            //status: SIStatus, id_: Optional[str], description: object
                            this.siGatewayCallback.onDescription(SIStatusFromString(receivedMessage.status), receivedMessage.body, receivedMessage.id);
                        }
                        break;
                    case "PROPERTY READ":
                        receivedMessage = SIGatewayClient.decodePropertyReadFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.id) {
                            this.siGatewayCallback.onPropertyRead(SIStatusFromString(receivedMessage.status), receivedMessage.id, receivedMessage.value);
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
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.id) {
                            //status:SIStatus, propertyId:string
                            this.siGatewayCallback.onPropertyWritten(SIStatusFromString(receivedMessage.status), receivedMessage.id);
                        }
                        break;
                    case "PROPERTY SUBSCRIBED":
                        receivedMessage = SIGatewayClient.decodePropertySubscribedFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.id) {
                            this.siGatewayCallback.onPropertySubscribed(SIStatusFromString(receivedMessage.status), receivedMessage.id);
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
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.id) {
                            this.siGatewayCallback.onPropertyUnsubscribed(SIStatusFromString(receivedMessage.status), receivedMessage.id);
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
                        if (this.siGatewayCallback && receivedMessage.id) {
                            this.siGatewayCallback.onPropertyUpdated(receivedMessage.id, receivedMessage.value);
                        }
                        break;
                    case "DATALOG READ":
                        receivedMessage = SIGatewayClient.decodeDatalogReadFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.status && receivedMessage.body && receivedMessage.count) {
                            if (receivedMessage.id) {
                                this.siGatewayCallback.onDatalogRead(SIStatusFromString(receivedMessage.status), receivedMessage.id, +receivedMessage.count, receivedMessage.body);
                            }
                            else {
                                let properties = receivedMessage.body.split("\n");
                                this.siGatewayCallback.onDatalogPropertiesRead(SIStatusFromString(receivedMessage.status), properties);
                            }
                        }
                        break;
                    case "DEVICE MESSAGE":
                        receivedMessage = SIGatewayClient.decodeDeviceMessageFrame(event.data);
                        if (this.siGatewayCallback && receivedMessage.timestamp && receivedMessage.accessId && receivedMessage.deviceId
                            && receivedMessage.messageId && receivedMessage.message) {
                            let deviceMessage = {
                                timestamp: receivedMessage.timestamp,
                                accessId: receivedMessage.accessId,
                                deviceId: receivedMessage.deviceId,
                                messageId: receivedMessage.messageId,
                                message: receivedMessage.message
                            };
                            this.siGatewayCallback.onDeviceMessage(deviceMessage);
                        }
                        break;
                    case "MESSAGES READ":
                        let receivedMessagesRead = SIGatewayClient.decodeMessagesReadFrame(event.data);
                        let deviceMessages = [];
                        let count = 0;
                        receivedMessagesRead.map(receivedMessageRead => {
                            if (receivedMessageRead.timestamp && receivedMessageRead.accessId &&
                                receivedMessageRead.deviceId && receivedMessageRead.messageId &&
                                receivedMessageRead.message) {
                                deviceMessages[count] = {
                                    timestamp: receivedMessageRead.timestamp,
                                    accessId: receivedMessageRead.accessId,
                                    deviceId: receivedMessageRead.deviceId,
                                    messageId: receivedMessageRead.messageId,
                                    message: receivedMessageRead.message
                                };
                                count++;
                            }
                        });
                        if (this.siGatewayCallback && receivedMessagesRead[0].status && receivedMessagesRead[0].count) {
                            this.siGatewayCallback.onMessageRead(SIStatusFromString(receivedMessagesRead[0].status), +receivedMessagesRead[0].count, deviceMessages);
                        }
                        break;
                    default:
                        SIProtocolError.raise("unsupported frame command :" + command);
                }
            }
        };
        this.ws.onclose = ( /*event:Event*/) => {
            this.setStateSI(SIConnectionState.DISCONNECTED);
            this.accessLevel = SIAccessLevel.NONE;
        };
        this.ws.onerror = (event) => {
            SIProtocolError.raise("Error occurs on the websocket");
        };
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
     * Instructs the gateway to scan every configured and functional device access driver for new devices and remove
     * devices that do not respond anymore.
     * The status of the operation and the number of devices present are reported using the on_enumerated() callback.
     */
    enumerate() {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    describe(deviceAccessId, deviceId, propertyId, flags) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
            this.ws.send(SIGatewayClient.encodeDescribeFrame(deviceAccessId, deviceId, propertyId, flags));
        }
    }
    /**
     * This method is used to retrieve the actual value of a given property from the connected gateway.
     * The property is identified by the property_id parameter.
     * The status of the read operation and the actual value of the property are reported using
     * the on_property_read() callback.
     * @param propertyId The ID of the property to read in the form '{device access ID}.{device ID}.{property ID}'.
     */
    readProperty(propertyId) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    readProperties(propertyIds) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    writeProperty(propertyId, value, flags) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
            this.ws.send(SIGatewayClient.encodeWritePropertyFrame(propertyId, value, flags));
        }
    }
    /**
     * This method can be used to subscribe to a property on the connected gateway. The property is identified by
     * the property_id parameter.
     * The status of the subscribe request is reported using the on_property_subscribed() callback.
     * @param propertyId The ID of the property to subscribe to in the form
     * '{device access ID}.{device ID}.{property ID}'.
     */
    subscribeToProperty(propertyId) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    subscribeToProperties(propertyIds) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    unsubscribeFromProperty(propertyId) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    unsubscribeFromProperties(propertyId) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
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
    readDatalog(propertyId, dateFrom, dateTo, limit) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
            this.ws.send(SIGatewayClient.encodeReadDatalogFrame(propertyId, dateFrom, dateTo, limit));
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
    readDatalogProperties(dateFrom, dateTo) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
            this.ws.send(SIGatewayClient.encodeReadDatalogFrame(undefined, dateFrom, dateTo, undefined));
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
    readMessages(dateFrom, dateTo, limit) {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
            this.ws.send(SIGatewayClient.encodeReadMessagesFrame(dateFrom, dateTo, limit));
        }
    }
    /**
     * Disconnects the client from the gateway.
     */
    disconnect() {
        this.ensureInState(SIConnectionState.CONNECTED);
        if (this.ws) {
            this.ws.close();
        }
    }
}
exports.SIGatewayClient = SIGatewayClient;
