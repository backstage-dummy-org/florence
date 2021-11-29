import React, { useEffect, useState } from "react";
import { push } from "react-router-redux";
import CollectionCreateController from "./create/CollectionCreateController";
import DoubleSelectableBoxController from "../../components/selectable-box/double-column/DoubleSelectableBoxController";
import notifications from "../../utilities/notifications";
import CollectionDetailsController from "./details/CollectionDetailsController";
import cookies from "../../utilities/cookies";
import Loader from "../../components/loader";
import Search from "../../components/search";
import collectionMapper from "./mapper/collectionMapper";

const Collections = props => {
    const { user, collections, isLoading, workingOn, updateWorkingOn, search, activeCollection } = props;
    const isViewer = user && user.userType === "VIEWER";

    useEffect(() => {
        props.loadCollections();
    }, []);

    useEffect(() => {
        if (workingOn && workingOn.id) document.getElementById(workingOn.id).scrollIntoView();
    }, [workingOn]);

    const handleCollectionClick = id => {
        if (isViewer) {
            cookies.add("collection", id, null);
            updateWorkingOn(id);
            props.dispatch(push(`${props.rootPath}/collections/${id}/preview`));
            return;
        }
        props.dispatch(push(`${props.rootPath}/collections/${id}`));
    };

    const getNotCompletedCollections = () =>
        isViewer && collections ? collections : collections.filter(collection => collection.approvalStatus !== "COMPLETE");

    return (
        <>
            <div className="grid grid--justify-space-around">
                <div className={isViewer ? "grid__col-8" : "grid__col-4"}>
                    <h1 className="text-center">Select a collection</h1>
                    <Search />
                    {isLoading && <Loader classNames="grid grid--align-center grid--align-self-center grid--full-height" />}
                    <DoubleSelectableBoxController
                        items={getNotCompletedCollections()}
                        activeItemID={props.params.collectionID}
                        isUpdating={isLoading}
                        search={props.search}
                        headings={["Name", "Publish date"]}
                        handleItemClick={handleCollectionClick}
                    />
                </div>
                {!isViewer && (
                    <div className="grid__col-4">
                        <h1 className="text-center">Create a collection</h1>
                        <CollectionCreateController collections={collections} user={user} />
                    </div>
                )}
            </div>
            {props.params.collectionID && <CollectionDetailsController collectionID={props.params.collectionID} routes={props.routes} />}
        </>
    );
};

export default Collections;
