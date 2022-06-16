import user from "./api-clients/user";
import notifications from "./notifications";
import { errCodes as errorCodes } from "./errorCodes";
import { store } from "../config/store";
import { addPopout, removePopouts } from "../config/actions";
import { getAuthState, updateAuthState } from "./auth";
import fp from "lodash/fp";
<<<<<<< HEAD
=======
import { startRefeshAndSession } from "../config/user/userActions";
>>>>>>> c5293bce5 (#986: Check for existing auth state on login)

export default class sessionManagement {
    static timers = {};
    static eventsToMonitor = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    static timeOffsets = {
        passiveRenewal: 300000,
        invasiveRenewal: 120000,
    };

    static createDefaultExpireTimes() {
        // TODO this is used up until enableNewSignIn goes live then remove this
        const now = new Date();
        const tomorrow = now.setHours(now.getHours() + 23);
        return {
            session_expiry_time: tomorrow,
            refresh_expiry_time: tomorrow,
        };
    }

    static createSessionExpiryTime(sessionExpiryTime = undefined, refreshExpiryTime = undefined) {
        return {
            refresh_expiry_time: refreshExpiryTime,
            session_expiry_time: sessionExpiryTime,
        };
    }

    // There are two tokens, Session and Refresh that manage the users access. Refresh is a long life token that can be
    // used to get a new session token. The session token is what gives the user access to the system and has a very
    // short life. If the user is active then we extend their session. The refresh token has a long life but also
    // expires and can't be renewed. So we extend it one last timse and let the user know they will be kicked out and
    // need to sign back in manually
    static setSessionExpiryTime = (sessionExpiryTime, refreshExpiryTime) => {
        const session = sessionManagement.createSessionExpiryTime(sessionExpiryTime, refreshExpiryTime);
        updateAuthState(session);
        this.initialiseSessionExpiryTimers(sessionExpiryTime, refreshExpiryTime);
    };

    static removeTimers = () => {
        this.removeInteractionMonitoring();
        this.removeWarnings();
        for (const [key] of Object.entries(this.timers)) {
            clearTimeout(this.timers[key]);
        }
        this.timers = {};
    };

    static startSessionTimer(sessionExpiryTime) {
        // Timer to start monitoring user interaction to add additional time to their session
        this.startExpiryTimer("sessionTimerPassive", sessionExpiryTime, this.timeOffsets.passiveRenewal, this.monitorInteraction);
        // Timer to tell the user their session is about to expire unless they interact with the page
        this.startExpiryTimer("sessionTimerInvasive", sessionExpiryTime, this.timeOffsets.invasiveRenewal, this.warnSessionSoonExpire);
    }

    static startRefreshTimer(refreshExpiryTime) {
        // Timer to start monitoring user interaction to add a final extra amount of time to their session
        this.startExpiryTimer("refreshTimerPassive", refreshExpiryTime, this.timeOffsets.passiveRenewal, this.monitorInteraction);
        // Timer to notify user they are on their last two minutes of using Florence and will need to sign out and back in
        this.startExpiryTimer("refreshTimerInvasive", refreshExpiryTime, this.timeOffsets.invasiveRenewal, this.warnRefreshSoonExpire);
    }

    static initialiseSessionExpiryTimers = (sessionExpiryTime, refreshExpiryTime) => {
        if (sessionExpiryTime) {
            sessionManagement.startSessionTimer(sessionExpiryTime);
        }
        if (refreshExpiryTime) {
            sessionManagement.startRefreshTimer(refreshExpiryTime);
        }
    };

    static convertUTCToJSDate(expiryTime) {
        // Convert API time to usable JS Date object
        if (expiryTime) {
            const expireTimeInUTCString = expiryTime.replace(" +0000 UTC", ""); //- this doesn't work
            // See https://github.com/ONSdigital/florence/blob/5a216ab029c945787997162af57263c819e15b5f/src/app/utilities/sessionManagement.js#L55
            return new Date(expireTimeInUTCString);
        }
        return null;
    }

    /** If expiryTime is UTC use convertUTCToJSDate */
    static startExpiryTimer = (name, expiryTime, offsetInMilliseconds, callback) => {
        // TODO testing ---->
        if (name === "sessionTimerPassive") {
            offsetInMilliseconds = 3480000;
        }
        if (name === "sessionTimerInvasive") {
            offsetInMilliseconds = 3570000;
        }
        // <----- Testing

        if (expiryTime) {
            // Convert 'now' into UTC (new Date() returns local time (could be different country or just BST))
            const now = new Date();
            const nowUTCInMS = now.getTime() + now.getTimezoneOffset() * 60000;
            const nowInUTC = new Date(nowUTCInMS);
            console.log({
                expiryTime,
                offsetInMilliseconds,
                nowInUTC,
            });
            // Get the time difference between now and the expiry time minus the timer offset
            const timerInterval = expiryTime - offsetInMilliseconds - nowInUTC;
            if (this.timers[name] != null) {
                clearTimeout(this.timers[name]);
            }
            this.timers[name] = setTimeout(callback, timerInterval);
            console.log("time interval: ", {
                [name]: timerInterval,
            });
        }
    };

    static monitorInteraction = () => {
        this.eventsToMonitor.forEach(name => {
            document.addEventListener(name, this.refreshSession);
        });
    };

    static removeInteractionMonitoring = () => {
        this.eventsToMonitor.forEach(name => {
            document.removeEventListener(name, this.refreshSession);
        });
    };

    static warnSessionSoonExpire = () => {
        this.removeInteractionMonitoring();
        const popoutOptions = {
            id: "session-expire-soon",
            title: "Your session will end in 1 minute",
            body: "This is because you have been inactive. If you want to continue using Florence you must stay signed in. If not, you will be signed out and will need to sign in again.",
            buttons: [
                {
                    onClick: () => {
                        this.refreshSession();
                    },
                    text: "Stay signed in",
                    style: "primary",
                },
            ],
        };
        store.dispatch(addPopout(popoutOptions));
    };

    static warnRefreshSoonExpire = () => {
        console.log("WARNING!!!!!!");
        this.removeInteractionMonitoring();
        const popoutOptions = {
            id: "refresh-expire-soon",
            title: "Sorry, you need to sign back in again",
            body: "This is because you have been signed in for the maximum amount of time possible. Please save your work and sign back in to continue using Florence.",
            buttons: [
                {
                    onClick: () => {
                        // One final refresh before it expires to give the user as much time as possible to save their work
                        this.refreshSession();
                    },
                    text: "Ok",
                    style: "primary",
                },
            ],
        };
        store.dispatch(addPopout(popoutOptions));
    };

    static removeWarnings = () => {
        store.dispatch(removePopouts(["session-expire-soon", "refresh-expire-soon"])); // Todo all
    };

    static refreshSession = () => {
        this.removeInteractionMonitoring();
        this.removeWarnings();
        const renewError = error => {
            console.error("an unexpected error has occurred when extending the users session");
            if (error != null) {
                console.error(error);
            }
            const notification = {
                type: "warning",
                message: errorCodes.REFRESH_SESSION_ERROR,
                isDismissable: true,
                autoDismiss: 20000,
            };
            notifications.add(notification);
        };
        user.renewSession()
            .then(response => {
                if (response) {
                    const expirationTime = sessionManagement.convertUTCToJSDate(fp.get("expirationTime")(response));
                    sessionManagement.startSessionTimer(expirationTime);
                    const refresh_expiry_time = fp.get("refresh_expiry_time")(getAuthState());
                    store.dispatch(startRefeshAndSession(refresh_expiry_time, expirationTime));
                } else {
                    renewError();
                }
            })
            .catch(error => {
                renewError(error);
            });
    };

    /**
     *  @param sessionExpiryTime must be in js date format (not UTC from server)
     *  @returns true if session has expired
     *  */
    static isSessionExpired(sessionExpiryTime) {
        let timeDiff = new Date() - sessionExpiryTime;
        let diffInSeconds = Math.round(timeDiff / 1000);
        if (diffInSeconds <= 0) {
            return false;
        }
        return true;
    }
}
