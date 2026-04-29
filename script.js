class PasswordStrengthChecker {
    constructor() {
        this.passwordInput = document.getElementById('password');
        this.strengthBar = document.getElementById('strengthBar');
        this.strengthText = document.getElementById('strengthText');
        this.feedbackSection = document.getElementById('feedbackSection');
        this.togglePassword = document.getElementById('togglePassword');
        this.eyeIcon = document.getElementById('eyeIcon');
        this.generateBtn = document.getElementById('generatePassword');
        this.copyBtn = document.getElementById('copyPassword');
        this.crackTimeText = document.getElementById('crackTimeText');
        this.themeToggle = document.getElementById('themeToggle');
        
        // New elements for enhanced features
        this.passwordLength = document.getElementById('passwordLength');
        this.lengthValue = document.getElementById('lengthValue');
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.passwordHistory = document.getElementById('passwordHistory');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        this.commonPasswords = [
            'password', '123456', '123456789', '12345678', '12345', '1234567',
            '1234567890', '1234', 'qwerty', 'abc123', '111111', 'password123',
            'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
            'sunshine', 'princess', 'admin123', 'master', 'hello', 'freedom',
            'whatever', 'qazwsx', 'trustno1', '123qwe', '1q2w3e4r', 'zxcvbnm',
            'iloveyou', 'adobe123', '123123', 'starwars', '654321', 'football',
            'baseball', 'shadow', 'superman', 'azerty', 'qwertyuiop', 'asdfghjkl'
        ];
        
        this.init();
    }
    
    init() {
        this.passwordInput.addEventListener('input', () => this.checkPassword());
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        this.generateBtn.addEventListener('click', () => this.generateStrongPassword());
        this.copyBtn.addEventListener('click', () => this.copyPassword());
        this.themeToggle.addEventListener('change', () => this.toggleTheme());
        
        // New event listeners
        this.passwordLength.addEventListener('input', () => this.updateLengthDisplay());
        this.clearHistoryBtn.addEventListener('click', () => this.clearPasswordHistory());
        
        // Initialize theme and history
        this.loadTheme();
        this.loadPasswordHistory();
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.themeToggle.checked = true;
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.themeToggle.checked = false;
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        this.eyeIcon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    
    checkPassword() {
        const password = this.passwordInput.value;
        
        if (password.length === 0) {
            this.resetUI();
            return;
        }
        
        this.feedbackSection.classList.remove('hidden');
        
        const analysis = this.analyzePassword(password);
        this.updateStrengthMeter(analysis.score);
        this.updateCheckboxes(analysis);
        this.updateSuggestions(analysis);
        this.updateCrackTime(analysis.entropy);
        this.updateCopyButton();
    }
    
    analyzePassword(password) {
        let score = 0;
        let feedback = [];
        let entropy = this.calculateEntropy(password);
        
        // Length check
        const lengthScore = Math.min(password.length / 12, 1) * 25;
        score += lengthScore;
        
        // Character variety checks
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^a-zA-Z0-9]/.test(password)) score += 15;
        
        // Common password penalty
        if (this.isCommonPassword(password)) {
            score = Math.max(score - 30, 0);
            feedback.push('This is a commonly used password');
        }
        
        // Pattern checks
        if (this.hasRepeatingChars(password)) {
            score = Math.max(score - 10, 0);
            feedback.push('Contains repeating characters');
        }
        
        if (this.hasSequentialChars(password)) {
            score = Math.max(score - 10, 0);
            feedback.push('Contains sequential characters');
        }
        
        if (this.hasKeyboardPatterns(password)) {
            score = Math.max(score - 5, 0);
            feedback.push('Contains keyboard patterns');
        }
        
        // Entropy bonus
        if (entropy > 50) score += 10;
        else if (entropy > 30) score += 5;
        
        return {
            score: Math.min(score, 100),
            length: password.length,
            hasLowercase: /[a-z]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            hasNumbers: /[0-9]/.test(password),
            hasSpecial: /[^a-zA-Z0-9]/.test(password),
            isCommon: this.isCommonPassword(password),
            hasRepeating: this.hasRepeatingChars(password),
            hasSequential: this.hasSequentialChars(password),
            hasKeyboardPattern: this.hasKeyboardPatterns(password),
            entropy: entropy,
            feedback: feedback
        };
    }
    
    calculateEntropy(password) {
        const charset = this.getCharsetSize(password);
        if (charset === 0) return 0;
        return password.length * Math.log2(charset);
    }
    
    getCharsetSize(password) {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Approximate
        return size;
    }
    
    isCommonPassword(password) {
        return this.commonPasswords.includes(password.toLowerCase());
    }
    
    hasRepeatingChars(password) {
        for (let i = 0; i < password.length - 2; i++) {
            if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
                return true;
            }
        }
        return false;
    }
    
    hasSequentialChars(password) {
        const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
        for (const seq of sequences) {
            for (let i = 0; i < seq.length - 2; i++) {
                const substring = seq.substring(i, i + 3);
                if (password.includes(substring)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    hasKeyboardPatterns(password) {
        const patterns = ['qwerty', 'asdf', 'zxcv', 'qaz', 'wsx', 'edc', 'rfv', 'tgb', 'yhn', 'ujm', 'ik', 'ol'];
        const lowerPassword = password.toLowerCase();
        return patterns.some(pattern => lowerPassword.includes(pattern));
    }
    
    updateStrengthMeter(score) {
        this.strengthBar.style.width = score + '%';
        
        let strengthLevel, colorClass, textColor;
        
        if (score < 20) {
            strengthLevel = 'Very Weak';
            colorClass = 'bg-red-500';
            textColor = 'text-red-600';
        } else if (score < 40) {
            strengthLevel = 'Weak';
            colorClass = 'bg-orange-500';
            textColor = 'text-orange-600';
        } else if (score < 60) {
            strengthLevel = 'Fair';
            colorClass = 'bg-yellow-500';
            textColor = 'text-yellow-600';
        } else if (score < 80) {
            strengthLevel = 'Good';
            colorClass = 'bg-blue-500';
            textColor = 'text-blue-600';
        } else {
            strengthLevel = 'Strong';
            colorClass = 'bg-green-500';
            textColor = 'text-green-600';
        }
        
        this.strengthBar.className = `strength-bar h-full rounded-full ${colorClass}`;
        this.strengthText.className = `text-sm font-semibold ${textColor}`;
        this.strengthText.textContent = strengthLevel;
    }
    
    updateCheckboxes(analysis) {
        const checks = [
            { id: 'lengthCheck', condition: analysis.length >= 8, label: 'Length' },
            { id: 'uppercaseCheck', condition: analysis.hasUppercase, label: 'Uppercase' },
            { id: 'lowercaseCheck', condition: analysis.hasLowercase, label: 'Lowercase' },
            { id: 'numberCheck', condition: analysis.hasNumbers, label: 'Numbers' },
            { id: 'specialCheck', condition: analysis.hasSpecial, label: 'Special' },
            { id: 'commonCheck', condition: !analysis.isCommon, label: 'Common' },
            { id: 'patternCheck', condition: !analysis.hasRepeating && !analysis.hasSequential && !analysis.hasKeyboardPattern, label: 'Patterns' },
            { id: 'entropyCheck', condition: analysis.entropy > 40, label: 'Entropy' }
        ];
        
        checks.forEach(check => {
            const element = document.getElementById(check.id);
            const icon = element.querySelector('i');
            const text = element.querySelector('p');
            
            if (check.condition) {
                element.className = 'text-center p-3 bg-green-50 rounded-lg border border-green-200';
                icon.className = 'fas fa-check text-green-500 mb-1';
                text.className = 'text-xs text-green-700 font-medium';
            } else {
                element.className = 'text-center p-3 bg-red-50 rounded-lg border border-red-200';
                icon.className = 'fas fa-times text-red-500 mb-1';
                text.className = 'text-xs text-red-700 font-medium';
            }
        });
    }
    
    updateSuggestions(analysis) {
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = '';
        
        const suggestions = [];
        
        if (analysis.length < 12) {
            suggestions.push('Use at least 12 characters for better security');
        }
        
        if (!analysis.hasUppercase) {
            suggestions.push('Add uppercase letters (A-Z)');
        }
        
        if (!analysis.hasLowercase) {
            suggestions.push('Add lowercase letters (a-z)');
        }
        
        if (!analysis.hasNumbers) {
            suggestions.push('Include numbers (0-9)');
        }
        
        if (!analysis.hasSpecial) {
            suggestions.push('Add special characters (!@#$%^&*)');
        }
        
        if (analysis.isCommon) {
            suggestions.push('Avoid common passwords - make yours unique');
        }
        
        if (analysis.hasRepeating) {
            suggestions.push('Avoid repeating characters (aaa, 111)');
        }
        
        if (analysis.hasSequential) {
            suggestions.push('Avoid sequential characters (123, abc)');
        }
        
        if (analysis.hasKeyboardPattern) {
            suggestions.push('Avoid keyboard patterns (qwerty, asdf)');
        }
        
        if (analysis.entropy < 40) {
            suggestions.push('Increase password complexity for higher entropy');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('Great password! It meets all security criteria.');
        }
        
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.className = 'flex items-start';
            li.innerHTML = `
                <i class="fas fa-lightbulb text-yellow-500 mr-2 mt-0.5"></i>
                <span class="text-sm text-gray-700">${suggestion}</span>
            `;
            suggestionsList.appendChild(li);
        });
    }
    
    updateCrackTime(entropy) {
        let crackTime;
        
        if (entropy < 20) {
            crackTime = 'Instantly';
        } else if (entropy < 30) {
            crackTime = 'Minutes to hours';
        } else if (entropy < 40) {
            crackTime = 'Days to weeks';
        } else if (entropy < 50) {
            crackTime = 'Months to years';
        } else if (entropy < 60) {
            crackTime = 'Decades';
        } else if (entropy < 70) {
            crackTime = 'Centuries';
        } else {
            crackTime = 'Millennia or more';
        }
        
        this.crackTimeText.textContent = crackTime;
    }
    
    updateCopyButton() {
        this.copyBtn.disabled = this.passwordInput.value.length === 0;
    }
    
    generateStrongPassword() {
        const length = parseInt(this.passwordLength.value);
        let charset = '';
        
        if (this.includeUppercase.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (this.includeLowercase.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (this.includeNumbers.checked) charset += '0123456789';
        if (this.includeSymbols.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (charset === '') {
            alert('Please select at least one character type');
            return;
        }
        
        let password = '';
        
        // Ensure at least one character from each selected type
        if (this.includeUppercase.checked) {
            password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        }
        if (this.includeLowercase.checked) {
            password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        }
        if (this.includeNumbers.checked) {
            password += '0123456789'[Math.floor(Math.random() * 10)];
        }
        if (this.includeSymbols.checked) {
            const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            password += symbols[Math.floor(Math.random() * symbols.length)];
        }
        
        // Fill the rest
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        this.passwordInput.value = password;
        this.checkPassword();
        this.addToPasswordHistory(password);
        
        // Add a visual feedback
        this.passwordInput.classList.add('ring-2', 'ring-green-500');
        setTimeout(() => {
            this.passwordInput.classList.remove('ring-2', 'ring-green-500');
        }, 1000);
    }
    
    updateLengthDisplay() {
        this.lengthValue.textContent = this.passwordLength.value;
    }
    
    loadPasswordHistory() {
        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        this.displayPasswordHistory(history);
    }
    
    addToPasswordHistory(password) {
        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        
        // Add timestamp and avoid duplicates
        const entry = {
            password: password,
            timestamp: new Date().toISOString()
        };
        
        // Remove if password already exists
        const filteredHistory = history.filter(item => item.password !== password);
        
        // Add to beginning and keep only last 10
        const newHistory = [entry, ...filteredHistory].slice(0, 10);
        
        localStorage.setItem('passwordHistory', JSON.stringify(newHistory));
        this.displayPasswordHistory(newHistory);
    }
    
    displayPasswordHistory(history) {
        if (history.length === 0) {
            this.passwordHistory.innerHTML = '<p class="text-xs text-secondary italic">No passwords generated yet</p>';
            return;
        }
        
        this.passwordHistory.innerHTML = history.map(entry => `
            <div class="flex items-center justify-between p-2 bg-primary bg-opacity-5 rounded hover:bg-opacity-10 transition-colors group">
                <div class="flex-1">
                    <code class="text-xs font-mono text-primary">${this.maskPassword(entry.password)}</code>
                    <div class="text-xs text-tertiary">${this.formatTimestamp(entry.timestamp)}</div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="navigator.clipboard.writeText('${entry.password}')" class="p-1 hover:bg-primary hover:bg-opacity-10 rounded" title="Copy">
                        <i class="fas fa-copy text-xs text-primary"></i>
                    </button>
                    <button onclick="this.closest('.flex').remove()" class="p-1 hover:bg-red-500 hover:bg-opacity-10 rounded" title="Remove">
                        <i class="fas fa-times text-xs text-red-500"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    maskPassword(password) {
        if (password.length <= 4) return password;
        return password.substring(0, 2) + '•'.repeat(password.length - 4) + password.substring(password.length - 2);
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return date.toLocaleDateString();
    }
    
    clearPasswordHistory() {
        if (confirm('Are you sure you want to clear all password history?')) {
            localStorage.removeItem('passwordHistory');
            this.loadPasswordHistory();
        }
    }
    
    copyPassword() {
        const password = this.passwordInput.value;
        if (!password) return;
        
        navigator.clipboard.writeText(password).then(() => {
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            this.copyBtn.classList.add('bg-green-100', 'text-green-700');
            
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
                this.copyBtn.classList.remove('bg-green-100', 'text-green-700');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy password:', err);
        });
    }
    
    resetUI() {
        this.strengthBar.style.width = '0%';
        this.strengthText.textContent = 'Not Rated';
        this.strengthText.className = 'text-sm font-semibold';
        this.feedbackSection.classList.add('hidden');
        this.copyBtn.disabled = true;
    }
}

// Initialize the password strength checker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PasswordStrengthChecker();
});
