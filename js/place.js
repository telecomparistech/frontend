$(function () {

    // Add new place
    $('#new-place-form').hide();

    $(window).keydown(function (event) {
        if (event.keyCode == 27) {
            $('#new-place-form').hide();
        }
        if (event.ctrlKey && event.keyCode == 78) {
            console.log("Hey! Ctrl+N event captured!");
            showNewForm();
            event.preventDefault();
        }
        if (event.ctrlKey && event.keyCode == 84) {
            console.log("Hey! Ctrl+T event captured!");
            event.preventDefault();
        }
        if (event.ctrlKey && event.keyCode == 83) {
            console.log("Hey! Ctrl+S event captured!");
            event.preventDefault();
        }
    });

    $('#new-place').click(function () {
        showNewForm();
    });

    $('#new-place-form-close').click(function () {
        $('#new-place-form').hide();
    });

    $("#newPlaceFormSubmit").click(function () {
        submitForm($('#new-place-form'));
    });

    // Extract city, country from address input by user when creating a new place

    $('#addressInput').blur(function () {
        showLocation($('#addressInput').val());
        map.setZoom(zoomMax);
    });

});

function showNewForm() {
    $('#new-place-form')[0].reset();
    $('#new-place-form').show();

    var communityCode = $('#communityCode');
    if (communityCode.has('option').length < 1) {
        fillCountries(communityCode);
    }
    communityCode.val($('#communityCriterion').val());

    var placeType = $('#placeType');
    if (placeType.has('option').length < 1) {
        fillPlaceTypes(placeType, "/api/getListAllTypes");
    }

    $('#title').focus();
}

function fillPlaceTypes(placeType, apiUrl) {
    placeType.find('option').remove().end();
    $.ajax({
        type: "get",
        url: apiUrl,
        dataType: "json",
        success: function (data) {
            data = $(data);
            for (var i = 0; i < data.length; i++) {
                placeType
                    .append($("<option></option>")
                        .attr("value", data[i])
                        .text(getTypeLabel(data[i])));
            }
            ;
            placeType.val('RESTAURANT');
        },
        error: function (request, status, error) {
            console.log(request.responseText + ":" + status + ":" + error);
        }
    });
}

function fillCountries(communityCode) {
    $.ajax({
        type: "get",
        url: "/api/getListAllCountries",
        success: function (data) {
            $(data).each(function (idx, item) {
                communityCode
                    .append($("<option></option>")
                        .attr("value", item.code)
                        .text(item.nativeName));
            });
            communityCode.val($('#communityCriterion').val());
        },
        error: function (request, status, error) {
            console.log(request.responseText + ":" + status + ":" + error);
        }
    });
}

function extractCityFromAddress(address) {
    geocoder.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            getCity(results);
        } else {
            $('#addressInput').addClass("warning");
            //alert('Không tìm thấy địa chỉ này :(');
        }
    });
}


function disable(form) {
    var limit = form.elements.length;
    for (i = 0; i < limit; i++) {
        form.elements[i].disabled = true;
    }
}

function enable(form) {
    var limit = form.elements.length;
    for (i = 0; i < limit; i++) {
        form.elements[i].disabled = false;
    }
}

// common functions
function submitForm(form) {
    if (!$('#title').val()) {
        $('#title').addClass("warning");
        $('#title').focus();
        alert('Xin bạn vui lòng nhập tên địa điểm');
        return false;
    }

    if (!$('#addressInput').val()) {
        $('#addressInput').addClass("warning");
        $('#addressInput').focus();
        alert('Xin bạn vui lòng nhập địa điểm');
        return false;
    }


    form.hide();
    $('#new-place').text('Xin cảm ơn');
    //disable(form);
    $.ajax({
        url: form.attr("action"),
        type: "POST",
        data: new FormData(form[0]),
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        success: function (item) {
            // Handle upload success
            //enable(form);
            // Display and focus on the new place
            displayPlace(item, 0);
        },
        error: function () {
            // Handle upload error
            //alert(data);
        }
    });
}
