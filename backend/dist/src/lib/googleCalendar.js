"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oAuth2Client = void 0;
exports.createMeetEvent = createMeetEvent;
const googleapis_1 = require("googleapis");
exports.oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
function createMeetEvent(_a) {
    return __awaiter(this, arguments, void 0, function* ({ summary, description, startTime, endTime, timeZone = "UTC", attendees = [], tokens, }) {
        var _b, _c, _d;
        try {
            exports.oAuth2Client.setCredentials({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
            });
            const calendar = googleapis_1.google.calendar({ version: "v3", auth: exports.oAuth2Client });
            const event = {
                summary,
                description,
                start: { dateTime: startTime, timeZone },
                end: { dateTime: endTime, timeZone },
                attendees,
                conferenceData: {
                    createRequest: {
                        requestId: `skillswap-${Date.now()}`,
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
            };
            const created = yield calendar.events.insert({
                calendarId: "primary",
                requestBody: event,
                conferenceDataVersion: 1,
                sendUpdates: "all",
            });
            const meetLink = created.data.hangoutLink ||
                ((_d = (_c = (_b = created.data.conferenceData) === null || _b === void 0 ? void 0 : _b.entryPoints) === null || _c === void 0 ? void 0 : _c.find((e) => e.entryPointType === "video")) === null || _d === void 0 ? void 0 : _d.uri);
            if (!meetLink) {
                console.error("Calendar API response:", created.data);
                throw new Error("No Meet link returned from Calendar API");
            }
            return meetLink;
        }
        catch (error) {
            console.error("Error creating Google Meet event:", error);
            if (error instanceof Error) {
                throw new Error(`Failed to create Google Meet: ${error.message}`);
            }
            throw new Error("Failed to create Google Meet event");
        }
    });
}
