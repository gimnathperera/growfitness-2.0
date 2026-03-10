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
exports.SessionSchema = exports.Session = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shared_types_1 = require("@grow-fitness/shared-types");
const toObjectId = (value) => {
    if (value === undefined || value === null) {
        return value;
    }
    return new mongoose_2.Types.ObjectId(value);
};
let Session = class Session {
    title;
    type;
    coachId;
    locationId;
    dateTime;
    duration;
    capacity;
    kids;
    status;
    isFreeSession;
};
exports.Session = Session;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Session.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.SessionType }),
    __metadata("design:type", String)
], Session.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
        set: toObjectId,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Session.prototype, "coachId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Location',
        required: true,
        set: toObjectId,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Session.prototype, "locationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Session.prototype, "dateTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Session.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Session.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [mongoose_2.Types.ObjectId],
        ref: 'Kid',
        required: false,
        set: (value) => value?.map(kidId => toObjectId(kidId)) ?? value,
    }),
    __metadata("design:type", Array)
], Session.prototype, "kids", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.SessionStatus, default: shared_types_1.SessionStatus.SCHEDULED }),
    __metadata("design:type", String)
], Session.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], Session.prototype, "isFreeSession", void 0);
exports.Session = Session = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Session);
exports.SessionSchema = mongoose_1.SchemaFactory.createForClass(Session);
const formatRef = (value) => {
    if (value && typeof value === 'object' && '_id' in value) {
        return value;
    }
    return value?.toString?.() ?? value;
};
const normalizeKid = (kid) => {
    if (kid && typeof kid === 'object' && '_id' in kid) {
        const hasExtra = Object.keys(kid).some(key => !['_id', '__v'].includes(key));
        if (hasExtra) {
            return {
                ...kid,
                _id: kid._id.toString(),
                id: kid._id.toString(),
            };
        }
        return kid._id.toString();
    }
    return kid?.toString?.() ?? kid;
};
exports.SessionSchema.set('toObject', {
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString?.() ?? ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.kidId;
        ret.coachId = formatRef(ret.coachId);
        ret.locationId = formatRef(ret.locationId);
        ret.kids = Array.isArray(ret.kids) ? ret.kids.map(normalizeKid) : ret.kids;
        return ret;
    },
});
exports.SessionSchema.set('toJSON', {
    transform: (_doc, ret) => {
        ret.id = ret._id?.toString?.() ?? ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.kidId;
        ret.coachId = formatRef(ret.coachId);
        ret.locationId = formatRef(ret.locationId);
        ret.kids = Array.isArray(ret.kids) ? ret.kids.map(normalizeKid) : ret.kids;
        return ret;
    },
});
exports.SessionSchema.index({ dateTime: 1 });
exports.SessionSchema.index({ coachId: 1 });
exports.SessionSchema.index({ status: 1 });
exports.SessionSchema.index({ locationId: 1 });
exports.SessionSchema.index({ isFreeSession: 1 });
//# sourceMappingURL=session.schema.js.map