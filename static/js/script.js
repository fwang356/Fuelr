$(function(){
    $(".dropdown-menu .dropdown-item").click(function(){
        $(".btn-dropdown:first-child").text($(this).text());
        $(".btn-dropdown:first-child").val($(this).text());
        $(".btn-dropdown:first-child").css('color', '#fd5000c4');
    });
});

$(function(){
    $(".dropdown-menu .dropdown-item-hidden").click(function(){
        $(".btn-dropdown:first-child").text($(this).text());
        $(".btn-dropdown:first-child").val($(this).text());
        $(".btn-dropdown:first-child").css('color', '#fd5000c4');
    });
});

$(document).ready(function() {
    container = document.getElementById('show');
    var comp = container.currentStyle || getComputedStyle(container, null);
    if (comp.display === 'block') {
        const searchInput = document.getElementById('search');
        const searchInputEnd = document.getElementById('search-end');
        const rangeInput = document.getElementById('range');
        const gasType = document.getElementById('gas-type');
        const searchWrapper = document.querySelector('.wrapper');
        const searchWrapperEnd = document.querySelector('.wrapper-end')
        const resultsWrapper = document.querySelector('.results');
        const resultsWrapperEnd = document.querySelector('.results-end');
    
        searchInput.addEventListener('keyup', () => {
            let results = [];
            let input = searchInput.value;

            if (input.length > 0) {
                $.post("/autocomplete", {"input": input})
                    .then(function (response) {
                        results = response.filter((item) => {
                            return item.toLowerCase().includes(input.toLowerCase());
                        });

                    renderResults(results);
                })
            }
            renderResults(results);
        });

        
        searchInputEnd.addEventListener('keyup', () => {
            let results = [];
            let input = searchInputEnd.value;

            if (input.length > 0) {
                $.post("/autocomplete", {"input": input})
                    .then(function (response) {
                        results = response.filter((item) => {
                            return item.toLowerCase().includes(input.toLowerCase());
                        });

                        renderResultsEnd(results);
                    })
            }
            renderResultsEnd(results);
        });

        function renderResults(results) {
            if (results.length == 0) {
                return searchWrapper.classList.remove('show');
            }
        
            const content = results
            .map((item) => {
                return `<li><button type="button" class=dropdown-item id=autocomplete>${item}</button></li>`;
            })
            .join('');
        
            searchWrapper.classList.add('show');
            resultsWrapper.innerHTML = `<ul>${content}</ul>`;

            $(function(){
                $(".results ul li .dropdown-item#autocomplete").click(function(){
                    $(".search:first-child").text($(this).text());
                    $(".search:first-child").val($(this).text());
                    $(".search:first-child").css('color', '#fd5000c4');
                    return searchWrapper.classList.remove('show');
                });
            });
        }

        function renderResultsEnd(results) {
            if (results.length == 0) {
                return searchWrapperEnd.classList.remove('show');
            }
        
            const content = results
            .map((item) => {
                return `<li><button type="button" class=dropdown-item id=autocomplete>${item}</button></li>`;
            })
            .join('');
        
            searchWrapperEnd.classList.add('show');
            resultsWrapperEnd.innerHTML = `<ul>${content}</ul>`;

            $(function(){
                $(".results-end ul li .dropdown-item#autocomplete").click(function(){
                    $(".search-end:first-child").text($(this).text());
                    $(".search-end:first-child").val($(this).text());
                    $(".search-end:first-child").css('color', '#fd5000c4');
                    return searchWrapperEnd.classList.remove('show');
                });
            });
        }

        calculate.addEventListener('click', () => {
            if (document.getElementById("search").value == '' || document.getElementById("search-end").value == ''
                || document.getElementById("range").value == '' || document.getElementById("gas-type").firstChild == null) {
                window.alert("Please fill out the forms!");
            } else {
                calculate.innerHTML = "Loading...";
                $.post("/gas-station", {"start": searchInput.value, "end": searchInputEnd.value, "range": rangeInput.value, "gas_type": gasType.value})
                    .then(function (response) {
                        console.log(response);
                        if (response == "You Don't Need to Fuel Up for this Trip") {
                            window.alert("You Don't Need to Fuel Up for this Trip!");
                            calculate.innerHTML = "Calculate";
                        } else {
                            calculate.innerHTML = "Calculate";
                            initMap(response);
                        }
                    })
            }
            
        })

        function initMap(response) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer();
            const gas_stations = response;
    
            document.getElementById("map").style.height = '700px';
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 6,
            });
            directionsRenderer.setMap(map);
    
            for (let i = 0; i < gas_stations.length; i++) {
                const marker = new google.maps.Marker({
                    position: gas_stations[i]['position'],
                    map: map,
                })
    
                const contentString = 
                    '<div id="content">' +
                    '<div id="siteNotice">' +
                    "</div>" +
                    '<h1 id="firstHeading" class="firstHeading" style="font-size: 18px;">' + gas_stations[i]['station'] + '</h1>' +
                    '<div id="bodyContent">' +
                    "<ul>" + 
                    "<li>Price: " + gas_stations[i]['price'] + "</li>" +
                    "<li>Rating: " + gas_stations[i]['rating'] + "</li>"
                    "</div>" +
                    "</div>";
    
                const infowindow = new google.maps.InfoWindow({
                    content: contentString,
                });
    
                marker.addListener('click', () => {
                    infowindow.open({
                        anchor: marker,
                        map,
                        shouldFocus: false,
                      });
                })
            }
    
            calculateAndDisplayRoute(directionsService, directionsRenderer);
        }
    
        function calculateAndDisplayRoute(directionsService, directionsRenderer) {
            directionsService
            .route({
                origin: searchInput.value,
                destination: searchInputEnd.value,
                travelMode: google.maps.TravelMode.DRIVING,
            })
            .then((response) => {
                directionsRenderer.setDirections(response);
                const summaryPanel = document.getElementById("directions");
                summaryPanel.innerHTML = "";
            })
        }
        
    } else {
        const searchInput = document.getElementById('search-hidden');
        const searchInputEnd = document.getElementById('search-end-hidden');
        const rangeInput = document.getElementById('range-hidden');
        const gasType = document.getElementById('gas-type-hidden');
        const searchWrapper = document.querySelector('.wrapper-hidden');
        const searchWrapperEnd = document.querySelector('.wrapper-end-hidden')
        const resultsWrapper = document.querySelector('.results-hidden');
        const resultsWrapperEnd = document.querySelector('.results-end-hidden');
    
        searchInput.addEventListener('keyup', () => {
            let results = [];
            let input = searchInput.value;
    
            if (input.length > 0) {
                $.post("/autocomplete", {"input": input})
                    .then(function (response) {
                        results = response.filter((item) => {
                            return item.toLowerCase().includes(input.toLowerCase());
                        });
    
                    renderResults(results);
                })
            }
            renderResults(results);
        });
    
        
        searchInputEnd.addEventListener('keyup', () => {
            let results = [];
            let input = searchInputEnd.value;
    
            if (input.length > 0) {
                $.post("/autocomplete", {"input": input})
                    .then(function (response) {
                        results = response.filter((item) => {
                            return item.toLowerCase().includes(input.toLowerCase());
                        });
    
                        renderResultsEnd(results);
                    })
            }
            renderResultsEnd(results);
        });
    
        function renderResults(results) {
            if (results.length == 0) {
                return searchWrapper.classList.remove('show');
            }
        
            const content = results
            .map((item) => {
                return `<li><button type="button" class=dropdown-item-hidden id=autocomplete>${item}</button></li>`;
            })
            .join('');
        
            searchWrapper.classList.add('show');
            resultsWrapper.innerHTML = `<ul>${content}</ul>`;
    
            $(function(){
                $(".results-hidden ul li .dropdown-item-hidden#autocomplete").click(function(){
                    $(".search-hidden:first-child").text($(this).text());
                    $(".search-hidden:first-child").val($(this).text());
                    $(".search-hidden:first-child").css('color', '#fd5000c4');
                    return searchWrapper.classList.remove('show');
                });
            });
        }
    
        function renderResultsEnd(results) {
            if (results.length == 0) {
                return searchWrapperEnd.classList.remove('show');
            }
        
            const content = results
            .map((item) => {
                return `<li><button type="button" class=dropdown-item-hidden id=autocomplete>${item}</button></li>`;
            })
            .join('');
        
            searchWrapperEnd.classList.add('show');
            resultsWrapperEnd.innerHTML = `<ul>${content}</ul>`;
    
            $(function(){
                $(".results-end-hidden ul li .dropdown-item-hidden#autocomplete").click(function(){
                    $(".search-end-hidden:first-child").text($(this).text());
                    $(".search-end-hidden:first-child").val($(this).text());
                    $(".search-end-hidden:first-child").css('color', '#fd5000c4');
                    return searchWrapperEnd.classList.remove('show');
                });
            });
        }
    
        calculate.addEventListener('click', () => {
            if (document.getElementById("search-hidden").value == '' || document.getElementById("search-end-hidden").value == ''
                || document.getElementById("range-hidden").value == '' || document.getElementById("gas-type-hidden").firstChild == null) {
                window.alert("Please fill out the forms!");
            } else {
                calculate.innerHTML = "Loading...";
                $.post("/gas-station", {"start": searchInput.value, "end": searchInputEnd.value, "range": rangeInput.value, "gas_type": gasType.value})
                    .then(function (response) {
                        if (response == "You Don't Need to Fuel Up for this Trip") {
                            window.alert("You Don't Need to Fuel Up for this Trip!");
                            calculate.innerHTML = "Calculate";
                        } else {
                            console.log(response);
                            calculate.innerHTML = "Calculate";
                            initMap(response);
                        }
                    })
            }
            function initMap(response) {
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer();
                const gas_stations = response;
        
                document.getElementById("map").style.height = '700px';
                const map = new google.maps.Map(document.getElementById("map"), {
                    zoom: 6,
                });
                directionsRenderer.setMap(map);
        
                for (let i = 0; i < gas_stations.length; i++) {
                    const marker = new google.maps.Marker({
                        position: gas_stations[i]['position'],
                        map: map,
                    })
        
                    const contentString = 
                        '<div id="content">' +
                        '<div id="siteNotice">' +
                        "</div>" +
                        '<h1 id="firstHeading" class="firstHeading" style="font-size: 18px;">' + gas_stations[i]['station'] + '</h1>' +
                        '<div id="bodyContent">' +
                        "<ul>" + 
                        "<li>Price: " + gas_stations[i]['price'] + "</li>" +
                        "<li>Rating: " + gas_stations[i]['rating'] + "</li>"
                        "</div>" +
                        "</div>";
        
                    const infowindow = new google.maps.InfoWindow({
                        content: contentString,
                    });
        
                    marker.addListener('click', () => {
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                          });
                    })
                }
        
                calculateAndDisplayRoute(directionsService, directionsRenderer);
            }
        
            function calculateAndDisplayRoute(directionsService, directionsRenderer) {
                directionsService
                .route({
                    origin: searchInput.value,
                    destination: searchInputEnd.value,
                    travelMode: google.maps.TravelMode.DRIVING,
                })
                .then((response) => {
                    directionsRenderer.setDirections(response);
                    const summaryPanel = document.getElementById("directions");
                    summaryPanel.innerHTML = "";
                })
            }
        })
    }

    
})

