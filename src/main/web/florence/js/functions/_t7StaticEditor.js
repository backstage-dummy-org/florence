function staticEditor(collectionId, data) {

  var setActiveTab, getActiveTab;
  $(".edit-accordion").on('accordionactivate', function(event, ui) {
    setActiveTab = $(".edit-accordion").accordion("option", "active");
    if(setActiveTab !== false) {
      localStorage.setItem('activeTab', setActiveTab);
    }
  });

  getActiveTab = localStorage.getItem('activeTab');
  accordion(getActiveTab);

  $("#metadata-q").remove();
  $("#metadata-f").remove();
  $("#metadata-ad").remove();
  $("#contact-p").remove();
  $("#survey-p").remove();
  $("#metadata-b").remove();
  $("#frequency-p").remove();
  $("#compilation-p").remove();
  $("#geoCoverage-p").remove();
  $("#sampleSize-p").remove();
  $("#lastRevised-p").remove();
  $("#releaseDate-p").remove();
  $("#reference-p").remove();
  $("#download").remove();

  // Metadata edition and saving
  $("#name").on('click keyup', function () {
    $(this).textareaAutoSize();
    data.name = $(this).val();
  });
  $("#summary").on('click keyup', function () {
    $(this).textareaAutoSize();
    data.summary = $(this).val();
  });
  $("#keywords").on('click keyup', function () {
    $(this).textareaAutoSize();
    data.keywords = $(this).val();
  });
  $("#metaDescription").on('click keyup', function () {
    $(this).textareaAutoSize();
    data.metaDescription = $(this).val();
  });

 // Edit content
  // Load and edition
  $(data.content).each(function(index, note) {

    $("#content-edit_"+index).click(function() {
      var editedSectionValue = $("#content-markdown_" + index).val();

      var saveContent = function(updatedContent) {
        data.content[index].data = updatedContent;
        updateContent(collectionId, getPathName(), JSON.stringify(data));
      };

      loadMarkdownEditor(editedSectionValue, saveContent, data);
    });

    // Delete
    $("#content-delete_"+index).click(function() {
      $("#"+index).remove();
      data.content.splice(index, 1);
      updateContent(collectionId, getPathName(), JSON.stringify(data));
    });
  });

  //Add new content
  $("#addContent").one('click', function () {
    data.content.push({data:""});
    updateContent(collectionId, getPathName(), JSON.stringify(data));
  });

  function sortableContent() {
    $("#sortable-content").sortable();
  }
  sortableContent();
}

