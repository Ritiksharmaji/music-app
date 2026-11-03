// Minimal YouTube IFrame player page for the mobile app's WebView. Served from our own
// origin so YouTube sees a proper embedder. The app sends commands with
// injectJavaScript (window.player.*) and receives events via ReactNativeWebView.postMessage.
export const youtubePlayerPage = `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#player{position:absolute;inset:0;width:100%;height:100%}</style>
</head>
<body>
<div id="player"></div>
<script>
  var yt = null, ready = false, pending = null;
  function send(type, data) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
  }
  function progress() {
    if (!ready) return;
    send('progress', { position: yt.getCurrentTime() || 0, duration: yt.getDuration() || 0 });
  }
  window.player = {
    load: function (id, autoplay) {
      if (!ready) { pending = { id: id, autoplay: autoplay }; return; }
      if (autoplay) yt.loadVideoById(id); else yt.cueVideoById(id);
    },
    play: function () { if (ready) yt.playVideo(); },
    pause: function () { if (ready) yt.pauseVideo(); },
    seek: function (seconds) { if (ready) { yt.seekTo(seconds, true); progress(); } },
  };
  window.onYouTubeIframeAPIReady = function () {
    yt = new YT.Player('player', {
      width: '100%', height: '100%',
      playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1, fs: 0, origin: location.origin },
      events: {
        onReady: function () {
          ready = true;
          send('ready');
          if (pending) { window.player.load(pending.id, pending.autoplay); pending = null; }
        },
        onStateChange: function (e) { send('state', e.data); },
        onError: function (e) { send('error', e.data); },
      },
    });
    setInterval(progress, 500);
  };
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
</script>
</body>
</html>`;
