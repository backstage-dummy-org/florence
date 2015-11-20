function ArticleDownloadEditor(collectionId, data) {

//  var index = data.release;
  var newFiles = [], newChart = [], newTable = [], newImage = [], newData = [], newLinks = [], newRelatedQmi = [], newRelatedMethodology = [], newDocuments = [];
  var setActiveTab, getActiveTab;
  var renameUri = false;
  var timeoutId;

  $(".edit-accordion").on('accordionactivate', function (event, ui) {
    setActiveTab = $(".edit-accordion").accordion("option", "active");
    if (setActiveTab !== false) {
      Florence.globalVars.activeTab = setActiveTab;
    }
  });

  getActiveTab = Florence.globalVars.activeTab;
  accordion(getActiveTab);
  getLastPosition();

  // Metadata load, edition and saving
  $("#title").on('input', function () {
    renameUri = true;
    $(this).textareaAutoSize();
    data.description.title = $(this).val();
  });
  $("#edition").on('input', function () {
    renameUri = true;
    $(this).textareaAutoSize();
    data.description.edition = $(this).val();
  });
  //if (!Florence.collection.date) {                        //overwrite scheduled collection date
  if (!data.description.releaseDate) {
    $('#releaseDate').datepicker({dateFormat: 'dd MM yy'}).on('change', function () {
      data.description.releaseDate = new Date($(this).datepicker({dateFormat: 'dd MM yy'})[0].value).toISOString();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        autoSaveMetadata(collectionId, data);
      }, 3000);
    });
  } else {
    //dateTmp = $('#releaseDate').val();
    dateTmp = data.description.releaseDate;
    var dateTmpFormatted = $.datepicker.formatDate('dd MM yy', new Date(dateTmp));
    $('#releaseDate').val(dateTmpFormatted).datepicker({dateFormat: 'dd MM yy'}).on('change', function () {
      data.description.releaseDate = new Date($('#releaseDate').datepicker('getDate')).toISOString();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        autoSaveMetadata(collectionId, data);
      }, 3000);
    });
  }
  //} else {
  //    $('.release-date').hide();
  //}
  $("#nextRelease").on('input', function () {
    $(this).textareaAutoSize();
    data.description.nextRelease = $(this).val();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });
  if (!data.description.contact) {
    data.description.contact = {};
  }
  $("#contactName").on('input', function () {
    $(this).textareaAutoSize();
    data.description.contact.name = $(this).val();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });
  $("#contactEmail").on('input', function () {
    $(this).textareaAutoSize();
    data.description.contact.email = $(this).val();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });
  $("#contactTelephone").on('input', function () {
    $(this).textareaAutoSize();
    data.description.contact.telephone = $(this).val();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });
  $("#abstract").on('input', function () {
    $(this).textareaAutoSize();
    data.description._abstract = $(this).val();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });
  $("#keywordsTag").tagit({
    availableTags: data.description.keywords,
    singleField: true,
    allowSpaces: true,
    singleFieldNode: $('#keywords')
  });
  $('#keywords').on('change', function () {
    data.description.keywords = $('#keywords').val().split(',');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });
  $("#metaDescription").on('input', function () {
    $(this).textareaAutoSize();
    data.description.metaDescription = $(this).val();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });

  /* The checked attribute is a boolean attribute, which means the corresponding property is true if the attribute
   is present at all—even if, for example, the attribute has no value or is set to empty string value or even "false" */
  var checkBoxStatus = function () {
    if (data.description.nationalStatistic === "false" || data.description.nationalStatistic === false) {
      return false;
    }
    return true;
  };

  $("#metadata-list input[type='checkbox']").prop('checked', checkBoxStatus).click(function () {
    data.description.nationalStatistic = $("#metadata-list input[type='checkbox']").prop('checked') ? true : false;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      autoSaveMetadata(collectionId, data);
    }, 3000);
  });

  $('#add-chart').click(function () {
    loadChartBuilder(data, function () {
      refreshPreview();

      putContent(collectionId, data.uri, JSON.stringify(data),
        success = function () {
          Florence.Editor.isDirty = false;
          refreshPreview();
          refreshChartList(collectionId, data);
        },
        error = function (response) {
          handleApiError(response);
        }
      );
    });
  });

  $('#add-table').click(function () {
    loadTableBuilder(data, function () {
      Florence.Editor.isDirty = false;
      refreshPreview();
      refreshTablesList(collectionId, data);
    });
  });

  $('#add-image').click(function () {
    loadImageBuilder(data, function () {
      Florence.Editor.isDirty = false;
      //refreshPreview();
      refreshImagesList(collectionId, data);
    });
  });

  // Save
  var editNav = $('.edit-nav');
  editNav.off(); // remove any existing event handlers.

  editNav.on('click', '.btn-edit-save', function () {
    save(updateContent);
  });

  // completed to review
  editNav.on('click', '.btn-edit-save-and-submit-for-review', function () {
    save(saveAndCompleteContent);
  });

  // reviewed to approve
  editNav.on('click', '.btn-edit-save-and-submit-for-approval', function () {
    save(saveAndReviewContent);
  });

  function save(onSave) {
    // Sections
    data.markdown = [$('#content-markdown').val()];
    // charts
    var orderChart = $("#sortable-chart").sortable('toArray');
    $(orderChart).each(function (indexCh, nameCh) {
      var uri = data.charts[parseInt(nameCh)].uri;
      var title = data.charts[parseInt(nameCh)].title;
      var filename = data.charts[parseInt(nameCh)].filename;
      var safeUri = checkPathSlashes(uri);
      newChart[indexCh] = {uri: safeUri, title: title, filename: filename};
    });
    data.charts = newChart;
    // tables
    var orderTable = $("#sortable-table").sortable('toArray');
    $(orderTable).each(function (indexTable, nameTable) {
      var uri = data.tables[parseInt(nameTable)].uri;
      var title = data.tables[parseInt(nameTable)].title;
      var filename = data.tables[parseInt(nameTable)].filename;
      var safeUri = checkPathSlashes(uri);
      newTable[indexTable] = {uri: safeUri, title: title, filename: filename};
    });
    data.tables = newTable;
    // images
    var orderImage = $("#sortable-image").sortable('toArray');
    $(orderImage).each(function (indexImage, nameImage) {
      var uri = data.images[parseInt(nameImage)].uri;
      var title = data.images[parseInt(nameImage)].title;
      var filename = data.images[parseInt(nameImage)].filename;
      var safeUri = checkPathSlashes(uri);
      newImage[indexImage] = {uri: safeUri, title: title, filename: filename};
    });
    data.images = newImage;
    // Related documents
    var orderDocument = $("#sortable-document").sortable('toArray');
    $(orderDocument).each(function (indexD, nameD) {
      var uri = data.relatedDocuments[parseInt(nameD)].uri;
      var safeUri = checkPathSlashes(uri);
      newDocuments[indexD] = {uri: safeUri};
    });
    data.relatedDocuments = newDocuments;
    // Related data
    var orderData = $("#sortable-data").sortable('toArray');
    $(orderData).each(function (indexDat, nameDat) {
      var uri = data.relatedData[parseInt(nameDat)].uri;
      var safeUri = checkPathSlashes(uri);
      newData[indexDat] = {uri: safeUri};
    });
    data.relatedData = newData;
    // Files are uploaded. Save metadata
    var orderFile = $("#sortable-file").sortable('toArray');
    $(orderFile).each(function (indexF, nameF) {
      var title = $('#file-title_' + nameF).val();
      var file = data.downloads[parseInt(nameF)].file;
      newFiles[indexF] = {title: title, file: file};
    });
    data.downloads = newFiles;
    // External links
    var orderLink = $("#sortable-link").sortable('toArray');
    $(orderLink).each(function (indexL, nameL) {
      var displayText = $('#link-markdown_' + nameL).val();
      var link = $('#link-uri_' + nameL).val();
      newLinks[indexL] = {uri: link, title: displayText};
    });
    data.links = newLinks;
    // Related qmi
    var orderRelatedQmi = $("#sortable-qmi").sortable('toArray');
    $(orderRelatedQmi).each(function (indexM, nameM) {
      var uri = data.relatedMethodology[parseInt(nameM)].uri;
      var safeUri = checkPathSlashes(uri);
      newRelatedQmi[indexM] = {uri: safeUri};
    });
    data.relatedMethodology = newRelatedQmi;
    // methodology
    var orderRelatedMethodology = $("#sortable-methodology").sortable('toArray');
    $(orderRelatedMethodology).each(function (indexM, nameM) {
      var uri = data.relatedMethodologyArticle[parseInt(nameM)].uri;
      var safeUri = checkPathSlashes(uri);
      newRelatedMethodology[indexM] = {uri: safeUri};
    });
    data.relatedMethodologyArticle = newRelatedMethodology;

    checkRenameUri(collectionId, data, renameUri, onSave);
  }
}


