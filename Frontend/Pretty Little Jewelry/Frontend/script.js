// script.js
document.addEventListener('DOMContentLoaded', function() {
  // Cart state
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // DOM elements
  const cartIcon = document.querySelector('.cart-icon-container');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartSidebar = document.getElementById('cart-sidebar');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.querySelector('.total-price');
  const cartCountElement = document.querySelector('.cart-count');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const emptyCartMessage = document.querySelector('.empty-cart-message');
  
  // Initialize the cart display
  updateCartDisplay();
  
  // Cart toggle functionality
  cartIcon.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);
  closeCartBtn.addEventListener('click', toggleCart);
  
  // Add to cart functionality
  addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });
  
  // Checkout button
  checkoutBtn.addEventListener('click', proceedToCheckout);
  
  // Functions
  function toggleCart() {
    cartOverlay.classList.toggle('active');
    cartSidebar.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  }
  
  function addToCart(e) {
    const button = e.target;
    const productElement = button.closest('.product');
    
    const product = {
      id: productElement.dataset.id,
      name: productElement.dataset.name,
      price: parseFloat(productElement.dataset.price),
      quantity: 1,
      image: productElement.querySelector('.main-image').src
    };
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push(product);
    }
    
    // Save to localStorage
    saveCart();
    
    // Update cart display
    updateCartDisplay();
    
    // Show cart
    if (!cartSidebar.classList.contains('active')) {
      toggleCart();
    }
    
    // Add visual feedback
    button.textContent = 'Added!';
    button.classList.add('added');
    setTimeout(() => {
      button.textContent = 'Add to Cart';
      button.classList.remove('added');
    }, 1000);
  }
  
  function updateCartDisplay() {
    // Update cart items
    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block';
      cartItemsContainer.innerHTML = '';
    } else {
      emptyCartMessage.style.display = 'none';
      renderCartItems();
    }
    
    // Update total
    updateCartTotal();
    
    // Update cart count
    updateCartCount();
  }
  
  function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.classList.add('cart-item');
      cartItemElement.dataset.id = item.id;
      
      cartItemElement.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-price">Rs.${item.price.toFixed(2)}</p>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn increase">+</button>
          </div>
        </div>
        <button class="remove-item">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
      button.addEventListener('click', updateQuantity);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', removeItem);
    });
  }
  
  function updateQuantity(e) {
    const button = e.target;
    const cartItem = button.closest('.cart-item');
    const id = cartItem.dataset.id;
    const quantityElement = cartItem.querySelector('.quantity');
    let quantity = parseInt(quantityElement.textContent);
    
    if (button.classList.contains('increase')) {
      quantity += 1;
    } else if (button.classList.contains('decrease')) {
      quantity = Math.max(1, quantity - 1);
    }
    
    // Update cart
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity = quantity;
      saveCart();
      updateCartTotal();
    }
    
    quantityElement.textContent = quantity;
  }
  
  function removeItem(e) {
    const button = e.target.closest('.remove-item');
    const cartItem = button.closest('.cart-item');
    const id = cartItem.dataset.id;
    
    // Remove from cart
    cart = cart.filter(item => item.id !== id);
    saveCart();
    
    // Update display
    cartItem.classList.add('removing');
    setTimeout(() => {
      updateCartDisplay();
    }, 300);
  }
  
  function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `Rs.${total.toFixed(2)}`;
    
    // Update payment amount in checkout modal if it exists
    const paymentAmount = document.getElementById('payment-amount');
    if (paymentAmount) {
      paymentAmount.textContent = total.toFixed(2);
    }
  }
  
  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = count;
  }
  
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  function proceedToCheckout() {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add some items before checkout.');
      return;
    }
    
    // Here you would typically redirect to a checkout page
    // For this example, we'll just show an alert
    alert('Proceeding to checkout with ' + cart.length + ' items.');
    
    // In a real implementation, you would:
    // 1. Redirect to a checkout page with cart data
    // 2. Or open a checkout modal
    // 3. Or connect to a payment processor like Stripe
    
    // Example: open checkout modal if it exists
    const checkoutModal = document.querySelector('.checkout-modal');
    if (checkoutModal) {
      checkoutModal.style.display = 'block';
    }
  }
  
  // Initialize Stripe payment form if it exists
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    initStripe();
  }
  
  function initStripe() {
    const stripe = Stripe('your_publishable_key_here'); // Replace with your actual key
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    
    cardElement.mount('#card-element');
    
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: document.getElementById('email').value,
        },
      });
      
      if (error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
      } else {
        // Payment method created successfully
        // Here you would typically send the paymentMethod.id to your server
        // along with the cart details to complete the payment
        
        // For this example, we'll simulate a successful payment
        alert('Payment successful! Order completed.');
        
        // Clear the cart
        cart = [];
        saveCart();
        updateCartDisplay();
        
        // Close modals
        document.querySelector('.checkout-modal').style.display = 'none';
        toggleCart();
      }
    });
  }
  
  // Close checkout modal if close button exists
  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.querySelector('.checkout-modal').style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.querySelector('.checkout-modal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.hero-slider');
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.prev-slide');
  const nextBtn = document.querySelector('.next-slide');
  
  let currentSlide = 0;
  const slideCount = slides.length;
  
  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.dot');
  
  // Next slide function
  function nextSlide() {
    goToSlide(currentSlide === slideCount - 1 ? 0 : currentSlide + 1);
  }
  
  // Previous slide function
  function prevSlide() {
    goToSlide(currentSlide === 0 ? slideCount - 1 : currentSlide - 1);
  }
  
  // Go to specific slide
  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }
  
  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  // Auto slide change (optional)
  let slideInterval = setInterval(nextSlide, 5000);
  
  // Pause on hover
  slider.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  
  slider.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
});

