// app.js - Lógica de la interfaz de usuario

// Variables globales
let scraper;
let currentWords = [];

// Elementos del DOM
const urlInput = document.getElementById('url-input');
const scrapeBtn = document.getElementById('scrape-btn');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const messageDiv = document.getElementById('message');
const wordCountSpan = document.getElementById('word-count');
const charCountSpan = document.getElementById('char-count');
const pagesCountSpan = document.getElementById('pages-count');
const linksCountSpan = document.getElementById('links-count');
const currentUrlSpan = document.getElementById('current-url');
const scrapeTimeSpan = document.getElementById('scrape-time');
const uniquePercentSpan = document.getElementById('unique-percent');
const efficiencySpan = document.getElementById('efficiency');
const wordsList = document.getElementById('words-list');
const frequentWordsList = document.getElementById('frequent-words');
const siteStructureList = document.getElementById('site-structure');
const emptyWords = document.getElementById('empty-words');
const emptyFreq = document.getElementById('empty-freq');
const emptyStructure = document.getElementById('empty-structure');
const sortAscBtn = document.getElementById('sort-asc');
const sortDescBtn = document.getElementById('sort-desc');
const sortLengthAscBtn = document.getElementById('sort-length-asc');
const sortLengthDescBtn = document.getElementById('sort-length-desc');
const filterShortBtn = document.getElementById('filter-short');
const filterLongBtn = document.getElementById('filter-long');
const clearWordsBtn = document.getElementById('clear-words');
const exportBtn = document.getElementById('export-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressPercent = document.getElementById('progress-percent');
const progressStepsContainer = document.getElementById('progress-steps');
const settingsToggle = document.getElementById('settings-toggle');
const settingsContent = document.getElementById('settings-content');
const settingsChevron = document.getElementById('settings-chevron');
const exportSeparator = document.getElementById('export-separator');

// Configuración
const depthSelect = document.getElementById('depth-select');
const pageLimitInput = document.getElementById('page-limit');
const minLengthInput = document.getElementById('min-length');
const filterCommonCheckbox = document.getElementById('filter-common');
const includeExternalCheckbox = document.getElementById('include-external');
const timeoutInput = document.getElementById('timeout');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    scraper = new AdvancedScraper();
    setupEventListeners();
    updateStats();
}

function setupEventListeners() {
    // Botón de scraping
    scrapeBtn.addEventListener('click', startScraping);
    
    // Configuración avanzada
    settingsToggle.addEventListener('click', toggleAdvancedSettings);
    
    // Controles de ordenamiento y filtrado
    sortAscBtn.addEventListener('click', () => sortWords('asc'));
    sortDescBtn.addEventListener('click', () => sortWords('desc'));
    sortLengthAscBtn.addEventListener('click', () => sortWords('length-asc'));
    sortLengthDescBtn.addEventListener('click', () => sortWords('length-desc'));
    filterShortBtn.addEventListener('click', filterShortWords);
    filterLongBtn.addEventListener('click', filterLongWords);
    clearWordsBtn.addEventListener('click', clearAllWords);
    exportBtn.addEventListener('click', exportWords);
    
    // Enter en el input de URL
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startScraping();
        }
    });
}

