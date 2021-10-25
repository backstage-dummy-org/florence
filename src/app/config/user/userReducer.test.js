import { userLoggedIn, userLoggedOut } from "./userActions";

import reducer from "./userReducer";

jest.mock("../../utilities/log", () => {
    return {
        add: function () {
            // do nothing
        },
        eventTypes: {},
    };
});

describe("userReducer", () => {
    it("should return the initial state", () => {
        expect(reducer(undefined, {})).toEqual({
            isAuthenticated: false,
            email: "",
            userType: "",
            isAdmin: false,
        });
    });

    it("should handle a userLoggedIn action", () => {
        const previousState = {};
        expect(reducer(previousState, userLoggedIn("foo@bar.com", "PUBLISHER", false))).toEqual({
            isAuthenticated: true,
            email: "foo@bar.com",
            userType: "PUBLISHER",
            isAdmin: false,
        });
    });

    it("should handle a userLoggedOut action", () => {
        const previousState = {
            isAuthenticated: true,
            email: "foo@bar.com",
            userType: "PUBLISHER",
            isAdmin: false,
        };
        expect(reducer(previousState, userLoggedOut())).toEqual({
            isAuthenticated: false,
            email: null,
            userType: null,
            isAdmin: null,
        });
    });
});
