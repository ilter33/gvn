import { dorks } from './dorks.js';
import { search, searchEngines } from './search.js';
import { scanURL } from './scanner.js';

const dorkTypeSelect = document.getElementById('dorkType');
const dorkListSelect = document.getElementById('dorkList');
const startSearchBtn = document.getElementById('startSearchBtn');
const stopSearchBtn = document.getElementById('stopSearchBtn');
const startScanBtn = document.getElementById('startScanBtn');
const stopScanBtn = document.getElementById('stopScanBtn');
const consoleContent = document.getElementById('consoleContent');

let foundUrls = new Set();
let isSearching = false;
let isScanning = false;

function log(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `entry ${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  consoleContent.appendChild(entry);
  consoleContent.scrollTop = consoleContent.scrollHeight;
}

function addVulnerableLink(url, details) {
  const link = document.createElement('div');
  link.className = 'vulnerable-link';
  link.textContent = `${url}\n${details}`;
  link.addEventListener('click', () => {
    navigator.clipboard.writeText(url)
      .then(() => log('URL copied to clipboard', 'success'))
      .catch(err => log('Failed to copy URL: ' + err, 'error'));
  });
  consoleContent.appendChild(link);
}

dorkTypeSelect.addEventListener('change', () => {
  dorkListSelect.innerHTML = '<option value="">Select Target Pattern</option>';
  const selectedType = dorkTypeSelect.value;
  
  if (selectedType) {
    dorks[selectedType].forEach(dork => {
      const option = document.createElement('option');
      option.value = dork;
      option.textContent = dork;
      dorkListSelect.appendChild(option);
    });
    dorkListSelect.disabled = false;
  } else {
    dorkListSelect.disabled = true;
  }
});

dorkListSelect.addEventListener('change', () => {
  startSearchBtn.disabled = !dorkListSelect.value;
});

async function performSearch() {
  consoleContent.innerHTML = '';
  
  const selectedDork = dorkListSelect.value;
  const engines = Object.keys(searchEngines);
  const uniqueUrls = new Set();

  foundUrls.clear();
  log(`Arama işlemi başlatılıyor: ${selectedDork}`);
  
  for (const engine of engines) {
    if (!isSearching) break;
    
    try {
      log(`${engine} sızma denemesi yapılıyor...`);
      const urls = await search(selectedDork, engine);
      
      urls.forEach(url => {
        if (!uniqueUrls.has(url)) {
          uniqueUrls.add(url);
          foundUrls.add(url);
          log(`Hedef tespit edildi: ${url}`);
        }
      });
    } catch (error) {
      log(`${engine} sızma başarısız: ${error.message}`, 'error');
    }
  }

  startScanBtn.disabled = foundUrls.size === 0;
  log(`İşlem tamamlandı. Toplam benzersiz hedef sayısı: ${foundUrls.size}`);
}

async function performScan() {
  consoleContent.innerHTML = '';
  
  log('Güvenlik açığı analizi başlatılıyor...');
  const vulnerabilityType = dorkTypeSelect.value;
  let vulnerabilitiesFound = 0;

  for (const url of foundUrls) {
    if (!isScanning) break;
    
    try {
      log(`Analiz ediliyor: ${url}`);
      const result = await scanURL(url, vulnerabilityType);
      
      if (result.vulnerable) {
        vulnerabilitiesFound++;
        addVulnerableLink(url, result.details);
        log(`Güvenlik açığı tespit edildi! Önem derecesi: ${result.severity}`, 'warning');
      }
    } catch (error) {
      log(`${url} analizi başarısız: ${error.message}`, 'error');
    }
  }

  log(`Analiz tamamlandı. ${vulnerabilitiesFound} adet güvenlik açığı tespit edildi.`);
}

startSearchBtn.addEventListener('click', async () => {
  isSearching = true;
  startSearchBtn.disabled = true;
  stopSearchBtn.disabled = false;
  await performSearch();
  isSearching = false;
  startSearchBtn.disabled = false;
  stopSearchBtn.disabled = true;
});

stopSearchBtn.addEventListener('click', () => {
  isSearching = false;
  stopSearchBtn.disabled = true;
  log('Arama işlemi kullanıcı tarafından durduruldu');
});

startScanBtn.addEventListener('click', async () => {
  isScanning = true;
  startScanBtn.disabled = true;
  stopScanBtn.disabled = false;
  await performScan();
  isScanning = false;
  startScanBtn.disabled = false;
  stopScanBtn.disabled = true;
});

stopScanBtn.addEventListener('click', () => {
  isScanning = false;
  stopScanBtn.disabled = true;
  log('Analiz işlemi kullanıcı tarafından durduruldu');
});