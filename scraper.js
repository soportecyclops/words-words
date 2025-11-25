// scraper.js - Lógica avanzada de scraping y procesamiento

// Clase principal para el scraping
class AdvancedScraper {
    constructor() {
        this.wordsSet = new Set();
        this.wordFrequency = {};
        this.pagesAnalyzed = 0;
        this.linksFound = 0;
        this.totalWordsFromPage = 0;
        this.scrapeStartTime = 0;
        this.currentProgress = 0;
        this.progressSteps = [];
        this.siteLinks = [];
        
        // Palabras comunes a filtrar (si está activada la opción)
        this.commonWords = new Set([
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 
            'de', 'del', 'al', 'a', 'en', 'y', 'o', 'pero', 'por', 
            'para', 'con', 'sin', 'sobre', 'bajo', 'entre', 'hacia', 
            'desde', 'hasta', 'durante', 'mediante', 'según', 'ante', 
            'bajo', 'cabe', 'con', 'contra', 'de', 'desde', 'durante', 
            'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 
            'según', 'sin', 'so', 'sobre', 'tras', 'versus', 'vía', 
            'que', 'qué', 'cual', 'cuál', 'quien', 'quién', 'cuyo', 
            'cuya', 'cuyos', 'cuyas', 'donde', 'dónde', 'como', 'cómo', 
            'cuando', 'cuándo', 'cuanto', 'cuánto', 'cuanta', 'cuánta', 
            'cuantos', 'cuántos', 'cuantas', 'cuántas'
        ]);
    }

    // Procesar texto y extraer palabras
    processText(text, minLength = 3, filterCommon = true) {
        // Extraer palabras usando una expresión regular mejorada
        const words = text.match(/\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}\b/g) || [];
        this.totalWordsFromPage += words.length;
        
        // Procesar palabras: convertir a minúsculas y aplicar filtros
        const processedWords = words
            .map(word => word.toLowerCase())
            .filter(word => {
                // Filtrar por longitud mínima
                if (word.length < minLength) return false;
                
                // Filtrar palabras comunes si está activado
                if (filterCommon && this.commonWords.has(word)) return false;
                
                return true;
            });
        
        // Actualizar frecuencia de palabras
        processedWords.forEach(word => {
            this.wordFrequency[word] = (this.wordFrequency[word] || 0) + 1;
        });
        
        // Agregar palabras al conjunto (Set automáticamente elimina duplicados)
        processedWords.forEach(word => this.wordsSet.add(word));
        
