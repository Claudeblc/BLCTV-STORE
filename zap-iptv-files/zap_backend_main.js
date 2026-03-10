        /* ═══════════════════════════════════════════════════════════════
           CONFIGURATION
           ═══════════════════════════════════════════════════════════════ */
        var API_BASE = 'http://187.124.27.19:3000';
		var APP_URL = 'https://blctvplayer.store/ZAP_IPTV_files/saved_resource.html';

        var currentVideoUrl = '';
        var currentVideoTitle = '';
        var currentVideoPoster = '';
        var isPlaying = false;
        var playerVisible = false;
        var deviceMac = '';
        var frame = document.getElementById('app-frame');

        /* ═══════════════════════════════════════════════════════════════
           MAC ADDRESS RETRIEVAL
           ═══════════════════════════════════════════════════════════════ */

        /**
         * Récupérer l'adresse MAC de la TV Samsung via webapis.network
         * Fallback: génère un identifiant unique basé sur le DUID
         */
        function getMacAddress() {
            // Méthode 1: webapis.network (Samsung TV)
            try {
                if (typeof webapis !== 'undefined' && webapis.network) {
                    var mac = webapis.network.getMac();
                    if (mac && mac !== '00:00:00:00:00:00') {
                        console.log('[ZAP] MAC from webapis.network: ' + mac);
                        return mac.toUpperCase();
                    }
                }
            } catch(e) {
                console.log('[ZAP] webapis.network.getMac failed: ' + e.message);
            }

            // Méthode 2: webapis.productinfo DUID (Samsung TV unique ID)
            try {
                if (typeof webapis !== 'undefined' && webapis.productinfo) {
                    var duid = webapis.productinfo.getDuid();
                    if (duid && duid.length > 0) {
                        // Convertir DUID en format MAC-like
                        var hash = 0;
                        for (var i = 0; i < duid.length; i++) {
                            hash = ((hash << 5) - hash) + duid.charCodeAt(i);
                            hash |= 0;
                        }
                        var hex = Math.abs(hash).toString(16).padStart(12, '0').substring(0, 12);
                        var mac = hex.match(/.{2}/g).join(':').toUpperCase();
                        console.log('[ZAP] MAC from DUID: ' + mac + ' (DUID: ' + duid + ')');
                        return mac;
                    }
                }
            } catch(e) {
                console.log('[ZAP] webapis.productinfo.getDuid failed: ' + e.message);
            }

            // Méthode 3: tizen.systeminfo (Ethernet MAC)
            try {
                if (typeof tizen !== 'undefined' && tizen.systeminfo) {
                    // Synchronous approach - try to get from stored value
                    var storedMac = localStorage.getItem('zap_device_mac');
                    if (storedMac) return storedMac;

                    // Async approach - will be used on next load
                    tizen.systeminfo.getPropertyValue('ETHERNET_NETWORK', function(ethernet) {
                        if (ethernet && ethernet.macAddress) {
                            localStorage.setItem('zap_device_mac', ethernet.macAddress.toUpperCase());
                        }
                    }, function() {
                        tizen.systeminfo.getPropertyValue('WIFI_NETWORK', function(wifi) {
                            if (wifi && wifi.macAddress) {
                                localStorage.setItem('zap_device_mac', wifi.macAddress.toUpperCase());
                            }
                        }, function() {});
                    });
                }
            } catch(e) {}

            // Méthode 4: Générer un identifiant persistant unique
            var storedMac = localStorage.getItem('zap_device_mac');
            if (storedMac) return storedMac;

            // Dernier recours: générer un ID unique
            var chars = '0123456789ABCDEF';
            var mac = '';
            for (var i = 0; i < 6; i++) {
                if (i > 0) mac += ':';
                mac += chars.charAt(Math.floor(Math.random() * 16));
                mac += chars.charAt(Math.floor(Math.random() * 16));
            }
            localStorage.setItem('zap_device_mac', mac);
            console.log('[ZAP] Generated device MAC: ' + mac);
            return mac;
        }

        /* ═══════════════════════════════════════════════════════════════
           ACTIVATION CHECK
           ═══════════════════════════════════════════════════════════════ */

        function checkActivation() {
            deviceMac = getMacAddress();
            document.getElementById('act-mac-value').textContent = deviceMac;
            document.getElementById('loading-status').textContent = 'Vérification de l\'activation...';

            console.log('[ZAP] Checking activation for MAC: ' + deviceMac);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', API_BASE + '/api/trpc/license.check?input=' + encodeURIComponent(JSON.stringify({json: {macAddress: deviceMac}})), true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 15000;

            xhr.onload = function() {
                try {
                    var response = JSON.parse(xhr.responseText);
                    var result = response.result && response.result.data ? response.result.data : response;

                    console.log('[ZAP] Activation response:', JSON.stringify(result));

                    if (result.active) {
                        // Activé ! Charger l'app
                        console.log('[ZAP] Device is ACTIVATED. Expires: ' + (result.expiresAt || 'N/A'));
                        showApp();
                    } else {
                        // Non activé
                        console.log('[ZAP] Device is NOT activated. Reason: ' + (result.reason || 'unknown'));
                        showBlockedScreen(result.reason || 'not_found');
                    }
                } catch(e) {
                    console.log('[ZAP] Parse error: ' + e.message + ' | Response: ' + xhr.responseText);
                    // En cas d'erreur de parsing, essayer quand même de charger l'app
                    // (pour ne pas bloquer si le serveur renvoie un format inattendu)
                    showApp();
                }
            };

            xhr.onerror = function() {
                console.log('[ZAP] Network error during activation check');
                // En cas d'erreur réseau, charger l'app quand même (mode offline gracieux)
                showApp();
            };

            xhr.ontimeout = function() {
                console.log('[ZAP] Activation check timed out');
                showApp();
            };

            xhr.send();
        }

        function showApp() {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('activation-screen').classList.remove('visible');
            frame.src = APP_URL;
            frame.style.display = 'block';
            frame.onload = function() {
                injectTVFlags();
            };
        }

        function showBlockedScreen(reason) {
            document.getElementById('loading-screen').style.display = 'none';

            var titleEl = document.getElementById('act-title');
            var subtitleEl = document.getElementById('act-subtitle');

            if (reason === 'expired') {
                titleEl.textContent = 'Abonnement expiré';
                subtitleEl.textContent = 'Votre abonnement ZAP IPTV a expiré. Renouvelez votre abonnement puis appuyez sur "Recharger" pour reprendre l\'accès.';
            } else if (reason === 'suspended') {
                titleEl.textContent = 'Compte suspendu';
                subtitleEl.textContent = 'Votre compte a été temporairement suspendu. Contactez votre revendeur pour plus d\'informations.';
            } else {
                titleEl.textContent = 'Application non activée';
                subtitleEl.textContent = 'Votre téléviseur n\'est pas encore activé pour ZAP IPTV. Contactez votre revendeur ou effectuez un paiement pour activer votre abonnement.';
            }

            document.getElementById('activation-screen').classList.add('visible');
        }

        function reloadActivation() {
            var btn = document.getElementById('act-reload-btn');
            var btnText = document.getElementById('act-btn-text');

            // Show loading state
            btnText.innerHTML = '<span class="act-btn-spinner"></span> Vérification...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Re-check activation
            setTimeout(function() {
                checkActivation();
                // Reset button after check
                setTimeout(function() {
                    btnText.textContent = 'Recharger';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 2000);
            }, 500);
        }

        /* ═══════════════════════════════════════════════════════════════
           START: Lancement direct sans vérification de licence
           ═══════════════════════════════════════════════════════════════ */
        setTimeout(function() {
            showApp();
        }, 1000);

        /* ═══════════════════════════════════════════════════════════════
           TV FLAGS INJECTION
           ═══════════════════════════════════════════════════════════════ */

        function injectTVFlags() {
            try {
                var w = frame.contentWindow;
                w.__IS_TIZEN_TV__ = true;
                w.__IS_ANDROID_TV__ = true;
                w.__IS_ANDROID_WEBVIEW__ = true;
                w.__IS_MOBILE_APP__ = true;
                w.__DEVICE_MAC__ = deviceMac;
                w.TizenPlayer = window.TizenPlayer;
                w.AndroidPlayer = window.AndroidPlayer;
                try { w.dispatchEvent(new Event('tvFlagsReady')); } catch(e) {}
            } catch(e) {}
            try { frame.contentWindow.postMessage({ type: 'tizen-init', ready: true, mac: deviceMac }, '*'); } catch(e) {}
        }

        // Re-inject flags periodically (SPA may clear them on navigation)
        setInterval(function() {
            try {
                if (frame.style.display !== 'none' && !frame.contentWindow.__IS_TIZEN_TV__) injectTVFlags();
            } catch(e) {}
        }, 2000);

        /* ═══════════════════════════════════════════════════════════════
           EXTERNAL PLAYER - Lance un lecteur vidéo installé sur la TV
           via tizen.application.launchAppControl (AppControl)
           Pour VOD et Séries uniquement.
           ═══════════════════════════════════════════════════════════════ */

        function showExternalPlayerScreen(title, poster, streamType) {
            var screen = document.getElementById('external-player-screen');
            var titleEl = document.getElementById('ext-title');
            var posterContainer = document.getElementById('ext-poster-container');
            var typeBadge = document.getElementById('ext-type-badge');
            var statusEl = document.getElementById('ext-status');
            var substatusEl = document.getElementById('ext-substatus');
            var spinnerEl = document.getElementById('ext-spinner');

            titleEl.textContent = title || 'Vidéo';
            typeBadge.textContent = streamType === 'series' ? 'Série' : 'Film';

            if (poster) {
                posterContainer.innerHTML = '<img class="ext-poster" src="' + poster + '" onerror="this.style.display=\'none\'" />';
            } else {
                posterContainer.innerHTML = '<div class="ext-poster-placeholder">' + (streamType === 'series' ? '📺' : '🎬') + '</div>';
            }

            statusEl.textContent = 'Ouverture du lecteur externe...';
            substatusEl.textContent = 'Le lecteur vidéo installé sur votre TV va s\'ouvrir';
            spinnerEl.style.display = 'block';
            screen.classList.add('visible');
        }

        function hideExternalPlayerScreen() {
            document.getElementById('external-player-screen').classList.remove('visible');
        }

        function launchExternalPlayer(url, title, poster, streamType) {
            currentVideoUrl = url;
            currentVideoTitle = title || '';
            currentVideoPoster = poster || '';

            showExternalPlayerScreen(title, poster, streamType);

            var mimeType = 'video/*';
            if (url.indexOf('.m3u8') !== -1) mimeType = 'application/vnd.apple.mpegurl';
            else if (url.indexOf('.mp4') !== -1) mimeType = 'video/mp4';
            else if (url.indexOf('.mkv') !== -1) mimeType = 'video/x-matroska';
            else if (url.indexOf('.avi') !== -1) mimeType = 'video/x-msvideo';
            else if (url.indexOf('.ts') !== -1) mimeType = 'video/mp2t';

            console.log('[ZAP] Launching external player: ' + url + ' (MIME: ' + mimeType + ')');

            try {
                if (typeof tizen !== 'undefined' && tizen.application) {
                    var appControl = new tizen.ApplicationControl(
                        'http://tizen.org/appcontrol/operation/view',
                        url, mimeType, null, null, null
                    );

                    tizen.application.launchAppControl(
                        appControl, null,
                        function() {
                            console.log('[ZAP] External player launched successfully');
                            document.getElementById('ext-status').textContent = 'Lecture en cours dans le lecteur externe';
                            document.getElementById('ext-spinner').style.display = 'none';
                            setTimeout(function() { hideExternalPlayerScreen(); }, 3000);
                        },
                        function(e) {
                            console.log('[ZAP] External player launch failed: ' + e.message);
                            document.getElementById('ext-status').textContent = 'Aucun lecteur externe trouvé';
                            document.getElementById('ext-substatus').textContent = 'Lecture avec le lecteur intégré Samsung...';
                            document.getElementById('ext-spinner').style.display = 'none';
                            setTimeout(function() {
                                hideExternalPlayerScreen();
                                playWithAVPlay(url);
                            }, 1500);
                        },
                        {
                            onsuccess: function() {
                                console.log('[ZAP] External player returned');
                                hideExternalPlayerScreen();
                                sendResultToWeb(0, 0, true);
                            },
                            onfailure: function() {
                                console.log('[ZAP] External player returned with failure');
                                hideExternalPlayerScreen();
                            }
                        }
                    );
                } else {
                    console.log('[ZAP] No Tizen API, falling back to AVPlay');
                    document.getElementById('ext-status').textContent = 'API Tizen non disponible, lecture intégrée...';
                    setTimeout(function() {
                        hideExternalPlayerScreen();
                        playWithAVPlay(url);
                    }, 1500);
                }
            } catch(e) {
                console.log('[ZAP] Error launching external player: ' + e.message);
                hideExternalPlayerScreen();
                playWithAVPlay(url);
            }
        }

        /* ═══════════════════════════════════════════════════════════════
           AVPlay - Lecteur intégré Samsung
           ═══════════════════════════════════════════════════════════════ */

        function initAVPlay() {
            try {
                if (typeof webapis !== 'undefined' && webapis.avplay) return true;
            } catch(e) {}
            return false;
        }

        function playVideo(url, title, poster, streamType) {
            currentVideoUrl = url;
            currentVideoTitle = title || '';
            currentVideoPoster = poster || '';

            if (streamType === 'vod' || streamType === 'series' || streamType === 'movie') {
                launchExternalPlayer(url, title, poster, streamType);
                return;
            }

            if (initAVPlay()) playWithAVPlay(url);
            else window.open(url, '_blank');
        }

        function playVideoAtPosition(url, title, posMs, poster, streamType) {
            currentVideoUrl = url;
            currentVideoTitle = title || '';
            currentVideoPoster = poster || '';

            if (streamType === 'vod' || streamType === 'series' || streamType === 'movie') {
                launchExternalPlayer(url, title, poster, streamType);
                return;
            }

            if (initAVPlay()) playWithAVPlay(url, posMs);
            else window.open(url, '_blank');
        }

        function playWithAVPlay(url, seekMs) {
            try {
                var overlay = document.getElementById('player-overlay');
                overlay.style.display = 'block';
                playerVisible = true;
                webapis.avplay.close();
                webapis.avplay.open(url);
                webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
                webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN');
                var listener = {
                    onbufferingstart: function() {},
                    onbufferingprogress: function(p) {},
                    onbufferingcomplete: function() {},
                    oncurrentplaytime: function(ms) {},
                    onevent: function(type, data) {},
                    onerror: function(type) { closePlayer(); },
                    onstreamcompleted: function() {
                        sendResultToWeb(webapis.avplay.getDuration(), webapis.avplay.getDuration(), true);
                        closePlayer();
                    },
                    ondrmevent: function(type, data) {}
                };
                webapis.avplay.setListener(listener);
                webapis.avplay.prepareAsync(function() {
                    webapis.avplay.play();
                    isPlaying = true;
                    if (seekMs && seekMs > 0) webapis.avplay.seekTo(seekMs);
                }, function(err) {
                    closePlayer();
                    window.open(url, '_blank');
                });
            } catch(e) {
                closePlayer();
                window.open(url, '_blank');
            }
        }

        function closePlayer() {
            try {
                if (typeof webapis !== 'undefined' && webapis.avplay) {
                    var state = webapis.avplay.getState();
                    if (state !== 'NONE' && state !== 'IDLE') {
                        var pos = 0, dur = 0;
                        try { pos = webapis.avplay.getCurrentTime(); } catch(e) {}
                        try { dur = webapis.avplay.getDuration(); } catch(e) {}
                        sendResultToWeb(pos, dur, false);
                        webapis.avplay.stop();
                    }
                    webapis.avplay.close();
                }
            } catch(e) {}
            isPlaying = false;
            playerVisible = false;
            document.getElementById('player-overlay').style.display = 'none';
        }

        function sendResultToWeb(posMs, durMs, endReached) {
            try {
                frame.contentWindow.postMessage({
                    type: 'external-player-result',
                    position: posMs || 0,
                    duration: durMs || 0,
                    endReached: !!endReached
                }, '*');
            } catch(e) {}
        }

        function sendMediaKey(action) {
            if (!initAVPlay()) return;
            try {
                var state = webapis.avplay.getState();
                if (action === 'play_pause' || action === 'play' || action === 'pause') {
                    if (state === 'PLAYING') { webapis.avplay.pause(); isPlaying = false; }
                    else if (state === 'PAUSED' || state === 'READY') { webapis.avplay.play(); isPlaying = true; }
                } else if (action === 'stop') { closePlayer(); }
                else if (action === 'forward') { webapis.avplay.seekTo(webapis.avplay.getCurrentTime() + 10000); }
                else if (action === 'backward') { webapis.avplay.seekTo(Math.max(0, webapis.avplay.getCurrentTime() - 10000)); }
            } catch(e) {}
        }

        function sendVolumeKey(direction) {
            try {
                if (typeof tizen !== 'undefined' && tizen.tvaudiocontrol) {
                    if (direction === 'up') tizen.tvaudiocontrol.setVolumeUp();
                    else if (direction === 'down') tizen.tvaudiocontrol.setVolumeDown();
                    else if (direction === 'mute') { tizen.tvaudiocontrol.setMute(!tizen.tvaudiocontrol.isMute()); }
                }
            } catch(e) {}
        }

        // Expose as both TizenPlayer and AndroidPlayer
        window.TizenPlayer = {
            playVideo: function(url, title, poster, streamType) { playVideo(url, title, poster, streamType); },
            playVideoAtPosition: function(url, title, posMs, poster, streamType) { playVideoAtPosition(url, title, posMs, poster, streamType); },
            sendMediaKey: sendMediaKey,
            sendVolumeKey: sendVolumeKey,
            launchExternalPlayer: launchExternalPlayer,
            getMacAddress: function() { return deviceMac; },
            showKeyboard: function() {}
        };
        window.AndroidPlayer = {
            playVideo: function(url, title, poster, streamType) { playVideo(url, title || '', poster || '', streamType || ''); },
            playVideoAtPosition: function(url, title, posMs, poster, streamType) { playVideoAtPosition(url, title, posMs, poster, streamType); },
            sendMediaKey: sendMediaKey,
            sendMediaKeyCode: function(code) {
                if (code === 85) sendMediaKey('play_pause');
                else if (code === 87) sendMediaKey('forward');
                else if (code === 88) sendMediaKey('backward');
                else if (code === 86) sendMediaKey('stop');
            },
            sendVolumeKey: sendVolumeKey,
            getMacAddress: function() { return deviceMac; },
            showKeyboard: function() {}
        };

        // Listen for postMessage from iframe
        window.addEventListener('message', function(event) {
            if (!event.data || !event.data.type) return;
            var d = event.data;
            if (d.type === 'tizen-play-video') playVideo(d.url, d.title, d.poster, d.streamType);
            else if (d.type === 'tizen-play-video-at-position') playVideoAtPosition(d.url, d.title, d.positionMs, d.poster, d.streamType);
            else if (d.type === 'tizen-launch-external') launchExternalPlayer(d.url, d.title, d.poster, d.streamType);
            else if (d.type === 'tizen-media-key') sendMediaKey(d.action);
            else if (d.type === 'tizen-volume-key') sendVolumeKey(d.direction);
            else if (d.type === 'tizen-close-player') closePlayer();
            else if (d.type === 'get-device-mac') {
                try { frame.contentWindow.postMessage({ type: 'device-mac', mac: deviceMac }, '*'); } catch(e) {}
            }
        });

        /* ═══════════════════════════════════════════════════════════════
           SAMSUNG TV REMOTE CONTROL
           ═══════════════════════════════════════════════════════════════ */

        var TIZEN_KEY_MAP = {
            37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown',
            13: 'Enter', 10009: 'Escape', 27: 'Escape', 10252: ' ',
            415: 'MediaPlay', 19: 'MediaPause', 413: 'MediaStop',
            417: 'MediaFastForward', 412: 'MediaRewind',
            447: 'VolumeUp', 448: 'VolumeDown', 449: 'VolumeMute',
            10182: 'Exit'
        };

        var lastDpadTime = 0;
        var DPAD_MIN_INTERVAL = 120;

        document.addEventListener('keydown', function(e) {
            var keyCode = e.keyCode;

            // ===== ACTIVATION SCREEN: only handle reload button =====
            var actScreen = document.getElementById('activation-screen');
            if (actScreen.classList.contains('visible')) {
                if (keyCode === 13 || keyCode === 10252) {
                    e.preventDefault();
                    reloadActivation();
                }
                return;
            }

            // ===== EXTERNAL PLAYER SCREEN: Back = hide =====
            var extScreen = document.getElementById('external-player-screen');
            if (extScreen.classList.contains('visible')) {
                if (keyCode === 10009 || keyCode === 27) {
                    e.preventDefault();
                    hideExternalPlayerScreen();
                }
                return;
            }

            // ===== PLAYER VISIBLE: handle media keys =====
            if (playerVisible) {
                switch(keyCode) {
                    case 10009: case 27: e.preventDefault(); closePlayer(); return;
                    case 415: e.preventDefault(); sendMediaKey('play'); return;
                    case 19: e.preventDefault(); sendMediaKey('pause'); return;
                    case 10252: e.preventDefault(); sendMediaKey('play_pause'); return;
                    case 413: e.preventDefault(); sendMediaKey('stop'); return;
                    case 417: e.preventDefault(); sendMediaKey('forward'); return;
                    case 412: e.preventDefault(); sendMediaKey('backward'); return;
                    case 37: e.preventDefault(); sendMediaKey('backward'); return;
                    case 39: e.preventDefault(); sendMediaKey('forward'); return;
                }
                return;
            }

            // ===== APP MODE: forward all keys to iframe =====
            var jsKey = TIZEN_KEY_MAP[keyCode];
            if (!jsKey) return;

            e.preventDefault();
            e.stopPropagation();

            if (keyCode >= 37 && keyCode <= 40) {
                var now = Date.now();
                if (now - lastDpadTime < DPAD_MIN_INTERVAL) return;
                lastDpadTime = now;
            }

            try {
                frame.contentWindow.dispatchEvent(new KeyboardEvent('keydown', {
                    key: jsKey, code: jsKey, keyCode: keyCode, which: keyCode,
                    bubbles: true, cancelable: true
                }));
            } catch(ex) {
                try {
                    frame.contentWindow.postMessage({ type: 'tizen-key', key: jsKey, keyCode: keyCode }, '*');
                } catch(ex2) {}
            }
        });

        // Register Samsung TV special keys
        try {
            if (typeof tizen !== 'undefined' && tizen.tvinputdevice) {
                ['MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaStop',
                 'MediaFastForward', 'MediaRewind', 'MediaTrackPrevious', 'MediaTrackNext',
                 'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
                 'ChannelUp', 'ChannelDown', 'VolumeUp', 'VolumeDown', 'VolumeMute'
                ].forEach(function(k) {
                    try { tizen.tvinputdevice.registerKey(k); } catch(e) {}
                });
            }
        } catch(e) {}

        // Keep screen on
        try {
            if (typeof webapis !== 'undefined' && webapis.appcommon) {
                webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
            }
        } catch(e) {}
        try {
            if (typeof tizen !== 'undefined' && tizen.power) {
                tizen.power.request('SCREEN', 'SCREEN_NORMAL');
            }
        } catch(e) {}
