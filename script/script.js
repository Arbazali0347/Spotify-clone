
let currentsong = new Audio()
let currFolder;
let songs;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function fetchSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        else if (element.href.endsWith(".mp4")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUl = document.querySelector(".songs-list").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs){
        songUl.innerHTML = songUl.innerHTML + `
        <li>
            <img src="image/music.svg" alt="">
            <div class="info-songlist">
                <div class="song-name">${song.replaceAll("%20", " ")}</div>
                <div class="song-artist">Arbaz</div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img src="image/play-smol.svg" alt="">
            </div>
        </li>`
    }
    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playsong(e.querySelector(".info-songlist").firstElementChild.innerHTML.trim())
        })
    })

    // console.log(songs)
    return songs
}
const playsong = (track, pause = false) => {
    // var audio = new Audio("/songs/" + track);
    // console.log(audio)
    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        playButton.src = "image/pause.svg"
    }
    document.querySelector(".bar-info").innerHTML = `${decodeURI(track)}`
    document.querySelector(".run-time").innerHTML = "00:00"
    document.querySelector(".current-time").innerHTML = "00:00"
}

async function displayAlbums() {
    let a = await fetch('/songs/');
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            // get the Metadata
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card">
                     <div class="play-icon">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60" height="60">
                             <!-- Circle Background -->
                             <circle cx="50" cy="50" r="48" fill="#28a745"/>
                             <!-- Play Triangle -->
                             <polygon points="40,30 40,70 70,50" fill="#000" />
                         </svg>
                     </div>
                     <img src="/songs/${folder}/cover.jpeg" alt="">
                     <h2>${folder}</h2>
                     <p>there are ${folder} best song in this list</p>
            </div>`
        }

    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let h2Text = item.currentTarget.querySelector("h2").innerText;
            document.querySelector(".library h3").innerHTML = h2Text
            songs = await fetchSongs(`songs/${item.currentTarget.dataset.folder}`)
            // playsong(songs[0])
        })
    })
}

async function main() {
    await fetchSongs("songs/Old-song");
    document.querySelector(".library h3").innerHTML = "Old-song"
    playsong(songs[0], true)
    // load the songs
    displayAlbums()
    // Play button click 
    playButton.addEventListener('click', () => {
        if (currentsong.paused) {
            currentsong.play();
            playButton.src = "image/pause.svg"
        }
        else if (currentsong.pause) {
            currentsong.pause();
            playButton.src = "image/play.svg"
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".run-time").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}`
        document.querySelector(".current-time").innerHTML = `${secondsToMinutesSeconds(currentsong.duration)}`
        // Seekbar ko move karo (bas tab jab duration valid ho)
        if (currentsong.duration && !isNaN(currentsong.duration)) {
            const progressPercent = (currentsong.currentTime / currentsong.duration) * 100;
            seekBar.value = progressPercent;
        }
    })

    // Seekbar ko pakdo
    const seekBar = document.getElementById("seekBar");
    // Jab user seekbar ko drag kare
    seekBar.addEventListener('input', () => {
        // Calculate karo naya time
        const newTime = (seekBar.value / 100) * currentsong.duration;
        // Song ka time set karo
        currentsong.currentTime = newTime;
    });

    // Add event listener click hamburger
    document.querySelector(".ham-buger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    });

    // Add event listener close button
    document.getElementById("close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    });

    // Add event listener previes 
    previes.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playsong(songs[index - 1])
        }
    });
    // Add event listener next 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playsong(songs[index + 1])
            console.log(songs[index + 1])
        }
    });

    // Add event listener to valum change
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(`volum to song = ${e.target.value}`)
        document.querySelector(".volume-range").innerHTML = e.target.value
        currentsong.volume = parseInt(e.target.value) / 100

    });
    // Add eventlistener volume logo change and volume change
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("image/volume.svg")) {
            e.target.src = e.target.src.replace("image/volume.svg", "image/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".volume-range").innerHTML = currentsong.volume
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".volume-range").innerHTML = "10"
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })
}
main()