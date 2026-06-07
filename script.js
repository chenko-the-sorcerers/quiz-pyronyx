const SUPABASE_URL = "https://hmpiffdsavbepuzuesnd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sCp9xCJmD4JofsqcB-W08Q_BeZ81nrX";
const SUPABASE_TABLE = "quiz_results";
const ATTEMPT_TABLE = "quiz_attempts";
const DEVICE_ID_KEY = "pyronyx_quiz_device_id";
const ATTEMPT_LOCK_KEY = "pyronyx_quiz_attempt_lock";
const IP_LOOKUP_URL = "https://api.ipify.org?format=json";

const QUESTIONS = [
  {
    question:
      "Berdasarkan karakteristiknya, apa perbedaan utama yang membedakan Agentic AI dengan Generative AI dalam hal sifat operasinya?",
    answers: [
      "Agentic AI bersifat reaktif dan selalu menunggu instruksi dari manusia.",
      "Agentic AI hanya mampu melakukan interaksi tunggal (single interaction) per instruksi.",
      "Agentic AI bersifat proaktif dan dapat mengambil inisiatif untuk mencapai tujuan.",
      "Agentic AI sepenuhnya disetir oleh manusia (human-driven).",
    ],
    correct: 2,
  },
  {
    question:
      "Dalam cara kerja Agentic AI, kemampuan untuk memecah tujuan besar menjadi tugas-tugas kecil yang terstruktur (sub-tasks) disebut sebagai...",
    answers: ["Reasoning (Penalaran)", "Memory (Memori)", "Action (Tindakan)", "Planning (Perencanaan)"],
    correct: 3,
  },
  {
    question:
      "Dalam konteks Smart Healthcare, teknologi apa yang paling tepat digunakan untuk mengolah rekam medis elektronik skala besar demi memprediksi wabah dan personalisasi perawatan?",
    answers: ["Telemedicine", "Big Data Analytics", "IoT & Wearable Devices", "Artificial Intelligence"],
    correct: 1,
  },
  {
    question:
      "Terdapat berbagai tantangan etika dalam digitalisasi medis. Risiko di mana sistem AI memberikan hasil yang tidak akurat karena dilatih dengan data yang kurang merepresentasikan keragaman populasi disebut dengan...",
    answers: ["Privasi Data", "Keamanan Data", "Bias AI", "Kesenjangan Digital"],
    correct: 2,
  },
  {
    question:
      "Menurut presentasi, apa pesan utama terkait arah perubahan pada layanan kesehatan (Smart Healthcare) di masa depan?",
    answers: [
      "Layanan kesehatan akan lebih berfokus pada pengobatan rumah sakit skala besar.",
      "Healthcare masa depan akan lebih preventif daripada kuratif.",
      "Biaya kesehatan konvensional akan semakin turun tanpa bantuan teknologi.",
      "Dokter sepenuhnya akan digantikan oleh AI dalam semua aspek medis.",
    ],
    correct: 1,
  },
  {
    question:
      "Dalam membangun startup AI (Digital Entrepreneurship), apa langkah pertama yang harus dilakukan berdasarkan framework yang dipaparkan?",
    answers: ["Bangun Minimum Viable Product (MVP)", "Validasi Pasar", "Integrasikan AI", "Temukan Masalah"],
    correct: 3,
  },
  {
    question:
      "Dengan terjadinya transisi menuju AI Economy (kecerdasan prediktif), hal apa yang kini secara resmi menjadi aset bisnis yang paling berharga?",
    answers: ["Data", "Kantor Fisik", "Tenaga Kerja Manual", "Software Konvensional"],
    correct: 0,
  },
  {
    question:
      "Pada pilar utama Smart Nation 5.0, inisiatif apa yang bertujuan untuk menghadirkan kurikulum adaptif yang dikurasi oleh AI untuk personalisasi gaya belajar?",
    answers: ["Smart Society", "Smart Education", "Smart Economy", "Smart Government"],
    correct: 1,
  },
  {
    question:
      "Materi presentasi membagi peran generasi muda dalam ekosistem AI menjadi empat. Jika seseorang mendorong batas riset dan etika penerapan AI untuk kemaslahatan masyarakat, orang tersebut berperan sebagai...",
    answers: ["AI User", "AI Builder", "AI Innovator", "AI Entrepreneur"],
    correct: 2,
  },
  {
    question:
      "Berdasarkan visi lanskap nasional menuju 2035-2045, manakah di bawah ini yang merupakan salah satu dari '3 Kompetensi Utama Mutlak' yang harus dimiliki?",
    answers: ["Hardware Engineering", "Data Literacy", "Social Media Management", "Advanced Medical Surgery"],
    correct: 1,
  },
];

