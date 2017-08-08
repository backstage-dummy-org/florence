import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';

const propTypes = {
    label: PropTypes.string,
    id: PropTypes.string.isRequired,
    url: PropTypes.string,
    error: PropTypes.string,
    extension: PropTypes.string,
    accept: PropTypes.string
}

class FileUpload extends Component {
    constructor(props) {
        super(props);
    }

    renderInput() {
        return (
            <Input 
                label={this.props.label}
                id={this.props.id}
                type="file"
                accept={this.props.accept}
                error={this.props.error}
            />
        )
    }

    renderLink() {
        return (
            <div className="margin-bottom--2">
                <div>
                    {this.props.label}
                </div>
                <a href={this.props.url} target="_blank" rel="noopener noreferrer">{this.props.url}</a> 
            </div>
        )
    }

    render() {
        return (
            <div className="grid">
                    {this.props.url && !this.props.error ?
                        this.renderLink()
                    :
                        <div className="grid__col-6 margin-bottom--1">
                            {this.renderInput()}
                        </div>
                    }
            </div>
        )
    }
}

FileUpload.propTypes = propTypes;

export default FileUpload;