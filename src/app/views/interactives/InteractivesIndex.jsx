import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { editInteractive, filterInteractives, getInteractives, resetSuccessMessage, sortInteractives } from "../../actions/interactives";
import { Link } from "react-router";
import AlertSuccess from "../../components/alert/AlertSuccess";
import FooterAndHeaderLayout from "../../components/layout/FooterAndHeaderLayout";
import Input from "../../components/Input";
import Select from "../../components/Select";
import ButtonWithShadow from "../../components/button/ButtonWithShadow";
import Chip from "../../components/chip/Chip";
import moment from "moment";
import { getParameterByName, isInArray } from "../../utilities/utils";
import BackButton from "../../components/back-button";
import collections from "../../utilities/api-clients/collections";

export default function InteractivesIndex(props) {
    const dispatch = useDispatch();
    const { filteredInteractives, successMessage } = useSelector(state => state.interactives);
    const { rootPath } = useSelector(state => state.state);

    const [internalId, setInternalId] = useState("");
    const [title, setTitle] = useState("");
    const [sort, setSort] = useState("");

    const [successCreate, setSuccessCreate] = useState(false);
    const [successUpdate, setSuccessUpdate] = useState(false);
    const [successDelete, setSuccessDelete] = useState(false);
    const [collection, setCollection] = useState({});
    const [collectionId, setCollectionId] = useState("");

    useEffect(() => {
        setCollectionId(getParameterByName("collection"));
        dispatch(getInteractives());
    }, []);

    useEffect(() => {
        if (collectionId) {
            const fetchCollection = async () => {
                return await collections.get(collectionId);
            };
            fetchCollection()
                .then(data => {
                    setCollection(data);
                })
                .catch(console.error);
            setSort("date");
        }
    }, [collectionId]);

    useEffect(() => {
        if (sort) {
            dispatch(sortInteractives(sort));
        }
    }, [filteredInteractives, sort]);

    useEffect(() => {
        if (successMessage.success) {
            if (successMessage.type === "create") {
                setSuccessCreate(true);
            }
            if (successMessage.type === "update") {
                setSuccessUpdate(true);
            }
            if (successMessage.type === "delete") {
                setSuccessDelete(true);
            }
            dispatch(resetSuccessMessage());
        }
    }, [successMessage]);

    const sortOptions = [
        { id: "date", name: "Latest updated" },
        { id: "title", name: "Title" },
    ];

    const handleFilter = () => {
        let filters = {};
        if (title !== "") {
            filters = Object.assign({}, filters, {
                label: title,
            });
        }
        if (internalId !== "") {
            filters = Object.assign({}, filters, {
                internalId,
            });
        }
        dispatch(filterInteractives(filters));
    };

    const linkToCollection = interactive => {
        const formData = new FormData();
        const { id: interactiveId, metadata } = interactive;
        const { internal_id, title, label } = metadata;
        formData.append(
            "interactive",
            JSON.stringify({
                id: interactiveId,
                metadata: {
                    internal_id,
                    title,
                    label,
                    collection_id: collectionId,
                },
            })
        );
        dispatch(editInteractive(interactiveId, formData));
        dispatch(getInteractives());
    };

    const getChips = interactive => {
        const { state, published, metadata } = interactive;
        let chips = [];

        if (metadata.collection_id) {
            chips.push(<Chip style="standard" text="LINKED TO COLLECTION" />);
        } else if (published) {
            chips.push(<Chip style="green" text="PUBLISHED" />);
        }

        switch (state) {
            case "ArchiveUploaded":
            case "ArchiveDispatchedToImporter":
                chips.push(<Chip style="blue" text="UPLOADING" />);
                break;
            case "ImportSuccess":
                chips.push(<Chip style="blue" text="UPLOADED" />);
                break;
            case "ArchiveDispatchFailed":
            case "ImportFailure":
                chips.push(<Chip style="red" text="ERROR" />);
                break;
            default:
                chips.push(<Chip style="red" text="ERROR" />);
        }
        return chips;
    };

    return (
        <FooterAndHeaderLayout title="Manage my interactives">
            <div className="grid grid--justify-space-around padding-bottom--2">
                <div className="grid__col-sm-12 grid__col-md-10 grid__col-xlg-8">
                    {collectionId && (
                        <BackButton
                            redirectUrl={`${rootPath}/collections/${collectionId}`}
                            classNames={`ons-breadcrumb__item ${successUpdate && "padding-bottom--1"}`}
                        />
                    )}
                    {successCreate && <AlertSuccess classNames="margin-top--1" text="Interactive has been successfully submitted" />}
                    {successUpdate && <AlertSuccess classNames="margin-top--1" text="Interactive has been successfully updated" />}
                    {successDelete && <AlertSuccess classNames="margin-top--1" text="Interactive has been successfully deleted" />}
                    {collectionId && (
                        <>
                            <h2 className="ons-u-fs-xxl ons-u-mt-l margin-top--1">Selected collection: {collection.name}</h2>
                            <h1 className="margin-top--1">Select an available Interactive to link</h1>
                        </>
                    )}
                    <div className="grid grid--justify-space-around margin-top--1">
                        <div className="grid__col-sm-12 grid__col-md-3">
                            <h3 className="text-left">Filter by</h3>
                            <Input
                                type="text"
                                id="internal_id"
                                placeholder=""
                                name="internal_id"
                                onChange={e => setInternalId(e.target.value)}
                                label="Internal ID"
                                value={internalId}
                            />
                            <Input
                                type="text"
                                id="title"
                                placeholder=""
                                name="title"
                                onChange={e => setTitle(e.target.value)}
                                data-testid="title-input"
                                label="Title"
                                value={title}
                            />
                            <div className="inline-block margin-top--2 margin-bottom--5">
                                <ButtonWithShadow type="button" buttonText="Apply" onClick={handleFilter} isSubmitting={false} />
                            </div>
                        </div>
                        <div className="grid__col-sm-12 grid__col-md-7">
                            <div className="grid--justify-space-between" style={{ display: "flex" }}>
                                <div>
                                    <b className="font-size--18">{filteredInteractives.length} results </b>
                                </div>
                                <div>
                                    <ButtonWithShadow
                                        type="button"
                                        buttonText="Upload interactive"
                                        class="secondary"
                                        onClick={() => props.router.push(`${rootPath}/interactives/create?collection=${collectionId}`)}
                                        isSubmitting={false}
                                    />
                                </div>
                            </div>
                            <hr className="ons-separator__regular margin-top--1" />
                            <div className="grid--justify-space-between sort-container" style={{ display: "flex" }}>
                                <div className="grid--align-center margin-top--1" style={{ display: "flex" }}>
                                    <label className="ons-label padding-right--1" htmlFor="sort-options">
                                        Sort by
                                    </label>
                                    <Select contents={sortOptions} selectedOption={sort} id="sort-options" onChange={e => setSort(e.target.value)} />
                                </div>
                            </div>
                            <hr className="ons-separator__light margin-bottom--1" />
                            <ul className="list--neutral list--neutral__chips" role="list">
                                {filteredInteractives.map((interactive, key) => {
                                    const { id, metadata, last_updated } = interactive;
                                    return (
                                        <li key={key} className="list__item" role="listitem">
                                            <div style={{ display: "flex" }}>
                                                <div className="list__item__title grid__col-sm-12 grid__col-md-6">
                                                    <Link to={`${rootPath}/interactives/edit/${id}?collection=${collectionId}`}>
                                                        {metadata.title} {metadata.internal_id}
                                                    </Link>
                                                    <p>Last edited on {moment(last_updated).format("Do MMMM YYYY")}</p>
                                                </div>
                                                <div className="list__item__statuses grid__col-sm-12 grid__col-md-3">{getChips(interactive)}</div>
                                                <div className="list__item__buttons grid__col-sm-12 grid__col-md-3">
                                                    <div>
                                                        {collectionId && (
                                                            <ButtonWithShadow
                                                                type="button"
                                                                buttonText="Link"
                                                                class="success"
                                                                onClick={() => linkToCollection(interactive)}
                                                                isSubmitting={false}
                                                                disabled={metadata.collection_id}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <hr className="ons-separator__light margin-top--1" />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </FooterAndHeaderLayout>
    );
}
