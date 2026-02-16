// ========================================
// Mobile Menu Toggle
// ========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// ========================================
// Smooth Scrolling for Navigation Links
// ========================================
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Contact Form Handling
// ========================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        course: document.getElementById('course').value,
        message: document.getElementById('message').value.trim(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.course || !formData.message) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Validate phone (basic check for 10 digits)
    const phonePattern = /^[0-9]{10}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        showMessage('Please enter a valid 10-digit phone number.', 'error');
        return;
    }
    
    // Save to localStorage
    saveLeadData(formData);
    
    // Show success message
    showMessage('Thank you for your interest! We will contact you soon.', 'success');
    
    // Reset form
    contactForm.reset();
    
    // Hide message after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
});

// ========================================
// Save Lead Data to LocalStorage
// ========================================
function saveLeadData(data) {
    // Get existing leads from localStorage
    let leads = JSON.parse(localStorage.getItem('sriMMILeads')) || [];
    
    // Add new lead with unique ID
    data.id = Date.now().toString();
    leads.push(data);
    
    // Save back to localStorage
    localStorage.setItem('sriMMILeads', JSON.stringify(leads));
}

// ========================================
// Show Form Message
// ========================================
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
}

// ========================================
// Scroll Animation for Elements
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .work-card, .testimonial-card, .about-content');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ========================================
// Active Navigation Link on Scroll
// ========================================
window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');
    const navHeight = document.querySelector('.navbar').offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ========================================
// Back to Top Button (Optional)
// ========================================
let backToTopBtn = document.createElement('button');
backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopBtn.className = 'back-to-top';
backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--maroon), var(--dark-maroon));
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 999;
    transition: all 0.3s ease;
`;

document.body.appendChild(backToTopBtn);

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

backToTopBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px)';
    this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
});

backToTopBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
});

// ========================================
// Generate Sample Leads for Testing
// ========================================
function generateSampleLeads() {
    const existingLeads = JSON.parse(localStorage.getItem('sriMMILeads')) || [];
    
    // Only generate if no leads exist
    if (existingLeads.length > 0) {
        console.log(`Already have ${existingLeads.length} leads in storage`);
        return;
    }

    const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Raj', 'Anjali', 'Vikram', 'Neha', 'Karan', 'Pooja', 
                        'Arjun', 'Divya', 'Rohan', 'Kavya', 'Aditya', 'Riya', 'Siddharth', 'Tanvi', 'Varun', 'Megha'];
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Desai', 'Shah', 'Mehta', 'Joshi', 'Reddy',
                       'Nair', 'Pillai', 'Rao', 'Verma', 'Agarwal', 'Malhotra', 'Chopra', 'Kapoor', 'Shetty', 'Iyer'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Pune', 'Surat', 'Vadodara', 'Rajkot', 'Chennai', 'Hyderabad'];
    const courses = ['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'DNB', 'Nursing', 'Pharmacy', 'Engineering', 'Biotech', 'B.VOC'];
    const messages = [
        'I am interested in studying medicine abroad. Please provide more information.',
        'Looking for admission guidance for the upcoming session.',
        'Can you help with visa documentation and university selection?',
        'I want to know about FMGE coaching and preparation.',
        'Please share details about scholarship opportunities.',
        'Interested in engineering programs in European universities.',
        'Need assistance with IELTS preparation and admission process.',
        'Looking for nursing courses in top universities.',
        'Want information about pharmacy programs and career prospects.',
        'Can you guide me regarding MD/MS admission procedures?',
        'I am planning to study MBBS. What are the best options?',
        'Please call me to discuss admission possibilities.',
        'Looking for affordable medical universities with good rankings.',
        'Need help with educational loan and financial planning.',
        'Interested in biotech programs. Please share university list.',
        'What are the eligibility criteria for DNB programs?',
        'I want to pursue BDS abroad. Please guide.',
        'Looking for direct admission without entrance exam.',
        'Can you help with documentation for student visa?',
        'Interested in attending your seminar on study abroad options.'
    ];

    const sampleLeads = [];
    const today = new Date();

    for (let i = 0; i < 40; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const course = courses[Math.floor(Math.random() * courses.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Generate dates spread over the last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const leadDate = new Date(today);
        leadDate.setDate(today.getDate() - daysAgo);
        
        const lead = {
            id: Date.now().toString() + i,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}@email.com`,
            phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            course: course,
            message: message,
            timestamp: leadDate.toISOString(),
            date: leadDate.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        sampleLeads.push(lead);
    }

    // Save to localStorage
    localStorage.setItem('sriMMILeads', JSON.stringify(sampleLeads));
    console.log('%c✓ Generated 40 sample leads for testing!', 'color: #28a745; font-size: 14px; font-weight: bold;');
    console.log('%cAccess admin panel to view: admin.html', 'color: #0d6efd; font-size: 12px;');
}

// Auto-generate sample leads on first load
if (!sessionStorage.getItem('sampleLeadsGenerated')) {
    generateSampleLeads();
    sessionStorage.setItem('sampleLeadsGenerated', 'true');
}

// ========================================
// Console Welcome Message
// ========================================
console.log('%cSRI MMI EDU TECH INDIA', 'color: #0d6efd; font-size: 24px; font-weight: bold;');
console.log('%cSupporting Education World Wide', 'color: #dc143c; font-size: 16px; font-style: italic;');
console.log('%cWebsite developed with ❤️', 'color: #6c757d; font-size: 12px;');
console.log('%c────────────────────────────────────', 'color: #dee2e6;');
console.log('%cTo clear sample leads, run: localStorage.removeItem("sriMMILeads")', 'color: #6c757d; font-size: 11px;');
