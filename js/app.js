document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    const viewWelcome = document.getElementById('view-welcome');
    const viewMenu = document.getElementById('view-menu');
    const btnBack = document.getElementById('btn-back');

    // Transición al menú principal al hacer clic en "Iniciar"
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            viewWelcome.classList.add('d-none');
            viewMenu.classList.remove('d-none');
        });
    }

    // Regresar a la pantalla del planeta
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            viewMenu.classList.add('d-none');
            viewWelcome.classList.remove('d-none');
        });
    }
});