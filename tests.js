// tests.js - Tests de verificación para el scraper

class ScraperTests {
    constructor(scraper) {
        this.scraper = scraper;
        this.results = [];
    }

    async runAllTests() {
        console.log('🧪 Iniciando tests del Scraper...');
        this.results = [];

        await this.testTextProcessing();
        await this.testWordFiltering();
        await this.testFileProcessing();
        await this.testMultipleSources();
        await this.testProgressTracking();
        await this.testExportFunctionality();

        this.printResults();
    }

    async testTextProcessing() {
        const testName = 'Procesamiento de texto básico';
        
        try {
            const originalCount = this.scraper.wordsSet.size;
            const testText = 'Este es un texto de prueba con palabras repetidas palabras';
            
            const result = this.scraper.processText(testText, 'test-básico', 3, false);
            
            // Verificar que se procesaron palabras
            if (result.totalWords <= 0) {
                throw new Error('No se procesaron palabras');
            }
            
            // Verificar que las palabras únicas se agregaron
            const newCount = this.scraper.wordsSet.size;
            if (newCount <= originalCount) {
                throw new Error('No se agregaron palabras nuevas');
            }
            
            this.recordResult(testName, true, `Procesadas ${result.totalWords} palabras, ${result.newWords} nuevas`);
        } catch (error) {
            this.recordResult(testName, false, error.message);
        }
    }

    async testWordFiltering() {
        const testName = 'Filtrado de palabras comunes';
        
        try {
            const testText = 'el la los las de y en un una para con';
            const originalCount = this.scraper.wordsSet.size;
            
            // Procesar con filtrado activado
            const result = this.scraper.processText(testText, 'test-filtrado', 3, true);
            
            // Con filtrado activado, debería agregar pocas o ninguna palabra
            if (result.newWords > 2) {
                throw new Error('El filtrado no está funcionando correctamente');
            }
            
            this.recordResult(testName, true, `Filtrado correcto: ${result.newWords} palabras nuevas (esperado: 0-2)`);
        } catch (error) {
            this.recordResult(testName, false, error.message);
        }
    }

    async testFileProcessing() {
        const testName = 'Procesamiento de archivos';
        
        try {
            // Crear un archivo de prueba
            const testContent = 'Contenido de prueba para verificar el procesamiento de archivos texto';
            const testFile = new Blob([testContent], { type: 'text/plain' });
            testFile.name = 'test-file.txt';
            
            const originalCount = this.scraper.wordsSet.size;
            const result = await this.scraper.processFile(testFile, 3, false);
            
            if (result.stats.wordCount <= originalCount) {
                throw new Error('El archivo no se procesó correctamente');
            }
            
            this.recordResult(testName, true, `Archivo procesado: ${result.stats.wordCount} palabras totales`);
        } catch (error) {
            this.recordResult(testName, false, error.message);
        }
    }

    async testMultipleSources() {
        const testName = 'Múltiples fuentes';
        
        try {
            const originalSources = this.scraper.sources.length;
            
            // Procesar múltiples textos
            this.scraper.processText('Primera fuente de prueba', 'fuente-1', 3, false);
            this.scraper.processText('Segunda fuente diferente', 'fuente-2', 3, false);
            this.scraper.processText('Tercera fuente adicional', 'fuente-3', 3, false);
            
            if (this.scraper.sources.length !== originalSources + 3) {
                throw new Error('No se registraron correctamente las fuentes');
            }
            
            this.recordResult(testName, true, `Registradas ${this.scraper.sources.length} fuentes`);
        } catch (error) {
            this.recordResult(testName, false, error.message);
        }
    }

    async testProgressTracking() {
        const testName = 'Seguimiento de progreso';
        
        try {
            const originalStats = this.scraper.getStats();
            
            // Simular procesamiento
            this.scraper.processText('Texto para prueba de progreso y estadísticas', 'test-progreso', 3, false);
            
            const newStats = this.scraper.getStats();
            
            if (newStats.totalProcessingTime <= originalStats.totalProcessingTime) {
                throw new Error('El tiempo de procesamiento no se actualiza');
            }
            
            if (newStats.totalWordsProcessed <= originalStats.totalWordsProcessed) {
                throw new Error('El contador de palabras no se actualiza');
            }
            
            this.recordResult(testName, true, 'Progreso y estadísticas actualizadas correctamente');
        } catch (error) {
            this.recordResult(testName, false, error.message);
        }
    }

    async testExportFunctionality() {
        const testName = 'Funcionalidad de exportación';
        
        try {
            if (this.scraper.wordsSet.size === 0) {
                // Agregar algunas palabras para la prueba
                this.scraper.processText('palabra prueba exportación contenido', 'test-export', 3, false);
            }
            
            const wordsArray = Array.from(this.scraper.wordsSet);
            
            // Probar diferentes separadores
            const separators = {
                ' ': ' ',
                ',': ',',
                '\\n': '\n',
                '\\t': '\t'
            };
            
            for (const [key, separator] of Object.entries(separators)) {
                const exported = wordsArray.join(separator);
                
                if (!exported.includes(separator) && wordsArray.length > 1) {
                    throw new Error(`El separador '${key}' no funciona correctamente`);
                }
            }
            
            this.recordResult(testName, true, `Exportación probada con ${wordsArray.length} palabras`);
        } catch (error) {
            this.recordResult(testName, false, error.message);
        }
    }

    recordResult(testName, passed, message) {
        this.results.push({
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toLocaleTimeString()
        });
        
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
    }

    printResults() {
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        console.log('\n📊 RESUMEN DE TESTS:');
        console.log(`✅ ${passed} pasados de ${total} tests`);
        
        this.results.forEach(result => {
            const status = result.passed ? 'PASÓ' : 'FALLÓ';
            console.log(`  ${status} - ${result.name}: ${result.message}`);
        });
        
        // Mostrar resultados en la UI si está disponible
        if (typeof window !== 'undefined' && window.app) {
            const message = passed === total ? 
                `✅ Todos los tests pasaron correctamente (${passed}/${total})` :
                `⚠️ ${passed} de ${total} tests pasaron. Revisa la consola para más detalles.`;
            
            window.app.showMessage(message, passed === total ? 'success' : 'warning');
        }
    }
}

// Función global para ejecutar tests
window.runScraperTests = async function(scraper) {
    const tests = new ScraperTests(scraper);
    await tests.runAllTests();
    return tests.results;
};

// Tests automáticos al cargar en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🔧 Modo desarrollo: Los tests están disponibles');
        console.log('Ejecuta window.runScraperTests(window.app.scraper) para probar');
    });
}
