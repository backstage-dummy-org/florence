function qmiEditor(collectionId, data) {

  var newSections = [], newFiles = [];
  var lastIndexFile = 0;
  var uriUpload;
  var setActiveTab, getActiveTab;

  $(".edit-accordion").on('accordionactivate', function(event, ui) {
    setActiveTab = $(".edit-accordion").accordion("option", "active");
    if(setActiveTab !== false) {
      localStorage.setItem('activeTab', setActiveTab);
    }
  });

  getActiveTab = localStorage.getItem('activeTab');
  accordion(getActiveTab);

  $("#metadata-s").remove();
  $("#metadata-f").remove();
  $("#metadata-ad").remove();
  $("#summary-p").remove();
  $("#releaseDate-p").remove();
  $("#reference-p").remove();

  // Metadata edition and saving
  $("#title").on('input', function () {
    $(this).textareaAutoSize();
    data.description.title = $(this).val();
  });
  if (!data.description.contact) {
    data.description.contact = {};
  }
  $("#contactName").on('input', function () {
    $(this).textareaAutoSize();
    data.description.contact.name = $(this).val();
  });
  $("#contactEmail").on('input', function () {
    $(this).textareaAutoSize();
    data.description.contact.email = $(this).val();
  });
  $("#contactTelephone").on('input', function () {
    $(this).textareaAutoSize();
    data.description.contact.telephone = $(this).val();
  });
  $("#survey").on('input', function () {
    $(this).textareaAutoSize();
    data.description.surveyName = $(this).val();
  });
  $("#frequency").on('input', function () {
    $(this).textareaAutoSize();
    data.description.frequency = $(this).val();
  });
  $("#compilation").on('input', function () {
    $(this).textareaAutoSize();
    data.description.compilation = $(this).val();
  });
  $("#geoCoverage").on('input', function () {
    $(this).textareaAutoSize();
    data.description.geoCoverage = $(this).val();
  });
  $("#sampleSize").on('input', function () {
    $(this).textareaAutoSize();
    data.description.sampleSize = $(this).val();
  });
  $("#lastRevised").on('input', function () {
    $(this).textareaAutoSize();
    data.description.lastRevised = $(this).val();
  });
  $("#keywordsTag").tagit({availableTags: data.description.keywords,
                        availableTags: data.description.keywords,
                        singleField: true,
                        singleFieldNode: $('#keywords')
  });
  $('#keywords').on('change', function () {
    data.description.keywords = [$('#keywords').val()];
  });
  $("#metaDescription").on('input', function () {
    $(this).textareaAutoSize();
    data.description.metaDescription = $(this).val();
  });

 // Edit content
  // Load and edition
  $(data.markdown).each(function(index, note) {

    $("#content-edit_"+index).click(function() {
      var editedSectionValue = $("#content-markdown_" + index).val();

      var saveContent = function(updatedContent) {
        data.markdown[index] = updatedContent;
        updateContent(collectionId, getPathName(), JSON.stringify(data));
      };

      loadMarkdownEditor(editedSectionValue, saveContent, data);
    });

    // Delete
    $("#content-delete_"+index).click(function() {
      $("#"+index).remove();
      data.markdown.splice(index, 1);
      updateContent(collectionId, getPathName(), JSON.stringify(data));
    });
  });

  //Add new content
  $("#addContent").one('click', function () {
    data.markdown.push("");
    updateContent(collectionId, getPathName(), JSON.stringify(data));
  });

  function sortableContent() {
    $("#sortable-content").sortable();
  }
  sortableContent();


 // Edit download
  // Load and edition
  $(data.downloads).each(function (index) {
    lastIndexFile = index + 1;

    // Delete
    $("#file-delete_"+index).click(function() {
      $("#"+index).remove();
      $.ajax({
        url: "/zebedee/content/" + collectionId + "?uri=" + data.downloads[index].uri,
        type: "DELETE",
        success: function (res) {
          console.log(res);
        },
        error: function (res) {
          console.log(res);
        }
      });
      data.downloads.splice(index, 1);
      updateContent(collectionId, getPathName(), JSON.stringify(data));
    });
  });

  //Add new download
  $("#addFile").one('click', function () {
    $('#sortable-download').append(
        '<div id="' + lastIndexFile + '" class="edit-section__sortable-item">' +
        '  <form id="UploadForm" action="" method="post" enctype="multipart/form-data">' +
        '    <p><input type="file" name="files" id="files">' +
        '    <p>' +
        '  </form>' +
        '  <div id="response"></div>' +
        '  <ul id="list"></ul>' +
        '</div>');

    (function () {
      var input = document.getElementById("files"), formdata = false;

      if (window.FormData) {
        formdata = new FormData();
      }
      function showUploadedItem (source) {
        var list = document.getElementById("list"),
            li   = document.createElement("li"),
            para = document.createElement("p"),
            text = document.createTextNode(source);
        para.appendChild(text);
        li.appendChild(para);
        list.appendChild(li);
      }
      if (input.addEventListener) {
        input.addEventListener("change", function (evt) {
          document.getElementById("response").innerHTML = "Uploading . . .";

          var file = this.files[0];
          uriUpload = getPathName() + "/" + file.name;

          if (data.downloads.length > 0) {
            $(data.downloads).each(function (i, filesUploaded) {
              if (filesUploaded.file == uriUpload) {
                alert('This file already exists');
                $('#' + lastIndexFile).remove();
                datasetEditor(collectionId, data);
                return;
              }
            });
            if (!!file.name.match(/\.csv$|.xls$|.zip$/)) {
              showUploadedItem(file.name);
              if (formdata) {
                formdata.append("name", file);
              }
            } else {
              alert('This file type is not supported');
              $('#' + lastIndexFile).remove();
              datasetEditor(collectionId, data);
              return;
            }

            if (formdata) {
              $.ajax({
                url: "/zebedee/content/" + collectionId + "?uri=" + uriUpload,
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                success: function (res) {
                  document.getElementById("response").innerHTML = "File uploaded successfully";
                  data.downloads.push({title:'', uri: uriUpload});
                  updateContent(collectionId, getPathName(), JSON.stringify(data));
                }
              });
            }
          } else {
            if (!!file.name.match(/\.csv$|.xls$|.zip$/)) {
              showUploadedItem(file.name);
              if (formdata) {
                formdata.append("name", file);
              }
            } else {
              alert('This file type is not supported');
              $('#' + lastIndexFile).remove();
              datasetEditor(collectionId, data);
              return;
            }

            if (formdata) {
              $.ajax({
                url: "/zebedee/content/" + collectionId + "?uri=" + uriUpload,
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                success: function (res) {
                  document.getElementById("response").innerHTML = "File uploaded successfully";
                  data.downloads.push({title:'', uri: uriUpload});
                  updateContent(collectionId, getPathName(), JSON.stringify(data));
                }
              });
            }
          }
        }, false);
      }
    })();
  });

  function sortableFiles() {
    $("#sortable-download").sortable();
  }
  sortableFiles();

  // Save
  var editNav = $('.edit-nav');
  editNav.off(); // remove any existing event handlers.

  editNav.on('click', '.btn-edit-save', function () {
    save();
    updateContent(collectionId, getPathName(), JSON.stringify(data));
  });

  // completed to review
  editNav.on('click', '.btn-edit-save-and-submit-for-review', function () {
    //pageData = $('.fl-editor__headline').val();
    save();
    saveAndCompleteContent(collectionId, getPathName(), JSON.stringify(data));
  });

  // reviewed to approve
  editNav.on('click', '.btn-edit-save-and-submit-for-approval', function () {
    save()
    saveAndReviewContent(collectionId, getPathName(), JSON.stringify(data));
  });

  function save() {
   // Sections
      var orderSection = $("#sortable-content").sortable('toArray');
      $(orderSection).each(function (indexS, nameS) {
        var markdown = $('#content-markdown_' + nameS).val();
      newSections[indexS] = markdown;
      });
      data.markdown = newSections;
    // Files are uploaded. Save metadata
    var orderFile = $("#sortable-download").sortable('toArray');
    $(orderFile).each(function(index, name){
      var title = $('#download-title_'+name).val();
      var file = $('#download-filename_' + name).val();
      newFiles[index] = {title: title, uri: file};
    });
    data.downloads = newFiles;
  }
}
