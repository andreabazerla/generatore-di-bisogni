// ============================================
// CONFIGURAZIONE COLORI PER FASI DEL GIORNO
// ============================================
const COLORI = {
  notteIniziale: {
    top: '#000428',    // Blu scuro
    bottom: '#004e92'  // Blu
  },
  alba: {
    top: '#FF512F',    // Arancione-rosso
    bottom: '#F09819'  // Giallo-arancio
  },
  mattino: {
    top: '#56CCF2',    // Azzurro chiaro
    bottom: '#2F80ED'  // Blu cielo
  },
  giorno: {
    top: '#56CCF2',    // Azzurro chiaro
    bottom: '#87CEEB'  // Celeste
  },
  tramonto: {
    top: '#FF512F',    // Arancione-rosso
    bottom: '#DD2476'  // Rosa-viola
  },
  crepuscolo: {
    top: '#2C3E50',    // Grigio-blu scuro
    bottom: '#4CA1AF'  // Blu-grigio
  },
  notte: {
    top: '#0f0c29',    // Viola scuro
    bottom: '#302b63'  // Viola
  }
};

// ============================================
// CALCOLO ORE ALBA E TRAMONTO
// ============================================
function calcolaOreSolari(data) {
  // Latitudine media Italia: 42° Nord
  const latitudine = 42;
  
  // Giorno dell'anno (1-365)
  const inizioAnno = new Date(data.getFullYear(), 0, 0);
  const diff = data - inizioAnno;
  const giornoAnno = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Declinazione solare (semplificata)
  const declinazione = 23.45 * Math.sin((360/365) * (giornoAnno - 81) * Math.PI / 180);
  
  // Angolo orario alba/tramonto
  const cosOmegas = -Math.tan(latitudine * Math.PI / 180) * Math.tan(declinazione * Math.PI / 180);
  const omegas = Math.acos(Math.max(-1, Math.min(1, cosOmegas))) * 180 / Math.PI;
  
  // Ore di luce
  const oreLuce = 2 * omegas / 15;
  
  // Alba e tramonto (ore decimali)
  const alba = 12 - (oreLuce / 2);
  const tramonto = 12 + (oreLuce / 2);
  
  return { alba, tramonto };
}

