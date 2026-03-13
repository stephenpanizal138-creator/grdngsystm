// Predefined subjects
const predefinedSubjects = [
    'ISA 302',
    'SA301', 
    'SIA 302',
    'IT ELECTI 3',
    'IT ELECT 4',
    'CAP301'
];

let subjects = [...predefinedSubjects];
let subjectInputs = [];
let savedRecords = JSON.parse(localStorage.getItem('savedRecords')) || [];
let currentRecordName = '';

// DOM elements
const elements = {
    studentName: document.getElementById('studentName'),
    course: document.getElementById('course'),
    section: document.getElementById('section'),
    subjectsList: document.getElementById('subjectsList'),
    addSubjectBtn: document.getElementById('addSubjectBtn'),
    calculateBtn: document.getElementById('calculateBtn'),
    saveBtn: document.getElementById('saveBtn'),
    viewRecordsBtn: document.getElementById('viewRecordsBtn'),
    darkModeBtn: document.getElementById('darkModeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    preview: document.getElementById('preview'),
    liveAverage: document.getElementById('liveAverage'),
    results: document.getElementById('results'),
    averageDisplay: document.getElementById('averageDisplay'),
    letterGrade: document.getElementById('letterGrade'),
    status: document.getElementById('status'),
    gradesDisplay: document.getElementById('gradesDisplay'),
    savedRecords: document.getElementById('savedRecords'),
    recordsList: document.getElementById('recordsList'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalBody: document.getElementById('modalBody')
};

// Letter grade mapping
const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
};

// Initialize app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    renderSubjects();
    loadStudentInfo();
    loadDarkMode();
    renderSavedRecords();
    
    // Event listeners
    elements.addSubjectBtn.onclick = addCustomSubject;
    elements.calculateBtn.onclick = calculateAverage;
    elements.saveBtn.onclick = saveRecord;
    elements.viewRecordsBtn.onclick = toggleRecordsView;
    elements.darkModeBtn.onclick = toggleDarkMode;
    elements.clearBtn.onclick = clearAll;
    
    // Realtime preview
    document.addEventListener('input', debounce(updateLiveAverage, 300));
    
    // Modal close
    document.querySelector('.close-modal').onclick = closeModal;
    elements.modalOverlay.onclick = closeModal;
}

// Update TODO progress
function updateTODO() {
    // Simulated - in real would edit file
}

// Render subjects
function renderSubjects() {
    elements.subjectsList.innerHTML = '';
    subjectInputs = [];
    
    subjects.forEach((subject, index) => {
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject-item fade-in';
        subjectDiv.id = `subject-${index}`;
        
        subjectDiv.innerHTML = `
            <label>${subject}:</label>
            <input type="number" id="grade-${index}" min="0" max="100" step="0.1" placeholder="Grade" value="">
            ${index >= predefinedSubjects.length ? 
                `<button class="delete-btn" onclick="deleteSubject(${index})">Delete</button>` : 
                ''
            }
        `;
        
        elements.subjectsList.appendChild(subjectDiv);
        subjectInputs.push(document.getElementById(`grade-${index}`));
    });
    updateTODO(); // Mark render improved
}

// Add custom subject
function addCustomSubject() {
    const name = prompt('Enter new subject name:')?.trim();
    if (name) {
        subjects.push(name);
        renderSubjects();
    }
}

// Delete subject
function deleteSubject(index) {
    if (index >= predefinedSubjects.length) {
        subjects.splice(index, 1);
        renderSubjects();
    }
}

