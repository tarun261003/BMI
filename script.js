function calculateBMI() {
  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);

  const bmiResult = document.getElementById("bmiResult");
  const lottieContainer = document.getElementById("bmiLottie");
  const suggestion = document.getElementById("weightSuggestion");
  const trendContainer = document.getElementById("bmiTrend");

  if (
    !age ||
    !gender ||
    !height ||
    !weight ||
    age <= 0 ||
    height <= 0 ||
    weight <= 0
  ) {
    bmiResult.innerText = "Please enter all values correctly.";
    suggestion.innerText = "";
    trendContainer.innerText = "";
    return;
  }

  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const bmiRounded = parseFloat(bmi.toFixed(1));
  bmiResult.innerText = `Your BMI is ${bmiRounded}`;

  const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  const previousBMI =
    history.length > 0 ? parseFloat(history[history.length - 1].bmi) : null;

  let trendMessage = "";
  let animationPath = "";
  let feedbackMessage = "";

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return "underweight";
    if (bmiValue <= 24.9) return "healthy";
    if (bmiValue <= 29.9) return "overweight";
    return "obese";
  };

  const currentCategory = getBMICategory(bmiRounded);
  const previousCategory = previousBMI ? getBMICategory(previousBMI) : null;

  // BMI trend logic
  if (previousBMI !== null) {
    const delta = bmiRounded - previousBMI;
    const isImprovement =
      (previousCategory === "underweight" && bmiRounded > previousBMI) ||
      (previousCategory === "overweight" && bmiRounded < previousBMI) ||
      (previousCategory === "obese" && bmiRounded < previousBMI) ||
      (previousCategory === "healthy" &&
        currentCategory === "healthy" &&
        Math.abs(delta) < 0.5);

    if (delta === 0) {
      trendMessage = `<span style="color: gray;">➡️ BMI unchanged since last check.</span>`;
      animationPath = "./Animations/neutral.png";
      playSound("alert");
    } else if (isImprovement) {
      trendMessage = `<span style="color: green;">${
        delta > 0 ? "⬆️" : "⬇️"
      } BMI improved since last check!</span>`;
      animationPath = "./Animations/happy.png";
      playSound("happy");
    } else {
      trendMessage = `<span style="color: red;">${
        delta > 0 ? "⬆️" : "⬇️"
      } BMI worsened since last check.</span>`;
      animationPath = "./Animations/sad.png";
      playSound("error");
    }

    trendContainer.innerHTML = trendMessage;
  } else {
    trendContainer.innerHTML = ""; // First entry
  }

  // Weight change suggestion logic
  const healthyMinBMI = 18.5;
  const healthyMaxBMI = 24.9;

  if (bmiRounded < healthyMinBMI) {
    const targetWeight = healthyMinBMI * heightM * heightM;
    const gainNeeded = (targetWeight - weight).toFixed(1);
    feedbackMessage = `Underweight. Eat nutritious food and aim to gain ~${gainNeeded} kg.`;
    if (!animationPath) animationPath = "./Animations/sad.png";
    playSound("alert");
  } else if (bmiRounded <= healthyMaxBMI) {
    feedbackMessage = "Great! You're healthy. 🎉";
    if (!animationPath) animationPath = "./Animations/happy.png";
    playSound("happy");
  } else if (bmiRounded <= 29.9) {
    const targetWeight = healthyMaxBMI * heightM * heightM;
    const loseNeeded = (weight - targetWeight).toFixed(1);
    feedbackMessage = `Overweight. Try to lose ~${loseNeeded} kg.`;
    if (!animationPath) animationPath = "./Animations/neutral.png";
    playSound("alert");
  } else {
    const targetWeight = healthyMaxBMI * heightM * heightM;
    const loseNeeded = (weight - targetWeight).toFixed(1);
    feedbackMessage = `Obese. You need to lose ~${loseNeeded} kg.`;
    if (!animationPath) animationPath = "./Animations/sad.png";
    playSound("error");
  }

  // Display final output
  suggestion.innerText = feedbackMessage;
  lottieContainer.innerHTML = `<img src="${animationPath}" alt="BMI Feedback" style="max-width:100%; height:auto;" />`;

  // Save entry
  const date = new Date().toLocaleDateString();
  const entry = { date, age, gender, height, weight, bmi: bmiRounded };
  history.push(entry);
  localStorage.setItem("bmiHistory", JSON.stringify(history));

  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history
    .slice(-5)
    .reverse()
    .forEach((entry) => {
      const li = document.createElement("li");
      li.innerText = `${entry.date} - BMI: ${entry.bmi}`;
      list.appendChild(li);
    });
}

function playSound(type) {
  let audioPath = "";
  switch (type) {
    case "happy":
      audioPath = "Animations/happy.wav";
      break;
    case "alert":
      audioPath = "Animations/alert.mp3";
      break;
    case "error":
      audioPath = "Animations/sad.mp3";
      break;
  }
  const audio = new Audio(audioPath);
  audio.play();
}

window.onload = renderHistory;
