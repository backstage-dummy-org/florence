function staticPageEditor(collectionId, data) {

  var newLinks = [], newFiles = [], newChart = [], newTable = [], newImage = [];
  var setActiveTab, getActiveTab;
  var renameUri = false;

  $(".edit-accordion").on('accordionactivate', function (event, ui) {
    setActiveTab = $(".edit-accordion").accordion("option", "active");
    if (setActiveTab !== false) {
      Florence.globalVars.activeTab = setActiveTab;
    }
  });

  getActiveTab = Florence.globalVars.activeTab;
  accordion(getActiveTab);

  $("#metadata-ad").remove();
  $("#metadata-f").remove();
  $("#metadata-md").remove();
  $("#metadata-q").remove();
  $("#contact-p").remove();
  $("#natStat").remove();
  $("#survey-p").remove();
  $("#frequency-p").remove();
  $("#compilation-p").remove();
  $("#geoCoverage-p").remove();
  $("#sampleSize-p").remove();
  $(".lastRevised-p").remove();
  $("#reference-p").remove();

  // Metadata edition and saving
  $("#title").on('input', function () {
    renameUri = true;
    $(this).textareaAutoSize();
    data.description.title = $(this).val();
  });
  $("#summary").on('input', function () {
    $(this).textareaAutoSize();
    data.description.summary = $(this).val();
  });
  if (!data.description.releaseDate) {
    $('#releaseDate').datepicker({dateFormat: 'dd MM yy'}).on('change', function () {
      data.description.releaseDate = new Date($(this).datepicker({dateFormat: 'dd MM yy'})[0].value).toISOString();
    });
  } else {
    dateTmp = data.description.releaseDate;
    var dateTmpFormatted = $.datepicker.formatDate('dd MM yy', new Date(dateTmp));
    $('#releaseDate').val(dateTmpFormatted).datepicker({dateFormat: 'dd MM yy'}).on('change', function () {
      data.description.releaseDate = new Date($('#releaseDate').datepicker('getDate')).toISOString();
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
  });
  $("#metaDescription").on('input', function () {
    $(this).textareaAutoSize();
    data.description.metaDescription = $(this).val();
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
    // Files are uploaded. Save metadata
    var orderFile = $("#sortable-file").sortable('toArray');
    $(orderFile).each(function (indexF, nameF) {
      var title = $('#file-title_' + nameF).val();
      var file = data.downloads[parseInt(nameF)].file;
      newFiles[indexF] = {title: title, file: file};
    });
    data.downloads = newFiles;
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
      var version = data.tables[parseInt(nameTable)].version;
      var safeUri = checkPathSlashes(uri);
      newTable[indexTable] = {uri: safeUri, title: title, filename: filename, version: version};
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
    // links
    var orderLink = $("#sortable-link").sortable('toArray');
    $(orderLink).each(function (indexL, nameL) {
      if (data.links[parseInt(nameL)].title) {
        var name = data.links[parseInt(nameL)].title;
        var link = data.links[parseInt(nameL)].uri;
        newLinks[indexL] = {uri: link, title: name};
      } else {
        var link = data.links[parseInt(nameL)].uri;
        newLinks[indexL] = {uri: link};
      }
    });
    data.links = newLinks;

    // tags
    if ($("#selectTopic").val() && $("#selectSubTopic").val()) {
      data.description.primaryTopic = $("#selectTopic").val()[0]
      data.description.secondaryTopics = $("#selectSubTopic").val()
    }
    else if ($("#selectTopic").val() && !$("#selectSubTopic").val()) {
      sweetAlert("Cannot save this page", "A value is required for 'Subtopic' if a 'Topic' has been selected");
      return
    } 

    checkRenameUri(collectionId, data, renameUri, onSave);
  }
}

