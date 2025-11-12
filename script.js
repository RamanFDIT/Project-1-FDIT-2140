const expandBtns = document.querySelectorAll('.questionComp');

expandBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const answerPanel = btn.nextElementSibling;
        if (!answerPanel) {
            return;
        }

        answerPanel.classList.toggle('is-open');

        const arrowIcon = btn.querySelector('.arrowDefault');
        if (arrowIcon) {
            arrowIcon.classList.toggle('is-open');
        }
    });
});