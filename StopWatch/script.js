let timerDisplay = document.getElementById('timer');
let startBtn = document.getElementById('start');
let resetBtn = document.getElementById('reset');
let musicToggleBtn = document.getElementById('music-toggle');
let playIcon = document.getElementById('play-icon');
let pauseIcon = document.getElementById('pause-icon');
let backgroundMusic = document.getElementById('background-music');
let musicStatus = document.getElementById('music-status');
let musicStatusText = document.getElementById('music-status-text');
let musicControls = document.getElementById('music-controls');

let musicSelect = document.getElementById('music-select');
let setMusicBtn = document.getElementById('set-music');


////////////////////////
let fsNote = document.getElementById('fs-note');

document.addEventListener('DOMContentLoaded', () => {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const contentDiv = document.getElementById('fs-content'); // Ensure this matches your HTML ID
    // Update the button text based on fullscreen state
    
    const updateButtonText = () => {
        if (document.fullscreenElement) {
            fullscreenBtn.textContent = 'See All Menu';
            fsNote.style.color = "white";
        } else {
            fullscreenBtn.textContent = 'Fullscreen';
        }
    };

    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
           
        } else {
            contentDiv.requestFullscreen();
        }
        updateButtonText();
        fsNote.style.color = "#282c34";
    });

    document.addEventListener('fullscreenchange', updateButtonText);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
    });

    // Initial update for button text on page load
    updateButtonText();
});


// Get the fullscreen button
// const fullscreenBtn = document.getElementById('fullscreen-btn');
// const contentDiv = document.getElementById('fs-content'); // The div you want to fullscreen

// fullscreenBtn.addEventListener('click', () => {
//     if (document.fullscreenElement) {
//         document.exitFullscreen();
//     } else {
//         contentDiv.requestFullscreen();
//     }
// });

// document.addEventListener('keydown', (event) => {
//     if (event.key === 'Escape' && document.fullscreenElement) {
//         document.exitFullscreen();
//     }
// });



// let backgroundMusic = document.getElementById('background-music');

// setMusicBtn.addEventListener('click', () => {
//     let selectedMusic = musicSelect.value;
//     backgroundMusic.src = `music/${selectedMusic}`;
//     backgroundMusic.currentTime = 0;
//     backgroundMusic.pause();  // Stop current music if playing
//     musicPlaying = false;
//     updateMusicStatus(""); // Clear the music status
//     updateMusicControls("reset"); // Hide controls until the music is played
// });

setMusicBtn.addEventListener('click', () => {
    let selectedMusic = musicSelect.value;
    backgroundMusic.src = `Assets/timer_bg_music/${selectedMusic}`;
    backgroundMusic.currentTime = 0;
    backgroundMusic.pause();  // Stop current music if playing
    musicPlaying = false;
    updateMusicStatus(""); // Clear the music status
    updateMusicControls("reset"); // Hide controls until the music is played
    backgroundMusic.play();
    // updateMusicControls("play");
    toggleMusic();
});




let startTime, updatedTime, difference;
let tInterval;
let paused = false;
let running = false;
let setTime = 0; // In seconds
let musicPlaying = false;

function startPauseResumeTimer() {
    if (!running && setTime > 0) {
        if (!paused) {
            startTime = new Date().getTime();
            difference = setTime * 1000;
            backgroundMusic.play();  // Play the background music
            musicPlaying = true;
            updateMusicStatus("Playing");
        } else {
            startTime = new Date().getTime() - (setTime * 1000 - difference);
            backgroundMusic.play();  // Resume the background music
            musicPlaying = true;
            updateMusicStatus("Playing");
        }
        tInterval = setInterval(updateTimer, 1000);
        running = true;
        startBtn.innerHTML = "Pause";
        updateMusicControls("play");
    } else if (running) {
        clearInterval(tInterval);
        paused = true;
        running = false;
        backgroundMusic.pause();  // Pause the background music
        musicPlaying = false;
        updateMusicStatus("Paused");
        startBtn.innerHTML = "Resume";
        updateMusicControls("pause");
    }
}

function resetTimer() {
    clearInterval(tInterval);
    timerDisplay.innerHTML = "00:00:00";
    paused = false;
    running = false;
    setTime = 0;
    backgroundMusic.pause();  // Pause the background music
    backgroundMusic.currentTime = 0;  // Reset the music to the beginning
    musicPlaying = false;
    updateMusicStatus("");  // Clear the music status
    startBtn.innerHTML = "Start";
    updateMusicControls("reset");
}

function setPreset(minutes) {
    resetTimer();
    setTime = minutes * 60;
    updateTimerDisplay();  // Update the display immediately with the new time
}

function setCustomTime() {
    let customTime = document.getElementById('custom-time').value;
    if (customTime && customTime > 0) {
        setPreset(parseInt(customTime));
    }
}

function updateTimerDisplay() {
    let hours = Math.floor(setTime / 3600);
    let minutes = Math.floor((setTime % 3600) / 60);
    let seconds = setTime % 60;

    timerDisplay.innerHTML = 
        (hours < 10 ? "0" : "") + hours + ":" + 
        (minutes < 10 ? "0" : "") + minutes + ":" + 
        (seconds < 10 ? "0" : "") + seconds;
}

function updateTimer() {
    updatedTime = new Date().getTime();
    difference = setTime * 1000 - (updatedTime - startTime);

    if (difference <= 0) {
        clearInterval(tInterval);
        timerDisplay.innerHTML = "00:00:00";
        running = false;
        backgroundMusic.pause();  // Stop the background music
        musicPlaying = false;
        updateMusicStatus("");
        startBtn.innerHTML = "Start";
        updateMusicControls("reset");
        return;
    }

    let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);

    timerDisplay.innerHTML = 
        (hours < 10 ? "0" : "") + hours + ":" + 
        (minutes < 10 ? "0" : "") + minutes + ":" + 
        (seconds < 10 ? "0" : "") + seconds;
}

function updateMusicStatus(status) {
    let musicFileName = backgroundMusic.src.split('/').pop();
    musicStatus.innerHTML = `Background Music: ${musicFileName}${status ? ` (${status}...)` : ''}`;
}

function updateMusicControls(state) {
    switch (state) {
        case "play":
            playIcon.style.display = "none";
            pauseIcon.style.display = "block";
            musicStatusText.innerHTML = "Pause Music";
            musicControls.style.display = "flex";
            updateMusicStatus("Playing");
            break;
        case "pause":
            playIcon.style.display = "block";
            pauseIcon.style.display = "none";
            musicStatusText.innerHTML = "Play Music";
            musicControls.style.display = "flex";
            updateMusicStatus("Paused");
            break;
        case "reset":
            playIcon.style.display = "block";
            pauseIcon.style.display = "none";
            musicStatusText.innerHTML = ""; // Clear the text
            musicControls.style.display = "flex";
            break;
        case "reloaded":
            musicControls.style.display = "none";
            break;
    }
}

function toggleMusic() {
    if (musicPlaying) {
        backgroundMusic.pause();
        musicPlaying = false;
        updateMusicControls("pause");
    } else {
        backgroundMusic.play();
        musicPlaying = true;
        updateMusicControls("play");
    }
}

// Initialize music controls on page load
window.addEventListener('load', () => {
    updateMusicControls("reloaded"); // Hide controls on page load
});

startBtn.addEventListener('click', startPauseResumeTimer);
resetBtn.addEventListener('click', resetTimer);
musicToggleBtn.addEventListener('click', toggleMusic);

