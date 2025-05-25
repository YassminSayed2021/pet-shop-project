





async function stripe(price) {
        const response = await fetch('https://adel.dev/scripts/stripe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: price,
                name: 'Pets Shop',
                onSuccess: "https://127.0.0.1:5501/payment-page/payment-page.html",
                onCancel: "https://127.0.0.1:5501/payment-page/payment-page.html",
            })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Error: " + data.error);
        }
    }



// Helper to create form group
function createPaymentForm() {
    const container = document.createElement('div');
    container.className = 'payment-container';

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Payment Details';
    container.appendChild(title);

    const form = document.createElement('form');
    form.id = 'payment-form';

    // Get amount from localStorage
    const amountValueRaw = localStorage.getItem('finalAmount');
    if (amountValueRaw) {
        const amountDisplay = document.createElement('h3');
        const amountValue = parseFloat(amountValueRaw);
        amountDisplay.textContent = `Amount: $${amountValue.toFixed(2)}`;
        form.appendChild(amountDisplay);

        // Submit Button
        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = 'Pay Now';
        form.appendChild(button);

        // Submit handler
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Convert dollars to cents for Stripe (e.g. 50.00 -> 5000)
            const priceInCents = Math.round(amountValue * 1);
            stripe(priceInCents);
        });
    } else {
        const amountError = document.createElement('div');
        amountError.textContent = "There is no amount";
        form.appendChild(amountError);
    }

    container.appendChild(form);
    document.getElementById('app').appendChild(container);
}


// Initialize the app
createPaymentForm();

