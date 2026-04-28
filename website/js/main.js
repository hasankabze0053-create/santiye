/* JAVASCRIPT LOGIC - CEPTEŞEF */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. MOBILE MENU TOGGLE
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '80px';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.background = 'rgba(11, 11, 11, 0.95)';
                navMenu.style.padding = '20px';
                navMenu.style.borderBottom = '1px solid var(--glass-border)';
            } else {
                icon.className = 'fa-solid fa-bars';
                navMenu.style.display = '';
            }
        });
    }

    // 2. SMOOTH SCROLLING FOR NAV LINKS
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav, .hero-btns a, .trust-section a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
                        navMenu.style.display = '';
                    }
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for fixed header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 3. ACTIVE LINK HIGHLIGHTING ON SCROLL
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // 4. OLD FORM HANDLER REMOVED (Replaced by Google Sheets handler)
    // 4. HIGHLIGHT HERO ON "CEPTEŞEF NEDİR?" CLICK
    const aboutLink = document.querySelector('a[href="#about"]');
    const heroLeft = document.querySelector('.hero-left');
    
    if (aboutLink && heroLeft) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            heroLeft.classList.add('highlight-hero');
            
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            setTimeout(() => {
                heroLeft.classList.remove('highlight-hero');
            }, 2000);
        });
    }
    // 5. FORM SUBMISSION (GOOGLE SHEETS & EMAIL)
    const preRegisterForm = document.getElementById('preRegisterForm');
    // ÖNEMLİ: Aşağıdaki URL'yi kendi Google Apps Script Web App URL'niz ile değiştirin.
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6-h7m4Di3oKn2QFbJgYhm6jCQbGjImGL2j4y9SEjKsyCGdvcqUcVo6YvYB4shxnp2/exec'; 
    
    if (preRegisterForm) {
        preRegisterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Premium Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> İşleniyor...';
            
            const formData = new FormData(this);
            const userTypeSelect = document.getElementById('userType');
            const userTypeText = userTypeSelect.options[userTypeSelect.selectedIndex].text;
            
            // Map data
            const data = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                userType: userTypeText,
                serviceArea: formData.get('otherType') || userTypeText
            };
            
            // Eğer URL henüz tanımlanmadıysa (Test amaçlı mock başarı)
            if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
                setTimeout(() => {
                    showPremiumAlert('Ön kaydınız başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.', 'success');
                    preRegisterForm.reset();
                    if (typeof toggleOtherInput === 'function') toggleOtherInput();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }, 1000);
                return;
            }
            
            // Send data via simple request (to avoid CORS preflight)
            const postData = new URLSearchParams();
            for (const key in data) {
                postData.append(key, data[key]);
            }
            
            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Apps Script requires no-cors for simple fetch
                body: postData
            })
            .then(() => {
                showPremiumAlert('Ön kaydınız başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.', 'success');
                preRegisterForm.reset();
                if (typeof toggleOtherInput === 'function') toggleOtherInput();
            })
            .catch(error => {
                console.error('Error:', error);
                showPremiumAlert('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }

    // PREMIUM ALERT FUNCTION
    function showPremiumAlert(message, type) {
        const alertBox = document.createElement('div');
        alertBox.className = `premium-alert ${type}`;
        alertBox.innerHTML = `
            <div class="alert-content">
                <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(alertBox);
        
        setTimeout(() => alertBox.classList.add('show'), 10);
        
        setTimeout(() => {
            alertBox.classList.remove('show');
            setTimeout(() => alertBox.remove(), 300);
        }, 5000);
    }
});

function selectUserType(type) {
    const select = document.getElementById('userType');
    if (select) {
        select.value = type;
        toggleOtherInput();
    }
}

function toggleOtherInput() {
    const select = document.getElementById('userType');
    const otherGroup = document.getElementById('otherTypeGroup');
    const otherInput = document.getElementById('otherType');
    
    if (select && otherGroup) {
        if (select.value === 'diger') {
            otherGroup.classList.remove('hidden');
            if (otherInput) otherInput.required = true;
        } else {
            otherGroup.classList.add('hidden');
            if (otherInput) {
                otherInput.required = false;
                otherInput.value = '';
            }
        }
    }
}

