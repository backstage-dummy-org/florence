function methodologyDownloadEditor(collectionId, data) {

  var newFiles = [];
  var setActiveTab, getActiveTab;
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

  $("#metadata-ad").remove();
  $("#metadata-f").remove();
  $("#metadata-q").remove();
  $("#metadata-s").remove();
  $("#summary-p").remove();
  $("#natStat").remove();
  $("#survey-p").remove();
  $("#frequency-p").remove();
  $("#compilation-p").remove();
  $("#geoCoverage-p").remove();
  $("#sampleSize-p").remove();
  $(".release-date").remove();
  $("#reference-p").remove();

  // Metadata edition and saving
  $("#title").on('input', function () {
    $(this).textareaAutoSize();
    data.description.title = $(this).val();
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
  if (!data.description.lastRevised) {
    $('#lastRevised').datepicker({dateFormat: 'dd MM yy'}).on('change', function () {
      data.description.lastRevised = new Date($(this).datepicker({dateFormat: 'dd MM yy'})[0].value).toISOString();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        autoSaveMetadata(collectionId, data);
      }, 3000);
    });
  } else {
    dateTmp = data.description.lastRevised;
    var dateTmpFormatted = $.datepicker.formatDate('dd MM yy', new Date(dateTmp));
    $('#lastRevised').val(dateTmpFormatted).datepicker({dateFormat: 'dd MM yy'}).on('change', function () {
      data.description.lastRevised = new Date($('#lastRevised').datepicker('getDate')).toISOString();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        autoSaveMetadata(collectionId, data);
      }, 3000);
    });
  }
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

  // Save
  var editNav = $('.edit-nav');
  editNav.off(); // remove any existing event handlers.

  editNav.on('click', '.btn-edit-save', function () {
    save();
    updateContent(collectionId, data.uri, JSON.stringify(data));
  });

  // completed to review
  editNav.on('click', '.btn-edit-save-and-submit-for-review', function () {
    //pageData = $('.fl-editor__headline').val();
    save();
    saveAndCompleteContent(collectionId, data.uri, JSON.stringify(data));
  });

  // reviewed to approve
  editNav.on('click', '.btn-edit-save-and-submit-for-approval', function () {
    save();
    saveAndReviewContent(collectionId, data.uri, JSON.stringify(data));
  });

  function save() {
    // Sections
    data.markdown = [$('#content-markdown').val()];
    // Files are uploaded. Save metadata
    var orderFile = $("#sortable-file").sortable('toArray');
    $(orderFile).each(function (indexF, nameF) {
      var title = $('#file-title_' + nameF).val();
      var file = data.downloads[parseInt(nameF)].file;
      newFiles[indexF] = {title: title, file: file};
    });
    data.downloads = newFiles;
  }
}