document.querySelectorAll('.product').forEach(product => {
    const mainImage = product.querySelector('.main-image');
    const thumbnails = product.querySelectorAll('.thumbnail-row img');

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        // Update the main image source
        mainImage.src = thumbnail.src;

        // Remove 'active' class from all thumbnails in this product
        thumbnails.forEach(thumb => thumb.classList.remove('active'));

        // Add 'active' class to clicked thumbnail
        thumbnail.classList.add('active');
      });
    });
  });
  

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Reset form status
      formStatus.style.display = 'none';
      formStatus.className = 'form-status';
      
      // Reset error messages
      document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
      });
      
      // Validate form
      let isValid = true;
      
      // Validate name
      const nameInput = document.getElementById('name');
      if (!nameInput.value.trim()) {
        document.getElementById('nameError').textContent = 'Please enter your name';
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
      }
      
      // Validate email
      const emailInput = document.getElementById('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        document.getElementById('emailError').textContent = 'Please enter your email';
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
      } else if (!emailRegex.test(emailInput.value)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email';
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
      }
      
      // Validate message
      const messageInput = document.getElementById('message');
      if (!messageInput.value.trim()) {
        document.getElementById('messageError').textContent = 'Please enter your message';
        document.getElementById('messageError').style.display = 'block';
        isValid = false;
      }
      
      if (isValid) {
        // Simulate form submission (replace with actual AJAX call)
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        
        // Simulate API call
        setTimeout(() => {
          // Show success message
          formStatus.textContent = 'Your message has been sent successfully!';
          formStatus.className = 'form-status success';
          formStatus.style.display = 'block';
          
          // Reset form
          contactForm.reset();
          
          // Reset button
          submitBtn.disabled = false;
          btnText.textContent = originalText;
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            formStatus.style.display = 'none';
          }, 5000);
        }, 1500);
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', function() {
  // Mobile accordion functionality
  const footerHeadings = document.querySelectorAll('.footer-heading');
  
  if (window.innerWidth <= 768) {
    footerHeadings.forEach(heading => {
      heading.addEventListener('click', () => {
        const section = heading.parentElement;
        section.classList.toggle('active');
        
        // Close other sections when one is opened
        if (section.classList.contains('active')) {
          document.querySelectorAll('.footer-section').forEach(sec => {
            if (sec !== section && sec.classList.contains('active')) {
              sec.classList.remove('active');
            }
          });
        }
      });
    });
  }

  // Newsletter form submission
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const messageDiv = this.querySelector('.form-message');
      
      // Simple validation
      if (!emailInput.value || !emailInput.value.includes('@')) {
        messageDiv.textContent = 'Please enter a valid email address';
        messageDiv.classList.add('error');
        messageDiv.classList.remove('success');
        return;
      }
      
      // Simulate form submission
      messageDiv.textContent = 'Thank you for subscribing!';
      messageDiv.classList.add('success');
      messageDiv.classList.remove('error');
      emailInput.value = '';
      
      // Reset message after 5 seconds
      setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.classList.remove('success');
      }, 5000);
    });
  }

  // Back to top button
  const backToTopButton = document.querySelector('.back-to-top');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
  
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Payment method tooltips (optional)
  const paymentIcons = document.querySelectorAll('.payment-icon');
  paymentIcons.forEach(icon => {
    const paymentType = icon.querySelector('i').className.split('-')[2];
    icon.setAttribute('title', paymentType.charAt(0).toUpperCase() + paymentType.slice(1));
  });
});