        return processedWords.length;
    }

    // Simular scraping de página con contenido realista
    async scrapePageContent(url) {
        // En un entorno real, aquí se haría una petición HTTP
        // Para esta demo, generamos contenido realista basado en la URL
        
        const pageTemplates = {
            'tecnologia': `
                La inteligencia artificial está transformando la forma en que interactuamos con la tecnología. 
                Los algoritmos de machine learning permiten a las computadoras aprender de los datos y mejorar 
                su rendimiento con el tiempo. Python se ha convertido en el lenguaje de programación preferido 
                para el desarrollo de aplicaciones de IA debido a su sintaxis clara y su ecosistema de librerías. 
                TensorFlow y PyTorch son frameworks populares para el desarrollo de modelos de deep learning.
                La nube computing ofrece escalabilidad y flexibilidad para desplegar aplicaciones complejas.
                La ciberseguridad es fundamental para proteger los datos sensibles en la era digital.
            `,
            'ciencia': `
                La investigación científica avanza constantemente en múltiples disciplinas. 
                La física cuántica revela comportamientos fascinantes a nivel subatómico. 
                La biología molecular estudia los mecanismos fundamentales de la vida. 
                La astronomía explora los misterios del universo y los exoplanetas. 
                La química orgánica sintetiza compuestos complejos con aplicaciones médicas. 
                La genética moderna permite entender las bases hereditarias de las enfermedades.
            `,
            'educacion': `
                La educación digital ha revolucionado los métodos de enseñanza tradicionales. 
                Las plataformas de aprendizaje online ofrecen flexibilidad y accesibilidad. 
                Los recursos educativos abiertos democratizan el conocimiento globalmente. 
                La pedagogía moderna enfatiza el aprendizaje activo y colaborativo. 
                Las competencias digitales son esenciales en el mercado laboral actual.
            `,
            'default': `
                El desarrollo web es el proceso de crear sitios web y aplicaciones para internet. 
                Incluye diseño web, desarrollo de contenido web, scripting del lado del cliente y del servidor, 
                y configuración de seguridad de red, entre otras tareas. El desarrollo web puede variar desde 
                desarrollar una simple página de texto plano hasta complejas aplicaciones web, negocios 
                electrónicos y servicios de redes sociales. Las tecnologías web fundamentales incluyen HTML, 
                CSS y JavaScript, junto con frameworks y librerías modernas como React, Angular y Vue.
                La accesibilidad web asegura que todos los usuarios puedan utilizar los sitios correctamente.
                El rendimiento y la optimización son cruciales para la experiencia del usuario final.
            `
        };
        
        // Determinar el tipo de contenido basado en la URL
        let contentType = 'default';
        if (url.includes('tecnologia') || url.includes('tech')) contentType = 'tecnologia';
        else if (url.includes('ciencia') || url.includes('science')) contentType = 'ciencia';
        else if (url.includes('educacion') || url.includes('education')) contentType = 'educacion';
        
        return pageTemplates[contentType];
    }

    // Simular encontrar enlaces en una página
    async findLinksOnPage(url, depth, includeExternal = false) {
        const baseDomain = new URL(url).hostname;
        const links = [];
        
        // Enlaces internos simulados
        const internalLinks = [
            { url: `${url}/articulo1`, title: 'Artículo Principal', type: 'internal' },
            { url: `${url}/nosotros`, title: 'Sobre Nosotros', type: 'internal' },
            { url: `${url}/servicios`, title: 'Nuestros Servicios', type: 'internal' },
            { url: `${url}/contacto`, title: 'Información de Contacto', type: 'internal' },
            { url: `${url}/blog`, title: 'Blog y Noticias', type: 'internal' }
        ];
        
        links.push(...internalLinks);
        
        // Enlaces externos si están permitidos
        if (includeExternal) {
            const externalLinks = [
                { url: 'https://related-site.com', title: 'Sitio Relacionado', type: 'external' },
                { url: 'https://example.org', title: 'Recursos Adicionales', type: 'external' }
            ];
            links.push(...externalLinks);
        }
        
        this.linksFound += links.length;
        return links;
    }

    // Función principal de scraping
    async scrapeWebsite(url, depth = 1, pageLimit = 10, minLength = 3, filterCommon = true, includeExternal = false, timeout = 30000) {
        this.scrapeStartTime = Date.now();
        this.pagesAnalyzed = 0;
        this.linksFound = 0;
        this.totalWordsFromPage = 0;
        this.wordsSet.clear();
        this.wordFrequency = {};
        this.siteLinks = [];
        
        const pagesToScrape = [{ url, depth: 0 }];
        const scrapedPages = new Set([url]);
        
        while (pagesToScrape.length > 0 && this.pagesAnalyzed < pageLimit) {
            const currentPage = pagesToScrape.shift();
            
            // Simular scraping de la página actual
            await this.delay(800);
            const content = await this.scrapePageContent(currentPage.url);
            const wordsAdded = this.processText(content, minLength, filterCommon);
            this.pagesAnalyzed++;
            
            // Actualizar progreso
            const progress = Math.min(20 + (this.pagesAnalyzed / pageLimit) * 60, 80);
            this.updateProgress(progress, `Analizando página ${this.pagesAnalyzed} de ${pageLimit}...`);
            
            // Si no hemos alcanzado la profundidad máxima, buscar enlaces
            if (currentPage.depth < depth) {
                await this.delay(600);
                const links = await this.findLinksOnPage(currentPage.url, currentPage.depth, includeExternal);
                
                // Agregar nuevos enlaces a la cola
                for (const link of links) {
                    if (!scrapedPages.has(link.url) && pagesToScrape.length < pageLimit * 2) {
                        pagesToScrape.push({ url: link.url, depth: currentPage.depth + 1 });
                        scrapedPages.add(link.url);
                    }
                }
                
                this.siteLinks.push(...links);
            }
        }
        
        // Procesamiento final
        await this.delay(500);
        this.updateProgress(95, 'Generando estadísticas finales...');
        await this.delay(300);
        this.updateProgress(100, 'Análisis completado');
        
        return {
            words: Array.from(this.wordsSet),
            frequency: this.wordFrequency,
            stats: this.getStats(),
            links: this.siteLinks
        };
    }

    // Obtener estadísticas completas
    getStats() {
        const totalChars = Array.from(this.wordsSet).reduce((sum, word) => sum + word.length, 0);
        const avgLength = this.wordsSet.size > 0 ? (totalChars / this.wordsSet.size).toFixed(1) : 0;
        const uniquePercent = this.totalWordsFromPage > 0 ? 
            ((this.wordsSet.size / this.totalWordsFromPage) * 100).toFixed(1) : 0;
        const scrapeTime = (Date.now() - this.scrapeStartTime) / 1000;
        const efficiency = scrapeTime > 0 ? Math.round(this.wordsSet.size / scrapeTime) : 0;
        
        return {
            wordCount: this.wordsSet.size,
            charCount: totalChars,
            avgLength: avgLength,
            pagesAnalyzed: this.pagesAnalyzed,
            linksFound: this.linksFound,
            totalWordsFromPage: this.totalWordsFromPage,
            uniquePercent: uniquePercent,
            scrapeTime: scrapeTime.toFixed(1),
            efficiency: efficiency
        };
    }

    // Utilidad: delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Métodos para manejar el progreso (se implementarán en app.js)
    updateProgress(percent, text) {
        // Este método se implementará en app.js para actualizar la UI
        if (typeof window !== 'undefined' && window.updateProgress) {
            window.updateProgress(percent, text);
        }
    }
}

// Exportar para uso en navegador
if (typeof window !== 'undefined') {
    window.AdvancedScraper = AdvancedScraper;
}
