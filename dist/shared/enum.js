"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.TransactionSubject = exports.RequestStatus = exports.RequestType = exports.Gender = exports.Role = void 0;
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
var TransactionSubject;
(function (TransactionSubject) {
    TransactionSubject["TICKET"] = "TICKET";
    TransactionSubject["HIRING"] = "HIRING";
})(TransactionSubject || (exports.TransactionSubject = TransactionSubject = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TICKET"] = "TICKET";
    NotificationType["ACCOUNT"] = "ACCOUNT";
    NotificationType["REQUEST_REJECT"] = "REQUEST_REJECT";
    NotificationType["REQUEST_ACCEPT"] = "REQUEST_ACCEPT";
    NotificationType["RECIEVED_REQUEST"] = "RECIEVED_REQUEST";
    NotificationType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    NotificationType["PAYMENT_FAILURE"] = "PAYMENT_FAILURE";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
