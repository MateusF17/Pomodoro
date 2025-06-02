# Temporizador Pomodoro Simples

Um aplicativo web de temporizador Pomodoro simples e elegante para ajudar a gerenciar seu tempo e aumentar a produtividade, construído com HTML, CSS (Tailwind CSS + CSS customizado) e JavaScript puro, incluindo a biblioteca Tone.js para notificações sonoras.

## Funcionalidades

* **Modos de Temporizador:**
    * Trabalho (padrão 25 minutos)
    * Pausa Curta (padrão 5 minutos)
    * Pausa Longa (padrão 15 minutos)
* **Controles:** Iniciar, Pausar, Continuar e Reiniciar o temporizador.
* **Círculo de Progresso Visual:** Um anel SVG que mostra o tempo restante.
* **Notificações Sonoras:** Um alerta sonoro (usando Tone.js) ao final de cada sessão.
* **Contador de Pomodoros:** Acompanha o número de sessões de trabalho concluídas.
* **Ciclos para Pausa Longa:** Indica quantos ciclos de trabalho faltam para uma pausa longa (padrão: 4 ciclos).
* **Tempos Configuráveis:** Permite ao usuário definir durações personalizadas para trabalho, pausas e o número de ciclos para pausa longa através de um modal.
* **Design Responsivo:** Interface adaptável a diferentes tamanhos de tela.
* **Feedback Visual Dinâmico:** A cor de fundo e do anel de progresso mudam de acordo com o modo atual (trabalho, pausa curta, pausa longa).
* **Título da Página Dinâmico:** O título da aba do navegador exibe o tempo restante e o modo atual.

## Tecnologias Utilizadas

* **HTML5:** Estrutura básica da página.
* **CSS3:**
    * **Tailwind CSS:** Framework CSS utilitário para estilização rápida e responsiva da interface.
    * **CSS Customizado (`style.css`):** Para estilos específicos não cobertos pelo Tailwind ou mais complexos (como a fonte global e animações do círculo de progresso).
* **JavaScript (ES6+):** Lógica do temporizador, manipulação do DOM, gerenciamento de estado e interações.
* **Tone.js:** Biblioteca JavaScript para síntese de áudio e notificações sonoras no navegador.
* **Google Fonts:** Para a fonte 'Inter'.

## Estrutura dos Arquivos

O projeto é composto por três arquivos principais:

* **`index.html`**: Contém a estrutura HTML da página, incluindo os botões, o visor do temporizador, o círculo de progresso SVG e o modal de configurações. Ele também linka os arquivos CSS e JavaScript.
* **`style.css`**: Contém estilos CSS customizados que complementam o Tailwind CSS, como a definição da fonte principal (`Inter`) e estilos para elementos específicos como `.timer-display` e as animações do `.progress-ring_circle`.
* **`script.js`**: Contém toda a lógica JavaScript do aplicativo.

## Como Executar

1.  Clone este repositório ou baixe os arquivos (`index.html`, `style.css`, `script.js`) para uma pasta no seu computador.
2.  Abra o arquivo `index.html` em qualquer navegador web moderno (Chrome, Firefox, Edge, Safari).

Não há necessidade de compilação ou instalação de dependências, pois o Tailwind CSS e o Tone.js são carregados via CDN.

## Detalhes do Código (`script.js`)

O arquivo `script.js` é o coração da aplicação e é responsável por:

### 1. Seleção de Elementos da DOM
   No início do script, todos os elementos HTML interativos (botões, displays, inputs) são selecionados e armazenados em constantes para fácil acesso.

### 2. Variáveis Globais e Configurações
* `workTime`, `shortBreakTime`, `longBreakTime`: Armazenam a duração (em segundos) para cada modo.
* `cyclesForLongBreak`: Número de ciclos de trabalho antes de uma pausa longa.
* `currentTime`: Tempo atual restante no temporizador (em segundos).
* `timerInterval`: ID do intervalo retornado por `setInterval`, usado para controlar o temporizador.
* `currentMode`: String que indica o modo atual ('work', 'shortBreak', 'longBreak').
* `pomodorosCompleted`, `cyclesCompleted`: Contadores.
* `isPaused`: Booleano que indica se o temporizador está pausado.
* `synth`: Instância do `Tone.Synth` para o alarme sonoro.
* `radius`, `circumference`: Usados para calcular o progresso do círculo SVG.

### 3. Funções Principais

