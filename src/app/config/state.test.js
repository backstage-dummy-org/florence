import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import { userLoggedIn, userLoggedOut } from './actions';
import initialState from './initialState';
import reducer from './reducer';

test('Reducer returns proper initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
});

test('userLoggedIn action and USER_LOGGED_IN reducer should work', () => {
    const action = userLoggedIn("foo@bar.com", "PUBLISHER", false);
    expect(reducer({}, action)).toEqual({
        user: {
            isAuthenticated: true,
            email: "foo@bar.com",
            userType: "PUBLISHER",
            isAdmin: false
        }
    });
});

test('userLoggedOut action and USER_LOGGED_OUT reducer should work', () => {
    const action = userLoggedOut();
    expect(reducer({}, action)).toEqual({
        user: {
            isAuthenticated: false
        }
    });
});