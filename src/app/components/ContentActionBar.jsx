import React from "react";

import PropTypes from "prop-types";

const buttonStyle = {
    POSITIVE: "positive",
    PRIMARY: "primary",
    NEGATIVE: "negative",
    INVERSE: "inverse",
    WARNING: "warning",
    SUBTLE: "subtle",
    INVERT_PRIMARY: "invert-primary",
}
let buttonStyleArray = Object.values(buttonStyle)
const propTypes = {
    unsavedChanges: PropTypes.bool.isRequired,
    buttons: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        link: PropTypes.string,
        style: PropTypes.oneOf(buttonStyleArray),
        disabled: PropTypes.bool
    })),
    cancel: PropTypes.func,
    cancelDisabled: PropTypes.bool,
    stickToBottom: PropTypes.bool
};

const ContentActionBar = props => {

    let outerContainerClasses = props.stickToBottom ? "content-action-bar" : "";
    return (
        <div className={outerContainerClasses}>
            <div className="grid grid--justify-left padding-bottom--1 padding-top--1">
                {props.buttons.map((btn, index) => {
                    let classes = "btn"
                    if (btn.style !== null) {
                        classes += ` btn--${btn.style}`
                    }
                    classes += (index > 0) ? " margin-left--1" : ""
                    return (<button
                        id={btn.id}
                        type="button"
                        onClick={btn.onClick}
                        disabled={btn.disabled}
                        className={classes}
                    >{btn.text}</button>)
                })}
                {props.cancel && <button
                    id="cancel"
                    type="button"
                    onClick={props.cancel}
                    disabled={props.cancelDisabled}
                    className="btn btn--invert-primary margin-left--1"
                >Cancel</button>}
                {props.unsavedChanges &&
                <svg className="svg-icon--action-bar margin-left--1" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 512 512" focusable="false">
                    <path d="M256,34.297L0,477.703h512L256,34.297z M256,422.05c-9.22,0-16.696-7.475-16.696-16.696s7.475-16.696,16.696-16.696
                        c9.22,0,16.696,7.475,16.696,16.696S265.22,422.05,256,422.05z M239.304,344.137V177.181h33.391v166.956H239.304z"/>
                </svg>}
                {props.unsavedChanges &&
                <span className="content-action-bar__warn"> You have unsaved changes</span>}

            </div>
        </div>
    );
};
ContentActionBar.propTypes = propTypes;
export default ContentActionBar;
