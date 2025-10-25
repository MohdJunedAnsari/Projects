
// const fileInput = document.getElementById('file-input');
// const audio = document.getElementById('audio');
// const audioSource = document.getElementById('audio-source');
// const songName = document.getElementById('song-name');

// fileInput.addEventListener('change', function () {
//     const file = this.files[0];
//     if (file) {
//         const url = URL.createObjectURL(file);
//         audioSource.src = url;
//         audio.load();
//         songName.textContent = file.name;
//         audio.play();
//     }
// });


// === Element references ===
const fileInput = document.getElementById('fileInput');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const seek = document.getElementById('seek');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const volume = document.getElementById('volume');
const playlistList = document.getElementById('playlistList');
const clearPlaylist = document.getElementById('clearPlaylist');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const saveMeta = document.getElementById('saveMeta');
const themeToggle = document.getElementById('themeToggle');

// === State ===
let playlist = [];
let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;

// === Load saved metadata ===
if (localStorage.getItem('playlistMeta')) {
    playlist = JSON.parse(localStorage.getItem('playlistMeta'));
    renderPlaylist();
}

// === Event Listeners ===
fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    files.forEach(file => {
        playlist.push({
            name: file.name,
            artist: 'Unknown Artist',
            file: file
        });
    });
    renderPlaylist();
    savePlaylistMeta();
    if (playlist.length === files.length) {
        loadTrack(0, true);
    }
});

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeTrack(-1));
nextBtn.addEventListener('click', () => changeTrack(1));

seek.addEventListener('input', () => {
    audio.currentTime = seek.value;
});

volume.addEventListener('input', () => {
    audio.volume = volume.value;
});

audio.addEventListener('timeupdate', updateSeek);
audio.addEventListener('loadedmetadata', () => {
    seek.max = Math.floor(audio.duration);
    durTime.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', onTrackEnd);

clearPlaylist.addEventListener('click', () => {
    playlist = [];
    renderPlaylist();
    savePlaylistMeta();
    audio.pause();
    audio.src = '';
    trackTitle.textContent = '';
    trackArtist.textContent = '';
});

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
});

saveMeta.addEventListener('click', savePlaylistMeta);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
});

// Restore theme preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
}

// === Functions ===
function renderPlaylist() {
    playlistList.innerHTML = '';
    playlist.forEach((track, i) => {
        const li = document.createElement('li');
        li.textContent = track.name;
        li.classList.toggle('active', i === currentIndex);
        li.addEventListener('click', () => loadTrack(i, true));
        playlistList.appendChild(li);
    });
}

function loadTrack(index, play = false) {
    currentIndex = index;
    const track = playlist[currentIndex];
    if (track.file) {
        audio.src = URL.createObjectURL(track.file);
        trackTitle.textContent = track.name;
        trackArtist.textContent = track.artist || 'Unknown Artist';
        renderPlaylist();
        if (play) {
            audio.play();
            playBtn.textContent = '⏸';
        } else {
            playBtn.textContent = '▶';
        }
    }
}

function changeTrack(direction) {
    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentIndex = (currentIndex + direction + playlist.length) % playlist.length;
    }
    loadTrack(currentIndex, true);
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸';
    } else {
        audio.pause();
        playBtn.textContent = '▶';
    }
}

function updateSeek() {
    seek.value = Math.floor(audio.currentTime);
    curTime.textContent = formatTime(audio.currentTime);
}

function onTrackEnd() {
    if (isRepeat) {
        loadTrack(currentIndex, true);
    } else {
        changeTrack(1);
    }
}

function savePlaylistMeta() {
    localStorage.setItem('playlistMeta', JSON.stringify(
        playlist.map(t => ({ name: t.name, artist: t.artist }))
    ));
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

