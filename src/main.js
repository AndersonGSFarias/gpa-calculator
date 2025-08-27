// ======================
// Imports
// ======================
// (Aqui você coloca futuros imports se usar módulos ou libs externas, por enquanto não tem nada)

// ======================
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
  novoBox.classList.add("opacity-0", "translate-y-5"); // invisível e deslocado

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

  // ============================
  // Função de excluir disciplina
  // ============================
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
    box.classList.add("opacity-0", "translate-y-5");

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
function calculateResults() {
  // Pega todas as caixas de disciplina
  const boxes = document.querySelectorAll(".discipline-box");

  let sum = 0;
  let count = 0;
  const invalids = []; // aqui guardamos os números (1,2,3...) das caixas inválidas

  // Remove marcações de erro antigas (se houver)
  document.querySelectorAll("input.input-invalid").forEach((inp) => inp.classList.remove("input-invalid"));
  // remove mensagens antigas caso exista (compatibilidade com versões anteriores)
  document.querySelectorAll(".input-error").forEach((el) => el.remove());

  // Para cada box, tenta ler o input de nota
  boxes.forEach((box) => {
    const input = box.querySelector("input[type='number']");
    const seqSpan = box.querySelector(".discipline-count");
    // pega o número da sequência, removendo o ponto se existir (ex: "2." -> "2")
    const seq = seqSpan ? seqSpan.textContent.replace(".", "").trim() : "?";

    if (!input) return; // se não encontrar input, pula

    const raw = (input.value || "").toString().trim();
    if (raw === "") return; // campo vazio → ignora no cálculo

    const normalized = raw.replace(",", ".");
    const value = parseFloat(normalized);

    // Validação: numero finito entre 0 e 10
    if (Number.isFinite(value) && value >= 0 && value <= 10) {
      sum += value;
      count += 1;
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

    // foco no primeiro input inválido para ajudar o usuário
    const firstInvalid = document.querySelector("input.input-invalid");
    if (firstInvalid) firstInvalid.focus();
  }

  // retorno útil para testes ou próximos passos
  return {
    average: averageFormatted,
    count,
    sum,
    invalidCount: invalids.length,
    invalidList: invalids,
  };
}

// Start App
// ======================
document.addEventListener("DOMContentLoaded", onInit);
