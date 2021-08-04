$(function(){
    $(".dropdown-menu .dropdown-item").click(function(){
        $(".btn-dropdown:first-child").text($(this).text());
        $(".btn-dropdown:first-child").val($(this).text());
        $(".btn-dropdown:first-child").css('color', '#fd5000c4');
    });
});

$(document).ready(function() {
    const searchInput = document.getElementById('search');
    const searchInputEnd = document.getElementById('search-end');
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
            console.log(input.length)
            $.post("/autocomplete", {"input": input})
                .then(function (response) {
                    console.log(response);
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
});

// TODO: Send start/end to Flask server and get directions.
// Add gas stations as markers.
$(document).ready(function() {
    const calculate = document.getElementById("calculate");

    calculate.addEventListener('click', () => {
        initMap();
    })

    function initMap() {
        const start = { lat: -25.344, lng: 131.036 };
        const end = {};

        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: start,
        });

        const marker = new google.maps.Marker({
            position: start,
            map: map,
        });
    }
})

