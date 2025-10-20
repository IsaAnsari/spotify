// --- BASE PATH FIX for hosting ---
// const basePath = window.location.origin.includes("github.io") ? "." : "";
const basePath = "";


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

// async function getSongs(folder) {
//     currFolder = folder;
//     let a = await fetch(`/${folder}/`)
//     let response = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let as = div.getElementsByTagName("a")

//     songs = []
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1])
//         }
//     }

//     // Show all the songs in the playlists
//     let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
//     songUL.innerHTML = ""
//     for (const song of songs) {
//         songUL.innerHTML = songUL.innerHTML + `<li> 
//                             <img class="invert" src="img/music.svg" alt="">
//                             <div class="info">
//                                 <div>${song.replaceAll("%20", " ").replaceAll("%26", " ").replaceAll("%2C", ",")}</div>
//                                 <div class = "artistName">${song.split("_")[1].split(".")[0].replaceAll("%20", " ").replaceAll("%26", " ").replaceAll("%2C", ",")}</div>
//                             </div>
//                             <div class="playnow">
//                                 <!-- <span>Play Now</span> -->
//                                 <img class="invert" src="img/play.svg" alt="play svg">
//                             </div>
//                         </li>`;
//     }

//     //! Atach an event listener to each song
//     // Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
//     //     e.addEventListener("click", element => {
//     //         playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
//     //     })
//     // })

//     // Attach an event listener to each song li
//     Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((li, index) => {
//         li.addEventListener("click", () => {
//             // Reset all icons to play
//             document.querySelectorAll(".song-list li .playnow img").forEach(img => {
//                 img.src = "img/play.svg";
//             });

//             // Current li icon = pause
//             let currentIcon = li.querySelector(".playnow img");
//             if (currentIcon) currentIcon.src = "img/pause.svg";

//             // ✅ Set correct playlist and index
//             currentPlaylist = songs;
//             currentSongIndex = index;

//             // ✅ Play the selected track
//             playMusic(songs[index]);
//         });
//     });


//     currentPlaylist = songs; // current folder ke sab songs save
//     currentSongIndex = 0;    // start from 0 each time



//     return songs

// }

// async function getSongs(folder) {
//     currFolder = folder;
//     const res = await fetch(`${basePath}/${folder.startsWith("songs/") ? folder : "songs/" + folder}/list.json`);


//     const data = await res.json();
//     songs = data.songs;

//     // Show all songs in sidebar
//     const songUL = document.querySelector(".song-list ul");
//     songUL.innerHTML = "";

//     songs.forEach((song, index) => {
//         songUL.innerHTML += `
//             <li>
//                 <img class="invert" src="img/music.svg" alt="">
//                 <div class="info">
//                     <div>${song.replaceAll("%20", " ").replaceAll("%26", " ")}</div>
//                     <div class="artistName">${data.title}</div>
//                 </div>
//                 <div class="playnow">
//                     <img class="invert" src="img/play.svg" alt="">
//                 </div>
//             </li>`;
//     });

//     // Add click events
//     Array.from(document.querySelectorAll(".song-list li")).forEach((li, index) => {
//         li.addEventListener("click", () => {
//             document.querySelectorAll(".song-list li .playnow img").forEach(img => img.src = "img/play.svg");
//             li.querySelector(".playnow img").src = "img/pause.svg";
//             currentPlaylist = songs;
//             currentSongIndex = index;
//             playMusic(songs[index]);
//         });
//     });

//     currentPlaylist = songs;
//     return songs;
// }

