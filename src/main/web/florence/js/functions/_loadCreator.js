function loadCreator (collectionId) {
  var pageType, releaseDate;

  getCollection(collectionId,
    success = function (response) {
      if (!response.publishDate) {
        releaseDate = null;
      } else {
        releaseDate = response.publishDate;
      }
    },
    error = function (response) {
      handleApiError(response);
    }
  );

  $('select').off().change(function () {
    pageType = $(this).val();
    var parentUrl = localStorage.getItem("pageurl");

    if (pageType === 'bulletin' || pageType === 'article') {
      loadT4Creator(collectionId, releaseDate, pageType, parentUrl);
    }

    else if (pageType === 'compendium-landing-page') {
      loadT6Creator(collectionId, releaseDate, pageType, parentUrl);
    }

    else if (pageType.match(/static_.+/)) {
      loadT7Creator(collectionId, releaseDate, pageType, parentUrl);
    }

    else if (pageType === 'reference_tables' || pageType === 'dataset') {
      loadT8Creator(collectionId, releaseDate, pageType, parentUrl);
    }
  });
}