// ============================================
// INTERPOLAZIONE TRA DUE COLORI
// ============================================
function interpolaColore(colore1, colore2, fattore) {
  // Converte hex in RGB
  const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const c1 = hex2rgb(colore1);
  const c2 = hex2rgb(colore2);
  
  // Interpola ciascun canale
  const r = Math.round(c1.r + (c2.r - c1.r) * fattore);
  const g = Math.round(c1.g + (c2.g - c1.g) * fattore);
  const b = Math.round(c1.b + (c2.b - c1.b) * fattore);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// CALCOLO GRADIENTE IN BASE ALL'ORA
// ============================================
function calcolaGradiente() {
  const ora = new Date();
  const oreDecimali = ora.getHours() + ora.getMinutes() / 60;
  
  // Calcola alba e tramonto per oggi
  const { alba, tramonto } = calcolaOreSolari(ora);
  
  // Definisce gli orari chiave
  const primaAlba = alba - 1;      // 1 ora prima dell'alba
  const dopoAlba = alba + 1;       // 1 ora dopo l'alba
  const mezzogiorno = 12;
  const primaTramonto = tramonto - 1;  // 1 ora prima del tramonto
  const dopoTramonto = tramonto + 1;   // 1 ora dopo il tramonto
  
  let gradiente;
  
  // NOTTE (dopo crepuscolo fino a prima dell'alba)
  if (oreDecimali < primaAlba || oreDecimali >= dopoTramonto + 1) {
    gradiente = COLORI.notte;
  }
  // PRIMA DELL'ALBA (transizione notte -> alba)
  else if (oreDecimali >= primaAlba && oreDecimali < alba) {
    const fattore = (oreDecimali - primaAlba) / (alba - primaAlba);
    gradiente = {
      top: interpolaColore(COLORI.notte.top, COLORI.alba.top, fattore),
      bottom: interpolaColore(COLORI.notte.bottom, COLORI.alba.bottom, fattore)
    };
  }
  // ALBA
  else if (oreDecimali >= alba && oreDecimali < dopoAlba) {
    const fattore = (oreDecimali - alba) / (dopoAlba - alba);
    gradiente = {
      top: interpolaColore(COLORI.alba.top, COLORI.mattino.top, fattore),
      bottom: interpolaColore(COLORI.alba.bottom, COLORI.mattino.bottom, fattore)
    };
  }
  // MATTINO/GIORNO
  else if (oreDecimali >= dopoAlba && oreDecimali < primaTramonto) {
    gradiente = COLORI.giorno;
  }
  // PRIMA DEL TRAMONTO (transizione giorno -> tramonto)
  else if (oreDecimali >= primaTramonto && oreDecimali < tramonto) {
    const fattore = (oreDecimali - primaTramonto) / (tramonto - primaTramonto);
    gradiente = {
      top: interpolaColore(COLORI.giorno.top, COLORI.tramonto.top, fattore),
      bottom: interpolaColore(COLORI.giorno.bottom, COLORI.tramonto.bottom, fattore)
    };
  }
  // TRAMONTO
  else if (oreDecimali >= tramonto && oreDecimali < dopoTramonto) {
    const fattore = (oreDecimali - tramonto) / (dopoTramonto - tramonto);
    gradiente = {
      top: interpolaColore(COLORI.tramonto.top, COLORI.crepuscolo.top, fattore),
      bottom: interpolaColore(COLORI.tramonto.bottom, COLORI.crepuscolo.bottom, fattore)
    };
  }
  // CREPUSCOLO (transizione tramonto -> notte)
  else if (oreDecimali >= dopoTramonto && oreDecimali < dopoTramonto + 1) {
    const fattore = (oreDecimali - dopoTramonto) / 1;
    gradiente = {
      top: interpolaColore(COLORI.crepuscolo.top, COLORI.notte.top, fattore),
      bottom: interpolaColore(COLORI.crepuscolo.bottom, COLORI.notte.bottom, fattore)
    };
  }
  
  return gradiente;
}

// ============================================
// APPLICA GRADIENTE ALLO SFONDO
// ============================================
// ============================================
// ANIMAZIONE GRADIENTE SOTTILE (dichiarata prima dell'uso)
// Conserva il gradiente corrente; l'animazione varia l'angolo lentamente
const CURRENT_GRADIENT = { top: '', bottom: '' };

function applyBackground(angleDeg) {
  document.body.style.background = `linear-gradient(${angleDeg}deg, ${CURRENT_GRADIENT.top}, ${CURRENT_GRADIENT.bottom})`;
}

// Imposta gradiente iniziale in modo che l'animazione angolare non parta con valori vuoti
const ANIM_SETTINGS = { amplitude: 6, periodMs: 20000 };
try {
  const _init = calcolaGradiente();
  CURRENT_GRADIENT.top = (_init.top && _init.top.startsWith && _init.top.startsWith('#')) ? rgbToCss(parseColorToRgb(_init.top)) : (_init.top || 'rgb(0,0,0)');
  CURRENT_GRADIENT.bottom = (_init.bottom && _init.bottom.startsWith && _init.bottom.startsWith('#')) ? rgbToCss(parseColorToRgb(_init.bottom)) : (_init.bottom || 'rgb(20,20,20)');
} catch (e) {
  CURRENT_GRADIENT.top = 'rgb(10,10,30)';
  CURRENT_GRADIENT.bottom = 'rgb(30,30,60)';
}

let _angleRaf = null;
let _angleRunning = false;
function startGradientAnimation() {
  if (_angleRunning) return;
  _angleRunning = true;

  const amplitude = ANIM_SETTINGS.amplitude;
  const periodMs = ANIM_SETTINGS.periodMs;
  const omega = (2 * Math.PI) / periodMs;

  function frame(ts) {
    if (!_angleRunning) return;
    const angle = Math.sin(ts * omega) * amplitude;
    applyBackground(angle);
    _angleRaf = requestAnimationFrame(frame);
  }

  _angleRaf = requestAnimationFrame(frame);
}

function stopGradientAnimation() {
  _angleRunning = false;
  if (_angleRaf) { cancelAnimationFrame(_angleRaf); _angleRaf = null; }
}

// Avvia animazione gradiente
startGradientAnimation();

// Sospendi/riprendi animazione con Page Visibility API
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopGradientAnimation();
  else startGradientAnimation();
});

