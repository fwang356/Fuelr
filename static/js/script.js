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

        $.post("/autocomplete", {"input": input})
            .then(function (response) {
                if (input.length) {
                    results = response.filter((item) => {
                        return item.toLowerCase().includes(input.toLowerCase());
                    });
                }
                renderResults(results);
            })
        });

    

    searchInputEnd.addEventListener('keyup', () => {
        let results = [];
        let input = searchInputEnd.value;

        $.post("/autocomplete", {"input": input})
                .then(function (response) {
                    if (input.length) {
                        results = response.filter((item) => {
                            return item.toLowerCase().includes(input.toLowerCase());
                        });
                    }
                    renderResultsEnd(results);
                })
        });

    function renderResults(results) {
        if (!results.length) {
            return searchWrapper.classList.remove('show');
        }
    
        const content = results
        .map((item) => {
            return `<li>${item}</li>`;
        })
        .join('');
    
        searchWrapper.classList.add('show');
        resultsWrapper.innerHTML = `<ul>${content}</ul>`;
    }

    function renderResultsEnd(results) {
        if (!results.length) {
            return searchWrapperEnd.classList.remove('show');
        }
    
        const content = results
        .map((item) => {
            return `<li>${item}</li>`;
        })
        .join('');
    
        searchWrapperEnd.classList.add('show');
        resultsWrapperEnd.innerHTML = `<ul>${content}</ul>`;
    }
});