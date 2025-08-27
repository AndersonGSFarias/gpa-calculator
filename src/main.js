// Declaração de variáveis
// ======================
// Elementos principais
let addDisciplineBtn; // Botão de adicionar disciplina
let calculateBtn; // Botão de calcular
let disciplineContainer; // Container de disciplinas
let resultElements; // Objeto com os spans de resultados (average, maior, menor, etc.)

// ======================
// OnInit (inicialização do app)
// ======================
function onInit() {
  // 1. Mapear elementos do DOM (botões, containers, resultados)
  addDisciplineBtn = document.getElementById("add-discipline");
  calculateBtn = document.getElementById("calculate");
  disciplineContainer = document.getElementById("discipline-container");
  resultElements = {
    average: document.getElementById("average"),
    higherNote: document.getElementById("higher-note"),
    lowerNote: document.getElementById("lowest-note"),
    percent: document.getElementById("percent-valor"),
    total: document.getElementById("total-discipline"),
  };

  // 2. Adicionar listeners
  addDisciplineBtn.addEventListener("click", addDiscipline);
  calculateBtn.addEventListener("click", calculateResults);

  // 3. Preparar estado inicial (ex: garantir que os resultados começam zerados)
  resultElements.average.textContent = "0";
  resultElements.higherNote.textContent = "0";
  resultElements.lowerNote.textContent = "0";
  resultElements.percent.textContent = "0";
  resultElements.total.textContent = "0";
}

// ======================
// Funções auxiliares
// ======================

// Função de adicionar diciplina
function addDiscipline() {
  const TRANSITION_DURATION = 400; // ms — deve bater com o Tailwind (duration-400)

  // Pega todos os boxes atuais
  const boxes = document.querySelectorAll(".discipline-box");
  const qtdBox = boxes.length;

  // Box modelo (primeiro)
  const modelo = document.querySelector(".discipline-box");

  // Clonar o modelo
  const novoBox = modelo.cloneNode(true);
  novoBox.classList.remove("show-first"); // remove classe do modelo
  novoBox.classList.add("opacity-0", "-translate-y-5"); // invisível e deslocado

  // Atualizar numeração
  novoBox.querySelector(".discipline-count").textContent = qtdBox + 1 + ".";

  // Resetar valores
  novoBox.querySelector("select").value = "Matemática";
  novoBox.querySelector("input").value = "";

  // Configurar botão de excluir
  novoBox.querySelector(".delete-btn").addEventListener("click", deleteDiscipline);

  // Inserir no container
  disciplineContainer.insertBefore(novoBox, addDisciplineBtn.parentNode);

  // Dar tempo do navegador renderizar e aplicar animação de entrada
  setTimeout(() => {
    novoBox.classList.remove("opacity-0", "translate-y-5");
    novoBox.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-400", "ease-in-out");
  }, 10);

  // Função de excluir disciplina
  function deleteDiscipline(event) {
    const deleteBtn = event.currentTarget || event.target.closest(".delete-btn");
    if (!deleteBtn) return;

    const box = deleteBtn.closest(".discipline-box");
    if (!box) return;

    const allBoxes = document.querySelectorAll(".discipline-box");
    if (allBoxes.length <= 1) {
      window.alert("Pelo menos uma disciplina deve permanecer.\nNão é possível remover a última.");
      return;
    }

    // Animação de saída
    box.classList.remove("opacity-100", "translate-y-0");
    box.classList.add("opacity-0", "-translate-y-5");

    // Só remove do DOM após a animação
    setTimeout(() => {
      box.remove();

      // Reordena as numerações
      const boxesAfter = document.querySelectorAll(".discipline-box");
      boxesAfter.forEach((b, index) => {
        const numSpan = b.querySelector(".discipline-count");
        if (numSpan) numSpan.textContent = index + 1 + ".";
      });
    }, TRANSITION_DURATION);
  }

  // Garantir que o botão do primeiro box tenha o listener só 1 vez
  const primeiroDeleteBtn = document.querySelector(".discipline-box .delete-btn");
  if (primeiroDeleteBtn && !primeiroDeleteBtn.dataset.listenerAdded) {
    primeiroDeleteBtn.addEventListener("click", deleteDiscipline);
    primeiroDeleteBtn.dataset.listenerAdded = "true";
  }
}

// ======================
// Funções principais
// ======================

