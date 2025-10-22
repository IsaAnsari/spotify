window.addEventListener("load", () => {
    document.getElementById("loader").style.display = "none";
});


const basePath = window.location.hostname.includes("netlify.app") ? "." : "";


console.log('Lets Write JavaScript');

let currentSong = new Audio();
let songs;
let currFolder;

let allSongs = [];  // all folders ke songs yahan store karenge



let currentSongIndex = 0;
let currentPlaylist = [];



async function preloadAllSongs() {
    let a = await fetch(`${basePath}/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0].replaceAll("%2C", ",");

            let folderReq = await fetch(`${basePath}/songs/${folder}/list.json`);
            let folderRes = await folderReq.json();

            if (folderRes.songs) {
                folderRes.songs.forEach(songName => {
                    allSongs.push({ name: decodeURIComponent(songName), folder });
                });
            }
        }
    }
}


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder = "songs/A. R. Rahman") {
    // ✅ Always keep 'songs/' prefix
    if (!folder.startsWith("songs/")) folder = `songs/${folder}`;

    currFolder = folder;
    const encodedFolder = encodeURIComponent(folder.replace("songs/", ""));

    const res = await fetch(`${basePath}/songs/${encodedFolder}/list.json`);

    if (!res.ok) {
        console.error(`❌ Could not load list.json for ${folder}`);
        return;
    }

    const data = await res.json();
    songs = data.songs || [];

    const songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";

    songs.forEach((song, index) => {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(song)}</div>
                    <div class="artistName">${data.title}</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    });

    Array.from(document.querySelectorAll(".song-list li")).forEach((li, index) => {
        li.addEventListener("click", () => {
            document.querySelectorAll(".song-list li .playnow img").forEach(img => img.src = "img/play.svg");
            li.querySelector(".playnow img").src = "img/pause.svg";
            currentPlaylist = songs;
            currentSongIndex = index;
            playMusic(songs[index]);
        });
    });

    currentPlaylist = songs;
    return songs;
}



const playMusic = (track, pause = false) => {
    // currentSong.src = `${basePath}/songs/${currFolder}/${track}`;
    currentSong.src = `${basePath}/${currFolder}/${track}`;



    // ✅ Update index properly every time
    currentSongIndex = currentPlaylist.indexOf(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    // Update song info
    document.querySelector(".song-info").innerHTML = decodeURIComponent(track)
        .replaceAll("%20", " ")
        .replaceAll("%26", " ")
        .replaceAll("%2C", ",");

    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";

    // Reset sidebar icons
    document.querySelectorAll(".song-list li .playnow img").forEach(img => {
        img.src = "img/play.svg";
    });

    // Highlight the playing song
    let matchingLi = Array.from(document.querySelectorAll(".song-list li")).find(li =>
        li.querySelector(".info div").innerText.trim() === decodeURIComponent(track).trim()
    );

    if (matchingLi) {
        let icon = matchingLi.querySelector(".playnow img");
        if (icon) icon.src = "img/pause.svg";
    }
};



async function displayAlbums() {
    console.log("Displaying albums");

    const cardContainer = document.querySelector(".cardContainer");

    try {
        const res = await fetch(`${basePath}/songs.json`);
        const data = await res.json();

        for (const folder of data.artists) {
            const encodedFolder = encodeURIComponent(folder);

            // Show temporary placeholder card first
            const tempCard = document.createElement("div");
            tempCard.classList.add("card");
            tempCard.dataset.folder = `songs/${encodedFolder}`;
            tempCard.innerHTML = `
                <div class="play">
                    <svg viewBox="0 0 24 24"><path d="m7.05 3.606 
                    13.49 7.788a.7.7 0 0 1 0 1.212L7.05 
                    20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 
                    0 0 1 1.05-.606"></path></svg>
                    </div>
                <img src="./img/default-cover.jpg" alt="loading...">
                <h2>${folder}</h2>
                <p>Loading...</p>
            `;
            cardContainer.appendChild(tempCard);

            // Load actual info.json asynchronously
            try {
                // const infoRes = await fetch(`${basePath}/songs/${encodedFolder}/info.json`);
                const infoRes = await fetch(`${basePath}/songs/${folder}/info.json`);

                if (infoRes.ok) {
                    const info = await infoRes.json();
                    tempCard.querySelector("h2").textContent = info.title || folder;
                    tempCard.querySelector("p").textContent = info.description || "Playlist";
                    tempCard.querySelector("img").src = `songs/${encodedFolder}/cover.jpg`;
                }
            } catch (err) {
                console.warn(`⚠️ Info missing for ${folder}`);
            }

            // Add click listener to load playlist and auto-play first song
            tempCard.addEventListener("click", async (e) => {
                const folderPath = decodeURIComponent(e.currentTarget.dataset.folder);
                const loadedSongs = await getSongs(folderPath);

                document.querySelector(".song-list ul").scrollTop = 0;

                if (loadedSongs && loadedSongs.length > 0) {
                    currentSong.src = `${basePath}/${currFolder}/${loadedSongs[0]}`;

                    currentSong.addEventListener("canplaythrough", function handler() {
                        currentSong.removeEventListener("canplaythrough", handler);
                        playMusic(loadedSongs[0]);
                    });
                }

                // 📱 Auto open sidebar on mobile
                if (window.innerWidth <= 768) {
                    document.querySelector(".left").style.left = "0";
                }
            });
        }
    } catch (err) {
        console.error("❌ Could not load songs.json", err);
    }
}





async function main() {
    // Get the list of all the songs
    await getSongs("A. R. Rahman");
    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums()



    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"


            // sidebar icon bhi pause kar do
            let track = currentSong.src.split("/").slice(-1)[0];
            document.querySelectorAll(".song-list li .playnow img").forEach(img => {
                img.src = "img/play.svg"; // reset
            });
            let matchingLi = Array.from(document.querySelectorAll(".song-list li")).find(li =>
                li.querySelector(".info div").innerText.trim() === decodeURI(track).trim()
            );
            if (matchingLi) {
                let icon = matchingLi.querySelector(".playnow img");
                if (icon) icon.src = "img/pause.svg";
            }

        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"


            // sidebar icon bhi play kar do
            let track = currentSong.src.split("/").slice(-1)[0];
            let matchingLi = Array.from(document.querySelectorAll(".song-list li")).find(li =>
                li.querySelector(".info div").innerText.trim() === decodeURI(track).trim()
            );
            if (matchingLi) {
                let icon = matchingLi.querySelector(".playnow img");
                if (icon) icon.src = "img/play.svg";
            }


        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })




    // Toggle search bar on "Search" click
    document.querySelector(".home ul li:nth-child(2)").addEventListener("click", () => {
        const searchBar = document.querySelector(".searchContainer");
        if (searchBar.style.display === "none") {
            searchBar.style.display = "block";
            document.getElementById("songSearch").focus();
        } else {
            searchBar.style.display = "none";
        }
    });


    // 🔍 Search with instant play (final fixed)
    document.addEventListener("input", async (e) => {
        if (e.target.id !== "songSearch") return;

        const query = e.target.value.toLowerCase().trim();
        const songUL = document.querySelector(".song-list ul");
        songUL.innerHTML = "";

        if (query === "") return;

        // Filter allSongs for query
        const results = allSongs.filter(song =>
            song.name.toLowerCase().includes(query) ||
            song.folder.toLowerCase().includes(query)
        );

        results.forEach(song => {
            const cleanName = song.name.replaceAll("%20", " ").replaceAll("%26", " ").replaceAll("%2C", ",");
            const cleanArtist = song.folder.replaceAll("%20", " ").replaceAll("%26", " ").replaceAll("%2C", ",");
            songUL.innerHTML += `
            <li data-folder="${song.folder}" data-file="${song.name}">
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${cleanName}</div>
                    <div class="artistName">${cleanArtist}</div>
                </div>
                <div class="playnow">
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        });

        // 🎵 Play song on click
        Array.from(document.querySelectorAll(".song-list li")).forEach(li => {
            li.addEventListener("click", async () => {
                const folder = decodeURIComponent(li.dataset.folder);
                const file = decodeURIComponent(li.dataset.file);

                currFolder = `songs/${folder}`;
                const loadedSongs = await getSongs(currFolder);
                if (!loadedSongs) return;

                currentPlaylist = loadedSongs;
                currentSongIndex = loadedSongs.findIndex(s => decodeURIComponent(s) === file);

                if (currentSongIndex >= 0) {
                    currentSong.src = `${basePath}/songs/${folder}/${encodeURIComponent(file)}`;
                    currentSong.addEventListener("canplaythrough", function handler() {
                        currentSong.removeEventListener("canplaythrough", handler);
                        playMusic(file);
                    });
                }

                // 📱 Mobile sidebar auto open
                if (window.innerWidth <= 768) {
                    document.querySelector(".left").style.left = "0";
                }
            });
        });
    });



    await preloadAllSongs();



    // Auto-next functionality
    currentSong.addEventListener("ended", () => {
        // ✅ Check if there’s a next song in the current playlist
        if (currentSongIndex < currentPlaylist.length - 1) {
            currentSongIndex++;
            playMusic(currentPlaylist[currentSongIndex]);
        } else {
            // No more songs — stop playback
            play.src = "img/play.svg";
        }
    });


}

main()
