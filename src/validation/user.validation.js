"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLoginData = exports.validateRegistrationData = void 0;
const validator_1 = __importDefault(require("validator"));
function validateRegistrationData(name, email, password) {
    if (!validator_1.default.isLength(name, { min: 3 })) {
        return 'Username must be at leat 3 characters long';
    }
    if (!validator_1.default.isEmail(email)) {
        return 'Invalid email address';
    }
    if (!validator_1.default.isLength(password, { min: 8 })) {
        return 'Password must be at least 8 characters long';
    }
    if (!validator_1.default.isStrongPassword(password)) {
        return 'Password is not Strong enough';
    }
    return null;
}
exports.validateRegistrationData = validateRegistrationData;
function validateLoginData(email, password) {
    if (!validator_1.default.isEmail(email)) {
        return 'Email must be valid';
    }
    if (!validator_1.default.isLength(password, { min: 8 })) {
        return 'Password must be at least 8 characters long';
    }
    return null;
}
exports.validateLoginData = validateLoginData;
