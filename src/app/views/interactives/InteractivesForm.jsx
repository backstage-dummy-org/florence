import React, { useEffect, useState } from "react";
import { browserHistory, Link } from "react-router";

import { createInteractive, getInteractive, editInteractive, resetInteractiveError } from "../../actions/interactives";

import BackButton from "../../components/back-button";
import Input from "../../components/Input";
import ButtonWithShadow from "../../components/button/ButtonWithShadow";
import FooterAndHeaderLayout from "../../components/layout/FooterAndHeaderLayout";
import { useDispatch, useSelector } from "react-redux";

export default function InteractivesForm(props) {
    const dispatch = useDispatch();
    const { successMessage, interactive, errors } = useSelector(state => state.interactives);
    const { rootPath } = useSelector(state => state.state);

    const [internalId, setInternalId] = useState("");
    const [title, setTitle] = useState("");
    const [label, setLabel] = useState("");
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [interactiveId, setInteractiveId] = useState("");
    const [published, setPublished] = useState(false);

    useEffect(() => {
        const { interactiveId } = props.params;
        if (interactiveId) {
            setInteractiveId(interactiveId);
            dispatch(getInteractive(interactiveId));
        } else {
            setInternalId("");
            setTitle("");
            setLabel("");
            setFile(null);
            setUrl("");
            setInteractiveId("");
            setPublished(false);
        }
        dispatch(resetInteractiveError());
    }, []);

    useEffect(() => {
        if (interactive.metadata && interactiveId) {
            const { metadata } = interactive;
            setInternalId(metadata.internal_id);
            setTitle(metadata.title);
            setLabel(metadata.label);
            setUrl(`${window.location.origin}/interactives/${metadata.slug}-${metadata.resource_id}/embed`);
            setPublished(metadata.published);
        }
    }, [interactive]);

    useEffect(() => {
        if (successMessage.success) {
            if (successMessage.type === "create") {
                browserHistory.push(`${rootPath}/interactives`);
            }
            if (successMessage.type === "update") {
                browserHistory.push(`${rootPath}/interactives`);
            }
        }
    }, [successMessage]);

    const onSubmit = e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
            "interactive",
            JSON.stringify({
                id: interactiveId,
                metadata: {
                    internal_id: internalId,
                    title: title,
                    label: label,
                },
            })
        );
        interactiveId ? dispatch(editInteractive(interactiveId, formData)) : dispatch(createInteractive(formData));
    };

    const handleDelete = e => {
        e.preventDefault();
        browserHistory.push(`${rootPath}/interactives/delete/${interactiveId}`);
    };

    const handleFile = e => {
        const file = e.target.files[0];
        setFile(file);
    };

    const displayedErrors =  Object.values(errors);

    return (
        <FooterAndHeaderLayout title="Manage my interactives">
            <div className="grid grid--justify-space-around padding-bottom--2">
                <div className="grid__col-sm-12 grid__col-md-10 grid__col-xlg-8">
                    <BackButton redirectUrl={`${rootPath}/interactives`} classNames="ons-breadcrumb__item" />
                    {
                        (displayedErrors.length > 0) && <div className="grid__col-sm-12 grid__col-xl-4 padding-top--2">
                            <div className="ons-panel ons-panel--errors">
                                <div className="ons-panel--errors__title">
                                    <span className="">There are {displayedErrors.length} problems with your answer: </span>
                                </div>
                                <div className="ons-panel--errors__body">
                                    {
                                        displayedErrors.map((error, index) => {
                                            return <p>{index + 1}. <span>{error}</span> </p>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    }

                    <h1 className="ons-u-fs-xxl ons-u-mt-l">{!interactiveId ? "Upload a new interactive" : "Edit an existing interactive"}</h1>

                    {published && (
                        <div className="ons-panel ons-panel--info ons-panel--no-title">
                            <span className="ons-u-vh">Important information: </span>
                            <div className="ons-panel__body">
                                <p>This interactive has been published. You can only update the archive file via the upload button below.</p>
                            </div>
                        </div>
                    )}

                    {/* FORM */}
                    <div className="grid__col-sm-12 grid__col-xl-4">
                        {errors.internalId ? (
                            <div className="ons-panel ons-panel--error ons-panel--no-title ons-u-mb-s margin-bottom--1" id="error-panel">
                                <span className="ons-u-vh">Error: </span>
                                <div className="ons-panel__body">
                                    <p className="ons-panel__error">
                                        <strong>{ errors.internalId }</strong>
                                    </p>
                                    <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                        <Input
                                            type="text"
                                            id="internal_id"
                                            className="ons-input ons-input--text ons-input-type__input"
                                            name="internal_id"
                                            disabled={props.isAwaitingResponse}
                                            value={internalId}
                                            error={""}
                                            required
                                            onChange={e => setInternalId(e.target.value)}
                                            label="Internal ID"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                <Input
                                    type="text"
                                    id="internal_id"
                                    className="ons-input ons-input--text ons-input-type__input"
                                    name="internal_id"
                                    disabled={props.isAwaitingResponse}
                                    value={internalId}
                                    error={""}
                                    required
                                    onChange={e => setInternalId(e.target.value)}
                                    label="Internal ID"
                                />
                            </div>
                        )}
                        {errors.title ? (
                            <div className="ons-panel ons-panel--error ons-panel--no-title ons-u-mb-s margin-bottom--1" id="error-panel">
                                <span className="ons-u-vh">Error: </span>
                                <div className="ons-panel__body">
                                    <p className="ons-panel__error">
                                        <strong>{ errors.title }</strong>
                                    </p>
                                    <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                        <Input
                                            type="text"
                                            id="title"
                                            className="ons-input ons-input--text ons-input-type__input"
                                            name="title"
                                            disabled={props.isAwaitingResponse}
                                            value={title}
                                            required
                                            onChange={e => setTitle(e.target.value)}
                                            label="Title"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                <Input
                                    type="text"
                                    id="title"
                                    className="ons-input ons-input--text ons-input-type__input"
                                    name="title"
                                    disabled={props.isAwaitingResponse}
                                    value={title}
                                    required
                                    onChange={e => setTitle(e.target.value)}
                                    label="Title"
                                    helpMessage="It will help to search for the interactive later"
                                />
                            </div>
                        )}
                        {errors.label ? (
                            <div className="ons-panel ons-panel--error ons-panel--no-title ons-u-mb-s margin-bottom--1" id="error-panel">
                                <span className="ons-u-vh">Error: </span>
                                <div className="ons-panel__body">
                                    <p className="ons-panel__error">
                                        <strong>{ errors.label }</strong>
                                    </p>
                                    <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                        <Input
                                            type="text"
                                            id="label"
                                            className="ons-input ons-input--text ons-input-type__input"
                                            name="label"
                                            disabled={props.isAwaitingResponse}
                                            value={label}
                                            required
                                            onChange={e => setLabel(e.target.value)}
                                            label="Label"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                <Input
                                    type="text"
                                    id="label"
                                    className="ons-input ons-input--text ons-input-type__input"
                                    name="label"
                                    disabled={props.isAwaitingResponse}
                                    value={label}
                                    required
                                    onChange={e => setLabel(e.target.value)}
                                    label="Label"
                                    helpMessage="It will be used to generate the URL"
                                />
                            </div>
                        )}
                        {errors.file ? (
                            <div className="ons-panel ons-panel--error ons-panel--no-title ons-u-mb-s margin-bottom--1" id="error-panel">
                                <span className="ons-u-vh">Error: </span>
                                <div className="ons-panel__body">
                                    <p className="ons-panel__error">
                                        <strong>{ errors.file }</strong>
                                    </p>
                                    <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                        <Input
                                            type="file"
                                            id="file"
                                            name="file"
                                            accept=".zip"
                                            className="ons-input ons-input--text ons-input-type__input ons-input--upload"
                                            required
                                            onChange={handleFile}
                                            label="Upload a file"
                                            helpMessage="File types accepted are XLS and XLSX or PDF"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                <Input
                                    type="file"
                                    id="file"
                                    name="file"
                                    accept=".zip"
                                    className="ons-input ons-input--text ons-input-type__input ons-input--upload"
                                    required
                                    onChange={handleFile}
                                    label="Upload a file"
                                    helpMessage="Only file type accepted is ZIP"
                                />
                            </div>
                        )}

                        {interactiveId && (
                            <>
                                {errors.msg ? (
                                    <div className="ons-panel ons-panel--error ons-panel--no-title ons-u-mb-s" id="error-panel">
                                        <span className="ons-u-vh">Error: </span>
                                        <div className="ons-panel__body">
                                            <p className="ons-panel__error">
                                                <strong>Enter a correct URL</strong>
                                            </p>
                                            <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                                <Input
                                                    type="text"
                                                    id="url"
                                                    className="ons-input ons-input--text ons-input-type__input"
                                                    name="url"
                                                    disabled={props.isAwaitingResponse}
                                                    value={url}
                                                    required
                                                    onChange={e => setUrl(e.target.value)}
                                                    label="URL"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid__col-sm-12 grid__col-md-6 grid__col-xl-4">
                                        <Input
                                            type="text"
                                            id="url"
                                            className="ons-input ons-input--text ons-input-type__input"
                                            name="url"
                                            disabled={true}
                                            value={url}
                                            required
                                            onChange={e => setUrl(e.target.value)}
                                            label="URL"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <div className="inline-block padding-top--1">
                            {!interactiveId ? (
                                <ButtonWithShadow type="submit" buttonText="Confirm" onClick={onSubmit} isSubmitting={false} />
                            ) : (
                                <div className="inline-block">
                                    <ButtonWithShadow type="submit" buttonText="Save changes" onClick={onSubmit} isSubmitting={false} />
                                    <Link
                                        to={`${rootPath}/interactives/show/${interactiveId}`}
                                        target="_blank"
                                        className="ons-btn ons-btn--secondary"
                                    >
                                        <span className="ons-btn__inner">Preview</span>
                                    </Link>
                                    <ButtonWithShadow
                                        type="button"
                                        buttonText="Delete interactive"
                                        class="secondary"
                                        onClick={handleDelete}
                                        isSubmitting={false}
                                        disabled={published}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FooterAndHeaderLayout>
    );
}