function aggiornaGradiente() {
  const gradiente = calcolaGradiente();
  // Avvia una transizione morbida verso il nuovo gradiente
  transitionGradient(gradiente.top, gradiente.bottom, 1800);
  
  // Log per debug (opzionale)
  const ora = new Date();
  const { alba, tramonto } = calcolaOreSolari(ora);
  console.log(`Ora: ${ora.getHours()}:${ora.getMinutes().toString().padStart(2, '0')}`);
  console.log(`Alba: ${Math.floor(alba)}:${Math.round((alba % 1) * 60).toString().padStart(2, '0')}`);
  console.log(`Tramonto: ${Math.floor(tramonto)}:${Math.round((tramonto % 1) * 60).toString().padStart(2, '0')}`);
}

// ============================================
// TRANSIZIONE GRADIENTE SMOOTH
// ============================================
function parseColorToRgb(input) {
  if (!input) return { r: 0, g: 0, b: 0 };
  input = input.trim();
  if (input.startsWith('#')) {
    const r = parseInt(input.slice(1, 3), 16);
    const g = parseInt(input.slice(3, 5), 16);
    const b = parseInt(input.slice(5, 7), 16);
    return { r, g, b };
  }
  const m = input.match(/rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i);
  if (m) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
  return { r: 0, g: 0, b: 0 };
}

function rgbToCss(c) {
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

let _gradTransitionCancel = null;
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }

function transitionGradient(toTop, toBottom, duration = 1500) {
  // Se corrente vuoto -> imposta subito
  if (!CURRENT_GRADIENT.top) {
    CURRENT_GRADIENT.top = (toTop.startsWith('#') ? rgbToCss(parseColorToRgb(toTop)) : toTop);
    CURRENT_GRADIENT.bottom = (toBottom.startsWith('#') ? rgbToCss(parseColorToRgb(toBottom)) : toBottom);
    applyBackground(0);
    return;
  }

  if (_gradTransitionCancel) _gradTransitionCancel();

  const fromTop = parseColorToRgb(CURRENT_GRADIENT.top);
  const fromBottom = parseColorToRgb(CURRENT_GRADIENT.bottom);
  const targetTop = parseColorToRgb(toTop);
  const targetBottom = parseColorToRgb(toBottom);

  let start = null;
  let cancelled = false;
  _gradTransitionCancel = () => { cancelled = true; };

  function step(ts) {
    if (cancelled) { _gradTransitionCancel = null; return; }
    if (!start) start = ts;
    const t = Math.min(1, (ts - start) / duration);
    const tt = easeInOutCubic(t);

    const top = {
      r: lerp(fromTop.r, targetTop.r, tt),
      g: lerp(fromTop.g, targetTop.g, tt),
      b: lerp(fromTop.b, targetTop.b, tt)
    };
    const bottom = {
      r: lerp(fromBottom.r, targetBottom.r, tt),
      g: lerp(fromBottom.g, targetBottom.g, tt),
      b: lerp(fromBottom.b, targetBottom.b, tt)
    };

    CURRENT_GRADIENT.top = rgbToCss(top);
    CURRENT_GRADIENT.bottom = rgbToCss(bottom);

    if (t < 1) requestAnimationFrame(step);
    else _gradTransitionCancel = null;
  }

  requestAnimationFrame(step);
}