// Update live average
function updateLiveAverage() {
    const grades = subjectInputs.map(input => parseFloat(input.value) || 0).filter(g => g > 0);
    if (grades.length > 0) {
        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
        elements.liveAverage.textContent = avg.toFixed(1) + '%';
        elements.liveAverage.className = getLetterGrade(avg);
    } else {
        elements.liveAverage.textContent = '--';
    }
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Calculate final average
function calculateAverage() {
    const grades = subjectInputs.map(input => parseFloat(input.value) || 0);
    const validGrades = grades.filter(g => g >= 0 && g <= 100);
    
    if (validGrades.length === 0) {
        showModal('Please enter valid grades (0-100).');
        return;
    }
    
    const average = validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length;
    const letter = getLetterGrade(average);
    const isPass = average >= 60;
    
    elements.averageDisplay.innerHTML = `<strong>Average: ${average.toFixed(2)}%</strong>`;
    elements.letterGrade.textContent = letter;
    elements.letterGrade.className = `grade-${letter.toLowerCase()}`;
    elements.status.innerHTML = `<strong>${isPass ? '✅ PASS' : '❌ FAIL'}</strong>`;
    elements.status.className = isPass ? 'pass' : 'fail';
    
    // Grades list
    elements.gradesDisplay.innerHTML = '<h3>Individual Grades:</h3>';
    subjects.forEach((subject, i) => {
        const grade = grades[i];
        if (grade > 0) {
            const lg = getLetterGrade(grade);
            elements.gradesDisplay.innerHTML += `<p><strong>${subject}:</strong> ${grade}% (${lg})</p>`;
        }
    });
    
    elements.results.style.display = 'block';
    elements.results.scrollIntoView({ behavior: 'smooth' });
}

// Save record
function saveRecord() {
    if (!elements.studentName.value.trim()) {
        showModal('Please enter student name.');
        return;
    }
    
    const recordName = `${elements.studentName.value} - ${new Date().toLocaleString()}`;
    const record = {
        name: recordName,
        studentName: elements.studentName.value,
        course: elements.course.value,
        section: elements.section.value,
        subjects,
        grades: subjectInputs.map(inp => parseFloat(inp.value) || 0),
        average: parseFloat(elements.liveAverage.textContent) || 0,
        timestamp: new Date().toISOString()
    };
    
    savedRecords.unshift(record);
    localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
    renderSavedRecords();
    showModal('Record saved successfully!');
}

// Toggle records view
function toggleRecordsView() {
    const isVisible = elements.savedRecords.style.display !== 'none';
    elements.savedRecords.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderSavedRecords();
}

// Render saved records
function renderSavedRecords() {
    elements.recordsList.innerHTML = savedRecords.length ? 
        savedRecords.map((rec, i) => `
            <div class="record-item">
                <strong>${rec.name}</strong><br>
                <small>${rec.average.toFixed(1)}% - ${new Date(rec.timestamp).toLocaleDateString()}</small><br>
                <button onclick="loadRecord(${i})" style="background:#28a745;margin:5px;">Load</button>
                <button onclick="deleteRecord(${i})" style="background:#dc3545;margin:5px;">Delete</button>
            </div>
        `).join('') : 
        '<p>No saved records.</p>';
}

// Load specific record
function loadRecord(index) {
    const rec = savedRecords[index];
    elements.studentName.value = rec.studentName;
    elements.course.value = rec.course;
    elements.section.value = rec.section;
    subjects = rec.subjects;
    renderSubjects();
    
    setTimeout(() => {
        rec.grades.forEach((g, i) => {
            if (subjectInputs[i]) subjectInputs[i].value = g;
        });
        calculateAverage();
        updateLiveAverage();
    }, 100);
    
    closeModal();
    showModal('Record loaded!');
}

// Delete record
function deleteRecord(index) {
    if (confirm('Delete this record?')) {
        savedRecords.splice(index, 1);
        localStorage.setItem('savedRecords', JSON.stringify(savedRecords));
        renderSavedRecords();
    }
}

// Dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    elements.darkModeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('darkMode', isDark);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-theme');
        elements.darkModeBtn.textContent = '☀️ Light Mode';
    }
}

// Clear all
function clearAll() {
    if (confirm('Clear everything?')) {
        elements.studentName.value = '';
        elements.course.value = '';
        elements.section.value = '';
        subjects = [...predefinedSubjects];
        renderSubjects();
        elements.results.style.display = 'none';
        elements.savedRecords.style.display = 'none';
        currentRecordName = '';
        localStorage.removeItem('savedRecords');
        localStorage.removeItem('studentInfo');
        savedRecords = [];
    }
}

// Student info auto-save
[elements.studentName, elements.course, elements.section].forEach(input => {
    input.addEventListener('blur', saveStudentInfo);
});

function saveStudentInfo() {
    localStorage.setItem('studentInfo', JSON.stringify({
        studentName: elements.studentName.value,
        course: elements.course.value,
        section: elements.section.value
    }));
}

function loadStudentInfo() {
    const info = JSON.parse(localStorage.getItem('studentInfo')) || {};
    elements.studentName.value = info.studentName || '';
    elements.course.value = info.course || '';
    elements.section.value = info.section || '';
}

// Modal functions
function showModal(message) {
    elements.modalBody.innerHTML = `<p>${message}</p>`;
    elements.modalOverlay.style.display = 'flex';
}

function closeModal() {
    elements.modalOverlay.style.display = 'none';
}

// Expose functions globally for onclick
window.deleteSubject = deleteSubject;
window.loadRecord = loadRecord;
window.deleteRecord = deleteRecord;