const QUESTION_SECONDS = 60;

const state = {
  playerName: "",
  questions: [],
  attempt: null,
  currentQuestion: 0,
  score: 0,
  correctAnswers: 0,
  selectedAnswer: null,
  secondsLeft: QUESTION_SECONDS,
  startedAt: null,
  timerId: null,
  resultSaved: false,
};

const supabaseClient =
  SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const screens = {
  join: document.querySelector("#join-screen"),
  quiz: document.querySelector("#quiz-screen"),
  result: document.querySelector("#result-screen"),
};

const joinForm = document.querySelector("#join-form");
const joinButton = joinForm.querySelector("button[type='submit']");
const joinError = document.querySelector("#join-error");
const playerNameInput = document.querySelector("#player-name");
const playerLabel = document.querySelector("#player-label");
const playerAvatar = document.querySelector("#player-avatar");
const questionCounter = document.querySelector("#question-counter");
const scoreCounter = document.querySelector("#score-counter");
const timerCounter = document.querySelector("#timer-counter");
const progressBar = document.querySelector("#progress-bar");
const questionTitle = document.querySelector("#question-title");
const answerList = document.querySelector("#answer-list");
const feedbackText = document.querySelector("#feedback-text");
const nextButton = document.querySelector("#next-button");
const resultSummary = document.querySelector("#result-summary");
const saveStatus = document.querySelector("#save-status");
const revealButton = document.querySelector("#reveal-button");
const restartButton = document.querySelector("#restart-button");
const leaderboard = document.querySelector("#leaderboard");
const podium = document.querySelector("#podium");
const rankList = document.querySelector("#rank-list");

showAttemptLockMessage();

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = playerNameInput.value.trim();

  if (name.length < 2) {
    joinError.textContent = "Nama minimal 2 karakter.";
    return;
  }

  joinButton.disabled = true;
  joinButton.textContent = "Cek...";
  joinError.textContent = "Memeriksa akses peserta...";

  const gate = await registerAttempt(name);

  if (!gate.allowed) {
    joinError.textContent = gate.message;
    joinButton.textContent = "Join";
    joinButton.disabled = Boolean(getAttemptLock());
    return;
  }

  joinError.textContent = "";
  joinButton.textContent = "Join";
  startQuiz(name, gate.attempt);
});

nextButton.addEventListener("click", () => {
  if (state.currentQuestion === state.questions.length - 1) {
    finishQuiz();
    return;
  }

  state.currentQuestion += 1;
  renderQuestion();
});

revealButton.addEventListener("click", async () => {
  revealButton.disabled = true;
  revealButton.textContent = "Ranking Terbuka";
  await renderLeaderboard();
});

restartButton.addEventListener("click", () => {
  resetState();
  leaderboard.classList.remove("is-visible");
  podium.innerHTML = "";
  rankList.innerHTML = "";
  playerNameInput.value = "";
  showScreen("join");
  showAttemptLockMessage();
  playerNameInput.focus();
});

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[screenName].classList.add("is-active");
}

function startQuiz(name, attempt) {
  resetState();
  state.playerName = name;
  state.questions = createQuizQuestions();
  state.attempt = attempt;
  state.startedAt = Date.now();
  playerLabel.textContent = name;
  playerAvatar.textContent = name.charAt(0).toUpperCase();
  showScreen("quiz");
  renderQuestion();
}

function resetState() {
  window.clearInterval(state.timerId);
  state.playerName = "";
  state.questions = [];
  state.attempt = null;
  state.currentQuestion = 0;
  state.score = 0;
  state.correctAnswers = 0;
  state.selectedAnswer = null;
  state.secondsLeft = QUESTION_SECONDS;
  state.startedAt = null;
  state.timerId = null;
  state.resultSaved = false;
  revealButton.disabled = false;
  revealButton.textContent = "Tampilkan Ranking";
  nextButton.disabled = true;
}

