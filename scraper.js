// scraper.js - Lógica mejorada de scraping y procesamiento

class AdvancedScraper {
    constructor() {
        this.wordsSet = new Set();
        this.wordFrequency = {};
        this.sources = [];
        this.totalProcessingTime = 0;
        this.totalWordsProcessed = 0;
        
        // Palabras comunes a filtrar
        this.commonWords = new Set([
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 
            'de', 'del', 'al', 'a', 'en', 'y', 'o', 'pero', 'por', 
            'para', 'con', 'sin', 'sobre', 'bajo', 'entre', 'hacia', 
            'desde', 'hasta', 'durante', 'mediante', 'según', 'ante',
            'que', 'qué', 'cual', 'cuál', 'quien', 'quién', 'como', 'cómo'
        ]);
    }

    // Procesar texto y extraer palabras
    processText(text, sourceName, minLength = 3, filterCommon = true) {
        const startTime = Date.now();
        
        // Extraer palabras usando expresión regular mejorada
        const words = text.toLowerCase()
            .match(/\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}\b/g) || [];
        
        const processedWords = words.filter(word => {
            if (word.length < minLength) return false;
            if (filterCommon && this.commonWords.has(word)) return false;
            return true;
        });
        
        // Actualizar estadísticas
        const newWords = [];
        processedWords.forEach(word => {
            this.wordFrequency[word] = (this.wordFrequency[word] || 0) + 1;
            if (!this.wordsSet.has(word)) {
                this.wordsSet.add(word);
                newWords.push(word);
            }
        });
        
        const processingTime = (Date.now() - startTime) / 1000;
        this.totalProcessingTime += processingTime;
        this.totalWordsProcessed += processedWords.length;
        
        // Registrar la fuente
        this.sources.push({
            name: sourceName,
            wordsFound: processedWords.length,
            newWords: newWords.length,
            processingTime: processingTime,
            timestamp: new Date().toLocaleTimeString()
        });
        
