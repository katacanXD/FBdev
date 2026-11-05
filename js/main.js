// ======================================================
// Общие помощники
// ======================================================

// Проверяет форму по встроенным HTML-ограничениям
// и подсвечивает поля с ошибками.
function validateForm(form) {
    const formElements = Array.from(form.elements);

    // Сбрасываем предыдущие признаки ошибок.
    formElements.forEach((element) => {
        if (element.willValidate) {
            element.removeAttribute('aria-invalid');
        }
    });

    if (form.checkValidity()) {
        return true;
    }

    formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
            element.setAttribute('aria-invalid', 'true');
        }
    });

    // Показываем стандартные сообщения браузера.
    form.reportValidity();
    return false;
}

// ======================================================
// Модальное окно заявки (главная страница)
// ======================================================

const orderDialog = document.getElementById('order-dialog');
const orderButtons = document.querySelectorAll('.product-card__button[data-product]');
const closeDialogButton = document.getElementById('close-order-dialog');
const selectedProductInput = document.getElementById('selected-product');

// Перебираем все кнопки «Заказать» в карточках товаров.
if (orderDialog && selectedProductInput) {
    orderButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Записываем название товара в скрытое поле формы.
            selectedProductInput.value = button.dataset.product;

            // Открываем модальное окно.
            orderDialog.showModal();
        });
    });
}

// Закрываем модальное окно по кнопке «Закрыть».
if (orderDialog && closeDialogButton) {
    closeDialogButton.addEventListener('click', () => {
        orderDialog.close();
    });
}

// ======================================================
// Форма заявки
// ======================================================

const orderForm = document.getElementById('order-form');
const orderSuccess = document.getElementById('success-message');

if (orderForm && orderSuccess) {
    orderForm.addEventListener('submit', (event) => {
        // Отменяем стандартную отправку формы,
        // потому что backend пока не подключён.
        event.preventDefault();

        if (!validateForm(orderForm)) {
            return;
        }

        // Показываем сообщение об успешной отправке.
        orderSuccess.hidden = false;

        // Очищаем форму.
        orderForm.reset();

        if (orderDialog) {
            orderDialog.close();
        }
    });
}

// ======================================================
// Форма обратной связи (страница «Контакты»)
// ======================================================

const feedbackForm = document.getElementById('feedback-form');
const feedbackSuccess = document.getElementById('feedback-success');

if (feedbackForm && feedbackSuccess) {
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!validateForm(feedbackForm)) {
            return;
        }

        feedbackSuccess.hidden = false;
        feedbackForm.reset();
        feedbackSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
