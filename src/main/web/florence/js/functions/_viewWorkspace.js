function viewWorkspace(path, collectionId, menu) {

  var currentPath = '';
  if (path) {
    currentPath = path;
  }
  checkPathSlashes(currentPath);

  Florence.globalVars.pagePath = currentPath;

  if (menu === 'browse') {
    $('.nav--workspace li').removeClass('selected');
    $("#browse").addClass('selected');
    loadBrowseScreen(collectionId);
  }
  else if (menu === 'create') {
    $('.nav--workspace li').removeClass('selected');
    $("#create").addClass('selected');
    loadCreateScreen(collectionId);
  }
  else if (menu === 'edit') {
    $('.nav--workspace li').removeClass('selected');
    $("#edit").addClass('selected');
    Florence.globalVars.pagePath = path;
    loadPageDataIntoEditor(path, collectionId);
  }
}

