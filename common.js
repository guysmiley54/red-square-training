// Shared by every training page: sign-in session, calls to the training log, and small formatters.
(function(){
  var KEY = "rsq-training-session", IDLE_MS = 10 * 60 * 1000, idleTimer = null;

  function getSession(){
    try{
      var s = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if(s && s.token && s.until > Date.now()) return s;
    }catch(e){}
    return null;
  }
  function setSession(token, profile){
    // Kept for this browser tab only, and for at most four hours.
    try{ sessionStorage.setItem(KEY, JSON.stringify({token:token, profile:profile, until:Date.now() + 4*3600*1000})); }catch(e){}
  }
  function signOut(){
    try{ sessionStorage.removeItem(KEY); }catch(e){}
    location.href = "index.html";
  }

  // Every request goes to the Apps Script web app as plain text JSON and comes back as JSON.
  function api(action, data){
    if(!window.TRAINING_API) return Promise.reject(new Error("The staff log is not connected yet."));
    var body = Object.assign({action:action}, data || {});
    var s = getSession();
    if(s && !body.token) body.token = s.token;
    return fetch(window.TRAINING_API, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(body)})
      .then(function(r){ return r.json(); }, function(){ throw new Error("Could not reach the staff log. Check the internet connection and try again."); })
      .then(function(j){
        if(j && j.ok) return j;
        if(j && j.needPin){ var e = new Error(j.error || "Choose a PIN"); e.needPin = true; throw e; }
        if(j && /sign in again/i.test(j.error || "")){ try{ sessionStorage.removeItem(KEY); }catch(e2){} }
        throw new Error((j && j.error) || "Something went wrong. Try again.");
      });
  }

  // The office PC is shared, so sign out after ten minutes without a click or key press.
  function watchIdle(){
    function reset(){ clearTimeout(idleTimer); idleTimer = setTimeout(function(){ if(getSession()) signOut(); }, IDLE_MS); }
    ["click","keydown","touchstart"].forEach(function(ev){ document.addEventListener(ev, reset, true); });
    reset();
  }

  function el(tag, cls, text){ var e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }
  function fmtDate(iso){ return iso ? new Date(iso).toLocaleDateString("en-AU", {day:"numeric", month:"short", year:"numeric"}) : ""; }
  function fmtDateTime(iso){ return iso ? new Date(iso).toLocaleString("en-AU", {day:"numeric", month:"short", hour:"numeric", minute:"2-digit"}) : ""; }

  // Where each test lives. A test key looks like "glenorchy-menu:breakfast".
  var PAGES = { "glenorchy-menu": "glenorchy-menu.html", "cambridge-menu": "cambridge-menu.html" };
  function testLink(key){ var p = String(key).split(":"); return PAGES[p[0]] ? PAGES[p[0]] + "#" + p[1] : null; }

  // Old copies of a page can hang around in a browser tab. On load, and when a tab comes back into view,
  // compare this page's version with the published one and reload once if it is behind.
  function checkBuild(){
    try{
      var tag = document.querySelector('script[src*="common.js?v="]'); if(!tag) return;
      var mine = tag.getAttribute("src").split("v=")[1];
      fetch("version.txt?t=" + Date.now(), {cache:"no-store"}).then(function(r){ return r.ok ? r.text() : ""; }).then(function(v){
        v = v.trim(); if(!v || v === mine) return;
        var tried = ""; try{ tried = sessionStorage.getItem("rs-build-tried") || ""; }catch(e){}
        if(tried === v) return;
        try{ sessionStorage.setItem("rs-build-tried", v); }catch(e){}
        var u = new URL(location.href); u.searchParams.set("b", v); location.replace(u.toString());
      }).catch(function(){});
    }catch(e){}
  }
  checkBuild();
  window.addEventListener("pageshow", function(e){ if(e.persisted) checkBuild(); });
  document.addEventListener("visibilitychange", function(){ if(!document.hidden && /(\/|index\.html)$/.test(location.pathname)) checkBuild(); });

  window.Training = { getSession:getSession, setSession:setSession, signOut:signOut, api:api, watchIdle:watchIdle,
    el:el, fmtDate:fmtDate, fmtDateTime:fmtDateTime, testLink:testLink };
})();
