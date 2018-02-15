/**
 * validates collection data
 * 
 * @returns {object{isValid: boolean, errorMsg: string}} - Returns object with isValid boolean and an optional error message of why it's not valid
 */

export default class collectionValidation {

    static name(name) {
        if (!name || name.match(/^\s*$/)) {
            return {
                isValid: false,
                errorMsg: "Collections must be given a name"
            }
        }

        return {
            isValid: true,
            errorMsg: ""
        };
    }

    static date(date) {
        if (!date) {
            return {
                isValid: false,
                errorMsg: "Scheduled collections must be given a publish date"
            };
        }

        return {
            isValid: true,
            errorMsg: ""
        };
    }
    
    static time(time) {
        if (!time) {
            return {
                isValid: false,
                errorMsg: "Scheduled collections must be given a publish time"
            };
        }

        return {
            isValid: true,
            errorMsg: ""
        };
    }

    static release(releaseURI, releaseDateISO, releaseTitle) {
        if (!releaseURI) {
            return {
                isValid: false,
                errorMsg: "Release must have a URI"
            };
        }
        
        if (!releaseDateISO) {
            return {
                isValid: false,
                errorMsg: "Release must have a release date"
            };
        }
        
        if (!releaseTitle) {
            return {
                isValid: false,
                errorMsg: "Release must have a title"
            };
        }

        return {
            isValid: true,
            errorMsg: ""
        };
    }

    static type(publishType) {
        if (!publishType) {
            return {
                isValid: false,
                errorMsg: "Collections must have a publish type"
            }
        }
        
        if (publishType !== "manual" && publishType !== "scheduled") {
            return {
                isValid: false,
                errorMsg: "Collections must have a publish type"
            }
        }

        return {
            isValid: true,
            errorMsg: ""
        }
    }
}