import React, { Component } from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import { customStyles, labelCustomStyle } from "./selectTagsCustomStyle";

const propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    contents: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            options: PropTypes.arrayOf(
                PropTypes.shape({
                    label: PropTypes.string.isRequired,
                    value: PropTypes.string.isRequired,
                })
            ),
        })
    ).isRequired,
    handleChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
    error: PropTypes.string,
};

class SelectTags extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"form__input" + (this.props.error ? " form__input--error" : "")}>
                <label style={labelCustomStyle} className="form__label" htmlFor={this.props.id}>
                    {this.props.label}
                </label>
                {this.props.error && (
                    <div className="error-msg" role="alert">
                        {this.props.error}
                    </div>
                )}
                <Select
                    maxMenuHeight={250}
                    onChange={this.props.handleChange}
                    options={this.props.contents}
                    isMulti={this.props.multipleSelection}
                    styles={customStyles}
                />
            </div>
        );
    }
}
SelectTags.propTypes = propTypes;
export default SelectTags;