// Función para mostrar mensajes
function showMessage(text, type = 'info') {
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    messageDiv.innerHTML = `
        <div class="message ${type}">
            <i class="fas ${icon}"></i>
            <span>${text}</span>
        </div>
    `;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Función para actualizar la barra de progreso
function updateProgress(percent, text) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');
    
    if (progressBar && progressText && progressPercent) {
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${Math.round(percent)}%`;
        progressText.textContent = text;
    }
}

// Función para agregar pasos de progreso
function setupProgressSteps(steps) {
    const progressStepsContainer = document.getElementById('progress-steps');
    if (!progressStepsContainer) return;
    
    progressStepsContainer.innerHTML = '';
    
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'progress-step';
        
        const icon = document.createElement('div');
        icon.className = 'step-icon';
        icon.innerHTML = '<i class="fas fa-clock"></i>';
        
        const text = document.createElement('span');
        text.textContent = step;
        
        stepElement.appendChild(icon);
        stepElement.appendChild(text);
        progressStepsContainer.appendChild(stepElement);
    });
}

// Función para actualizar un paso de progreso
function updateProgressStep(stepIndex, status) {
    const steps = document.querySelectorAll('.progress-step');
    if (steps[stepIndex]) {
        const icon = steps[stepIndex].querySelector('.step-icon');
        if (icon) {
            icon.className = 'step-icon';
            
            if (status === 'completed') {
                icon.innerHTML = '<i class="fas fa-check"></i>';
                icon.classList.add('completed');
            } else if (status === 'active') {
                icon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                icon.classList.add('active');
            } else {
                icon.innerHTML = '<i class="fas fa-clock"></i>';
            }
        }
    }
}

// Función para actualizar estadísticas
function updateStats(stats = null) {
    if (stats) {
        wordCountSpan.textContent = stats.wordCount;
        charCountSpan.textContent = stats.charCount.toLocaleString();
        pagesCountSpan.textContent = stats.pagesAnalyzed;
        linksCountSpan.textContent = stats.linksFound;
        currentUrlSpan.textContent = urlInput.value ? new URL(urlInput.value).hostname : '-';
        scrapeTimeSpan.textContent = `${stats.scrapeTime}s`;
        uniquePercentSpan.textContent = `${stats.uniquePercent}%`;
        efficiencySpan.textContent = `${stats.efficiency}/s`;
    } else {
        wordCountSpan.textContent = '0';
        charCountSpan.textContent = '0';
        pagesCountSpan.textContent = '0';
        linksCountSpan.textContent = '0';
        currentUrlSpan.textContent = '-';
        scrapeTimeSpan.textContent = '0s';
        uniquePercentSpan.textContent = '0%';
        efficiencySpan.textContent = '0/s';
    }
}

// Función para actualizar la lista de palabras
function updateWordsList(words = []) {
    wordsList.innerHTML = '';
    currentWords = words;
    
    if (words.length === 0) {
        wordsList.appendChild(emptyWords);
        emptyWords.style.display = 'block';
    } else {
        emptyWords.style.display = 'none';
        
        words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            wordsList.appendChild(li);
        });
    }
}

// Función para actualizar palabras frecuentes
function updateFrequentWords(frequency = {}) {
    frequentWordsList.innerHTML = '';
    
    if (Object.keys(frequency).length === 0) {
        frequentWordsList.appendChild(emptyFreq);
        emptyFreq.style.display = 'block';
        return;
    }
    
    emptyFreq.style.display = 'none';
    
    // Ordenar palabras por frecuencia
    const sortedByFrequency = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    sortedByFrequency.forEach(([word, count]) => {
        const li = document.createElement('li');
        
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        
        const freqSpan = document.createElement('span');
        freqSpan.className = 'word-frequency';
        freqSpan.textContent = `${count} ocurrencias`;
        
        li.appendChild(wordSpan);
        li.appendChild(freqSpan);
        frequentWordsList.appendChild(li);
    });
}

// Función para actualizar la estructura del sitio
function updateSiteStructure(links = []) {
    siteStructureList.innerHTML = '';
    
    if (links.length === 0) {
        siteStructureList.appendChild(emptyStructure);
        emptyStructure.style.display = 'block';
        return;
    }
    
    emptyStructure.style.display = 'none';
    
    // Mostrar los primeros 10 enlaces encontrados
    links.slice(0, 10).forEach(link => {
        const li = document.createElement('li');
        
        const linkSpan = document.createElement('span');
        linkSpan.textContent = link.title || link.url;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'word-frequency';
        typeSpan.textContent = link.type === 'internal' ? 'Interno' : 'Externo';
        
        li.appendChild(linkSpan);
        li.appendChild(typeSpan);
        siteStructureList.appendChild(li);
    });
}

// Función principal de scraping
async function startScraping() {
    const url = urlInput.value.trim();
    if (!url) {
        showMessage('Por favor, ingresa una URL válida', 'error');
        return;
    }
    
    // Validar formato de URL
    try {
        new URL(url);
    } catch (e) {
        showMessage('La URL ingresada no es válida', 'error');
        return;
    }
    
    try {
        loading.style.display = 'block';
        loadingText.textContent = 'Iniciando análisis...';
        showMessage('Preparando el análisis de la página web...', 'info');
        
        // Configurar pasos de progreso
        const steps = [
            'Conectando con el servidor',
            'Descargando contenido principal',
            'Extrayendo enlaces internos',
            'Analizando páginas secundarias',
            'Procesando texto y palabras',
            'Generando estadísticas'
        ];
        
        setupProgressSteps(steps);
        updateProgress(0, 'Iniciando...');
        
        // Obtener configuración
        const depth = parseInt(depthSelect.value);
        const pageLimit = parseInt(pageLimitInput.value);
        const minLength = parseInt(minLengthInput.value);
        const filterCommon = filterCommonCheckbox.checked;
        const includeExternal = includeExternalCheckbox.checked;
        const timeout = parseInt(timeoutInput.value) * 1000;
        
        // Ejecutar scraping
        const result = await scraper.scrapeWebsite(
            url, depth, pageLimit, minLength, filterCommon, includeExternal, timeout
        );
        
        // Actualizar la interfaz con los resultados
        updateWordsList(result.words);
        updateFrequentWords(result.frequency);
        updateSiteStructure(result.links);
        updateStats(result.stats);
        
        showMessage(`Análisis completado. Se analizaron ${result.stats.pagesAnalyzed} páginas y se encontraron ${result.stats.wordCount} palabras únicas.`, 'success');
        
    } catch (error) {
        console.error('Error al extraer palabras:', error);
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Funciones de ordenamiento y filtrado
function sortWords(order) {
    if (!scraper || scraper.wordsSet.size === 0) {
        showMessage('No hay palabras para ordenar', 'info');
        return;
    }
    
    const words = Array.from(scraper.wordsSet);
    
    switch (order) {
        case 'asc':
            words.sort();
            showMessage('Palabras ordenadas alfabéticamente (A-Z)', 'info');
            break;
        case 'desc':
            words.sort().reverse();
            showMessage('Palabras ordenadas alfabéticamente (Z-A)', 'info');
            break;
        case 'length-asc':
            words.sort((a, b) => a.length - b.length);
            showMessage('Palabras ordenadas por longitud (corto a largo)', 'info');
            break;
        case 'length-desc':
            words.sort((a, b) => b.length - a.length);
            showMessage('Palabras ordenadas por longitud (largo a corto)', 'info');
            break;
    }
    
    updateWordsList(words);
}

function filterShortWords() {
    if (!scraper || scraper.wordsSet.size === 0) {
        showMessage('No hay palabras para filtrar', 'info');
        return;
    }
    
    const filtered = Array.from(scraper.wordsSet).filter(word => word.length < 5);
    updateWordsList(filtered);
    showMessage(`Mostrando ${filtered.length} palabras cortas (<5 letras)`, 'info');
}

function filterLongWords() {
    if (!scraper || scraper.wordsSet.size === 0) {
        showMessage('No hay palabras para filtrar', 'info');
        return;
    }
    
    const filtered = Array.from(scraper.wordsSet).filter(word => word.length > 10);
    updateWordsList(filtered);
    showMessage(`Mostrando ${filtered.length} palabras largas (>10 letras)`, 'info');
}

function clearAllWords() {
    if (!scraper || scraper.wordsSet.size === 0) {
        showMessage('No hay palabras para limpiar', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres limpiar todas las palabras?')) {
        scraper.wordsSet.clear();
        scraper.wordFrequency = {};
        scraper.pagesAnalyzed = 0;
        scraper.linksFound = 0;
        scraper.totalWordsFromPage = 0;
        scraper.siteLinks = [];
        
        updateWordsList();
        updateFrequentWords();
        updateSiteStructure();
        updateStats();
        
        showMessage('Todas las palabras han sido eliminadas', 'info');
    }
}

function exportWords() {
    if (!scraper || scraper.wordsSet.size === 0) {
        showMessage('No hay palabras para exportar', 'error');
        return;
    }
    
    const separator = exportSeparator.value;
    let actualSeparator = separator;
    
    // Convertir caracteres especiales
    if (separator === '\\t') actualSeparator = '\t';
    else if (separator === '\\n') actualSeparator = '\n';
    
    const content = Array.from(scraper.wordsSet).join(actualSeparator);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palabras_extraidas.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Archivo exportado correctamente', 'success');
}

function toggleAdvancedSettings() {
    const isVisible = settingsContent.classList.contains('show');
    
    if (isVisible) {
        settingsContent.classList.remove('show');
        settingsChevron.classList.remove('fa-chevron-up');
        settingsChevron.classList.add('fa-chevron-down');
    } else {
        settingsContent.classList.add('show');
        settingsChevron.classList.remove('fa-chevron-down');
        settingsChevron.classList.add('fa-chevron-up');
    }
}

// Hacer updateProgress disponible globalmente para scraper.js
window.updateProgress = updateProgress;