// ============================================
// CONDIVISIONE / COPIA
// ============================================
function createShareButton() {
  if (document.getElementById('shareBtn')) return;
  const container = document.querySelector('.container');
  if (!container) return;

  const btn = document.createElement('button');
  btn.id = 'shareBtn';
  btn.className = 'share-button';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Condividi la scritta corrente');
  btn.title = 'Condividi';
  btn.textContent = '👃➡️👂';

  btn.addEventListener('click', async () => {
    const scrittaEl = document.getElementById('scritta');
    const text = scrittaEl ? scrittaEl.textContent : '';
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bisogno', text });
        return;
      } catch (e) {
        // fall through to clipboard
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copiato!';
        setTimeout(() => btn.textContent = 'Condividi', 1400);
        return;
      } catch (e) {
        // fall through
      }
    }

    // fallback
    const tmp = document.createElement('textarea');
    tmp.value = text;
    document.body.appendChild(tmp);
    tmp.select();
    try { document.execCommand('copy'); btn.textContent = 'Copiato!'; } catch (e) { alert('Copia: ' + text); }
    tmp.remove();
    setTimeout(() => btn.textContent = 'Condividi', 1400);
  });

  // append to body so it's fixed in the corner
  document.body.appendChild(btn);
}

// ============================================
// SEGNALE STOP
// ============================================
function createStopSign() {
  if (document.getElementById('stopSign')) return;

  const stop = document.createElement('div');
  stop.id = 'stopSign';
  stop.className = 'stop-sign';
  stop.textContent = '🛑';
  stop.setAttribute('aria-label', 'Segnale di stop');

  document.body.appendChild(stop);
}

// ============================================
// SCRITTE E GESTIONE STATO
// ============================================

// PARAMETRI CONFIGURABILI
const SECONDI_MIN = 12;  // Secondi minimi prima del cambio (12 ore = 43200 secondi)
const SECONDI_MAX = 24;  // Secondi massimi prima del cambio (24 ore = 86400 secondi)

// Data di inizio: prima scritta comparsa il 17/12/2025 alle 23:28:00
const DATA_INIZIO = new Date('2025-12-19T00:00:00').getTime();

// Le scritte verranno caricate dal file JSON
let SCRITTE = [];

// Chiavi localStorage
const STORAGE_KEYS = {
  indiceCorrente: 'scrittaIndice',
  timestampUltimoCambio: 'ultimoCambio',
  timestampProssimoCambio: 'prossimoCambio'
};

// ============================================
// INIZIALIZZAZIONE STATO
// ============================================
function inizializzaStato() {
  const indice = localStorage.getItem(STORAGE_KEYS.indiceCorrente);
  
  // Se è la prima volta, inizializza con la data fissa di inizio
  if (indice === null) {
    const ora = Date.now();
    const secondiRandom = SECONDI_MIN + Math.random() * (SECONDI_MAX - SECONDI_MIN);
    
    // Calcola quante scritte dovrebbero essere già passate dalla DATA_INIZIO
    let tempoTrascorso = ora - DATA_INIZIO;
    let indiceCalcolato = 0;
    let ultimoCambioCalcolato = DATA_INIZIO;
    let prossimoCambioCalcolato = DATA_INIZIO + (secondiRandom * 1000);
    
    // Simula i cambi passati fino ad ora
    while (ora >= prossimoCambioCalcolato && indiceCalcolato < SCRITTE.length - 1) {
      indiceCalcolato++;
      ultimoCambioCalcolato = prossimoCambioCalcolato;
      const nuoviSecondi = SECONDI_MIN + Math.random() * (SECONDI_MAX - SECONDI_MIN);
      prossimoCambioCalcolato = ultimoCambioCalcolato + (nuoviSecondi * 1000);
    }
    
    localStorage.setItem(STORAGE_KEYS.indiceCorrente, indiceCalcolato.toString());
    localStorage.setItem(STORAGE_KEYS.timestampUltimoCambio, ultimoCambioCalcolato.toString());
    localStorage.setItem(STORAGE_KEYS.timestampProssimoCambio, prossimoCambioCalcolato.toString());
    
    return {
      indice: indiceCalcolato,
      ultimoCambio: ultimoCambioCalcolato,
      prossimoCambio: prossimoCambioCalcolato
    };
  }
  
  return {
    indice: parseInt(indice),
    ultimoCambio: parseInt(localStorage.getItem(STORAGE_KEYS.timestampUltimoCambio)),
    prossimoCambio: parseInt(localStorage.getItem(STORAGE_KEYS.timestampProssimoCambio))
  };
}

