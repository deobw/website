function animateName() {
    const nameElement = document.querySelector('.main-name');
    const name = "deobw";
    
    nameElement.textContent = "";
    nameElement.style.opacity = "1";
    
    const wrapper = document.createElement('div');
    wrapper.className = 'name-wrapper';
    nameElement.appendChild(wrapper);
    
    const letters = name.split('');
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'letter';
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(40px) rotateY(90deg)';
        span.style.filter = 'blur(10px)';
        span.dataset.index = index;
        wrapper.appendChild(span);
    });
    
    const letterElements = wrapper.querySelectorAll('.letter');
    
    letterElements.forEach((span, index) => {
        setTimeout(() => {
            span.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            span.style.opacity = '1';
            span.style.transform = 'translateY(0) rotateY(0deg)';
            span.style.filter = 'blur(0)';
            
            setTimeout(() => {
                span.style.transition = 'transform 2s ease-in-out, text-shadow 2s ease-in-out';
                span.style.animation = `float-${index % 3} 3s ease-in-out infinite`;
                span.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            }, 800);
        }, 150 * index);
    });
    
    wrapper.addEventListener('click', () => {
        letterElements.forEach((letter, index) => {
            setTimeout(() => {
                letter.style.animation = 'none';
                letter.style.transition = 'none';
                letter.style.animation = 'glitch 0.3s ease-in-out forwards';
                
                setTimeout(() => {
                    letter.style.animation = `float-${index % 3} 3s ease-in-out infinite`;
                }, 300);
            }, index * 50);
        });
    });
    
    let lastMouseMoveTime = 0;
    let mouseMoveTimeout;
    let rect;
    
    function handleMouseMove(e) {
        if (mouseMoveTimeout) {
            cancelAnimationFrame(mouseMoveTimeout);
        }
        
        const now = Date.now();
        if (now - lastMouseMoveTime < 16) {
            mouseMoveTimeout = requestAnimationFrame(() => handleMouseMove(e));
            return;
        }
        lastMouseMoveTime = now;
        
        if (!rect) {
            rect = wrapper.getBoundingClientRect();
        }
        
        const mouseX = e.clientX - rect.left;
        
        mouseMoveTimeout = requestAnimationFrame(() => {
            letterElements.forEach((letter) => {
                const letterRect = letter.getBoundingClientRect();
                const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
                const distanceFromMouse = Math.abs(mouseX - letterCenter);
                const maxDistance = 100;
                
                if (distanceFromMouse < maxDistance) {
                    const liftAmount = 8 * (1 - distanceFromMouse / maxDistance);
                    letter.style.transform = `translate3d(0, -${liftAmount}px, 0)`;
                    letter.style.textShadow = `0 0 ${liftAmount + 5}px rgba(255, 255, 255, 0.8)`;
                }
            });
        });
    }
    
    window.addEventListener('resize', () => {
        rect = null;
    });
    
    setTimeout(() => {
        wrapper.addEventListener('mousemove', handleMouseMove);
        
        wrapper.addEventListener('mouseleave', () => {
            if (mouseMoveTimeout) {
                cancelAnimationFrame(mouseMoveTimeout);
            }
        });
    }, (letters.length * 150) + 800);
}

function animateTabTitle() {
    const originalTitle = "deobw - Portfolio";
    const frames = [
        "⟡ deobw ⟡",
        "⟢ deobw ⟣",
        "◈ deobw ◈",
        "⧫ deobw ⧫",
        "◇ deobw ◇",
        "◆ deobw ◆"
    ];
    
    let frameIndex = 0;
    let active = true;
    
    function updateTitle() {
        if (active) {
            document.title = frames[frameIndex];
            frameIndex = (frameIndex + 1) % frames.length;
        }
    }
    
    const titleInterval = setInterval(updateTitle, 600);
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            active = false;
            document.title = "Come back ✨";
        } else {
            active = true;
            frameIndex = 0;
            document.title = frames[0];
        }
    });
    
    window.addEventListener('focus', () => {
        active = true;
    });
    
    window.addEventListener('blur', () => {
        active = false;
        document.title = "Miss you ✧ ✧";
    });
}