        return {
            totalWords: processedWords.length,
            newWords: newWords.length,
            processingTime: processingTime
        };
    }

    // Simular scraping de página con contenido variable
    async scrapePageContent(url, depth = 1) {
        // Generar contenido variable basado en la URL y profundidad
        const urlHash = this.hashString(url);
        const baseContent = this.generateVariableContent(urlHash, depth);
        
        // Simular tiempo de carga
        await this.delay(800 + (urlHash % 1000));
        
        return baseContent + (depth > 1 ? this.generateAdditionalContent(urlHash, depth) : '');
    }

    // Generar contenido variable basado en hash
    generateVariableContent(hash, depth) {
        const topics = [
            'tecnología inteligencia artificial machine learning algoritmos',
            'ciencia investigación física biología química astronomía',
            'programación desarrollo software código aplicaciones web',
            'educación aprendizaje enseñanza estudiantes conocimiento',
            'negocios empresa mercado economía finanzas inversión',
            'salud medicina bienestar nutrición ejercicio médico',
            'cultura arte música literatura cine teatro',
            'deporte atletismo competición entrenamiento equipo',
            'viajes turismo aventura exploración destinos cultura',
            'medioambiente naturaleza sostenibilidad ecología clima'
        ];
        
        const topicIndex = hash % topics.length;
        const baseWords = topics[topicIndex].split(' ');
        
        // Generar contenido más extenso basado en la profundidad
        let content = '';
        const sentences = 5 + (depth * 3) + (hash % 5);
        
        for (let i = 0; i < sentences; i++) {
            const sentenceLength = 8 + (hash % 8);
            let sentence = '';
            
            for (let j = 0; j < sentenceLength; j++) {
                const wordIndex = (hash + i + j) % baseWords.length;
                sentence += baseWords[wordIndex] + ' ';
            }
            
            content += this.capitalize(sentence.trim()) + '. ';
        }
        
        return content;
    }

    generateAdditionalContent(hash, depth) {
        const additionalWords = [
            'innovación transformación digital evolución progreso',
            'análisis datos información estadística resultados',
            'colaboración equipo trabajo proyecto organización',
            'creatividad innovación solución problema desafío',
            'optimización eficiencia productividad rendimiento',
            'seguridad protección privacidad confianza integridad',
            'comunidad sociedad participación colectivo unión',
            'futuro tendencia prospectiva visión oportunidad'
        ];
        
        const addIndex = (hash + depth) % additionalWords.length;
        const words = additionalWords[addIndex].split(' ');
        
        let content = ' Además';
        const sentences = 2 + (hash % 3);
        
        for (let i = 0; i < sentences; i++) {
            const sentenceLength = 6 + (hash % 6);
            let sentence = '';
            
            for (let j = 0; j < sentenceLength; j++) {
                const wordIndex = (hash + i + j) % words.length;
                sentence += words[wordIndex] + ' ';
            }
            
            content += ' ' + this.capitalize(sentence.trim()) + '.';
        }
        
        return content;
    }

    // Función de hash simple para generar números consistentes
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Simular encontrar enlaces en una página
    async findLinksOnPage(url, depth, pageLimit) {
        const links = [];
        const linkCount = 3 + (this.hashString(url) % 4);
        
        for (let i = 0; i < linkCount && links.length < pageLimit; i++) {
            links.push({
                url: `${url}/pagina-${depth}-${i}`,
                title: `Página ${depth}.${i}`,
                type: 'internal'
            });
        }
        
        await this.delay(300);
        return links;
    }

    // Función principal de scraping mejorada
    async scrapeWebsite(url, depth = 1, pageLimit = 5, minLength = 3, filterCommon = true) {
        const startTime = Date.now();
        const pagesToScrape = [{ url, depth: 0 }];
        const scrapedPages = new Set([url]);
        let pagesAnalyzed = 0;
        
        // Actualizar progreso inicial
        if (typeof window !== 'undefined' && window.updateProgress) {
            window.updateProgress(10, 'Iniciando análisis...');
        }
        
        while (pagesToScrape.length > 0 && pagesAnalyzed < pageLimit) {
            const currentPage = pagesToScrape.shift();
            
            // Actualizar progreso
            const progress = 10 + (pagesAnalyzed / pageLimit) * 70;
            if (typeof window !== 'undefined' && window.updateProgress) {
                window.updateProgress(progress, `Analizando página ${pagesAnalyzed + 1} de ${pageLimit}...`);
            }
            
            // Scraping de página actual
            const content = await this.scrapePageContent(currentPage.url, currentPage.depth);
            const result = this.processText(content, currentPage.url, minLength, filterCommon);
            pagesAnalyzed++;
            
            // Buscar enlaces si no hemos alcanzado la profundidad máxima
            if (currentPage.depth < depth - 1) {
                const links = await this.findLinksOnPage(currentPage.url, currentPage.depth, pageLimit);
                
                for (const link of links) {
                    if (!scrapedPages.has(link.url) && pagesToScrape.length < pageLimit * 2) {
                        pagesToScrape.push({ url: link.url, depth: currentPage.depth + 1 });
                        scrapedPages.add(link.url);
                    }
                }
            }
            
            // Pequeña pausa entre páginas
            await this.delay(200);
        }
        
        const totalTime = (Date.now() - startTime) / 1000;
        
        return {
            words: Array.from(this.wordsSet),
            frequency: {...this.wordFrequency},
            stats: this.getStats(),
            sources: [...this.sources],
            totalTime: totalTime
        };
    }

    // Procesar archivo de texto
    async processFile(file, minLength = 3, filterCommon = true) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const result = this.processText(content, file.name, minLength, filterCommon);
                    
                    resolve({
                        words: Array.from(this.wordsSet),
                        frequency: {...this.wordFrequency},
                        stats: this.getStats(),
                        sources: [...this.sources],
                        fileInfo: {
                            name: file.name,
                            size: file.size,
                            type: file.type
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    // Obtener estadísticas completas
    getStats() {
        const totalChars = Array.from(this.wordsSet).reduce((sum, word) => sum + word.length, 0);
        const avgLength = this.wordsSet.size > 0 ? (totalChars / this.wordsSet.size).toFixed(1) : 0;
        const efficiency = this.totalProcessingTime > 0 ? 
            Math.round(this.totalWordsProcessed / this.totalProcessingTime) : 0;
        
        return {
            wordCount: this.wordsSet.size,
            charCount: totalChars,
            avgLength: avgLength,
            sourcesCount: this.sources.length,
            totalWordsProcessed: this.totalWordsProcessed,
            totalProcessingTime: this.totalProcessingTime.toFixed(1),
            efficiency: efficiency
        };
    }

    // Limpiar todo
    clearAll() {
        this.wordsSet.clear();
        this.wordFrequency = {};
        this.sources = [];
        this.totalProcessingTime = 0;
        this.totalWordsProcessed = 0;
    }

    // Utilidad: delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exportar para uso en navegador
if (typeof window !== 'undefined') {
    window.AdvancedScraper = AdvancedScraper;
}
