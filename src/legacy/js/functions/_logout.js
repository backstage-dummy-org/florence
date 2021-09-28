/**
 * Logout the current user and return to the login screen.
 */
async function logout() {
    if (Florence.globalVars.config.enableNewSignIn) {
        const response = await fetch('/tokens/self', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await response.json()
        if (data.status === 400) {
            sweetAlert("An error occurred during sign out 'InvalidToken', please contact a system administrator");
            console.error("Error occurred sending DELETE to /tokens/self - InvalidToken");
        } else if (data.status !== 204) {
            sweetAlert("Unexpected error occurred during sign out");
            console.error("Error occurred sending DELETE to /tokens/self");
        }
    }
    delete_cookie('access_token');
    delete_cookie('collection');
    localStorage.setItem("loggedInAs", "");
    localStorage.setItem("userType", "");

    // Redirect to refactored login page
    window.location.pathname = "/florence/login";
}

function delete_cookie(name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}