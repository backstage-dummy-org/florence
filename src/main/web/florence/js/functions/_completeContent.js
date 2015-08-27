function saveAndCompleteContent(collectionId, path, content) {
  postContent(collectionId, path, content,
    success = function () {
      Florence.Editor.isDirty = false;
      completeContent(collectionId, path);
    },
    error = function (response) {
      if (response.status === 400) {
        alert("Cannot edit this page. It is already part of another collection.");
      }
      else if (response.status === 401) {
        alert("You are not authorised to update content.");
      }
      else {
        handleApiError(response);
      }
    });
}

function completeContent(collectionId, path) {
  var safePath = checkPathSlashes(path);
  // Update content
  $.ajax({
    url: "/zebedee/complete/" + collectionId + "?uri=" + safePath + "/data.json",
    dataType: 'json',
    type: 'POST',
    success: function () {
      viewCollections(collectionId);
    },
    error: function (response) {
      handleApiError(response);
    }
  });
}