async function getSongs(folder = "songs/A. R. Rahman") {
    currFolder = folder;

    // ✅ Safe check to prevent undefined errors
    if (!folder) {
        console.error("❌ getSongs() called without a folder path!");
        return;
    }

    // ✅ Normalize the path properly
    const folderPath = folder.startsWith("songs/") ? folder : `songs/${folder}`;
    const res = await fetch(`${basePath}/${folderPath}/list.json`);

    if (!res.ok) {
        console.error(`❌ Could not load list.json for ${folderPath}`);
        return;
    }

    const data = await res.json();
    songs = data.songs || [];

    // Show all songs in sidebar
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

    // Add click listeners
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
    // currentSong.src = `/${currFolder}/` + track;
    currentSong.src = currFolder + '/' + track

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


// async function displayAlbums(params) {
//     console.log("displaying albums")
//     // let a = await fetch(`/songs/`)
//     let a = await fetch(`songs/`)
//     // let a = await fetch(`http://127.0.0.1:5500/songs/`)
//     let response = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let anchors = div.getElementsByTagName("a")
//     let cardContainer = document.querySelector(".cardContainer")
//     let array = Array.from(anchors)
//     for (let index = 0; index < array.length; index++) {
//         const e = array[index];

//         if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
//             // console.log(e.href.split("/").slice(-2)[0])
//             let folder = e.href.split("/").slice(-1)[0]
//             //! Get the metadata of the folder
//             // let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
//             // let a = await fetch(`/songs/${folder}/info.json`)
//             let a = await fetch(`songs/${folder}/info.json`)
//             let response = await a.json();
//             console.log(response)
//             cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
//                         <div class="play">
//                             <svg data-encore-id="icon" role="img" aria-hidden="true"
//                                 class="e-91000-icon e-91000-baseline" viewBox="0 0 24 24">
//                                 <path
//                                     d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606">
//                                 </path>
//                             </svg>
//                         </div>
//                         <img src="/songs/${folder}/cover.jpg" alt="cover jpg">
//                         <h2>${response.title}</h2>
//                         <p>${response.description}</p>
//                     </div>`
//         }
//     }

//     // Load the playlist whenever card is clicked
//     Array.from(document.getElementsByClassName("card")).forEach((e) => {
//         e.addEventListener("click", async (item) => {
//             console.log("Fetching Songs")
//             songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
//             playMusic(songs[0])

//             // Sidebar ka pehla li ka icon pause kar do
//             let firstLi = document.querySelector(".song-list li");
//             if (firstLi) {
//                 let firstIcon = firstLi.querySelector(".playnow img");
//                 if (firstIcon) firstIcon.src = "img/pause.svg";
//             }

//             // 👇 NEW: agar mobile screen hai to sidebar open karo
//             if (window.innerWidth <= 1400) {
//                 document.querySelector(".left").style.left = "0";
//             }

//         })
//     })
// }

async function displayAlbums() {
    console.log("Displaying albums");
    const cardContainer = document.querySelector(".cardContainer");

    try {
        const res = await fetch(`${basePath}/songs.json`);
        const data = await res.json();

        for (const folder of data.artists) {
            try {
                const infoRes = await fetch(`${basePath}/songs/${folder}/info.json`);
                const info = await infoRes.json();

                cardContainer.innerHTML += `
                    <div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <svg viewBox="0 0 24 24"><path d="m7.05 3.606 
                            13.49 7.788a.7.7 0 0 1 0 1.212L7.05 
                            20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 
                            0 0 1 1.05-.606"></path></svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg" alt="cover">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (err) {
                console.warn(`⚠️ Error loading ${folder}`, err);
            }
        }

        // Add click listeners
        Array.from(document.getElementsByClassName("card")).forEach((card) => {
            card.addEventListener("click", async (e) => {
                const folder = e.currentTarget.dataset.folder;
                songs = await getSongs(folder);
                playMusic(songs[0]);
            });
        });

    } catch (err) {
        console.error("❌ Could not load songs.json", err);
    }
}



async function main() {
    // Get the list of all the songs
    // await getSongs("songs/ncs");
    // await getSongs();
    await getSongs("songs/A. R. Rahman");
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

    // Live search songs
    document.addEventListener("input", (e) => {
        if (e.target.id === "songSearch") {
            let query = e.target.value.toLowerCase();
            let allSongs = document.querySelectorAll(".song-list li");

            allSongs.forEach(li => {
                let songName = li.querySelector(".info div").innerText.toLowerCase();
                let artistName = li.querySelector(".artistName").innerText.toLowerCase();

                if (songName.includes(query) || artistName.includes(query)) {
                    li.style.display = "flex";
                } else {
                    li.style.display = "none";
                }
            });
        }
    });



    document.addEventListener("input", (e) => {
        if (e.target.id === "songSearch") {
            let query = e.target.value.toLowerCase().trim();
            let songUL = document.querySelector(".song-list ul");
            songUL.innerHTML = ""; // clear old list

            let results = allSongs.filter(song =>
                song.name.toLowerCase().includes(query)
            );

            results.forEach(song => {
                songUL.innerHTML += `
                <li data-folder="${song.folder}" data-file="${song.name}"> 
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.name.replaceAll("%20", " ").replaceAll("%26", " ").replaceAll("%2C", ",")}</div>
                <div class="artistName">${song.folder.replaceAll("%20", " ").replaceAll("%26", " ").replaceAll("%2C", ",")}</div>
            </div>
            <div class="playnow">
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
            });

            // Attach event listener to new li (for search results)
            // Attach event listener to new li (for search results)
            Array.from(document.querySelectorAll(".song-list li")).forEach((li) => {
                li.addEventListener("click", async () => {
                    const folder = li.getAttribute("data-folder");
                    const file = li.getAttribute("data-file");

                    // ✅ Update current folder
                    currFolder = "songs/" + folder;

                    // ✅ Fetch that playlist & update currentPlaylist
                    songs = await getSongs(currFolder);
                    currentPlaylist = songs;

                    // ✅ Decode filename to match real array element
                    const decodedFile = decodeURIComponent(file);
                    currentSongIndex = songs.findIndex(song => decodeURIComponent(song) === decodedFile);

                    // ✅ Play clicked song
                    playMusic(songs[currentSongIndex]);
                });
            });


        }
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