function initMusicPlayer() {
    const musicPlayer = document.querySelector('.music-player');
    const playBtn = musicPlayer.querySelector('.play-btn');
    const prevBtn = musicPlayer.querySelector('.prev-btn');
    const nextBtn = musicPlayer.querySelector('.next-btn');
    const trackName = musicPlayer.querySelector('.track-name');
    const progress = musicPlayer.querySelector('.progress');
    const timeDisplay = musicPlayer.querySelector('.time-display');
    const volumeSlider = musicPlayer.querySelector('.volume-slider');
    const volumeIcon = musicPlayer.querySelector('.volume-icon');
    const toggleBtn = musicPlayer.querySelector('.toggle-btn');
    const playlist = musicPlayer.querySelector('.playlist');
    const progressBar = musicPlayer.querySelector('.progress-bar');
    
    const audio = new Audio();
    let currentTrack = 0;
    let isPlaying = false;
    let tracks = [];
    
    function init() {
        loadTracks();
        
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPrev);
        nextBtn.addEventListener('click', playNext);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', playNext);
        volumeSlider.addEventListener('input', setVolume);
        toggleBtn.addEventListener('click', togglePlaylist);
        progressBar.addEventListener('click', seek);
        
        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            const errorCodes = {
                1: "MEDIA_ERR_ABORTED",
                2: "MEDIA_ERR_NETWORK",
                3: "MEDIA_ERR_DECODE", 
                4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
            };
            
            let errorMessage = "Unknown error";
            if (audio.error) {
                errorMessage = errorCodes[audio.error.code] || `Error code: ${audio.error.code}`;
            }
            
            trackName.textContent = `Error: ${errorMessage}`;
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
        
        audio.volume = volumeSlider.value / 100;
        
        playlist.classList.remove('hidden');
    }
    
    function loadTracks() {
        tracks = [
            {
                title: "I Feel So Empty",
                src: "resources/i feel so empty.mp3"
            },
            {
                title: "If You Care",
                src: "resources/If You Care (Slowed).mp3"
            },
            {
                title: "Solitude",
                src: "resources/juno, blindheart - Solitude.mp3"
            },
            {
                title: "Missing Textures",
                src: "resources/Missing Textures (Slowed Down).mp3"
            }
        ];
        
        createPlaylist();
    }
    
    function createPlaylist() {
        playlist.innerHTML = '';
        
        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.classList.add('playlist-item');
            if (index === currentTrack) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <span class="playlist-item-icon">
                    <i class="fas ${index === currentTrack && isPlaying ? 'fa-volume-up' : 'fa-music'}"></i>
                </span>
                <span>${track.title}</span>
            `;
            
            item.addEventListener('click', (event) => {
                event.preventDefault();
                console.log(`Playlist item clicked: ${track.title}`);
                currentTrack = index;
                loadTrack();
                
                isPlaying = false;
                togglePlay();
            });
            
            playlist.appendChild(item);
        });
    }
    
    function loadTrack() {
        if (tracks.length === 0) return;
        
        console.log(`Loading track: ${tracks[currentTrack].title} from ${tracks[currentTrack].src}`);
        
        audio.src = tracks[currentTrack].src;
        trackName.textContent = tracks[currentTrack].title;
        
        progress.style.width = '0%';
        timeDisplay.textContent = '00:00 / 00:00';
        
        updatePlaylistActiveItem();
        
        audio.load();
    }
    
    function togglePlay() {
        if (tracks.length === 0) {
            console.log("No tracks available");
            return;
        }
        
        if (!audio.src || audio.src === '') {
            console.log("No audio source set, loading current track");
            loadTrack();
        }
        
        if (isPlaying) {
            console.log("Pausing playback");
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            console.log("Starting playback");
            audio.play()
                .then(() => {
                    console.log("Playback started successfully");
                })
                .catch(error => {
                    console.error("Error playing audio:", error);
                    trackName.textContent = "Error: " + (error.message || "Cannot play audio");
                    fetch(audio.src)
                        .then(response => {
                            if (!response.ok) {
                                console.error(`File not found: ${audio.src}`);
                                trackName.textContent = "Error: File not found";
                            }
                        })
                        .catch(err => {
                            console.error("Network error:", err);
                        });
                });
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        isPlaying = !isPlaying;
        updatePlaylistActiveItem();
    }
    
    function playPrev() {
        if (tracks.length === 0) return;
        
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        loadTrack();
        
        if (isPlaying) {
            audio.play().catch(console.error);
        }
    }
    
    function playNext() {
        if (tracks.length === 0) return;
        
        currentTrack = (currentTrack + 1) % tracks.length;
        loadTrack();
        
        if (isPlaying) {
            audio.play().catch(console.error);
        }
    }
    
    function updateProgress() {
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        const durationMinutes = Math.floor(duration / 60) || 0;
        const durationSeconds = Math.floor(duration % 60) || 0;
        const currentMinutes = Math.floor(currentTime / 60) || 0;
        const currentSeconds = Math.floor(currentTime % 60) || 0;
        
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    }
    
    function seek(e) {
        if (!audio.duration) return;
        
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const seekTime = (clickX / width) * audio.duration;
        
        audio.currentTime = seekTime;
    }
    
    function setVolume() {
        audio.volume = volumeSlider.value / 100;
        
        if (audio.volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (audio.volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            volumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }
    
    function togglePlaylist() {
        playlist.classList.toggle('hidden');
    }
    
    function updatePlaylistActiveItem() {
        const items = playlist.querySelectorAll('.playlist-item');
        
        items.forEach((item, index) => {
            if (index === currentTrack) {
                item.classList.add('active');
                item.querySelector('.playlist-item-icon i').className = `fas ${isPlaying ? 'fa-volume-up' : 'fa-music'}`;
            } else {
                item.classList.remove('active');
                item.querySelector('.playlist-item-icon i').className = 'fas fa-music';
            }
        });
    }
    
    init();
    
    if (tracks.length > 0) {
        loadTrack();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    animateName();
    
    initBackgroundAnimation();
    
    animateTabTitle();
    
    initMusicPlayer();
});

function initBackgroundAnimation() {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particlesArray = [];
    const numberOfParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 20000));
    const colors = ['#ffffff', '#888888', '#444444'];
    
    let mouse = {
        x: null,
        y: null,
        radius: 200,
        lastMoveTime: 0
    };
    
    window.addEventListener('mousemove', function(event) {
        const now = Date.now();
        if (now - mouse.lastMoveTime > 10) {
            mouse.x = event.x;
            mouse.y = event.y;
            mouse.lastMoveTime = now;
        }
    });
    
    window.addEventListener('mouseout', function() {
        mouse.x = undefined;
        mouse.y = undefined;
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const newCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 20000));
            
            if (newCount > particlesArray.length) {
                for (let i = particlesArray.length; i < newCount; i++) {
                    particlesArray.push(new Particle());
                }
            } else if (newCount < particlesArray.length) {
                particlesArray.splice(newCount);
            }
        }, 200);
    });
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseSpeedX = Math.random() * 0.3 - 0.15;
            this.baseSpeedY = Math.random() * 0.3 - 0.15;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.1;
            this.density = (Math.random() * 20) + 1;
        }
        
        update() {
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            
            if (mouse.x !== undefined && mouse.y !== undefined) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distanceSquared = dx * dx + dy * dy;
                const radiusSquared = mouse.radius * mouse.radius;
                
                if (distanceSquared < radiusSquared) {
                    const distance = Math.sqrt(distanceSquared);
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    
                    const force = (mouse.radius - distance) / mouse.radius;
                    
                    this.speedX = forceDirectionX * force * this.density / 15;
                    this.speedY = forceDirectionY * force * this.density / 15;
                }
            }
            
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            else if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            else if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        
        if (canvas.width < 1000) {
            connectParticles(100);
        } else {
            connectParticles(150);
        }
        
        requestAnimationFrame(animate);
    }
    
    function connectParticles(maxDistance) {
        const increment = canvas.width < 768 ? 2 : 1;
        
        for (let i = 0; i < particlesArray.length; i += increment) {
            for (let j = i + 1; j < particlesArray.length; j += increment) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distanceSquared = dx * dx + dy * dy;
                const maxDistanceSquared = maxDistance * maxDistance;
                
                if (distanceSquared < maxDistanceSquared) {
                    const distance = Math.sqrt(distanceSquared);
                    const opacity = 1 - (distance / maxDistance);
                    
                    ctx.beginPath();
                    ctx.strokeStyle = '#ffffff';
                    ctx.globalAlpha = opacity * 0.15;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                    
                    if (mouse.x !== undefined && mouse.y !== undefined) {
                        const midX = (particlesArray[i].x + particlesArray[j].x) / 2;
                        const midY = (particlesArray[i].y + particlesArray[j].y) / 2;
                        const mouseDx = midX - mouse.x;
                        const mouseDy = midY - mouse.y;
                        const mouseDistSquared = mouseDx * mouseDx + mouseDy * mouseDy;
                        const mouseRadiusSquared = (mouse.radius * 1.5) * (mouse.radius * 1.5);
                        
                        if (mouseDistSquared < mouseRadiusSquared) {
                            const mouseDist = Math.sqrt(mouseDistSquared);
                            const lineOpacity = 0.4 * (1 - mouseDist / (mouse.radius * 1.5));
                            ctx.globalAlpha = lineOpacity;
                            ctx.strokeStyle = '#a6e1ff';
                            ctx.lineWidth = 0.8;
                            ctx.beginPath();
                            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }
        }
    }
    
    init();
    animate();
}
