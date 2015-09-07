function viewReportDetails(collection) {

  var success = collection.publishResults[collection.publishResults.length - 1];
  console.log(success);
  var duration = (function () {
    var start = new Date(success.transaction.startDate);
    var end = new Date(success.transaction.endDate);
    return end - start;
  })();
  var details = {name: collection.name, date: collection.formattedDate, duration: duration, success: success}

  var reportDetails = templates.reportDetails(details);
  $('.publish-selected').html(reportDetails);
  $('.collections-accordion').accordion({
    header: '.collections-section__head',
    heightStyle: "content",
    active: false,
    collapsible: true
  });

  $('th').click(function(){
    var table = $(this).parents('table').eq(0)
    var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
    this.asc = !this.asc
    if (!this.asc){rows = rows.reverse()}
    for (var i = 0; i < rows.length; i++){table.append(rows[i])}
  })
  function comparer(index) {
    return function(a, b) {
      var valA = getCellValue(a, index), valB = getCellValue(b, index)
      return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
    }
  }
  function getCellValue(row, index){ return $(row).children('td').eq(index).html() }

  $('.publish-selected .btn-collection-cancel').click(function () {
    $('.publish-selected').animate({right: "-50%"}, 500);
    $('.publish-select').animate({marginLeft: "25%"}, 800);
    $('.publish-select-table tbody tr').removeClass('selected');
  });
}