function renderQuestion() {
  const question = state.questions[state.currentQuestion];
  state.selectedAnswer = null;
  state.secondsLeft = QUESTION_SECONDS;

  questionCounter.textContent = `${state.currentQuestion + 1}/${state.questions.length}`;
  scoreCounter.textContent = state.score.toLocaleString("id-ID");
  timerCounter.textContent = QUESTION_SECONDS;
  progressBar.style.transform = "scaleX(1)";
  questionTitle.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.disabled = true;
  nextButton.textContent = state.currentQuestion === state.questions.length - 1 ? "Selesai" : "Lanjut";

  answerList.innerHTML = question.answers
    .map(
      (answer, index) => `
        <button class="answer-button" type="button" data-answer="${index}">
          <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
          <span>${answer.text}</span>
        </button>
      `,
    )
    .join("");

  answerList.querySelectorAll(".answer-button").forEach((button) => {
    button.addEventListener("click", () => selectAnswer(Number(button.dataset.answer)));
  });

  startTimer();
}

function startTimer() {
  window.clearInterval(state.timerId);
  state.timerId = window.setInterval(() => {
    state.secondsLeft -= 1;
    timerCounter.textContent = state.secondsLeft;
    progressBar.style.transform = `scaleX(${Math.max(state.secondsLeft, 0) / QUESTION_SECONDS})`;

    if (state.secondsLeft <= 0) {
      selectAnswer(null);
    }
  }, 1000);
}

function selectAnswer(answerIndex) {
  if (state.selectedAnswer !== null) {
    return;
  }

  window.clearInterval(state.timerId);
  state.selectedAnswer = answerIndex === null ? -1 : answerIndex;

  const question = state.questions[state.currentQuestion];
  const buttons = answerList.querySelectorAll(".answer-button");
  buttons.forEach((button) => {
    const index = Number(button.dataset.answer);
    const isSelectedCorrect = index === answerIndex && question.answers[index].isCorrect;
    button.disabled = true;
    if (isSelectedCorrect) {
      button.classList.add("is-correct");
    }
    if (index === answerIndex && !question.answers[index].isCorrect) {
      button.classList.add("is-wrong");
    }
  });

  if (answerIndex !== null && question.answers[answerIndex].isCorrect) {
    const timeBonus = state.secondsLeft * 12;
    const earnedScore = 640 + timeBonus;
    state.score += earnedScore;
    state.correctAnswers += 1;
    feedbackText.textContent = `Benar. +${earnedScore.toLocaleString("id-ID")} poin.`;
  } else if (answerIndex === null) {
    feedbackText.textContent = "Waktu habis. Jawaban tersimpan kosong.";
  } else {
    feedbackText.textContent = "Jawaban tersimpan. Lanjut ke soal berikutnya.";
  }

  scoreCounter.textContent = state.score.toLocaleString("id-ID");
  nextButton.disabled = false;
}

async function finishQuiz() {
  const durationSeconds = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000));
  const result = {
    player_name: state.playerName,
    score: state.score,
    correct_answers: state.correctAnswers,
    total_questions: state.questions.length,
    duration_seconds: durationSeconds,
    device_id: state.attempt?.device_id || getDeviceId(),
    ip_address: state.attempt?.ip_address || null,
    user_agent: getUserAgent(),
  };

  showScreen("result");
  resultSummary.textContent = `${state.playerName}, skor kamu ${state.score.toLocaleString(
    "id-ID",
  )} dengan ${state.correctAnswers} jawaban benar dari ${state.questions.length} soal.`;

  await saveResult(result);
}

async function saveResult(result) {
  const localResults = getLocalResults();
  localResults.push({ ...result, created_at: new Date().toISOString() });
  localStorage.setItem("pyronyx_quiz_results", JSON.stringify(localResults));

  if (!supabaseClient) {
    saveStatus.textContent =
      "Mode lokal aktif. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di script.js agar hasil tersimpan ke Supabase.";
    return;
  }

  const { error } = await supabaseClient.from(SUPABASE_TABLE).insert(result);
  if (error) {
    console.warn("Result saved locally only:", error.message);
    return;
  }

  state.resultSaved = true;
  saveStatus.textContent = "Hasil berhasil tersimpan ke Supabase.";
}

