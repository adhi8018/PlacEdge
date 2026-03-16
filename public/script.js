const moduleSelect = document.getElementById("moduleSelect");
const userInput = document.getElementById("userInput");
const generateBtn = document.getElementById("generateBtn");
const sampleBtn = document.getElementById("sampleBtn");
const copyBtn = document.getElementById("copyBtn");
const outputBox = document.getElementById("outputBox");

const sampleData = {
  resume: `Name: Adhishri Agarwal
Course: MCA
Skills: HTML, CSS, JavaScript, PHP, MySQL
Project: Health Care Management System
Goal: Want placement in software development`,

  interview: `I am an MCA student. I know HTML, CSS, JavaScript, PHP, and MySQL. I created a Health Care Management System project and I want to prepare for placement interviews.`,

  hr: `My weakness is that sometimes I overthink, but I always try to complete my work properly and on time.`,

  skillgap: `I am an MCA student and want placement in software development. I know HTML, CSS, JavaScript, PHP, and MySQL.`,

  readiness: `I am an MCA student with one project, basic web development skills, and I want to sit in placement drives for software roles.`
};

sampleBtn.addEventListener("click", () => {
  const selectedModule = moduleSelect.value;
  userInput.value = sampleData[selectedModule];
});

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatBullets(text) {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  let html = "<ul>";

  lines.forEach(line => {
    const cleanLine = line
      .replace(/^[-*•]\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();

    if (cleanLine) {
      html += `<li>${escapeHTML(cleanLine)}</li>`;
    }
  });

  html += "</ul>";
  return html;
}

function extractSections(rawText) {
  const lines = rawText.split("\n").map(line => line.trim()).filter(line => line !== "");
  const sections = [];
  let currentTitle = "Overview";
  let currentContent = [];

  lines.forEach(line => {
    const isHeading =
      line.endsWith(":") ||
      /^(\*\*.*\*\*)$/.test(line) ||
      /^[A-Z][A-Za-z\s&/()-]{2,40}:?$/.test(line);

    if (isHeading && line.length < 60) {
      if (currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n")
        });
      }

      currentTitle = line.replace(/\*\*/g, "").replace(/:$/, "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });

  if (currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n")
    });
  }

  return sections;
}

function getModuleTitle(module) {
  switch (module) {
    case "resume":
      return "Resume Analysis Report";
    case "interview":
      return "Interview Practice Report";
    case "hr":
      return "HR Answer Improvement";
    case "skillgap":
      return "Skill Gap Analysis";
    case "readiness":
      return "Placement Readiness Report";
    default:
      return "AI Output";
  }
}

function getModuleIcon(module) {
  switch (module) {
    case "resume":
      return "📄";
    case "interview":
      return "🎤";
    case "hr":
      return "💼";
    case "skillgap":
      return "🧠";
    case "readiness":
      return "🚀";
    default:
      return "✨";
  }
}

function getSectionIcon(title) {
  const lower = title.toLowerCase();

  if (lower.includes("strength")) return "✅";
  if (lower.includes("weak")) return "⚠️";
  if (lower.includes("missing")) return "📌";
  if (lower.includes("suggest")) return "🚀";
  if (lower.includes("improv")) return "🛠️";
  if (lower.includes("summary")) return "📝";
  if (lower.includes("score")) return "⭐";
  if (lower.includes("question")) return "❓";
  if (lower.includes("answer")) return "💬";
  if (lower.includes("ready")) return "🎯";
  if (lower.includes("overview")) return "📋";

  return "🔹";
}

function extractScore(text) {
  const scoreMatch = text.match(/(\d+(\.\d+)?)\s*\/\s*10/);
  return scoreMatch ? scoreMatch[0] : null;
}

function createSectionHTML(title, content) {
  const icon = getSectionIcon(title);
  const lines = content.split("\n").filter(line => line.trim() !== "");

  const bulletLike = lines.length > 1 || lines.some(line =>
    /^[-*•]/.test(line) || /^\d+\./.test(line)
  );

  return `
    <div class="result-section">
      <h3>${icon} ${escapeHTML(title)}</h3>
      ${
        bulletLike
          ? formatBullets(content)
          : `<p>${escapeHTML(content)}</p>`
      }
    </div>
  `;
}

function formatOutput(module, rawText) {
  const safeText = rawText || "No response received.";
  const title = getModuleTitle(module);
  const icon = getModuleIcon(module);
  const score = extractScore(safeText);

  const sections = extractSections(safeText);

  let html = `
    <div class="result-title">${icon} ${title}</div>
  `;

  if (score) {
    html += `<div class="score-box">⭐ Score: ${escapeHTML(score)}</div>`;
  }

  if (sections.length === 0) {
    html += `
      <div class="result-section">
        <h3>📋 Result</h3>
        <p>${escapeHTML(safeText)}</p>
      </div>
    `;
    return html;
  }

  sections.forEach(section => {
    if (section.content.trim()) {
      html += createSectionHTML(section.title, section.content);
    }
  });

  return html;
}

function setLoadingState(module) {
  const title = getModuleTitle(module);
  const icon = getModuleIcon(module);

  outputBox.innerHTML = `
    <div class="result-title">${icon} ${title}</div>
    <div class="result-section">
      <h3>⏳ Processing</h3>
      <p>Generating your result, please wait...</p>
    </div>
  `;
}

generateBtn.addEventListener("click", async () => {
  const module = moduleSelect.value;
  const input = userInput.value.trim();

  if (!input) {
    outputBox.innerHTML = `
      <div class="result-section">
        <h3>⚠️ Input Required</h3>
        <p>Please enter some content first.</p>
      </div>
    `;
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  setLoadingState(module);

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ module, input })
    });

    const data = await response.json();
    const rawOutput = data.output || "No response received.";
    outputBox.innerHTML = formatOutput(module, rawOutput);
  } catch (error) {
    console.error(error);
    outputBox.innerHTML = `
      <div class="result-section">
        <h3>❌ Connection Error</h3>
        <p>Failed to connect to server.</p>
      </div>
    `;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Result";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    const plainText = outputBox.innerText;
    await navigator.clipboard.writeText(plainText);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  } catch (error) {
    copyBtn.textContent = "Failed";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  }
});