function createCollection() {

  var publishDate, publishTime, collectionName, collectionType;
  publishDate  = $('#date').val();
  publishTime  = $('#time').val();
  collectionName = $('#collectionname').val();
  collectionType = $('form input[type=radio]:checked').val();
  var tempDate = publishDate + ' ' + publishTime;

  if (collectionType === 'scheduled') {
    var collectionDate = new Date(tempDate);
  } else {
    var publishDate = null;
  };

  // inline tests
  if (collectionName === '') {
    alert('This is not a valid collection name');
    return true;
  } if ((collectionType === 'scheduled') && (isValidDate(new Date(tempDate)))) {
    alert('This is not a valid date');
    return true;
  } if ((collectionType === 'scheduled') && (collectionDate < new Date())) {
    alert('This is not a valid date');
    return true;
  } else {
    // Create the collection
    $.ajax({
      url: "/zebedee/collection",
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify({name: collectionName, publishDate: collectionDate}),
      success: function (collection) {
        console.log("Collection " + collection.name + " created");
        collection.type = collectionType;
        Florence.setActiveCollection(collection);

        //localStorage.setItem("collection", collectionName);
        createWorkspace('', collection.id, 'browse');
      },
      error: function (response) {
        if(response.status === 409) {
          alert('A collection already exists with the name ' + collectionName);
        }
        else {
          handleApiError(response);
        }
      }
    });
  }
}

function isValidDate(d) {
  if (!isNaN(d.getTime()))
    {return false;}
  else
    {return true;}
}

