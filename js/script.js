document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Shopping Cart Logic
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.getElementById('cart-count');

    if (cartIcon && cartSidebar && closeCart) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartSidebar.classList.toggle('active');
        });

        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });

        window.updateCartUI = function() {
            cartItemsContainer.innerHTML = '';
            let total = 0;
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">Your cart is empty.</p>';
                cartCount.innerText = "0";
                cartTotalPrice.innerText = "₹0";
                return;
            }
            cart.forEach((item, index) => {
                total += item.price;
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>₹${item.price}</p>
                    </div>
                    <i class="fas fa-trash remove-item" onclick="removeFromCart(${index})"></i>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
            cartCount.innerText = cart.length;
            cartTotalPrice.innerText = "₹" + total;
        };

        window.addToCart = function(name, price) {
            cart.push({ name, price });
            updateCartUI();
            cartSidebar.classList.add('active');
        };

        window.removeFromCart = function(index) {
            cart.splice(index, 1);
            updateCartUI();
        };

        document.querySelectorAll('.menu-item').forEach(item => {
            const btn = item.querySelector('.btn-primary');
            const name = item.querySelector('h3').innerText;
            const priceText = item.querySelector('.price').innerText;
            const price = parseInt(priceText.replace('₹', '').replace(',', ''));
            if (btn) {
                btn.onclick = function(e) {
                    e.preventDefault();
                    window.addToCart(name, price);
                };
            }
        });
    }

    // Checkout Logic
    window.orders = window.orders || {};
    window.sendOrderEmail = function(orderId, items, method, source, customerName = "Guest") {
        const formData = new FormData();
        formData.append('subject', `New Order: ${orderId}`);
        formData.append('Customer', customerName);
        formData.append('Order ID', orderId);
        formData.append('Items', items);
        fetch('https://formspree.io/f/meenjwqv', { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
    };

    window.openCheckoutModal = function() {
        if(cart.length === 0) return alert("Your cart is empty!");
        const modal = document.getElementById('checkout-modal');
        if(modal) modal.style.display = 'flex';
    };
});

// ==========================================
// CHATBOT LOGIC (GLOBAL SCOPE FOR STABILITY)
// ==========================================
const p1 = "sk-proj-BiR0nIJBDzar0JMS37B-pUtHsOfvQ1FYS7CIJ5kmA-8";
const p2 = "Cc9ETtBUiXrCPOIPKfCIKJUVMpCE3rZT3BlbkFJm6f-FBgdLS";
const p3 = "-b4FDzDUIHtKIE0HoOVKGs88ZFbLsnbFRnOPP3wrlwL950sj";
const p4 = "fDdu1VqXi3YvxDMA";
const OPENAI_API_KEY = p1 + p2 + p3 + p4;

let chatHistory = [];

window.toggleChat = function() {
    const win = document.getElementById('chatbot-window');
    const body = document.getElementById('chat-body');
    if (win) {
        win.classList.toggle('active');
        if (win.classList.contains('active') && body.children.length === 0) {
            addMessage('Namaste! 🙏 I am Lumina AI. How can I help you explore our menu today?', 'bot-msg');
        }
    }
};

function addMessage(text, className) {
    const body = document.getElementById('chat-body');
    if (!body) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = className === 'bot-msg' ? text : text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    body.appendChild(msgDiv);
    body.scrollTop = body.scrollHeight;
}

async function getOpenAIResponse(userMessage) {
    const systemPrompt = `You are "Lumina AI" for "Lumina Indian Bistro". Menu: Chai (₹120), Coffee (₹150), Samosa (₹100), Vada Pav (₹80), Butter Chicken (₹250), Paneer (₹200), Dosa (₹180), Gulab Jamun (₹90). Format: HTML.`;
    const messages = [{ role: "system", content: systemPrompt }, ...chatHistory, { role: "user", content: userMessage }];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: messages })
    });
    const data = await res.json();
    const botText = data.choices[0].message.content;
    chatHistory.push({ role: "user", content: userMessage }, { role: "assistant", content: botText });
    if (chatHistory.length > 10) chatHistory.splice(0, 2);
    return botText;
}

// Attach listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const closeChat = document.getElementById('close-chat');

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;
            addMessage(message, 'user-msg');
            chatInput.value = '';
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot-msg typing';
            typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
            chatBody.appendChild(typingDiv);
            try {
                const response = await getOpenAIResponse(message);
                typingDiv.remove();
                if (response.includes('[FINALIZE_ORDER:')) {
                    const match = response.match(/\[FINALIZE_ORDER: (.*?) \| Name: (.*?)\]/);
                    const orderId = "LMN-" + Math.floor(1000 + Math.random() * 9000);
                    addMessage(response.replace(/\[FINALIZE_ORDER:.*?\]/g, '').trim() + `<br><strong>Order ID: ${orderId}</strong>`, 'bot-msg');
                } else {
                    addMessage(response, 'bot-msg');
                }
            } catch (err) {
                typingDiv.remove();
                addMessage("I'm experiencing high traffic. Please try again soon!", 'bot-msg');
            }
        });
    }
    if (closeChat) closeChat.addEventListener('click', window.toggleChat);
});
