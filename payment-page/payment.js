// Initialize Stripe (using test publishable key)
const stripe = Stripe('pk_test_51RR8inRQgleRY2lfafdo5rfvbp3K3PfxedT3cculD7bbDD9EnpqMrYlzLTNW3De7t02sh1g84vipDJtFLkTx3LMf00xkZNcecU');
const elements = stripe.elements();

// Function to get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Retrieve finalAmount and email from URL or localStorage
const finalAmount = parseFloat(getQueryParam('amount')) || parseFloat(localStorage.getItem('finalAmount')) || 0.00;
const prefilledEmail = getQueryParam('email') || '';

// Update amount display, button text, and email input
document.addEventListener('DOMContentLoaded', () => {
    console.log('Retrieved finalAmount:', finalAmount);
    console.log('Retrieved email:', prefilledEmail);
    document.getElementById('amount-display').textContent = `Amount: $${finalAmount.toFixed(2)}`;
    document.getElementById('button-text').textContent = `Pay $${finalAmount.toFixed(2)}`;
    if (prefilledEmail) {
        document.getElementById('email').value = decodeURIComponent(prefilledEmail);
    }
});

// Create card element
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#dc3545',
        },
    },
});

// Mount card element
cardElement.mount('#card-element');

// Handle real-time validation errors from the card Element
cardElement.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

// Handle form submission
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    // Validate amount
    if (finalAmount <= 0) {
        showNotification('Invalid amount. Please check your cart.', 'error');
        return;
    }

    setLoading(true);

    try {
        // Create payment method
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                email: email,
            },
        });

        if (error) {
            showNotification(error.message, 'error');
            setLoading(false);
        } else {
            // Simulate payment processing
            await simulatePayment(paymentMethod);
        }
    } catch (err) {
        console.error('Payment error:', err);
        showNotification('An unexpected error occurred. Please try again.', 'error');
        setLoading(false);
    }
});

// Simulate complete payment processing with detailed steps
async function simulatePayment(paymentMethod) {
    const amount = finalAmount; // Use finalAmount from URL or localStorage
    const cardBrand = paymentMethod.card.brand.toUpperCase();
    const last4 = paymentMethod.card.last4;
    const email = document.getElementById('email').value;

    try {
        // Step 1: Validating payment method
        // showNotification('🔍 Validating payment method...', 'success');
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Processing payment
        showNotification('⚡ Processing payment...', 'success');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: Confirming transaction
        // showNotification('✅ Confirming transaction...', 'success');
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for specific test card behaviors
        if (last4 === '0002') {
            // Declined card
            showNotification('❌ Payment Declined: Your card was declined by the issuing bank. Please try a different payment method.', 'error');
            setLoading(false);
            return;
        } else if (last4 === '9995') {
            // Insufficient funds
            showNotification('💳 Payment Failed: Insufficient funds available on your card. Please try a different card.', 'error');
            setLoading(false);
            return;
        }

        // Success for all other cards (including 4242 and any other test cards)
        // Generate transaction ID
        const transactionId = 'txn_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Final success notification with complete details
        const successMessage = `
            🎉 Payment Successful! 
            Amount: $${amount.toFixed(2)}
            Card: ${cardBrand} ****${last4}
            Email: ${email}
            Transaction ID: ${transactionId}
            ✅ Receipt sent to your email
        `;
        
        showNotification(successMessage, 'success');

        // Show additional confirmation
        // setTimeout(() => {
        //     showNotification('📧 Confirmation email has been sent to ' + email, 'success');
        // }, 2000);

        // Redirect to index.html after successful payment
        setTimeout(() => {
            showNotification('🔄 Redirecting to home page...', 'success');
            setTimeout(() => {
                window.location.href = '../index.html';
            },2000);
        }, 4000);

        resetForm();

    } catch (error) {
        showNotification('❌ Payment Error: ' + error.message, 'error');
        setLoading(false);
    }
}

function setLoading(isLoading) {
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('button-text');
    
    submitButton.disabled = isLoading;
    
    if (isLoading) {
        spinner.style.display = 'inline-block';
        buttonText.textContent = 'Processing Payment...';
    } else {
        spinner.style.display = 'none';
        buttonText.textContent = `Pay $${finalAmount.toFixed(2)}`;
    }
}

function resetForm() {
    setTimeout(() => {
        document.getElementById('payment-form').reset();
        cardElement.clear();
        setLoading(false);
        
        // Show reset confirmation
        setTimeout(() => {
            // showNotification('🔄 Form reset successfully. Ready for next payment!', 'success');
        }, 500);
    }, 4000); // Wait 4 seconds before resetting
}

function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-hide notification
    const hideDelay = type === 'success' ? 6000 : 5000;
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, hideDelay);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add some interactive feedback
document.getElementById('email').addEventListener('input', function() {
    if (this.value && !isValidEmail(this.value)) {
        this.style.borderColor = '#dc3545';
    } else {
        this.style.borderColor = '#e6ebf1';
    }
});

// Welcome message with instructions
setTimeout(() => {
    showNotification('💡 Enter your card details below to complete your payment securely!', 'success');
}, 1000);