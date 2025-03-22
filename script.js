document.addEventListener("DOMContentLoaded", function () {
    // Elements for quiz page
    const quizTitle = document.getElementById("quiz-title");
    const questionElement = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options");
    const nextButton = document.getElementById("next-btn");
    const prevButton = document.getElementById("prev-btn");
    const submitButton = document.getElementById("submit-btn");
    const progressBar = document.getElementById("progress-bar");

    // Elements for index page
    const categoryButtons = document.querySelectorAll(".category-btn");

    let quizData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswers = {};

    // Get category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    // Handle category button clicks on index.html
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener("click", function () {
                const selectedCategory = this.getAttribute("data-category");
                window.location.href = `quiz.html?category=${selectedCategory}`;
            });
        });
    }

    // Load quiz data if on quiz.html
    if (quizTitle && questionElement && optionsContainer) {
        fetch("quiz-data.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (data[category] && data[category].length > 0) {
                    quizData = data[category];
                    quizTitle.textContent = `${category} Quiz`;
                    loadQuestion();
                } else {
                    questionElement.textContent = "No questions available for this category.";
                    optionsContainer.innerHTML = "";
                    nextButton.style.display = "none";
                    prevButton.style.display = "none";
                    submitButton.style.display = "none";
                    progressBar.style.width = "0%";
                    progressBar.textContent = "0%";
                }
            })
            .catch(error => {
                console.error("Error loading quiz data:", error);
                questionElement.textContent = "Failed to load quiz data. Please check your connection or try again later.";
                optionsContainer.innerHTML = "";
                nextButton.style.display = "none";
                prevButton.style.display = "none";
                submitButton.style.display = "none";
                progressBar.style.width = "0%";
                progressBar.textContent = "0%";
            });
    }

    // Load question into the DOM
    function loadQuestion() {
        if (currentQuestionIndex < 0 || currentQuestionIndex >= quizData.length) return;

        const currentQuestion = quizData[currentQuestionIndex];
        questionElement.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
        optionsContainer.innerHTML = "";

        currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement("div");
            optionElement.classList.add("form-check", "mb-2");
            optionElement.innerHTML = `
                <input class="form-check-input" type="radio" name="option" id="option${index}" value="${option}" ${selectedAnswers[currentQuestionIndex] === option ? "checked" : ""}>
                <label class="form-check-label" for="option${index}">${option}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        updateNavigationButtons();
        updateProgressBar();
    }

    // Update navigation button visibility
    function updateNavigationButtons() {
        prevButton.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
        nextButton.style.display = currentQuestionIndex < quizData.length - 1 ? "inline-block" : "none";
        submitButton.style.display = currentQuestionIndex === quizData.length - 1 ? "block" : "none";
    }

    // Update progress bar
    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
        progressBar.setAttribute("aria-valuenow", progress);
    }

    // Save selected answer
    function saveSelectedAnswer() {
        const selectedOption = document.querySelector("input[name='option']:checked");
        if (selectedOption) {
            selectedAnswers[currentQuestionIndex] = selectedOption.value;
        }
    }

    // Event Listeners
    if (nextButton) {
        nextButton.addEventListener("click", function () {
            saveSelectedAnswer();
            if (currentQuestionIndex < quizData.length - 1) {
                currentQuestionIndex++;
                loadQuestion();
            }
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            saveSelectedAnswer();
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                loadQuestion();
            }
        });
    }

    if (submitButton) {
        submitButton.addEventListener("click", function () {
            saveSelectedAnswer();
            score = 0;
            quizData.forEach((question, index) => {
                if (selectedAnswers[index] === question.options[question.correct]) {
                    score++;
                }
            });

            localStorage.setItem("quizScore", score);
            localStorage.setItem("totalQuestions", quizData.length);
            window.location.href = "result.html";
        });
    }
});