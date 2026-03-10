"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarEventSchema = exports.GoogleCalendarEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let GoogleCalendarEvent = class GoogleCalendarEvent {
    userId;
    sessionId;
    googleEventId;
};
exports.GoogleCalendarEvent = GoogleCalendarEvent;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GoogleCalendarEvent.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Session', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GoogleCalendarEvent.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], GoogleCalendarEvent.prototype, "googleEventId", void 0);
exports.GoogleCalendarEvent = GoogleCalendarEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GoogleCalendarEvent);
exports.GoogleCalendarEventSchema = mongoose_1.SchemaFactory.createForClass(GoogleCalendarEvent);
exports.GoogleCalendarEventSchema.set('toObject', {
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString?.() ?? ret.id;
        delete ret._id;
        delete ret.__v;
        ret.userId = ret.userId?.toString?.() ?? ret.userId;
        ret.sessionId = ret.sessionId?.toString?.() ?? ret.sessionId;
        return ret;
    },
});
exports.GoogleCalendarEventSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString?.() ?? ret.id;
        delete ret._id;
        delete ret.__v;
        ret.userId = ret.userId?.toString?.() ?? ret.userId;
        ret.sessionId = ret.sessionId?.toString?.() ?? ret.sessionId;
        return ret;
    },
});
exports.GoogleCalendarEventSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
exports.GoogleCalendarEventSchema.index({ userId: 1 });
exports.GoogleCalendarEventSchema.index({ sessionId: 1 });
//# sourceMappingURL=google-calendar-event.schema.js.map