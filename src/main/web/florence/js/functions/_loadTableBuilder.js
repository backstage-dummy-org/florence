function loadTableBuilder(pageData, onSave, table) {
  var pageUrl = localStorage.getItem('pageurl');

  var html = templates.tableBuilder(table);
  $('body').append(html);

  if (table) {
    var basePath = getPathName();
    var tablePath = basePath + '/' + table.filename;
    renderTable(tablePath);
  }

  var input = document.getElementById("files"), formdata = false;

$('#upload-table-form').submit(function(event) {

  event.preventDefault();

  var formData = new FormData($(this)[0]);
  var table = buildJsonObjectFromForm();
  var path = getPathName() + "/" + table.filename;
  var xlsPath = path + ".xls";
  var htmlPath = path + ".html";


  // send xls file to zebedee
  $.ajax({
    url: "/zebedee/content/" + Florence.collection.id + "?uri=" + xlsPath,
    type: 'POST',
    data: formData,
    async: false,
    cache: false,
    contentType: false,
    processData: false,
    success: function (returndata) {
      createTableHtml();
    }
  });

  function createTableHtml() {
    $.ajax({
      url: "/zebedee/table/" + Florence.collection.id + "?uri=" + xlsPath,
      type: "POST",
      success: function (html) {
        saveTableJson();
        saveTableHtml(html);
      }
    });
  }

  function saveTableHtml(data) {
    $.ajax({
      url: "/zebedee/content/" + Florence.collection.id + "?uri=" + htmlPath,
      type: 'POST',
      data: data,
      processData: false,
      success: function (response) {
        renderTable(path);
      }
    });
  }

  return false;
});

  function renderTable(path) {

    var iframeMarkup = '<iframe id="preview-frame" frameBorder ="0" scrolling = "yes" src="/florence/table.html?path=' + path + '.xls"></iframe>'
    console.log(iframeMarkup);
    $('#table').html(iframeMarkup);

    document.getElementById('preview-frame').height= "500px";
    document.getElementById('preview-frame').width= "100%";
  }

  $('.btn-table-builder-cancel').on('click', function () {
    $('.table-builder').stop().fadeOut(200).remove();
  });

  function saveTableJson() {

    var table = buildJsonObjectFromForm();

    var tablePath = pageUrl + "/" + table.filename;
    var tableJson = tablePath  + ".json";

    $.ajax({
      url: "/zebedee/content/" + Florence.collection.id + "?uri=" + tableJson,
      type: "POST",
      data: JSON.stringify(table),
      processData: false,
      contentType: false,
      success: function (res) {
        addTableToPageJson(table);
      }
    });
  }

  function addTableToPageJson(table) {
    if (!pageData.tables) {
      pageData.tables = []
    } else {
      if (_.find(pageData.tables, function (existingTable) {
          return existingTable.filename === table.filename
        })) {
        alert("A table with this name already exists.");
        return;
      }
    }

    var tablePath = pageUrl + "/" + table.filename;
    pageData.tables.push({title: table.title, filename: table.filename, path: tablePath});
  }

  $('.btn-table-builder-create').on('click', function () {

    if (onSave) {
      onSave(table.filename, '<ons-table path="' + getPathName() + '/' + table.filename + '" />');
    }
    $('.table-builder').stop().fadeOut(200).remove();

  });

  function buildJsonObjectFromForm() {
    if (!table) {
      table = {};
    }

    table.type = 'table';
    table.title = $('#table-title').val();
    table.filename = table.filename ? table.filename : StringUtils.randomId();
    
    if (table.title === '') {
      table.title = '[Title]'
    }

    table.files = [];
    table.files.push({ type:'download-xls', filename:table.filename + '.xls' });
    table.files.push({ type:'html', filename:table.filename + '.html' });

    return table;
  }
}

