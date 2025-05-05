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

  // Show trend
  if (previousBMI !== null) {
    if (bmiRounded < previousBMI) {
      trendContainer.innerHTML = `<span style="color: green;">⬇️ BMI decreased since last check!</span>`;
    } else if (bmiRounded > previousBMI) {
      trendContainer.innerHTML = `<span style="color: red;">⬆️ BMI increased since last check.</span>`;
    } else {
      trendContainer.innerHTML = `<span style="color: gray;">➡️ BMI unchanged since last check.</span>`;
    }
  } else {
    trendContainer.innerHTML = "";
  }

  // Sound + Animation
  let animationPath = "",
    message = "";
  if (previousBMI !== null) {
    if (bmiRounded < previousBMI) {
      animationPath = "./Animations/happy.png";
      message = "Good job! BMI decreased!";
      playSound("happy");
    } else if (bmiRounded > previousBMI) {
      animationPath = "./Animations/sad.png";
      message = "Oh no! BMI increased.";
      playSound("error");
    } else {
      animationPath = "./Animations/neutral.png";
      message = "BMI remains the same. Maintain your routine!";
      playSound("alert");
    }
  } else {
    // First entry logic (based on standard ranges)
    if (bmi < 18.5) {
      animationPath = "./Animations/sad.png";
      message = "Underweight. Eat more healthy food!";
      playSound("alert");
    } else if (bmi <= 24.9) {
      animationPath = "./Animations/happy.png";
      message = "Great! You're healthy. 🎉";
      playSound("happy");
    } else if (bmi <= 29.9) {
      animationPath = "./Animations/neutral.png";
      const diff = (weight - 24.9 * (heightM * heightM)).toFixed(1);
      message = `Overweight. Try to lose ~${diff} kg.`;
      playSound("alert");
    } else {
      animationPath = "./Animations/sad.png";
      const diff = (weight - 24.9 * (heightM * heightM)).toFixed(1);
      message = `Obese. You need to lose ~${diff} kg.`;
      playSound("error");
    }
  }

  suggestion.innerText = message;

  // Show animation using <img>
  lottieContainer.innerHTML = "";
  lottieContainer.innerHTML = `<img src="${animationPath}" alt="BMI Feedback" style="max-width:100%; height:auto;" />`;

  // Save in localStorage
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
