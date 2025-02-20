const spotifyClientId = "d3e64aff65f84d73b5c5e7ab59a79355";
const spotifyClientSecret = "2f45a52281aa42d48fe920f8797f6ead";
const youtubeApiKey = "AIzaSyC6AiM65oXxS15ot-z1kS0LE6akfoDPmaM";
let spotifyAccessToken = "";

async function getSpotifyToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${spotifyClientId}&client_secret=${spotifyClientSecret}`
    });

    const data = await response.json();
    spotifyAccessToken = data.access_token;
}

async function searchSpotify() {
    const query = document.getElementById("searchInput").value;
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        headers: { "Authorization": `Bearer ${spotifyAccessToken}` }
    });

    const data = await response.json();
    displayResults(data.tracks.items);
}

function displayResults(tracks) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = '';

    tracks.forEach(track => {
        const songTitle = `${track.name} - ${track.artists[0].name}`;
        
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${track.album.images[0].url}" alt="${track.name}">
            <h3>${track.name}</h3>
            <p>${track.artists[0].name}</p>
            <button onclick="searchYouTube('${songTitle}')">▶ Play</button>
            <button onclick="likeSong('${songTitle}')">❤️ Like</button>
        `;
        resultsDiv.appendChild(card);
    });
}

async function searchYouTube(query) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)} music video&key=${youtubeApiKey}`);
        const data = await response.json();

        if (data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            console.log("Playing Video ID: ", videoId);
            playYouTube(videoId);
        } else {
            alert("No matching YouTube video found! Try another song.");
        }
    } catch (error) {
        console.error("YouTube API Error: ", error);
        alert("YouTube API failed. Check your API key.");
    }
}
                            
let youtubePlayer; 
function playYouTube(videoId) {
    if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
        console.error("YouTube API not loaded. Retrying...");
        setTimeout(() => playYouTube(videoId), 1000);
        return;
    }

    if (youtubePlayer) {
        youtubePlayer.loadVideoById(videoId);
    } else {
        youtubePlayer = new YT.Player("player", {
            height: "250",
            width: "400",
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                rel: 0,
                modestbranding: 1
            },
            events: {
                onReady: (event) => event.target.playVideo(),
                onError: (event) => {
                    console.error("YouTube Player Error:", event);
                    alert("An error occurred while loading the video because video is restricted and can only be played in YouTube. Please try again.");
                },
            }
        });
    }
}

function likeSong(song) {
    let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
    
    if (!likedSongs.includes(song)) {
        likedSongs.push(song);
        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
        alert(`❤️ Added to Liked Songs: ${song}`);
        displayLikedSongs(); 
    } else {
        alert("✅ Already in Liked Songs!");
    }
}

function displayLikedSongs() {
    const likedSongsDiv = document.getElementById("likedSongs");
    const likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
    
    likedSongsDiv.innerHTML = ''; 

    if (likedSongs.length > 0) {
        likedSongs.forEach(song => {
            const songElement = document.createElement("div");
            songElement.classList.add("liked-song");
            songElement.innerText = song; 
            likedSongsDiv.appendChild(songElement);
        });
    } else {
        likedSongsDiv.innerHTML = "<p>No liked songs yet!</p>";
    }
}

window.onload = function() {
    displayLikedSongs(); 
    getSpotifyToken(); 
};


window.onload = getSpotifyToken;
