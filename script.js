let resumeText = "";

document.getElementById("resumeInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    const typedarray = new Uint8Array(reader.result);

    pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
      let textPromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(
          pdf.getPage(i).then(page =>
            page.getTextContent().then(content =>
              content.items.map(item => item.str).join(" ")
            )
          )
        );
      }

      Promise.all(textPromises).then(pages => {
        resumeText = pages.join(" ");
        document.getElementById("output").textContent = "PDF loaded. Click Analyze Resume.";
      });
    });
  };

  reader.readAsArrayBuffer(file);
});

document.getElementById("analyzeBtn").addEventListener("click", function () {
  if (!resumeText.trim()) {
    alert("Please upload a resume first.");
    return;
  }

  const domains = {
    IT: ["python", "java", "sql", "javascript", "html", "css", "node", "react"],
    Marketing: ["seo", "content", "campaign", "brand", "strategy", "analytics"],
    Design: ["photoshop", "illustrator", "figma", "ux", "ui", "prototyping"],
    HR: ["recruitment", "training", "policy", "onboarding", "payroll"]
  };

  const result = [];
  let score = 0;

  for (let domain in domains) {
    const keywords = domains[domain];
    const found = keywords.filter(k => resumeText.toLowerCase().includes(k));
    const domainScore = Math.round((found.length / keywords.length) * 100);
    score = Math.max(score, domainScore);

    result.push(`🔹 ${domain} Domain: ${domainScore}% match\n  ✔ Found: ${found.join(', ') || 'None'}`);
  }

  const output = `
✅ Resume Analysis Complete

Overall Fit Score: ${score} / 100

${result.join("\n\n")}
`;

  document.getElementById("output").textContent = output;
});
