"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStatus = exports.RequestType = exports.Gender = exports.Role = void 0;
var Role;
(function (Role) {
    Role["GUEST"] = "GUEST";
    Role["HOST"] = "HOST";
    Role["DJ"] = "DJ";
    Role["BARTENDER"] = "BARTENDER";
    Role["BOTTLEGIRL"] = "BOTTLEGIRL";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
})(Gender || (exports.Gender = Gender = {}));
var RequestType;
(function (RequestType) {
    RequestType["SENT"] = "SENT";
    RequestType["RECIEVED"] = "RECIEVED";
})(RequestType || (exports.RequestType = RequestType = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["ACCEPTED"] = "ACCEPTED";
    RequestStatus["PENDING"] = "PENDING";
    RequestStatus["REJECTED"] = "REJECTED";
    RequestStatus["COMPLETED"] = "COMPLETED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
