function t1Editor(collectionId, data, templateData) {

  var newSections = [];
  var setActiveTab, getActiveTab;

  $(".edit-accordion").on('accordionactivate', function(event, ui) {
    setActiveTab = $(".edit-accordion").accordion("option", "active");
    if(setActiveTab !== false) {
      Florence.globalVars.activeTab = setActiveTab;
    }
  });

  getActiveTab = Florence.globalVars.activeTab;
  accordion(getActiveTab);

  resolveTitleT1(collectionId, templateData, 'sections');

  // Metadata edition and saving
  $("#summary").on('input', function () {
    $(this).textareaAutoSize();
    data.description.summary = $(this).val();
  });
  $("#keywordsTag").tagit({availableTags: data.description.keywords,
                        singleField: true,
                        allowSpaces: true,
                        singleFieldNode: $('#keywords')
  });
  $('#keywords').on('change', function () {
    data.description.keywords = $('#keywords').val().split(', ');
  });
  $("#metaDescription").on('input', function () {
    $(this).textareaAutoSize();
    data.description.metaDescription = $(this).val();
  });

  //Edit section
  $(data.sections).each(function(index, section) {
//  lastIndexSections = index + 1;
    $("#section-edit_"+index).click(function() {

      var iframeEvent = document.getElementById('iframe').contentWindow;
          iframeEvent.removeEventListener('click', Florence.Handler, true);
      createWorkspace('/', collectionId, '', true);

      $('#' + index).replaceWith(
          '<div id="' + index + '" class="edit-section__sortable-item">' +
          '  <textarea id="uri_' + index + '" placeholder="Go to the related document and click Get"></textarea>' +
          '  <button class="btn-page-get" id="section-get_' + index + '">Get</button>' +
          '  <button class="btn-page-cancel" id="section-cancel_' + index + '">Cancel</button>' +
          '</div>');
      $("#section-cancel_" + index).hide();

      $("#section-get_" + index).one('click', function () {
        var pastedUrl = $('#uri_'+index).val();
        if (!pastedUrl) {
          pastedUrl = getPathNameTrimLast();
        } else {
          pastedUrl = checkPathParsed(pastedUrl);
        }
        var sectionUrlData = pastedUrl + "/data";

        $.ajax({
          url: sectionUrlData,
          dataType: 'json',
          crossDomain: true,
          success: function (sectionData) {
            if (sectionData.type === 'timeseries') {
              data.sections.splice(index, 1,
              {theme: {uri: sectionData.breadcrumb[1].uri},
               statistics: {uri: sectionData.uri}
              });
              postContent(collectionId, '', JSON.stringify(data),
                success = function (response) {
                  console.log("Updating completed " + response);
                  Florence.Editor.isDirty = false;
                  createWorkspace('/', collectionId, 'edit');
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
                }
               );
            } else {
              alert("This is not a time series");
            }
          },
          error: function () {
            console.log('No page data returned');
          }
        });
      });

      $("#section-cancel_" + index).show().one('click', function () {
        createWorkspace('', collectionId, 'edit');
      });
    });
  });

  function sortableSections() {
    $("#sortable-section").sortable();
  }
  sortableSections();

  // Save
  var editNav = $('.edit-nav');
  editNav.off(); // remove any existing event handlers.

  editNav.on('click', '.btn-edit-save', function () {
    save();
    updateContent(collectionId, '', JSON.stringify(data));
  });

  // completed to review
  editNav.on('click', '.btn-edit-save-and-submit-for-review', function () {
    //pageData = $('.fl-editor__headline').val();
    save();
    saveAndCompleteContent(collectionId, '', JSON.stringify(data));
  });

  // reviewed to approve
  editNav.on('click', '.btn-edit-save-and-submit-for-approval', function () {
    save();
    saveAndReviewContent(collectionId, '', JSON.stringify(data));
  });

  function save() {
    // sections
    var orderSections = $("#sortable-section").sortable('toArray');
    $(orderSections).each(function(indexS, nameS){
      var uri = data.sections[parseInt(nameS)].statistics.uri;
      var safeUri = checkPathSlashes (uri);
      var link = data.sections[parseInt(nameS)].theme.uri;
      newSections[parseInt(indexS)] = {theme: {uri: link},
                                       statistics: {uri: safeUri}
                                      };
    });
    data.sections = newSections;
  }
}

function resolveTitleT1(collectionId, templateData, field) {
  var ajaxRequest = [];
  $(templateData[field]).each(function (index, path) {
    var eachUri = path.statistics.uri;
    var dfd = $.Deferred();
    getPageDataTitle(collectionId, eachUri,
      success = function (response) {
        templateData[field][index].statistics.title = response.title;
        dfd.resolve();
      },
      error = function () {
        alert(field + ' address: '+ eachUri+ ' is not found.');
        dfd.resolve();
      }
    );
    ajaxRequest.push(dfd);
  });

  $.when.apply($, ajaxRequest).then(function () {
    var dataTemplate = templateData[field];
    var html = templates.workEditT1Sections(dataTemplate);
    $('#to-populate').replaceWith(html);
  });
}
