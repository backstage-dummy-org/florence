function loadEquationBuilder(pageData, onSave, equation) {
    var equation = equation;
    var pageUrl = pageData.uri;
    var html = templates.equationBuilder(equation);

    $('body').append(html);
    $('.js-equation-builder').css("display", "block");

    $('.btn-equation-builder-cancel').on('click', function () {
        $('.js-equation-builder').stop().fadeOut(200).remove();
    });

    // if editing existing equation render preview straight away
    if (equation) {
        var contentStr = equation.content;
        renderPreview(contentStr);
    }

    // on change of content filed re-render preview
    $('#equation-content').keyup(function () {
        var contentStr = $(this).val();
        renderPreview(contentStr);
    });


    // save equation
    $('.btn-equation-builder-create').on('click', function () {

        equation = buildEquationObject();
        console.log("Equation Object: ", equation);

        var jsonPath = equation.uri + ".json";
        $.ajax({
            url: "/zebedee/equation/" + Florence.collection.id + "?uri=" + jsonPath,
            type: 'POST',
            data: JSON.stringify(equation),
            processData: false,
            contentType: 'application/json',
            success: function () {

                if (!pageData.equations) {
                    pageData.equations = [];
                }

                existingEquation = _.find(pageData.equations, function (existingEquation) {
                    return existingEquation.filename === equation.filename;
                });

                if (existingEquation) {
                    existingEquation.title = equation.title;
                } else {
                    pageData.equations.push({
                        title: equation.title,
                        filename: equation.filename,
                        uri: equation.uri
                    });
                }

                if (onSave) {
                    onSave(equation.filename, '<ons-equation path="' + equation.filename + '" />');
                }
                $('.js-equation-builder').stop().fadeOut(200).remove();
                refreshEquationsList(Florence.collection.id, pageData);
            }
        });
    });

    function buildEquationObject() {
        if (!equation) {
            equation = {};
        }

        equation.type = "equation";
        equation.filename = equation.filename ? equation.filename : StringUtils.randomId();
        equation.uri = pageUrl + "/" + equation.filename;
        equation.title = $('#equation-title').val();
        equation.content = $('#equation-content').val();

        return equation;
    }


    function renderPreview(content) {
        var svg;
        $.ajax({
            url: "/zebedee/equationpreview/",
            type: 'POST',
            contentType: 'text/plain',
            crossDomain: true,
            data: JSON.stringify(content),
            success: function (data) {
                svg = data;
                console.log("SVG: ", svg);
                $( ".js-equation-preview" ).html(svg);
            }
        });
    }

}