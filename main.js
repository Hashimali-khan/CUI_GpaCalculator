document.addEventListener('DOMContentLoaded', () => {
        // --- Constants and State ---
        const GPA_SCALE = [
            { min: 85, grade: "A", gpa: 4.00 }, { min: 80, grade: "A-", gpa: 3.66 },
            { min: 75, grade: "B+", gpa: 3.33 }, { min: 71, grade: "B", gpa: 3.00 },
            { min: 68, grade: "B-", gpa: 2.66 }, { min: 64, grade: "C+", gpa: 2.33 },
            { min: 61, grade: "C", gpa: 2.00 }, { min: 58, grade: "C-", gpa: 1.66 },
            { min: 54, grade: "D+", gpa: 1.30 }, { min: 50, grade: "D", gpa: 1.00 },
            { min: 0, grade: "F", gpa: 0.00 }
        ];
        const WEIGHTAGES = {
            THEORY: { mid: 0.25, quizzes: 0.15, assignments: 0.10, final: 0.50 },
            LAB: { mid: 0.25, assignments: 0.25, final: 0.50 }
        };
        const MIN_ASSESSMENTS = 4;

        let state = {
            hasLab: false,
            finalsAvailable: true
        };

        // --- Element Selectors ---
        const singleCourseBtn = document.getElementById('singleCourseBtn');
        const multiCourseBtn = document.getElementById('multiCourseBtn');
        const singleCourseCalculator = document.getElementById('singleCourseCalculator');
        const multiCourseCalculator = document.getElementById('multiCourseCalculator');
        const hasLabYes = document.getElementById('hasLabYes');
        const hasLabNo = document.getElementById('hasLabNo');
        const theoryWeightageContainer = document.getElementById('theoryWeightageContainer');
        const labAssessments = document.getElementById('labAssessments');
        const finalsAvailableYes = document.getElementById('finalsAvailableYes');
        const finalsAvailableNo = document.getElementById('finalsAvailableNo');
        const gpaEstimationContainer = document.getElementById('gpaEstimationContainer');
        const calculateBtn = document.getElementById('calculateBtn');
        const outputContainer = document.getElementById('outputContainer');
        
        // --- Dynamic UI Component Generation ---
        const createAssessmentInputs = (type, containerId, label) => {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div class="space-y-2">
                    <label class="block text-sm font-medium">${label}</label>
                    <input type="number" id="${type}Conducted" class="form-input w-24 rounded-md text-sm py-1" placeholder="Count" min="0">
                    <div id="${type}Fields" class="space-y-2 mt-2"></div>
                </div>
            `;
            document.getElementById(`${type}Conducted`).addEventListener('input', (e) => {
                generateFields(type, parseInt(e.target.value) || 0);
            });
        };

        const createSingleInput = (type, containerId, label) => {
            document.getElementById(containerId).innerHTML = `
                <div>
                    <label class="block text-sm font-medium">${label}</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" id="${type}Obtained" class="form-input w-full rounded-md" placeholder="Obtained">
                        <span class="text-gray-400">/</span>
                        <input type="number" id="${type}Total" class="form-input w-full rounded-md" placeholder="Total">
                    </div>
                </div>
            `;
        };

        const generateFields = (type, count) => {
            const fieldsContainer = document.getElementById(`${type}Fields`);
            fieldsContainer.innerHTML = '';
            for (let i = 1; i <= count; i++) {
                fieldsContainer.innerHTML += `
                    <div class="flex items-center space-x-2 pl-4">
                        <label class="text-xs w-16">${type.slice(0,1).toUpperCase()}${i}:</label>
                        <input type="number" class="form-input w-full rounded-md text-sm py-1 ${type}Obtained" placeholder="Obtained">
                        <span class="text-gray-400">/</span>
                        <input type="number" class="form-input w-full rounded-md text-sm py-1 ${type}Total" placeholder="Total">
                    </div>
                `;
            }
        };
        
        // --- Initial UI Setup ---
        const setupUI = () => {
            // Theory
            createAssessmentInputs('quizzes', 'quizzesContainer', 'Quizzes');
            createAssessmentInputs('assignments', 'assignmentsContainer', 'Assignments');
            createSingleInput('midterm', 'midtermContainer', 'Mid-term');
            createSingleInput('theoryFinal', 'theoryFinalContainer', 'Theory Final');
            
            // Lab
            createAssessmentInputs('labAssignments', 'labAssignmentsContainer', 'Lab Assignments');
            createSingleInput('labMidterm', 'labMidtermContainer', 'Lab Mid-term');
            createSingleInput('labFinal', 'labFinalContainer', 'Lab Final');

            updateFinalsModeUI();
            updateLabModeUI();
        };

        // --- UI Update Functions ---
        const updateLabModeUI = () => {
            theoryWeightageContainer.classList.toggle('hidden', !state.hasLab);
            labAssessments.classList.toggle('hidden', !state.hasLab);
            hasLabYes.classList.toggle('active', state.hasLab);
            hasLabNo.classList.toggle('active', !state.hasLab);
        };

        const updateFinalsModeUI = () => {
            gpaEstimationContainer.classList.toggle('hidden', state.finalsAvailable);
            document.getElementById('theoryFinalContainer').classList.toggle('hidden', !state.finalsAvailable);
            document.getElementById('labFinalContainer').classList.toggle('hidden', !state.finalsAvailable || !state.hasLab);
            finalsAvailableYes.classList.toggle('active', state.finalsAvailable);
            finalsAvailableNo.classList.toggle('active', !state.finalsAvailable);
        };

        // --- Event Listeners ---
        singleCourseBtn.addEventListener('click', () => {
            singleCourseBtn.classList.add('active');
            multiCourseBtn.classList.remove('active');
            singleCourseCalculator.classList.remove('hidden');
            multiCourseCalculator.classList.add('hidden');
        });

        multiCourseBtn.addEventListener('click', () => {
            multiCourseBtn.classList.add('active');
            singleCourseBtn.classList.remove('active');
            multiCourseCalculator.classList.remove('hidden');
            singleCourseCalculator.classList.add('hidden');
        });

        hasLabYes.addEventListener('click', () => { state.hasLab = true; updateLabModeUI(); updateFinalsModeUI(); });
        hasLabNo.addEventListener('click', () => { state.hasLab = false; updateLabModeUI(); updateFinalsModeUI(); });

        finalsAvailableYes.addEventListener('click', () => { state.finalsAvailable = true; updateFinalsModeUI(); });
        finalsAvailableNo.addEventListener('click', () => { state.finalsAvailable = false; updateFinalsModeUI(); });
        
        calculateBtn.addEventListener('click', () => {
            if (state.finalsAvailable) {
                calculatePostFinalsGPA();
            } else {
                calculatePreFinalsEstimation();
            }
        });
        
        // --- Calculation Logic ---
        const getAssessmentPercentage = (type) => {
            const conducted = parseInt(document.getElementById(`${type}Conducted`)?.value) || 0;
            const obtainedInputs = document.querySelectorAll(`.${type}Obtained`);
            const totalInputs = document.querySelectorAll(`.${type}Total`);
            let percentages = [];
            
            for (let i = 0; i < conducted; i++) {
                const obtained = parseFloat(obtainedInputs[i]?.value) || 0;
                const total = parseFloat(totalInputs[i]?.value) || 0;
                if (total > 0) {
                    percentages.push((obtained / total) * 100);
                } else {
                    percentages.push(0);
                }
            }

            const missing = MIN_ASSESSMENTS - conducted;
            if (missing > 0) {
                for (let i = 0; i < missing; i++) percentages.push(100); // Grace marks
            }

            if (percentages.length === 0) return 0;
            return percentages.reduce((a, b) => a + b, 0) / percentages.length;
        };
        
        const getExamPercentage = (type) => {
            const obtained = parseFloat(document.getElementById(`${type}Obtained`)?.value) || 0;
            const total = parseFloat(document.getElementById(`${type}Total`)?.value) || 0;
            return total > 0 ? (obtained / total) * 100 : 0;
        };

        const getGpaFromPercentage = (p) => GPA_SCALE.find(s => p >= s.min);

        const calculatePostFinalsGPA = () => {
            const theoryW = state.hasLab ? (parseFloat(document.getElementById('theoryWeightage').value) || 70) / 100 : 1;
            const labW = state.hasLab ? 1 - theoryW : 0;

            const quizP = getAssessmentPercentage('quizzes');
            const assignP = getAssessmentPercentage('assignments');
            const midP = getExamPercentage('midterm');
            const finalP = getExamPercentage('theoryFinal');
            
            const theoryTotal = (quizP * WEIGHTAGES.THEORY.quizzes) + (assignP * WEIGHTAGES.THEORY.assignments) + (midP * WEIGHTAGES.THEORY.mid) + (finalP * WEIGHTAGES.THEORY.final);
            
            let labTotal = 0;
            if (state.hasLab) {
                const labAssignP = getAssessmentPercentage('labAssignments');
                const labMidP = getExamPercentage('labMidterm');
                const labFinalP = getExamPercentage('labFinal');
                labTotal = (labAssignP * WEIGHTAGES.LAB.assignments) + (labMidP * WEIGHTAGES.LAB.mid) + (labFinalP * WEIGHTAGES.LAB.final);
            }

            let failed = false;
            let failReason = '';
            if (theoryTotal < 50) {
                failed = true;
                failReason = `Theory component score (${theoryTotal.toFixed(2)}%) is below 50%.`;
            }
            if (state.hasLab && labTotal < 50) {
                failed = true;
                failReason = `Lab component score (${labTotal.toFixed(2)}%) is below 50%.`;
            }

            if (failed) {
                renderFailOutput(failReason);
                return;
            }

            const overallPercentage = (theoryTotal * theoryW) + (labTotal * labW);
            const result = getGpaFromPercentage(overallPercentage);
            renderPassOutput(overallPercentage, result.grade, result.gpa);
        };

        const calculatePreFinalsEstimation = () => {
            const targetGpa = parseFloat(document.getElementById('targetGpa').value) || 0;
            const minReqPerc = GPA_SCALE.find(s => s.gpa >= targetGpa)?.min || (targetGpa > 4 ? 101 : 0);
            
            if(minReqPerc > 100) {
                renderFailOutput(`Target GPA of ${targetGpa.toFixed(2)} is not possible.`);
                return;
            }

            const theoryW = state.hasLab ? (parseFloat(document.getElementById('theoryWeightage').value) || 70) / 100 : 1;
            const labW = state.hasLab ? 1 - theoryW : 0;

            const quizP = getAssessmentPercentage('quizzes');
            const assignP = getAssessmentPercentage('assignments');
            const midP = getExamPercentage('midterm');

            const internalTheoryContribution = (quizP * WEIGHTAGES.THEORY.quizzes) + (assignP * WEIGHTAGES.THEORY.assignments) + (midP * WEIGHTAGES.THEORY.mid);
            
            let internalLabContribution = 0;
            if (state.hasLab) {
                const labAssignP = getAssessmentPercentage('labAssignments');
                const labMidP = getExamPercentage('labMidterm');
                internalLabContribution = (labAssignP * WEIGHTAGES.LAB.assignments) + (labMidP * WEIGHTAGES.LAB.mid);
            }
            
            const currentOverallMarks = (internalTheoryContribution * theoryW) + (internalLabContribution * labW);
            const marksNeededFromFinals = minReqPerc - currentOverallMarks;

            if (marksNeededFromFinals <= 0) {
                renderEstimationOutput(0, 0, currentOverallMarks, targetGpa);
                return;
            }

            const theoryFinalWeightAbs = WEIGHTAGES.THEORY.final * theoryW;
            const labFinalWeightAbs = state.hasLab ? WEIGHTAGES.LAB.final * labW : 0;
            const totalFinalWeightAbs = theoryFinalWeightAbs + labFinalWeightAbs;
            
            const requiredPercInEachFinal = marksNeededFromFinals / totalFinalWeightAbs;
            
            renderEstimationOutput(requiredPercInEachFinal, requiredPercInEachFinal, currentOverallMarks, targetGpa);
        };

        // --- Rendering Functions ---
        const renderFailOutput = (reason) => {
            outputContainer.innerHTML = `
                <div class="text-center p-4 bg-red-900/50 border border-red-700 rounded-lg">
                    <p class="text-2xl font-bold text-red-400">Status: FAILED</p>
                    <p class="text-lg text-red-300">Grade: F (0.00 GPA)</p>
                    <p class="mt-2 text-sm text-red-300/80">${reason}</p>
                </div>
            `;
        };
        
        const renderPassOutput = (percentage, grade, gpa) => {
            outputContainer.innerHTML = `
                <div class="text-center p-4 bg-green-900/50 border border-green-700 rounded-lg">
                    <p class="text-2xl font-bold text-green-400">GPA: ${gpa.toFixed(2)}</p>
                    <p class="text-lg text-green-300">Grade: ${grade}</p>
                    <p class="mt-2 text-sm text-green-300/80">Overall Percentage: ${percentage.toFixed(2)}%</p>
                </div>
            `;
        };

        const renderEstimationOutput = (reqTheory, reqLab, current, targetGpa) => {
            let warning = '';
            if (reqTheory > 100 || (state.hasLab && reqLab > 100)) {
                warning = `<div class="mt-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
                    <span class="font-bold">Warning:</span> Achieving this GPA is mathematically impossible as it requires over 100% in your finals.
                </div>`;
            }

            // Get total marks for finals
            const theoryFinalTotal = parseFloat(document.getElementById('theoryFinalTotal')?.value) || 0;
            const labFinalTotal = state.hasLab ? (parseFloat(document.getElementById('labFinalTotal')?.value) || 0) : 0;

            // Calculate absolute marks needed in finals
            let absTheory = theoryFinalTotal > 0 ? (reqTheory / 100) * theoryFinalTotal : null;
            let absLab = labFinalTotal > 0 ? (reqLab / 100) * labFinalTotal : null;

            // Calculate total internal marks
            let totalInternal = current;
            let minReqPerc = GPA_SCALE.find(s => s.gpa >= targetGpa)?.min || (targetGpa > 4 ? 101 : 0);
            let totalNeeded = minReqPerc;
            let finalsNeeded = totalNeeded - totalInternal;

            // Scenario generation (for simplicity, show 3 combinations)
            let scenarios = [];
            if (state.hasLab && theoryFinalTotal > 0 && labFinalTotal > 0) {
                // Vary theory and lab marks, keep their weighted sum = finalsNeeded
                const theoryW = (parseFloat(document.getElementById('theoryWeightage')?.value) || 70) / 100;
                const labW = 1 - theoryW;
                const theoryFinalWeightAbs = WEIGHTAGES.THEORY.final * theoryW;
                const labFinalWeightAbs = WEIGHTAGES.LAB.final * labW;
                const totalFinalWeightAbs = theoryFinalWeightAbs + labFinalWeightAbs;
                // Try 3 scenarios: (1) equal, (2) theory high/lab low, (3) lab high/theory low
                let finals = [
                    [0.5, 0.5],
                    [0.7, 0.3],
                    [0.3, 0.7]
                ];
                for (let [t, l] of finals) {
                    let theoryPerc = finalsNeeded / totalFinalWeightAbs * theoryFinalWeightAbs / (theoryFinalWeightAbs + labFinalWeightAbs) * (t * 2);
                    let labPerc = finalsNeeded / totalFinalWeightAbs * labFinalWeightAbs / (theoryFinalWeightAbs + labFinalWeightAbs) * (l * 2);
                    let theoryMarks = (theoryPerc / 100) * theoryFinalTotal;
                    let labMarks = (labPerc / 100) * labFinalTotal;
                    scenarios.push({
                        theoryPerc: theoryPerc.toFixed(2),
                        labPerc: labPerc.toFixed(2),
                        theoryMarks: theoryMarks.toFixed(2),
                        labMarks: labMarks.toFixed(2)
                    });
                }
            }

            let reqFinalsHTML = '';
            if (state.hasLab && theoryFinalTotal > 0 && labFinalTotal > 0) {
                reqFinalsHTML += `<div class="mt-2">
                    <p class="font-semibold text-blue-400">Scenarios for Required Final Marks:</p>
                    <ul class="text-left mt-2 space-y-1">
                        ${scenarios.map((s, i) => `<li>Scenario ${i+1}: Theory Final: <span class='font-bold'>${s.theoryMarks}</span>/${theoryFinalTotal} (${s.theoryPerc}%), Lab Final: <span class='font-bold'>${s.labMarks}</span>/${labFinalTotal} (${s.labPerc}%)</li>`).join('')}
                    </ul>
                </div>`;
            } else if (theoryFinalTotal > 0) {
                reqFinalsHTML += `<div class="mt-2">
                    <p class="font-semibold text-blue-400">Required in Theory Final:</p>
                    <p class="text-2xl font-bold">${absTheory ? absTheory.toFixed(2) : '?'} / ${theoryFinalTotal} (${reqTheory.toFixed(2)}%)</p>
                </div>`;
            }

            let absMarksHTML = '';
            if (finalsNeeded > 0) {
                absMarksHTML = `<div class="mt-2 text-sm text-gray-300">You need <span class='font-bold'>${finalsNeeded.toFixed(2)}</span> more absolute marks from finals to reach your target GPA (${minReqPerc} - ${totalInternal.toFixed(2)} = <span class='font-bold'>${finalsNeeded.toFixed(2)}</span>).</div>`;
            }

            if (reqTheory <= 0 && (!state.hasLab || reqLab <= 0)) {
                 outputContainer.innerHTML = `
                    <div class="p-4 bg-green-900/50 border border-green-700 rounded-lg text-center">
                        <p class="text-xl font-bold text-green-400">Congratulations!</p>
                        <p class="text-green-300">You have already secured a GPA of at least ${targetGpa.toFixed(2)} with your internal marks of ${current.toFixed(2)}%.</p>
                    </div>
                 `;
            } else {
                 outputContainer.innerHTML = `
                    <div class="p-4 bg-blue-900/50 border border-blue-700 rounded-lg text-center">
                        <p class="text-lg font-semibold text-blue-300">To get a ${targetGpa.toFixed(2)} GPA:</p>
                        <p class="text-sm text-blue-400 mb-2">(See scenarios below for required marks in finals)</p>
                        ${absMarksHTML}
                        ${reqFinalsHTML}
                        ${warning}
                        <p class="mt-4 text-xs text-gray-400">Remember, you must also pass each component (Theory/Lab) with at least 50% to avoid failing the course.</p>
                    </div>
                `;
            }
        };

        // --- Multi-Course GPA Logic ---
        const addCourseBtn = document.getElementById('addCourseBtn');
        const multiCourseList = document.getElementById('multiCourseList');
        const calculateMultiBtn = document.getElementById('calculateMultiBtn');
        const multiOutputContainer = document.getElementById('multiOutputContainer');
        
        addCourseBtn.addEventListener('click', () => {
            const courseCount = multiCourseList.children.length;
            if (courseCount >= 8) { // Limit courses
                alert("You can add a maximum of 8 courses.");
                return;
            }
            const newCourseEntry = document.createElement('div');
            newCourseEntry.className = "grid grid-cols-1 sm:grid-cols-4 gap-4 items-center p-3 bg-gray-700/50 rounded-lg";
            newCourseEntry.innerHTML = `
                <input type="text" class="form-input rounded-md col-span-1 sm:col-span-1" placeholder="Course Name">
                <select class="form-select rounded-md col-span-1 sm:col-span-1">
                    <option value="1">1 Credit Hour</option>
                    <option value="2">2 Credit Hours</option>
                    <option value="3" selected>3 Credit Hours</option>
                    <option value="4">4 Credit Hours</option>
                </select>
                <input type="number" step="0.01" class="form-input rounded-md col-span-1 sm:col-span-1" placeholder="GPA Earned">
                <button class="remove-course-btn bg-red-600 text-white rounded-md p-2 hover:bg-red-700 transition col-span-1 sm:col-span-1">Remove</button>
            `;
            multiCourseList.appendChild(newCourseEntry);
            newCourseEntry.querySelector('.remove-course-btn').addEventListener('click', (e) => e.target.parentElement.remove());
        });

        calculateMultiBtn.addEventListener('click', () => {
            const courseEntries = multiCourseList.children;
            let totalCreditHours = 0;
            let totalQualityPoints = 0;
            
            for(const entry of courseEntries) {
                const creditHours = parseFloat(entry.children[1].value);
                const gpa = parseFloat(entry.children[2].value);

                if(!isNaN(creditHours) && !isNaN(gpa) && creditHours > 0 && gpa >= 0) {
                    totalCreditHours += creditHours;
                    totalQualityPoints += gpa * creditHours;
                }
            }

            const overallGpa = totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0;
            
            multiOutputContainer.innerHTML = `
                <div class="p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
                    <p class="text-lg text-blue-300">Total Credit Hours: <span class="font-bold text-white">${totalCreditHours}</span></p>
                    <p class="text-2xl font-bold text-blue-400 mt-2">Overall GPA: <span class="text-white">${overallGpa.toFixed(2)}</span></p>
                </div>
            `;
        });


        // Initialize the app
        setupUI();
    });