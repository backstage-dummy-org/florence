import React, { Component } from "react";
import PropTypes from "prop-types";

import SimpleSelectableListItem from "./SimpleSelectableListItem";

const propTypes = {
    rows: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
            externalLink: PropTypes.bool,
            details: PropTypes.arrayOf(PropTypes.string),
            extraDetails: PropTypes.arrayOf(
                PropTypes.arrayOf(PropTypes.shape({ content: PropTypes.oneOfType[(PropTypes.string, PropTypes.object)], classes: PropTypes.string }))
            ),
        })
    ).isRequired,
    showLoadingState: PropTypes.bool,
};

export default class SimpleSelectableList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const showLoadingState = this.props.showLoadingState;
        const hasRows = this.props.rows.length;
        const colCount = hasRows && this.props.rows[0].extraDetails ? this.props.rows[0].extraDetails.length + 1 : 1;
        return (
            <ul className="list list--neutral simple-select-list">
                {hasRows
                    ? this.props.rows.map(row => {
                          return <SimpleSelectableListItem key={row.id} colCount={colCount} {...row} />;
                      })
                    : null}
                {showLoadingState && <span className="margin-top--1 loader loader--dark" />}
                {!hasRows && !showLoadingState ? <p>Nothing to show</p> : ""}
            </ul>
        );
    }
}

SimpleSelectableList.propTypes = propTypes;