// ============================================
// VERIFICA E CAMBIO SCRITTA
// ============================================
function verificaCambioScritta(stato) {
  const ora = Date.now();
  
  // Se è il momento di cambiare e non siamo all'ultima scritta
  if (ora >= stato.prossimoCambio && stato.indice < SCRITTE.length - 1) {
    const nuovoIndice = stato.indice + 1;
    const secondiRandom = SECONDI_MIN + Math.random() * (SECONDI_MAX - SECONDI_MIN);
    const prossimoCambio = ora + (secondiRandom * 1000);
    
    localStorage.setItem(STORAGE_KEYS.indiceCorrente, nuovoIndice.toString());
    localStorage.setItem(STORAGE_KEYS.timestampUltimoCambio, ora.toString());
    localStorage.setItem(STORAGE_KEYS.timestampProssimoCambio, prossimoCambio.toString());
    
    return {
      indice: nuovoIndice,
      ultimoCambio: ora,
      prossimoCambio: prossimoCambio
    };
  }
  
  return stato;
}

// ============================================
// AGGIORNA INTERFACCIA
// ============================================
function aggiornaInterfaccia() {
  let stato = inizializzaStato();
  stato = verificaCambioScritta(stato);
  
  // Aggiorna scritta
  const scrittaEl = document.getElementById('scritta');
  const newText = SCRITTE[stato.indice] || '';
  // Assicura classe di transizione
  scrittaEl.classList.add('fade-transition');
  // Accessibilità: annuncia aggiornamenti e rendi focusabile
  try {
    scrittaEl.setAttribute('role', 'status');
    scrittaEl.setAttribute('aria-live', 'polite');
    scrittaEl.setAttribute('aria-atomic', 'true');
    if (!scrittaEl.hasAttribute('tabindex')) scrittaEl.setAttribute('tabindex', '0');
  } catch (e) { /* ignore */ }
  if (scrittaEl.textContent !== newText) {
    // fade out
    scrittaEl.classList.add('hidden');
    setTimeout(() => {
      scrittaEl.textContent = newText;
      // pop-in animation
      scrittaEl.classList.remove('hidden');
      scrittaEl.classList.add('pop');
      setTimeout(() => scrittaEl.classList.remove('pop'), 700);
    }, 520);
  }
  
  // Aggiorna contatore
  const contatoreEl = document.getElementById('contatore');
  contatoreEl.textContent = `${stato.indice + 1}/${SCRITTE.length}`;

  // Aggiungi pulsante condividi se non esiste
  createShareButton();
  
  // Aggiorna cronometro
  const ora = Date.now();
  const differenzaMs = ora - stato.ultimoCambio;
  const ore = Math.floor(differenzaMs / (1000 * 60 * 60));
  const minuti = Math.floor((differenzaMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondi = Math.floor((differenzaMs % (1000 * 60)) / 1000);
  
  const cronometroEl = document.getElementById('cronometro');
cronometroEl.innerHTML = `Tempo dall'ultimo bisogno generato:<br><br>${ore}h ${minuti}m ${secondi}s`;
}

// ============================================
// CARICA SCRITTE DA FILE JSON
// ============================================
async function caricaScritte() {
  try {
    const risposta = await fetch('scritte.json');
    const dati = await risposta.json();
    SCRITTE = dati.scritte;
    
    // Aggiorna interfaccia dopo aver caricato le scritte
    aggiornaInterfaccia();
    // crea pulsante condividi dopo caricamento
    createShareButton();
    // crea segnale stop
    createStopSign();
  } catch (errore) {
    console.error('Errore nel caricamento delle scritte:', errore);
    // Scritte di fallback
    SCRITTE = [
      "Prima scritta",
      "Seconda scritta",
      "Terza scritta"
    ];
    aggiornaInterfaccia();
  }
}

// ============================================
// INIZIALIZZAZIONE
// ============================================
// Aggiorna gradiente all'avvio
aggiornaGradiente();

// Carica scritte e aggiorna interfaccia
caricaScritte();

// Aggiorna gradiente ogni minuto
setInterval(aggiornaGradiente, 60000);

// Aggiorna interfaccia ogni secondo (per mostrare i secondi nel cronometro)
setInterval(aggiornaInterfaccia, 1000);


