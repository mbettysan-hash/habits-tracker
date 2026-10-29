document.addEventListener('DOMContentLoaded', () => {
    // Vistas
    const viewWelcome = document.getElementById('view-welcome');
    const viewMenu = document.getElementById('view-menu');
    const viewNight = document.getElementById('view-night');

    // Botones de navegación
    const btnStart = document.getElementById('btn-start');
    const btnBackWelcome = document.getElementById('btn-back'); // Volver al inicio desde el menú
    const btnGrowing = document.getElementById('btn-growing');   // Botón "Continúa Creciendo"
    const btnBackMenu = document.getElementById('btn-back-menu'); // Volver al menú desde la noche

    // 1. Transición: Inicio -> Menú
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            viewWelcome.classList.add('d-none');
            viewMenu.classList.remove('d-none');
        });
    }

    // 2. Transición: Menú -> Inicio
    if (btnBackWelcome) {
        btnBackWelcome.addEventListener('click', () => {
            viewMenu.classList.add('d-none');
            viewWelcome.classList.remove('d-none');
        });
    }

    // 3. Transición: Menú -> Vista Nocturna (Continúa Creciendo)
    if (btnGrowing) {
        btnGrowing.addEventListener('click', () => {
            viewMenu.classList.add('d-none');
            viewNight.classList.remove('d-none');
        });
    }

    // 4. Transición: Vista Nocturna -> Menú
    if (btnBackMenu) {
        btnBackMenu.addEventListener('click', () => {
            viewNight.classList.add('d-none');
            viewMenu.classList.remove('d-none');
        });
    }
});