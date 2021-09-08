function loadEditIntLinks(onSave) {

//Add modal to select either internal or external
var position = $(".workspace-edit").scrollTop();
Florence.globalVars.pagePos = position;
var modalIntOrExt = templates.linkModal;
$('.workspace-menu').append(modalIntOrExt);

//Internal
$('#internal-link').click(function () {
    var modal = templates.relatedModalNoBrowse;
    $('.modal').remove();
    $('.workspace-menu').append(modal);
    $('.modal-box input[type=text]').focus();

    $('.btn-uri-get').off().click(function () {
        var uri = $('#uri-input').val();
        
        if (uri === "") {
            sweetAlert("This field cannot be empty. Please paste a valid url address");
        } else {
            var dataUrl = checkPathParsed(uri);
            if (dataUrl === "") {    //special case for home page
                dataUrl = "/";
            }
            if (dataUrl != false) {
                onSave('<a href="' + dataUrl + '"</a>');
            }
            $('.modal').remove();
        }
    });

    $('.btn-uri-cancel').off().one('click', function () {
        $('.modal').remove();
    });
});

//External
$('#external-link').click(function () {
    var linkData = {showTitleField: true};
    var modal = templates.linkExternalModal(linkData);
    var uri, title;
    $('.modal').remove();
    $('.workspace-menu').append(modal);

    $('#uri-input').change(function () {
        uri = $('#uri-input').val();
    });

    $('#uri-title').change(function () {
        title = $('#uri-title').val();
    });

    $('.btn-uri-get').off().click(function () {
        if (!title) {
            sweetAlert('You need to enter a title to continue');
        }
        else {
            onSave('<a href="' + uri + '"</a>');
            $('.modal').remove();
        }
    });

    $('.btn-uri-cancel').off().one('click', function () {
        $('.modal').remove();
    });
});

//Cancel
$('.btn-uri-cancel').off().click(function () {
    $('.modal').remove();
});
}