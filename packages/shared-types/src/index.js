"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerTargetAudience = exports.InvoiceStatus = exports.InvoiceType = exports.RequestStatus = exports.SessionStatus = exports.SessionType = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["COACH"] = "COACH";
    UserRole["PARENT"] = "PARENT";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType["INDIVIDUAL"] = "INDIVIDUAL";
    SessionType["GROUP"] = "GROUP";
})(SessionType || (exports.SessionType = SessionType = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "SCHEDULED";
    SessionStatus["CONFIRMED"] = "CONFIRMED";
    SessionStatus["CANCELLED"] = "CANCELLED";
    SessionStatus["COMPLETED"] = "COMPLETED";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "PENDING";
    RequestStatus["APPROVED"] = "APPROVED";
    RequestStatus["DENIED"] = "DENIED";
    RequestStatus["SELECTED"] = "SELECTED";
    RequestStatus["NOT_SELECTED"] = "NOT_SELECTED";
    RequestStatus["COMPLETED"] = "COMPLETED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["PARENT_INVOICE"] = "PARENT_INVOICE";
    InvoiceType["COACH_PAYOUT"] = "COACH_PAYOUT";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["PENDING"] = "PENDING";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var BannerTargetAudience;
(function (BannerTargetAudience) {
    BannerTargetAudience["PARENT"] = "PARENT";
    BannerTargetAudience["COACH"] = "COACH";
    BannerTargetAudience["ALL"] = "ALL";
})(BannerTargetAudience || (exports.BannerTargetAudience = BannerTargetAudience = {}));
//# sourceMappingURL=index.js.map