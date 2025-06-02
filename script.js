// script.js

// Elementos da DOM
const timeDisplay = document.getElementById('timeDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const workBtn = document.getElementById('workBtn');
const shortBreakBtn = document.getElementById('shortBreakBtn');
const longBreakBtn = document.getElementById('longBreakBtn');
const pomodoroCountDisplay = document.getElementById('pomodoroCount');
const cyclesToLongBreakDisplay = document.getElementById('cyclesToLongBreak');
const progressRing = document.getElementById('progressRing');
const body = document.body;

// Elementos do Modal de Configuração
const customTimeModal = document.getElementById('customTimeModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const saveCustomTimeBtn = document.getElementById('saveCustomTime');
const cancelCustomTimeBtn = document.getElementById('cancelCustomTime');
const customWorkInput = document.getElementById('customWork');
const customShortBreakInput = document.getElementById('customShortBreak');
const customLongBreakInput = document.getElementById('customLongBreak');
const customCyclesInput = document.getElementById('customCycles');

// Configurações do temporizador (em segundos)
let workTime = 25 * 60;
let shortBreakTime = 5 * 60;
let longBreakTime = 15 * 60;
let cyclesForLongBreak = 4; // Número de ciclos de trabalho antes de uma pausa longa

let currentTime; // Tempo atual em segundos
let timerInterval; // Variável para armazenar o intervalo do temporizador
let currentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
let pomodorosCompleted = 0;
let cyclesCompleted = 0; // Ciclos de trabalho concluídos desde a última pausa longa
let isPaused = true;

let synth; // Será inicializado após interação do usuário
try {
    synth = new Tone.Synth().toDestination();
} catch (e) {
    console.warn("Tone.js synth não pôde ser inicializado imediatamente. Será tentado no primeiro clique.", e);
}


// Configuração do círculo de progresso
const radius = progressRing.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

// Função para atualizar o visor do temporizador
function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Pomodoro`;


    let totalTimeForMode;
    if (currentMode === 'work') totalTimeForMode = workTime;
    else if (currentMode === 'shortBreak') totalTimeForMode = shortBreakTime;
    else totalTimeForMode = longBreakTime;
    
    if (totalTimeForMode > 0) { // Evita divisão por zero se o tempo for 0
        const percentRemaining = (currentTime / totalTimeForMode) * 100;
        setProgress(100 - percentRemaining); // Mostra o progresso preenchido
    } else {
        setProgress(0); // Se o tempo total for 0, progresso é 0
    }
}

async function ensureAudioContext() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    if (!synth) { // Tenta reinicializar se falhou antes
        try {
            synth = new Tone.Synth().toDestination();
        } catch (e) {
            console.error("Falha ao inicializar Tone.js synth mesmo após interação.", e);
        }
    }
}

// Função para iniciar o temporizador
async function startTimer() {
    await ensureAudioContext(); // Garante que o contexto de áudio está pronto
    if (isPaused) {
        isPaused = false;
        startPauseBtn.textContent = 'Pausar';
        startPauseBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        startPauseBtn.classList.add('bg-red-500', 'hover:bg-red-600');

        if (currentTime === undefined) { // Se for a primeira vez iniciando
             if (currentMode === 'work') currentTime = workTime;
             else if (currentMode === 'shortBreak') currentTime = shortBreakTime;
             else currentTime = longBreakTime;
        }
        updateDisplay(); // Atualiza o display imediatamente ao iniciar


        timerInterval = setInterval(() => {
            if (currentTime > 0) {
                currentTime--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                playSound();
                handleTimerEnd();
            }
        }, 1000);
    }
}

// Função para pausar o temporizador
function pauseTimer() {
    if (!isPaused) {
        isPaused = true;
        clearInterval(timerInterval);
        startPauseBtn.textContent = 'Continuar';
        startPauseBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        startPauseBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
    }
}

// Função para alternar entre iniciar e pausar
function toggleStartPause() {
    if (isPaused) {
        startTimer();
    } else {
        pauseTimer();
    }
}

// Função para reiniciar o temporizador para o modo atual
function resetTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    // Não auto-inicia ao resetar, apenas define o tempo e atualiza o display
    setMode(currentMode, false); 
    startPauseBtn.textContent = 'Iniciar';
    startPauseBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
    startPauseBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
}

// Função para tocar um som de alarme
function playSound() {
    if (synth) {
        try {
            synth.triggerAttackRelease("C5", "0.5"); // Toca uma nota C5 por 0.5 segundos
        } catch (e) {
            console.error("Erro ao tocar o som:", e);
        }
    } else {
        console.warn("Synth não está disponível para tocar som.");
        // Fallback simples se o Tone.js falhar completamente
        // alert("Tempo esgotado!");
    }
}

// Função para lidar com o fim do temporizador
function handleTimerEnd() {
    if (currentMode === 'work') {
        pomodorosCompleted++;
        pomodoroCountDisplay.textContent = pomodorosCompleted;
        cyclesCompleted++;
        cyclesToLongBreakDisplay.textContent = Math.max(0, cyclesForLongBreak - cyclesCompleted);

        if (cyclesCompleted >= cyclesForLongBreak) {
            setMode('longBreak', true); // Auto-inicia a pausa longa
            cyclesCompleted = 0; // Reinicia a contagem de ciclos
            cyclesToLongBreakDisplay.textContent = cyclesForLongBreak;
        } else {
            setMode('shortBreak', true); // Auto-inicia a pausa curta
        }
    } else { // Se era uma pausa (curta ou longa)
        setMode('work', true); // Auto-inicia o trabalho
    }
    // O startTimer() agora é chamado dentro de setMode se autoStart for true
}

// Função para definir o modo (trabalho, pausa curta, pausa longa)
function setMode(mode, autoStart = false) {
    currentMode = mode;
    // Garante que o timer esteja marcado como pausado e limpa qualquer intervalo existente ao mudar de modo
    isPaused = true; 
    clearInterval(timerInterval);

    // Remove a classe 'active' (Tailwind) de todos os botões de modo e reseta estilos
    [workBtn, shortBreakBtn, longBreakBtn].forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white'); // Classes de ativo
        btn.classList.add('bg-slate-700', 'text-slate-300'); // Classes de inativo/padrão
    });
    
    let activeBtn;
    // Atualiza o tempo e a interface
    if (mode === 'work') {
        currentTime = workTime;
        activeBtn = workBtn;
        body.className = 'bg-slate-900 text-white flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-500';
        progressRing.classList.remove('text-sky-500', 'text-emerald-500');
        progressRing.classList.add('text-indigo-500');
    } else if (mode === 'shortBreak') {
        currentTime = shortBreakTime;
        activeBtn = shortBreakBtn;
        body.className = 'bg-sky-900 text-white flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-500';
        progressRing.classList.remove('text-indigo-500', 'text-emerald-500');
        progressRing.classList.add('text-sky-500');
    } else if (mode === 'longBreak') {
        currentTime = longBreakTime;
        activeBtn = longBreakBtn;
        body.className = 'bg-emerald-900 text-white flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-500';
        progressRing.classList.remove('text-indigo-500', 'text-sky-500');
        progressRing.classList.add('text-emerald-500');
    }
    
    // Aplica estilo ativo ao botão selecionado
    if (activeBtn) {
        activeBtn.classList.remove('bg-slate-700', 'text-slate-300');
        activeBtn.classList.add('bg-indigo-600', 'text-white');
    }
    
    updateDisplay();
    startPauseBtn.textContent = 'Iniciar';
    startPauseBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
    startPauseBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');

    if(autoStart) {
        startTimer();
    }
}

// Funções do Modal de Configuração
function openCustomTimeModal() {
    customWorkInput.value = workTime / 60;
    customShortBreakInput.value = shortBreakTime / 60;
    customLongBreakInput.value = longBreakTime / 60;
    customCyclesInput.value = cyclesForLongBreak;
    customTimeModal.classList.remove('hidden');
}

function closeCustomTimeModal() {
    customTimeModal.classList.add('hidden');
}

function saveCustomTimes() {
    const newWorkTime = parseInt(customWorkInput.value);
    const newShortBreakTime = parseInt(customShortBreakInput.value);
    const newLongBreakTime = parseInt(customLongBreakInput.value);
    const newCycles = parseInt(customCyclesInput.value);

    if (isNaN(newWorkTime) || newWorkTime <= 0 ||
        isNaN(newShortBreakTime) || newShortBreakTime <= 0 ||
        isNaN(newLongBreakTime) || newLongBreakTime <= 0 ||
        isNaN(newCycles) || newCycles <=0) {
        alert("Por favor, insira valores válidos (números maiores que zero).");
        return;
    }

    workTime = newWorkTime * 60;
    shortBreakTime = newShortBreakTime * 60;
    longBreakTime = newLongBreakTime * 60;
    cyclesForLongBreak = newCycles;
    
    cyclesToLongBreakDisplay.textContent = cyclesForLongBreak - cyclesCompleted;

    // Reseta o timer para o modo atual com os novos tempos
    // O resetTimer chamará setMode(currentMode, false) que atualizará o currentTime e o display
    resetTimer(); 
    
    closeCustomTimeModal();
}

// Event Listeners
startPauseBtn.addEventListener('click', toggleStartPause);
resetBtn.addEventListener('click', resetTimer);

// Ao clicar nos botões de modo, apenas define o modo, não inicia automaticamente.
workBtn.addEventListener('click', () => setMode('work', false));
shortBreakBtn.addEventListener('click', () => setMode('shortBreak', false));
longBreakBtn.addEventListener('click', () => setMode('longBreak', false));

openSettingsBtn.addEventListener('click', openCustomTimeModal);
saveCustomTimeBtn.addEventListener('click', saveCustomTimes);
cancelCustomTimeBtn.addEventListener('click', closeCustomTimeModal);

// Inicialização
// Adiciona um listener para o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    setMode('work', false); // Define o modo inicial como 'work' sem iniciar automaticamente
    updateDisplay(); // Garante que o display inicial esteja correto
    cyclesToLongBreakDisplay.textContent = cyclesForLongBreak;

    // Adiciona um evento de clique genérico para iniciar o Tone.js na primeira interação do usuário
    // Isso é importante para políticas de autoplay de áudio em navegadores.
    function initialUserInteractionListener() {
        ensureAudioContext().then(() => {
            console.log("Contexto de áudio Tone.js pronto após interação.");
        }).catch(e => {
            console.error("Erro ao iniciar o contexto de áudio Tone.js:", e);
        });
        document.removeEventListener('click', initialUserInteractionListener); // Remove o listener após o primeiro clique
        document.removeEventListener('touchstart', initialUserInteractionListener);
    }
    document.addEventListener('click', initialUserInteractionListener);
    document.addEventListener('touchstart', initialUserInteractionListener);

});