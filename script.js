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
function aggiornaGradiente() {
  const gradiente = calcolaGradiente();
  document.body.style.background = `linear-gradient(to bottom, ${gradiente.top}, ${gradiente.bottom})`;
  
  // Log per debug (opzionale)
  const ora = new Date();
  const { alba, tramonto } = calcolaOreSolari(ora);
  console.log(`Ora: ${ora.getHours()}:${ora.getMinutes().toString().padStart(2, '0')}`);
  console.log(`Alba: ${Math.floor(alba)}:${Math.round((alba % 1) * 60).toString().padStart(2, '0')}`);
  console.log(`Tramonto: ${Math.floor(tramonto)}:${Math.round((tramonto % 1) * 60).toString().padStart(2, '0')}`);
}

// ============================================
// SCRITTE E GESTIONE STATO
// ============================================

// PARAMETRI CONFIGURABILI
const SECONDI_MIN = 1;  // Secondi minimi prima del cambio (12 ore = 43200 secondi)
const SECONDI_MAX = 10;  // Secondi massimi prima del cambio (24 ore = 86400 secondi)

// Data di inizio: prima scritta comparsa il 17/12/2025 alle 23:28:00
const DATA_INIZIO = new Date('2025-12-17T23:29:00').getTime();

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
  scrittaEl.textContent = SCRITTE[stato.indice];
  
  // Aggiorna contatore
  const contatoreEl = document.getElementById('contatore');
  contatoreEl.textContent = `${stato.indice + 1}/${SCRITTE.length}`;
  
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
