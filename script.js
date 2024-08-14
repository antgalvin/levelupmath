// Global settings
const PROBLEMS_PER_LEVEL = 7; // Set this to 2 for fast testing
const START_LEVEL = 1; // Set this to the desired starting level for testing

// Variables for tracking the game state
let currentLevel = START_LEVEL;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;  // Track incorrect answers
let totalAnswers = 0;
let questionsAtCurrentLevel = 0;  // Track the number of questions answered at the current level
let startTime;
let totalTimeSpent = 0;
let timerPaused = false;
let timeSpentPaused = 0;
const recentProblems = []; // Track the last 20 problems

document.addEventListener('DOMContentLoaded', (event) => {
    generateProblem();

    const answerInput = document.getElementById('answer');
    answerInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); // Prevent default form submission behavior
            if (timerPaused) {
                resumeTimer();  // Resume the timer if it's paused
            }
            checkAnswer();
        }
    });

    const resumeButton = document.getElementById('resume-button');
    resumeButton.addEventListener('click', function() {
        resumeTimer();
    });
});

function generateProblem() {
    let problem;
    let retryCount = 0;
    const maxRetries = 10;

    do {
        problem = createProblem(currentLevel);
        retryCount++;
    } while (isProblemRecent(problem.num1, problem.num2) && retryCount < maxRetries);

    if (problem.num3 !== undefined) {
        document.getElementById('problem').textContent = `${problem.num1} ${problem.operation} ${problem.num2} ${problem.operation} ${problem.num3}`;
    } else {
        document.getElementById('problem').textContent = `${problem.num1} ${problem.operation} ${problem.num2}`;
    }

    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
    document.currentProblem = problem;
    startTimer();

    storeProblem(problem.num1, problem.num2);
}

function createProblem(level) {
    let num1, num2, num3;
    let min = 21; // Set minimum value at 21 from level 8 onwards

    // Adjust the max value based on the level
    let max;
    if (level <= 10) {
        switch(level) {
            case 1:
                min = 1; max = 4; break;
            case 2:
                min = 1; max = 5; break;
            case 3:
                min = 2; max = 7; break;
            case 4:
                min = 5; max = 9; break;
            case 5:
                min = 10; max = 15; break;
            case 6:
                min = 16; max = 25; break;
            case 7:
                min = 10; max = 20; break;
            case 8:
                max = 50; break;
            case 9:
                max = 99; break;
            case 10:
                max = 100; break;
            default:
                min = 1; max = 10; // Fallback case
        }
    } else {
        // Increase the max value faster after level 10, aiming for 1000 by level 20
        max = Math.floor(100 + ((level - 10) * (1000 - 100) / 10)); // Linear increase to reach 1000 by level 20
    }

    num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    if (level >= 15) {
        // Set specific ranges for the third number based on the level
        let num3_min, num3_max;
        if (level < 18) {
            num3_min = 1; num3_max = 10; // Keep the third number small initially
        } else if (level < 21) {
            num3_min = 5; num3_max = 20; // Slightly increase the third number's range
        } else {
            num3_min = 10; num3_max = 50; // Further increase as levels get higher
        }
        num3 = Math.floor(Math.random() * (num3_max - num3_min + 1)) + num3_min;
        return { num1, num2, num3, operation: '+' };
    } else {
        return { num1, num2, operation: '+' };
    }
}



function isProblemRecent(num1, num2) {
    for (let i = 0; i < recentProblems.length; i++) {
        const problem = recentProblems[i];
        if ((problem.num1 === num1 && problem.num2 === num2) || 
            (problem.num1 === num2 && problem.num2 === num1)) {
            return true;
        }
    }
    return false;
}

function storeProblem(num1, num2) {
    recentProblems.push({ num1, num2 });

    if (recentProblems.length > 20) {
        recentProblems.shift();
    }
}

function startTimer() {
    startTime = new Date();
    timerPaused = false;
    timeSpentPaused = 0;
    document.getElementById('timer-status').textContent = ''; // Clear any previous pause indication
    document.getElementById('resume-button').style.display = 'none'; // Hide the Resume button initially
    monitorTime(); // Start monitoring time immediately
}

function stopTimer() {
    const endTime = new Date();
    const timeSpent = (endTime - startTime - timeSpentPaused) / 1000; // Time spent in seconds, subtracting paused time
    totalTimeSpent += timeSpent;

    // Update time displays
    document.getElementById('current-time').textContent = `Time on this problem: ${Math.floor(timeSpent)} seconds`;
    const averageTime = totalTimeSpent / totalAnswers;
    document.getElementById('average-time').textContent = `Average time per problem: ${Math.floor(averageTime)} seconds`;
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const correctAnswer = calculateAnswer(document.currentProblem);

    stopTimer();
    
    totalAnswers++;
    questionsAtCurrentLevel++;

    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');

    if (userAnswer === correctAnswer) {
        correctAnswers++;
        score += 10; // Points for correct answer
        document.getElementById('feedback').textContent = "Correct!";

        // Add a visual cue for score increase
        scoreElement.classList.add('score-up');

        setTimeout(() => {
            scoreElement.classList.remove('score-up');
        }, 500);

    } else {
        incorrectAnswers++;
        document.getElementById('feedback').textContent = `Incorrect! The correct answer was ${correctAnswer}.`;

        // Add a visual cue for incorrect answer
        scoreElement.classList.add('incorrect-feedback');

        setTimeout(() => {
            scoreElement.classList.remove('incorrect-feedback');
        }, 500);
    }

    updateScoreboard();
    adjustDifficulty();
    generateProblem();
}

function calculateAnswer(problem) {
    let result = problem.num1 + problem.num2;
    if (problem.num3 !== undefined) {
        result += problem.num3;
    }
    return result;
}

function updateScoreboard() {
    document.getElementById('score').textContent = `Correct: ${correctAnswers} | Incorrect: ${incorrectAnswers}`;
    document.getElementById('level').textContent = `Level: ${currentLevel}`;
}

function adjustDifficulty() {
    let accuracy = (correctAnswers / totalAnswers) * 100;

    if (questionsAtCurrentLevel >= PROBLEMS_PER_LEVEL && accuracy > 80) { 
        currentLevel++;
        questionsAtCurrentLevel = 0;

        // Add a visual cue for level up
        const levelElement = document.getElementById('level');
        levelElement.classList.add('level-up');

        setTimeout(() => {
            levelElement.classList.remove('level-up');
        }, 500);
    } else if (accuracy < 50 && currentLevel > 1) {
        currentLevel--;
        questionsAtCurrentLevel = 0;
    }
}

function monitorTime() {
    const currentTime = new Date();
    let timeSpent = (currentTime - startTime) / 1000; // Time spent in seconds
    const averageTime = totalTimeSpent / totalAnswers;

    if (timeSpent > 3 * averageTime && !timerPaused && totalAnswers > 0) { 
        timerPaused = true;
        timeSpentPaused = currentTime - startTime; // Store the time spent before pause
        document.getElementById('timer-status').textContent = 'Timer Paused';
        document.getElementById('resume-button').style.display = 'inline-block'; // Show the Resume button
    }

    if (!timerPaused) {
        document.getElementById('current-time').textContent = `Time on this problem: ${Math.floor(timeSpent)} seconds`;
    }

    if (!timerPaused) {
        requestAnimationFrame(monitorTime);
    }
}

function resumeTimer() {
    const pausedTime = new Date() - startTime - timeSpentPaused;
    startTime = new Date() - pausedTime;
    timerPaused = false;
    document.getElementById('resume-button').style.display = 'none';
    document.getElementById('timer-status').textContent = '';
    monitorTime();
}