// Função de calcular resultado da média
function calculateResults() {
  // Pega todas as caixas de disciplina
  const boxes = document.querySelectorAll(".discipline-box");

  let sum = 0;
  let count = 0;
  const invalids = []; // números das caixas inválidas
  const entries = []; // array de { valor, disciplina, seq } só com valores válidos

  // Remove marcações de erro antigas (se houver)
  document.querySelectorAll("input.input-invalid").forEach((inp) => inp.classList.remove("input-invalid"));
  document.querySelectorAll(".input-error").forEach((el) => el.remove());

  // Para cada box, tenta ler o input de nota
  boxes.forEach((box) => {
    const input = box.querySelector("input[type='number']");
    const select = box.querySelector("select");
    const seqSpan = box.querySelector(".discipline-count");
    const seq = seqSpan ? seqSpan.textContent.replace(".", "").trim() : "?";

    if (!input) return; // se não encontrar input, pula

    const raw = (input.value || "").toString().trim();
    if (raw === "") return; // campo vazio → ignora no cálculo

    const normalized = raw.replace(",", ".");
    const value = parseFloat(normalized);

    // Validação: número finito entre 0 e 10
    if (Number.isFinite(value) && value >= 0 && value <= 10) {
      sum += value;
      count += 1;
      entries.push({
        valor: value,
        disciplina: select ? select.value : "—",
        seq,
      });
    } else {
      // Marca como inválido (aplica classe visual) e registra o número da disciplina
      invalids.push(seq);
      input.classList.add("input-invalid");
    }
  });

  // Calcula média (protege divisão por zero)
  const average = count > 0 ? sum / count : 0;
  const averageFormatted = Number(average.toFixed(1));

  // Atualiza o DOM (span da média)
  if (resultElements && resultElements.average) {
    resultElements.average.textContent = String(averageFormatted);
  }

  // Se houver inválidos, mostra um alert nativo e foca no primeiro input inválido
  if (invalids.length > 0) {
    const msg = `Valor(s) inválido(s) nas disciplina(s): ${invalids.join(", ")}.\nPor favor informe um número entre 0 e 10.`;
    window.alert(msg);

    const firstInvalid = document.querySelector("input.input-invalid");
    if (firstInvalid) firstInvalid.focus();
  }

  // ====== Encontrar maior e menor nota entre as entradas válidas ======
  if (entries.length > 0) {
    // maior
    let maior = entries[0];
    // menor
    let menor = entries[0];

    entries.forEach((e) => {
      if (e.valor > maior.valor) maior = e;
      if (e.valor < menor.valor) menor = e;
    });

    // Atualiza maior nota e disciplina
    const higherNoteEl = document.getElementById("higher-note");
    const hnNameEl = document.getElementById("hn-discipline-name");
    if (higherNoteEl) higherNoteEl.textContent = String(maior.valor);
    if (hnNameEl) hnNameEl.textContent = String(maior.disciplina);

    // Atualiza menor nota e disciplina
    const lowerNoteEl = document.getElementById("lowest-note");
    const lnNameEl = document.getElementById("ln-discipline-name");
    if (lowerNoteEl) lowerNoteEl.textContent = String(menor.valor);
    if (lnNameEl) lnNameEl.textContent = String(menor.disciplina);

    // Porcentagem baseada na MÉDIA (ex: média 8 -> 80%)
    const percentVal = (average / 10) * 100; // usa a média
    const percentFormatted = Number(percentVal.toFixed(0)); // inteiro (80)
    const percentSpan = document.getElementById("percent-valor");
    if (percentSpan) percentSpan.textContent = String(percentFormatted);

    // Total de disciplinas informadas (válidas)
    const totalEl = document.getElementById("total-discipline");
    if (totalEl) totalEl.textContent = String(entries.length);
  } else {
    // Se não houver entradas válidas, zera/coloca default
    if (document.getElementById("higher-note")) document.getElementById("higher-note").textContent = "0";
    if (document.getElementById("hn-discipline-name")) document.getElementById("hn-discipline-name").textContent = "—";
    if (document.getElementById("lowest-note")) document.getElementById("lowest-note").textContent = "0";
    if (document.getElementById("ln-discipline-name")) document.getElementById("ln-discipline-name").textContent = "—";
    if (document.getElementById("percent-valor")) document.getElementById("percent-valor").textContent = "0";
    if (document.getElementById("total-discipline")) document.getElementById("total-discipline").textContent = "0";
  }

  // retorno útil para testes ou próximos passos
  return {
    average: averageFormatted,
    count,
    sum,
    invalidCount: invalids.length,
    invalidList: invalids,
    entries,
  };
}

// Start App
// ======================
document.addEventListener("DOMContentLoaded", onInit);