* **`updateDisplay()`**:
    * Calcula minutos e segundos a partir de `currentTime`.
    * Atualiza o texto do `timeDisplay`.
    * Atualiza o título da aba do navegador.
    * Calcula a porcentagem do tempo restante e chama `setProgress()`.

* **`setProgress(percent)`**:
    * Atualiza o atributo `stroke-dashoffset` do círculo SVG para criar o efeito de progresso.

* **`ensureAudioContext()`**:
    * Garante que o contexto de áudio do Tone.js seja iniciado, geralmente após uma interação do usuário, devido às políticas de autoplay dos navegadores.

* **Controles do Temporizador:**
    * `startTimer()`: Inicia o `setInterval` que decrementa `currentTime` a cada segundo e atualiza o display. Altera o texto e o estilo do botão "Iniciar/Pausar".
    * `pauseTimer()`: Limpa o `timerInterval` e atualiza o botão.
    * `toggleStartPause()`: Alterna entre `startTimer()` e `pauseTimer()`.
    * `resetTimer()`: Limpa o intervalo, redefine `isPaused`, e chama `setMode()` para o modo atual sem iniciar automaticamente.

* **`playSound()`**:
    * Usa `synth.triggerAttackRelease()` do Tone.js para tocar uma nota musical.

* **`handleTimerEnd()`**:
    * Chamada quando `currentTime` chega a 0.
    * Incrementa `pomodorosCompleted` e `cyclesCompleted` se o modo era 'work'.
    * Decide se o próximo modo é 'shortBreak', 'longBreak' ou 'work'.
    * Chama `setMode()` para o próximo modo, iniciando-o automaticamente.

* **`setMode(mode, autoStart = false)`**:
    * Define `currentMode` e `currentTime` de acordo com o modo selecionado.
    * Atualiza a classe 'active' (estilos Tailwind) nos botões de modo.
    * Muda as cores de fundo do `body` e do `progressRing` (via classes Tailwind).
    * Chama `updateDisplay()`.
    * Reseta o botão "Iniciar/Pausar".
    * Se `autoStart` for `true`, chama `startTimer()`.

* **Modal de Configurações:**
    * `openCustomTimeModal()`: Exibe o modal e preenche os inputs com os valores atuais.
    * `closeCustomTimeModal()`: Esconde o modal.
    * `saveCustomTimes()`: Valida os inputs, atualiza as variáveis de tempo (`workTime`, etc.) e `cyclesForLongBreak`, e então chama `resetTimer()` para aplicar as novas configurações ao estado atual do temporizador.

### 4. Event Listeners
   Listeners de clique são adicionados aos botões para chamar as funções apropriadas (`toggleStartPause`, `resetTimer`, `setMode` para cada botão de modo, e funções do modal).

### 5. Inicialização (`DOMContentLoaded`)
   * Quando o DOM está totalmente carregado, `setMode('work', false)` é chamado para configurar o estado inicial do temporizador (modo trabalho, sem iniciar automaticamente).
   * `updateDisplay()` é chamado para mostrar o tempo inicial.
   * Um listener de interação do usuário (`click` ou `touchstart`) é configurado para chamar `ensureAudioContext()`, garantindo que o som funcione.

## Estilização

A maior parte da estilização é feita com **Tailwind CSS**, aplicando classes utilitárias diretamente nos elementos HTML em `index.html`. Isso permite um desenvolvimento rápido e um design consistente.

O arquivo **`style.css`** é usado para:
* Importar e aplicar a fonte 'Inter' globalmente.
* Definir estilos para classes customizadas que seriam mais verbosas ou complexas de se fazer apenas com Tailwind, como:
    * `.timer-display`: Define o tamanho grande da fonte do relógio.
    * `.progress-ring_svg` e `.progress-ring_circle`: Estilos para a rotação inicial e transição suave do círculo de progresso SVG.

As classes de mudança de cor de fundo (`bg-slate-900`, `bg-sky-900`, `bg-emerald-900`) e as cores do círculo de progresso (`text-indigo-500`, `text-sky-500`, `text-emerald-500`) são aplicadas/removidas dinamicamente via JavaScript, utilizando as classes do Tailwind.

## Como Contribuir

Contribuições são bem-vindas! Se você tiver sugestões para melhorar este temporizador Pomodoro, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

## Licença

Este projeto é de código aberto e pode ser usado livremente. (Você pode adicionar uma licença específica aqui, como MIT, se desejar).

---
