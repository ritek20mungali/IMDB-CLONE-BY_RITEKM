




$(document).ready(function () {
    var apikey = "c8204f21";
    var timeoutId; // To store the timeout ID for debounce

    function searchMovies() {
        var movie = $("#movie").val();
        if (movie.trim() === "") {
            // If the search query is empty, clear the results
            $("#result").html("");
            return;
        }

        var settings = {
            "url": "http://www.omdbapi.com/?apikey=" + apikey + "&s=" + movie, // Use 's' instead of 't'
            "method": "GET",
            "timeout": 0,
        };

        $.ajax(settings).done(function (data) {
            console.log(data);
            if (data.Response === "True") {
                // If the API returns valid data, display the search results
                var movies = data.Search;
                var result = "";
                if (movies && movies.length > 0) {
                    movies.forEach(function (movieData) {
                        var imdbID = movieData.imdbID;
                        var isFavorite = isMovieInFavorites(imdbID);
                        result += `
                            <div class="card mb-3">
                                <div class="row g-0">
                                    <div class="col-md-4">
                                        <img src="${movieData.Poster}" alt="Movie Poster" class="img-fluid">
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <h5 class="card-title">${movieData.Title}</h5>
                                            <p class="card-text">Released: ${movieData.Year}</p>
                                            
                                            <a class="btn btn-primary addToFavorites" data-imdbid="${imdbID}" ${isFavorite ? 'disabled' : ''}>Add to Favorites</a>

                                            <a class="btn btn-primary details" data-imdbid="${imdbID}">Details</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    result = "<p>No results found.</p>";
                }
                $("#result").html(result);
            } else {
                // If the API does not return valid data, display an error message
                $("#result").html("<p>No results found.</p>");
            }
        });
    }

    function isMovieInFavorites(imdbID) {
        var favorites = getFavorites();
        return favorites.includes(imdbID);
    }

    function getFavorites() {
        var favoritesString = localStorage.getItem("favorites");
        return favoritesString ? JSON.parse(favoritesString) : [];
    }

    function updateFavorites(favorites) {
        var favoritesString = JSON.stringify(favorites);
        localStorage.setItem("favorites", favoritesString);
    }

    function displayFavorites() {
        var favorites = getFavorites();
        var favoritesHTML = ""; // Initialize an empty string to store the HTML for favorites
    
        favorites.forEach(function (imdbID) {
            var detailsUrl = "http://www.omdbapi.com/?apikey=" + apikey + "&i=" + imdbID;
            $.ajax({
                url: detailsUrl,
                method: "GET",
                timeout: 0,
                success: function (data) {
                    // Handle the movie details data here
                    favoritesHTML += `
                        <div class="card mb-3">
                            <div class="row g-0">
                                <div class="col-md-4">
                                    <img src="${data.Poster}" alt="Movie Poster" class="img-fluid">
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                        <h5 class="card-title">${data.Title}</h5>
                                        <p class="card-text">Released: ${data.Year}</p>
                                        <a class="btn btn-primary details" data-imdbid="${data.imdbID}">Details</a>
                                        <a class="btn btn-primary delete" data-imdbid="${data.imdbID}">Remove From Favorites</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
    
                    // After iterating through all favorites, set the HTML to the #favorites element
                    if (favoritesHTML !== "") {
                        $("#favorites").html(favoritesHTML);
                    } else {
                        $("#favorites").html("<p>No favorites added yet.</p>");
                    }
                },
                error: function () {
                    // Handle error if details cannot be fetched
                    console.log("Error fetching movie details.");
                }
            });
        });
    }
    

    

    $(document).on("click", ".details", function () {
        var imdbID = $(this).data("imdbid");
        var detailsUrl = "http://www.omdbapi.com/?apikey=" + apikey + "&i=" + imdbID;
    
        $.ajax({
            url: detailsUrl,
            method: "GET",
            timeout: 0,
            success: function (data) {
                console.log(data);
                // Populate the movie details in the card
                $("#movieDetailsPoster").attr("src", data.Poster);
                $("#movieDetailsTitle").text("Movie Name: " + data.Title);
                $("#movieDetailsActors").text("Actors: " + data.Actors);
                $("#movieDetailsGenre").text("Genre: " + data.Genre);
                $("#movieDetailsImdbRating").text("IMDb Rating: " + data.imdbRating + "/10");
                $("#movieDetailsReleased").text("Released: " + data.Year);
                // Add other movie details here (e.g., Plot, Director, etc.)
    
                // Show the movie details card
                $("#movieDetailsCard").removeClass("d-none");
            },
            error: function () {
                // Handle error if details cannot be fetched
                console.log("Error fetching movie details.");
            }
        });
    });
    

    // Event delegation for the "Close" button inside the movie details card
$(document).on("click", "#closeDetailsBtn", function () {
    // Hide the movie details card
    $("#movieDetailsCard").addClass("d-none");
});

    

    $(document).on("click", ".addToFavorites", function () {
        var imdbID = $(this).data("imdbid");
        alert("MOVIE HAS BEEN ADDED TO YOUOR LIST");
        var favorites = getFavorites();
        if (!favorites.includes(imdbID)) {
            favorites.push(imdbID);
            updateFavorites(favorites);
            $(this).attr("disabled", true);
        }
        
    });

    $(document).on("click", ".delete", function () {
        var imdbID = $(this).data("imdbid");
        var favorites = getFavorites();
        var index = favorites.indexOf(imdbID);
        if (index !== -1) {
            favorites.splice(index, 1);
            updateFavorites(favorites);
            displayFavorites(); // Refresh the favorites list after removal
        }
    });

    $("#movie").on("keyup", function () {
        // Debounce the search to avoid frequent API calls while typing
        clearTimeout(timeoutId);
        timeoutId = setTimeout(searchMovies, 500); // Adjust the debounce delay as needed
    });

    $("#movieForm").submit(function (e) {
        e.preventDefault();
        searchMovies();
    });

    displayFavorites();
});
