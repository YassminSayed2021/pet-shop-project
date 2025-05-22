// Helper to create form group
function createFormGroup(id, labelText, type, placeholder, maxLength) {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.placeholder = placeholder;
    if (maxLength) input.maxLength = maxLength;

    group.appendChild(label);
    group.appendChild(input);
    return group;
}

// Helper to create error msg
function createError(id, text) {
    const error = document.createElement('div');
    error.id = id;
    error.className = 'error';
    error.textContent = text;
    return error;
}

// Helper to create payment method selection
function createPaymentMethodSelection() {
    const group = document.createElement('div');
    group.className = 'form-group payment-methods';

    const label = document.createElement('label');
    label.textContent = 'Select Payment Method';

    const cardOption = document.createElement('div');
    cardOption.className = 'payment-option';
    
    const cardRadio = document.createElement('input');
    cardRadio.type = 'radio';
    cardRadio.id = 'card-payment';
    cardRadio.name = 'payment-method';
    cardRadio.value = 'card';
    cardRadio.checked = true;

    const cardLabel = document.createElement('label');
    cardLabel.htmlFor = 'card-payment';
    cardLabel.textContent = 'Credit/Debit Card';

    const codOption = document.createElement('div');
    codOption.className = 'payment-option';
    
    const codRadio = document.createElement('input');
    codRadio.type = 'radio';
    codRadio.id = 'cod-payment';
    codRadio.name = 'payment-method';
    codRadio.value = 'cod';

    const codLabel = document.createElement('label');
    codLabel.htmlFor = 'cod-payment';
    codLabel.textContent = 'Cash on Delivery';

    cardOption.appendChild(cardRadio);
    cardOption.appendChild(cardLabel);
    codOption.appendChild(codRadio);
    codOption.appendChild(codLabel);

    group.appendChild(label);
    group.appendChild(cardOption);
    group.appendChild(codOption);

    return group;
}

// Get amount from URL parameters
function getAmountFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    return amount ? parseFloat(amount) : 100; // Default to $100 if no amount provided just in test mode, it will be removed...
}

// Create payment form 
function createPaymentForm() {
    const container = document.createElement('div');
    container.className = 'payment-container';

    const title = document.createElement('h2');
    title.textContent = 'Payment Details';
    container.appendChild(title);

    const form = document.createElement('form');
    form.id = 'payment-form';

    //amount
    const amount = document.createElement('h3');
    const amountValue = getAmountFromUrl();
    const amountError = createError('amount-error', "there is no amount");
    amount.appendChild(amountError);
    amount.textContent = `Amount: $${amountValue.toFixed(2)}`;
    form.appendChild(amount);

    // Payment Method Selection
    const paymentMethodGroup = createPaymentMethodSelection();
    form.appendChild(paymentMethodGroup);

    // Card Payment Details Container
    const cardDetailsContainer = document.createElement('div');
    cardDetailsContainer.id = 'card-details';
    cardDetailsContainer.className = 'card-details';

    // Card Number
    const cardNumberGroup = createFormGroup('card-number', 'Card Number', 'text', '1234 5678 9012 3456', '19');
    const cardNumberError = createError('card-number-error', 'Please enter a valid card number');
    cardNumberGroup.appendChild(cardNumberError);
    cardDetailsContainer.appendChild(cardNumberGroup);

    // Card Holder
    const cardHolderGroup = createFormGroup('card-holder', 'Card Holder Name', 'text', 'ex: Ahmed xxxx');
    const cardHolderError = createError('card-holder-error', "Please enter the cardholder's name");
    cardHolderGroup.appendChild(cardHolderError);
    cardDetailsContainer.appendChild(cardHolderGroup);
 




    
    // Flex group for Expiry and CVV
    const flexGroup = document.createElement('div');
    flexGroup.className = 'flex-group';

    // Expiry Date
    const expiryGroup = createFormGroup('expiry-date', 'Expiry Date', 'text', 'MM/YY', '5');
    const expiryError = createError('expiry-date-error', 'Please enter a valid expiry date');
    expiryGroup.appendChild(expiryError);
    flexGroup.appendChild(expiryGroup);

    // CVV
    const cvvGroup = createFormGroup('cvv', 'CVV', 'text', '123', '3');
    const cvvError = createError('cvv-error', 'Please enter a valid CVV');
    cvvGroup.appendChild(cvvError);
    flexGroup.appendChild(cvvGroup);

    cardDetailsContainer.appendChild(flexGroup);
    form.appendChild(cardDetailsContainer);

    // Submit Button
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Pay Now';
    form.appendChild(button);

    // Cancel Button
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button'; // Changed from submit to button to prevent form submission
    cancelButton.textContent = 'Cancel';
    //cancelButton.className = 'cancel-button';
    cancelButton.addEventListener('click', () => {
        form.reset();
         const confirmCancel = confirm('Are you sure you want to cancel?');
         if(confirmCancel){
           window.location.href = 'pet-shop-project/index.html';
         }
        
    });
    form.appendChild(cancelButton);

    container.appendChild(form);
    document.getElementById('app').appendChild(container);
}

function setupFormBehavior() {
    const form = document.getElementById('payment-form');
    const cardNumber = document.getElementById('card-number');
    const cardHolder = document.getElementById('card-holder');
    const expiryDate = document.getElementById('expiry-date');
    const cvv = document.getElementById('cvv');
    const cardDetails = document.getElementById('card-details');
    const paymentMethods = document.getElementsByName('payment-method');

    // Toggle card details visibility based on payment method
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            cardDetails.style.display = e.target.value === 'card' ? 'block' : 'none';
        });
    });

    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = value;
    });
    
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 3) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        document.querySelectorAll('.error').forEach(error => error.style.display = 'none');

        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        if (selectedPaymentMethod === 'card') {
            const cardNumValue = cardNumber.value.replace(/\s/g, '');
            if (!/^\d{16}$/.test(cardNumValue)) {
                document.getElementById('card-number-error').style.display = 'block';
                isValid = false;
            }

            if (cardHolder.value.trim() === '') {
                document.getElementById('card-holder-error').style.display = 'block';
                isValid = false;
            }

            const expiryValue = expiryDate.value;
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryValue)) {
                document.getElementById('expiry-date-error').style.display = 'block';
                isValid = false;
            } else {
                const [month, year] = expiryValue.split('/').map(Number);
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    document.getElementById('expiry-date-error').style.display = 'block';
                    isValid = false;
                }
            }

            if (!/^\d{3}$/.test(cvv.value)) {
                document.getElementById('cvv-error').style.display = 'block';
                isValid = false;
            }
        }

        if (isValid) {
            const message = selectedPaymentMethod === 'card' 
                ? 'Payment processed successfully! (This is a demo)'
                : 'Order placed successfully! You will pay on delivery.';
            alert(message);
            form.reset();
        }
    });
}

// Initialize the app
createPaymentForm();
setupFormBehavior();
