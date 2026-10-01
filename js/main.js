document.addEventListener('DOMContentLoaded', () => {
    // 1. Модальное окно и кнопки заказа
    const orderDialog = document.getElementById('order-dialog');
    const orderButtons = document.querySelectorAll('.product-card__button');
    const closeDialogButton = document.getElementById('close-order-dialog');
    const selectedProductInput = document.getElementById('selected-product');

    if (orderDialog && orderButtons.length > 0) {
        orderButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const productName = btn.dataset.product || 'Товар';
                if (selectedProductInput) {
                    selectedProductInput.value = productName;
                }
                orderDialog.showModal();
            });
        });
    }

    if (orderDialog && closeDialogButton) {
        closeDialogButton.addEventListener('click', () => {
            orderDialog.close();
        });
    }

    // 2. Универсальная валидация для всех форм
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const elements = Array.from(form.elements);
            elements.forEach((el) => {
                if (el.willValidate) {
                    el.removeAttribute('aria-invalid');
                }
            });

            if (!form.checkValidity()) {
                elements.forEach((el) => {
                    if (el.willValidate && !el.checkValidity()) {
                        el.setAttribute('aria-invalid', 'true');
                    }
                });
                form.reportValidity();
                return;
            }

            // Успех
            form.reset();

            if (form.id === 'order-form' && orderDialog) {
                orderDialog.close();
                const successMsg = document.getElementById('success-message');
                if (successMsg) successMsg.hidden = false;
            }

            const pageSuccess = form.parentElement.querySelector('.success-message');
            if (pageSuccess) {
                pageSuccess.hidden = false;
            }
        });
    });
});