async function renderLeaderboard() {
  const rows = await loadLeaderboard();
  const rankedRows = rows
    .sort((a, b) => b.score - a.score || a.duration_seconds - b.duration_seconds)
    .slice(0, 10);

  podium.innerHTML = "";
  rankList.innerHTML = "";
  leaderboard.classList.add("is-visible");

  const topThree = [rankedRows[1], rankedRows[0], rankedRows[2]].filter(Boolean);
  topThree.forEach((row) => {
    const realRank = rankedRows.indexOf(row) + 1;
    podium.insertAdjacentHTML(
      "beforeend",
      `
        <article class="podium-card rank-${realRank}">
          <div class="medal">${realRank}</div>
          <div class="podium-name">${row.player_name}</div>
          <div class="podium-score">${row.score.toLocaleString("id-ID")} poin - ${
            row.correct_answers
          }/${row.total_questions} benar</div>
        </article>
      `,
    );
  });

  rankedRows.slice(3).forEach((row, index) => {
    const rank = index + 4;
    rankList.insertAdjacentHTML(
      "beforeend",
      `
        <article class="rank-row" style="animation-delay: ${900 + index * 120}ms">
          <div class="rank-number">${rank}</div>
          <div class="rank-name">${row.player_name}</div>
          <div class="rank-meta">${row.score.toLocaleString("id-ID")} poin - ${
            row.correct_answers
          }/${row.total_questions} benar</div>
        </article>
      `,
    );
  });
}

async function loadLeaderboard() {
  let rows = getLocalResults();

  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .select("player_name, score, correct_answers, total_questions, duration_seconds, created_at")
      .order("score", { ascending: false })
      .order("duration_seconds", { ascending: true })
      .limit(10);

    if (!error && data?.length) {
      rows = data;
    }
  }

  return rows;
}

function getLocalResults() {
  try {
    return JSON.parse(localStorage.getItem("pyronyx_quiz_results")) || [];
  } catch {
    return [];
  }
}

async function registerAttempt(playerName) {
  const lockedAttempt = getAttemptLock();

  if (lockedAttempt) {
    return {
      allowed: false,
      message: "Perangkat ini sudah pernah masuk quiz. Satu peserta hanya bisa join satu kali.",
    };
  }

  const attempt = {
    player_name: playerName,
    device_id: getDeviceId(),
    ip_address: await getPublicIp(),
    user_agent: getUserAgent(),
  };

  setAttemptLock(attempt);

  if (!supabaseClient) {
    return { allowed: true, attempt };
  }

  const { error } = await supabaseClient.from(ATTEMPT_TABLE).insert(attempt);

  if (error?.code === "23505") {
    return {
      allowed: false,
      message: "Perangkat ini sudah terdaftar. Kamu tidak bisa join quiz lebih dari satu kali.",
    };
  }

  if (error) {
    console.warn("Attempt saved locally only:", error.message);
  }

  return { allowed: true, attempt };
}

async function getPublicIp() {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3500);
    const response = await fetch(IP_LOOKUP_URL, {
      cache: "no-store",
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return typeof data.ip === "string" ? data.ip : null;
  } catch {
    return null;
  }
}

function getDeviceId() {
  const existingId = localStorage.getItem(DEVICE_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, newId);
  return newId;
}

function getUserAgent() {
  return navigator.userAgent.slice(0, 255);
}

function getAttemptLock() {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPT_LOCK_KEY));
  } catch {
    return null;
  }
}

function setAttemptLock(attempt) {
  localStorage.setItem(
    ATTEMPT_LOCK_KEY,
    JSON.stringify({
      player_name: attempt.player_name,
      device_id: attempt.device_id,
      ip_address: attempt.ip_address,
      started_at: new Date().toISOString(),
    }),
  );
}

function showAttemptLockMessage() {
  if (getAttemptLock()) {
    joinError.textContent = "Perangkat ini sudah pernah masuk quiz. Satu peserta hanya bisa join satu kali.";
    joinButton.disabled = true;
  }
}

function createQuizQuestions() {
  return shuffleItems(QUESTIONS).map((question) => {
    const answers = question.answers.map((answer, index) => ({
      text: answer,
      isCorrect: index === question.correct,
    }));

    return {
      question: question.question,
      answers: shuffleItems(answers),
    };
  });
}

function shuffleItems(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}
