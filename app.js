// app.js - Lógica mejorada de la interfaz

class LexiScraperApp {
    constructor() {
        this.scraper = new AdvancedScraper();
        this.currentWords = [];
        this.isProcessing = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeElements() {
        // Elementos de entrada
        this.urlInput = document.getElementById('url-input');
        this.scrapeBtn = document.getElementById('scrape-btn');
        this.addToListBtn = document.getElementById('add-to-list-btn');
        this.fileInput = document.getElementById('file-input');
        this.processFileBtn = document.getElementById('process-file-btn');
        
        // Elementos de UI
        this.loading = document.getElementById('loading');
        this.loadingText = document.getElementById('loading-text');
        this.messageDiv = document.getElementById('message');
        this.wordsList = document.getElementById('words-list');
        this.sourcesList = document.getElementById('sources-list');
        
        // Estadísticas
        this.wordCountSpan = document.getElementById('word-count');
        this.sourcesCountSpan = document.getElementById('sources-count');
        this.totalWordsSpan = document.getElementById('total-words');
        this.charCountSpan = document.getElementById('char-count');
        this.wordsBadge = document.getElementById('words-badge');
        this.totalTimeSpan = document.getElementById('total-time');
        this.efficiencySpan = document.getElementById('efficiency');
        this.lastSourceSpan = document.getElementById('last-source');
        
        // Controles
        this.sortAscBtn = document.getElementById('sort-asc');
        this.sortDescBtn = document.getElementById('sort-desc');
        this.sortLengthAscBtn = document.getElementById('sort-length-asc');
        this.sortLengthDescBtn = document.getElementById('sort-length-desc');
        this.clearWordsBtn = document.getElementById('clear-words');
        this.exportBtn = document.getElementById('export-btn');
        this.searchInput = document.getElementById('search-words');
        this.clearSearchBtn = document.getElementById('clear-search');
        
        // Configuración
        this.depthSelect = document.getElementById('depth-select');
        this.pageLimitInput = document.getElementById('page-limit');
        this.minLengthInput = document.getElementById('min-length');
        this.filterCommonCheckbox = document.getElementById('filter-common');
        this.exportSeparator = document.getElementById('export-separator');
        
        // Progreso
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.progressPercent = document.getElementById('progress-percent');
        this.progressStepsContainer = document.getElementById('progress-steps');
    }

    setupEventListeners() {
        // Scraping
        this.scrapeBtn.addEventListener('click', () => this.startScraping());
        this.addToListBtn.addEventListener('click', () => this.addToExistingList());
        
        // Archivos
        this.processFileBtn.addEventListener('click', () => this.processFile());
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.showMessage(`Archivo seleccionado: ${e.target.files[0].name}`, 'info');
            }
        });
        
        // Controles
        this.sortAscBtn.addEventListener('click', () => this.sortWords('asc'));
        this.sortDescBtn.addEventListener('click', () => this.sortWords('desc'));
        this.sortLengthAscBtn.addEventListener('click', () => this.sortWords('length-asc'));
        this.sortLengthDescBtn.addEventListener('click', () => this.sortWords('length-desc'));
        this.clearWordsBtn.addEventListener('click', () => this.clearAll());
        this.exportBtn.addEventListener('click', () => this.exportWords());
        
        // Búsqueda
        this.searchInput.addEventListener('input', () => this.filterWords());
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.filterWords();
        });
        
        // Enter en inputs
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startScraping();
        });
        
        // Configuración avanzada
        document.getElementById('settings-toggle').addEventListener('click', () => this.toggleAdvancedSettings());
        
        // Tests
        document.getElementById('run-tests-btn').addEventListener('click', () => this.runTests());
        document.getElementById('reset-all-btn').addEventListener('click', () => this.resetAll());
    }

    async startScraping() {
        if (this.isProcessing) {
            this.showMessage('Ya hay un proceso en ejecución', 'error');
            return;
        }

        const url = this.urlInput.value.trim();
        if (!url) {
            this.showMessage('Por favor, ingresa una URL válida', 'error');
            return;
        }

        try {
            new URL(url);
        } catch (e) {
            this.showMessage('La URL ingresada no es válida', 'error');
            return;
        }

        this.isProcessing = true;
        this.setLoading(true, 'Iniciando análisis...');

        try {
            const depth = parseInt(this.depthSelect.value);
            const pageLimit = parseInt(this.pageLimitInput.value);
            const minLength = parseInt(this.minLengthInput.value);
            const filterCommon = this.filterCommonCheckbox.checked;

            // Configurar progreso
            this.setupProgressSteps([
                'Conectando con el servidor',
                'Descargando contenido principal',
                'Extrayendo enlaces internos',
                'Analizando páginas secundarias',
                'Procesando texto y palabras',
                'Generando estadísticas'
            ]);

            await this.updateProgress(10, 'Preparando análisis...');

            const result = await this.scraper.scrapeWebsite(url, depth, pageLimit, minLength, filterCommon);
            
            await this.updateProgress(100, 'Análisis completado');
            
            this.updateUIWithResults(result);
            this.showMessage(`Scraping completado. ${result.stats.wordCount} palabras únicas encontradas.`, 'success');

        } catch (error) {
            console.error('Error en scraping:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
            this.isProcessing = false;
        }
    }

    async addToExistingList() {
        if (this.isProcessing) {
            this.showMessage('Ya hay un proceso en ejecución', 'error');
            return;
        }

        const url = this.urlInput.value.trim();
        if (!url) {
            this.showMessage('Por favor, ingresa una URL válida', 'error');
            return;
        }

        this.isProcessing = true;
        this.setLoading(true, 'Agregando a la lista existente...');

        try {
            const depth = 1; // Solo página principal para agregar
            const pageLimit = 3;
            const minLength = parseInt(this.minLengthInput.value);
            const filterCommon = this.filterCommonCheckbox.checked;

            const originalCount = this.scraper.wordsSet.size;
            const result = await this.scraper.scrapeWebsite(url, depth, pageLimit, minLength, filterCommon);
            const newWords = result.stats.wordCount - originalCount;

            this.updateUIWithResults(result);
            this.showMessage(`Agregadas ${newWords} palabras nuevas al diccionario`, 'success');

        } catch (error) {
            console.error('Error al agregar:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
            this.isProcessing = false;
        }
    }

    async processFile() {
        if (this.isProcessing) {
            this.showMessage('Ya hay un proceso en ejecución', 'error');
            return;
        }

        const file = this.fileInput.files[0];
        if (!file) {
            this.showMessage('Por favor, selecciona un archivo', 'error');
            return;
        }

        this.isProcessing = true;
        this.setLoading(true, 'Procesando archivo...');

        try {
            const minLength = parseInt(this.minLengthInput.value);
            const filterCommon = this.filterCommonCheckbox.checked;

            await this.updateProgress(30, 'Leyendo archivo...');
            const result = await this.scraper.processFile(file, minLength, filterCommon);
            await this.updateProgress(100, 'Archivo procesado');

            this.updateUIWithResults(result);
            this.showMessage(`Archivo procesado. ${result.stats.wordCount} palabras únicas encontradas.`, 'success');

            // Limpiar input de archivo
            this.fileInput.value = '';

        } catch (error) {
            console.error('Error procesando archivo:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
            this.isProcessing = false;
        }
    }

    updateUIWithResults(result) {
        this.updateWordsList(result.words);
        this.updateSourcesList(result.sources);
        this.updateStats(result.stats);
        
        if (result.totalTime) {
            this.totalTimeSpan.textContent = `${result.totalTime}s`;
        }
        
        const lastSource = result.sources[result.sources.length - 1];
        if (lastSource) {
            this.lastSourceSpan.textContent = lastSource.name;
        }
    }

    updateWordsList(words = []) {
        this.wordsList.innerHTML = '';
        this.currentWords = words;

        if (words.length === 0) {
            this.wordsList.appendChild(this.getEmptyState('words'));
            return;
        }

        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredWords = searchTerm ? 
            words.filter(word => word.toLowerCase().includes(searchTerm)) : 
            words;

        filteredWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            li.title = `Frecuencia: ${this.scraper.wordFrequency[word] || 1}`;
            this.wordsList.appendChild(li);
        });

        this.wordsBadge.textContent = filteredWords.length;
    }

    updateSourcesList(sources = []) {
        const sourcesList = document.getElementById('sources-list');
        sourcesList.innerHTML = '';

        if (sources.length === 0) {
            sourcesList.appendChild(this.getEmptyState('sources'));
            return;
        }

        // Mostrar las fuentes más recientes primero
        sources.slice().reverse().forEach(source => {
            const sourceItem = document.createElement('div');
            sourceItem.className = 'source-item';
            
            sourceItem.innerHTML = `
                <div class="source-info">
                    <div class="source-name">${source.name}</div>
                    <div class="source-stats">
                        ${source.wordsFound} palabras • ${source.newWords} nuevas • ${source.processingTime}s
                    </div>
                </div>
                <div class="source-words">+${source.newWords}</div>
            `;
            
            sourcesList.appendChild(sourceItem);
        });
    }

    updateStats(stats = null) {
        if (stats) {
            this.wordCountSpan.textContent = stats.wordCount;
            this.sourcesCountSpan.textContent = stats.sourcesCount;
            this.totalWordsSpan.textContent = stats.totalWordsProcessed;
            this.charCountSpan.textContent = stats.charCount.toLocaleString();
            this.efficiencySpan.textContent = `${stats.efficiency}/s`;
        } else {
            this.wordCountSpan.textContent = '0';
            this.sourcesCountSpan.textContent = '0';
            this.totalWordsSpan.textContent = '0';
            this.charCountSpan.textContent = '0';
            this.efficiencySpan.textContent = '0/s';
            this.totalTimeSpan.textContent = '0s';
            this.lastSourceSpan.textContent = '-';
            this.wordsBadge.textContent = '0';
        }
    }

    filterWords() {
        this.updateWordsList(Array.from(this.scraper.wordsSet));
    }

    sortWords(order) {
        if (this.scraper.wordsSet.size === 0) {
            this.showMessage('No hay palabras para ordenar', 'info');
            return;
        }

        const words = Array.from(this.scraper.wordsSet);

        switch (order) {
            case 'asc':
                words.sort();
                this.showMessage('Palabras ordenadas A-Z', 'info');
                break;
            case 'desc':
                words.sort().reverse();
                this.showMessage('Palabras ordenadas Z-A', 'info');
                break;
            case 'length-asc':
                words.sort((a, b) => a.length - b.length);
                this.showMessage('Palabras ordenadas por longitud (corto a largo)', 'info');
                break;
            case 'length-desc':
                words.sort((a, b) => b.length - a.length);
                this.showMessage('Palabras ordenadas por longitud (largo a corto)', 'info');
                break;
        }

        this.updateWordsList(words);
    }

    clearAll() {
        if (this.scraper.wordsSet.size === 0) {
            this.showMessage('No hay palabras para limpiar', 'info');
            return;
        }

        if (confirm('¿Estás seguro de que quieres limpiar todas las palabras y fuentes?')) {
            this.scraper.clearAll();
            this.updateUI();
            this.showMessage('Todas las palabras y fuentes han sido eliminadas', 'info');
        }
    }

    exportWords() {
        if (this.scraper.wordsSet.size === 0) {
            this.showMessage('No hay palabras para exportar', 'error');
            return;
        }

        const separator = this.exportSeparator.value;
        let actualSeparator = separator;
        
        if (separator === '\\t') actualSeparator = '\t';
        else if (separator === '\\n') actualSeparator = '\n';

        const content = Array.from(this.scraper.wordsSet).join(actualSeparator);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `diccionario_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Diccionario exportado correctamente', 'success');
    }

    // Métodos de UI
    showMessage(text, type = 'info') {
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

        this.messageDiv.innerHTML = `
            <div class="message ${type}">
                <i class="fas ${icon}"></i>
                <span>${text}</span>
            </div>
        `;

        setTimeout(() => {
            this.messageDiv.innerHTML = '';
        }, 5000);
    }

    setLoading(loading, text = '') {
        if (loading) {
            this.loading.style.display = 'block';
            this.loadingText.textContent = text;
            this.scrapeBtn.disabled = true;
            this.addToListBtn.disabled = true;
            this.processFileBtn.disabled = true;
        } else {
            this.loading.style.display = 'none';
            this.scrapeBtn.disabled = false;
            this.addToListBtn.disabled = false;
            this.processFileBtn.disabled = false;
        }
    }

    async updateProgress(percent, text) {
        if (this.progressBar && this.progressText && this.progressPercent) {
            this.progressBar.style.width = `${percent}%`;
            this.progressPercent.textContent = `${Math.round(percent)}%`;
            this.progressText.textContent = text;
            
            // Actualizar paso de progreso basado en el porcentaje
            const stepIndex = Math.floor(percent / 20);
            this.updateProgressStep(stepIndex, 'active');
            
            if (percent === 100) {
                // Marcar todos los pasos como completados
                for (let i = 0; i < 5; i++) {
                    this.updateProgressStep(i, 'completed');
                }
            }
        }
        
        // Pequeña pausa para que se vea la animación
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    setupProgressSteps(steps) {
        this.progressStepsContainer.innerHTML = '';
        
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
            this.progressStepsContainer.appendChild(stepElement);
        });
    }

    updateProgressStep(stepIndex, status) {
        const steps = this.progressStepsContainer.querySelectorAll('.progress-step');
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

    getEmptyState(type) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        if (type === 'words') {
            emptyState.innerHTML = `
                <i class="fas fa-language"></i>
                <p>No hay palabras extraídas aún</p>
                <p>Ingresa una URL o carga un archivo para comenzar</p>
            `;
        } else if (type === 'sources') {
            emptyState.innerHTML = `
                <i class="fas fa-globe"></i>
                <p>No hay fuentes analizadas</p>
            `;
        }
        
        return emptyState;
    }

    toggleAdvancedSettings() {
        const settingsContent = document.getElementById('settings-content');
        const settingsChevron = document.getElementById('settings-chevron');
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

    updateUI() {
        this.updateWordsList(Array.from(this.scraper.wordsSet));
        this.updateSourcesList(this.scraper.sources);
        this.updateStats(this.scraper.getStats());
    }

    async runTests() {
        this.showMessage('Ejecutando tests de verificación...', 'info');
        
        try {
            if (typeof window !== 'undefined' && window.runScraperTests) {
                await window.runScraperTests(this.scraper);
            } else {
                this.showMessage('Los tests no están disponibles', 'error');
            }
        } catch (error) {
            this.showMessage(`Error en tests: ${error.message}`, 'error');
        }
    }

    resetAll() {
        if (confirm('¿Estás seguro de que quieres reiniciar toda la aplicación?')) {
            this.scraper.clearAll();
            this.urlInput.value = '';
            this.fileInput.value = '';
            this.searchInput.value = '';
            this.updateUI();
            this.showMessage('Aplicación reiniciada correctamente', 'info');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.app = new LexiScraperApp();
});

// Hacer updateProgress disponible globalmente para scraper.js
window.updateProgress = function(percent, text) {
    if (window.app) {
        window.app.updateProgress(percent, text);
    }
};
