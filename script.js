document.addEventListener("DOMContentLoaded", function () {
    const crossword = Array.from({ length: 20 }, () => Array(20).fill(''));
    const numbers = Array.from({ length: 20 }, () => Array(20).fill(''));

    const answers = [
        { correct: 'SENASMOBILE', startX: 1, startY: 4, direction: 'vertical', number: 1, questionId: 'question-1' },
        { correct: 'DESENVOLVEDORMOBILE', startX: 3, startY: 0, direction: 'horizontal', number: 2, questionId: 'question-2' },
        { correct: 'PROGRAMAÇÃO', startX: 7, startY: 2, direction: 'horizontal', number: 3, questionId: 'question-3' },
        { correct: 'PAULO', startX: 0, startY: 17, direction: 'vertical', number: 4, questionId: 'question-4' },
        { correct: 'SERVIÇO', startX: 5, startY: 4, direction: 'horizontal', number: 5, questionId: 'question-5' },
        { correct: 'CHATGPT', startX: 0, startY: 12, direction: 'horizontal', number: 6, questionId: 'question-6' }
    ];

    let currentAnswer = null;

    // Inicializa os números iniciais no tabuleiro
    answers.forEach(answer => {
        const x = answer.startX;
        const y = answer.startY;
        numbers[x][y] = answer.number;
    });

    function drawCrossword() {
        const table = document.getElementById("crossword");
        table.innerHTML = '';

        for (let i = 0; i < crossword.length; i++) {
            let row = document.createElement("tr");
            for (let j = 0; j < crossword[i].length; j++) {
                let cell = document.createElement("td");

                if (isEditableCell(i, j)) {
                    cell.contentEditable = true;
                } else {
                    cell.classList.add("filled");
                }

                cell.setAttribute('data-x', i);
                cell.setAttribute('data-y', j);

                const content = document.createElement("div");
                content.classList.add("content");
                cell.appendChild(content);

                if (crossword[i][j] !== '') {
                    content.textContent = crossword[i][j];
                }

                if (numbers[i][j] !== '') {
                    let number = document.createElement("div");
                    number.textContent = numbers[i][j];
                    number.classList.add("number");
                    cell.appendChild(number);
                }

                cell.addEventListener('input', handleInput);
                cell.addEventListener('focus', handleFocus);
                cell.addEventListener('keydown', handleKeyDown);
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    }

    function isEditableCell(x, y) {
        return answers.some(answer => {
            for (let i = 0; i < answer.correct.length; i++) {
                const targetX = answer.direction === 'horizontal' ? answer.startX : answer.startX + i;
                const targetY = answer.direction === 'horizontal' ? answer.startY + i : answer.startY;
                if (x === targetX && y === targetY) return true;
            }
            return false;
        });
    }

    function handleFocus(event) {
        const cell = event.target.closest('td');
        const x = parseInt(cell.getAttribute('data-x'));
        const y = parseInt(cell.getAttribute('data-y'));

        if (!currentAnswer) {
            // Determine a resposta atual com base na célula focada
            answers.forEach(answer => {
                for (let i = 0; i < answer.correct.length; i++) {
                    const targetX = answer.direction === 'horizontal' ? answer.startX : answer.startX + i;
                    const targetY = answer.direction === 'horizontal' ? answer.startY + i : answer.startY;
                    if (targetX === x && targetY === y) {
                        currentAnswer = answer;
                        break;
                    }
                }
            });
        }

        // Movimenta automaticamente para a próxima célula da palavra "PAULO"
        if (currentAnswer && currentAnswer.correct === 'PAULO') {
            const { startX, startY, direction } = currentAnswer;
            if (x === startX && y === startY) {
                moveToNextCell(x, y);
            }
        }
    }

    function handleInput(event) {
        const cell = event.target.closest('td');
        const content = cell.querySelector(".content");
        const x = parseInt(cell.getAttribute('data-x'));
        const y = parseInt(cell.getAttribute('data-y'));

        // Permitir apenas uma letra maiúscula por célula
        let input = content.textContent.trim().toUpperCase();
        if (input.length > 1) {
            input = input[0]; // Apenas o primeiro caractere é mantido
        }
        content.textContent = input;

        // Atualiza o valor no grid
        crossword[x][y] = input;

        if (currentAnswer) {
            const { direction, correct, startX, startY } = currentAnswer;
            let correctWord = true;

            for (let i = 0; i < correct.length; i++) {
                const targetX = direction === 'horizontal' ? startX : startX + i;
                const targetY = direction === 'horizontal' ? startY + i : startY;
                const letter = crossword[targetX][targetY] || '';
                if (letter !== correct[i]) {
                    correctWord = false;
                    break;
                }
            }

            if (correctWord) {
                for (let i = 0; i < correct.length; i++) {
                    const targetX = direction === 'horizontal' ? startX : startX + i;
                    const targetY = direction === 'horizontal' ? startY + i : startY;
                    crossword[targetX][targetY] = correct[i];
                    // Adiciona a classe 'correct' às células corretas
                    const correctCell = document.querySelector(`td[data-x="${targetX}"][data-y="${targetY}"]`);
                    correctCell.classList.add('correct');
                }

                // Risca a pergunta correspondente e mostra o checkmark
                const questionElement = document.getElementById(currentAnswer.questionId);
                questionElement.classList.add('strikethrough');
                questionElement.querySelector('.checkmark').style.visibility = 'visible';

                currentAnswer = null;
            }

            checkAllAnswersCorrect(); // Verifica se todas as respostas estão corretas
            moveToNextCell(x, y);
        }
    }

    function handleKeyDown(event) {
        const cell = event.target.closest('td');
        const x = parseInt(cell.getAttribute('data-x'));
        const y = parseInt(cell.getAttribute('data-y'));

        // Apagar e mover para a célula anterior com Backspace
        if (event.key === 'Backspace') {
            event.preventDefault(); // Previne o comportamento padrão do Backspace
            const content = cell.querySelector(".content");
            if (content.textContent.trim() === '') {
                moveToPreviousCell(x, y);
            } else {
                content.textContent = ''; // Limpa o conteúdo ao pressionar backspace
                crossword[x][y] = ''; // Atualiza a grade de palavras cruzadas
                // Remove a classe 'correct' se a célula estiver vazia
                cell.classList.remove('correct');
            }
        }

        // Apagar conteúdo com a tecla Delete, mas não mover
        if (event.key === 'Delete') {
            const content = cell.querySelector(".content");
            content.textContent = ''; // Limpa o conteúdo ao pressionar delete
            crossword[x][y] = ''; // Atualiza a grade de palavras cruzadas
            cell.classList.remove('correct'); // Remove a classe 'correct' se a célula estiver vazia
        }

        // Mover para a próxima célula com a tecla 'ArrowRight' e 'ArrowDown'
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            moveToNextCell(x, y);
        }

        // Mover para a célula anterior com a tecla 'ArrowLeft' ou 'ArrowUp'
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            moveToPreviousCell(x, y);
        }
    }

    function moveToNextCell(x, y) {
        if (!currentAnswer) return;

        const { direction } = currentAnswer;

        let nextX = x;
        let nextY = y;

        if (direction === 'horizontal') {
            nextY += 1;
        } else {
            nextX += 1;
        }

        if (nextX < 20 && nextY < 20 && isEditableCell(nextX, nextY)) {
            const nextCell = document.querySelector(`td[data-x="${nextX}"][data-y="${nextY}"]`);
            if (nextCell) {
                nextCell.focus();
            }
        }
    }

    function moveToPreviousCell(x, y) {
        if (!currentAnswer) return;

        const { direction } = currentAnswer;

        let prevX = x;
        let prevY = y;

        if (direction === 'horizontal') {
            prevY -= 1;
        } else {
            prevX -= 1;
        }

        if (prevX >= 0 && prevY >= 0 && isEditableCell(prevX, prevY)) {
            const prevCell = document.querySelector(`td[data-x="${prevX}"][data-y="${prevY}"]`);
            if (prevCell) {
                prevCell.focus();
            }
        }
    }

    // Adiciona eventos de clique para perguntas
    function addQuestionClickEvents() {
        answers.forEach(answer => {
            const questionElement = document.getElementById(answer.questionId);
            questionElement.addEventListener('click', () => {
                const cell = document.querySelector(`td[data-x="${answer.startX}"][data-y="${answer.startY}"]`);
                if (cell) {
                    cell.focus();
                }
            });
        });
    }

    function checkAllAnswersCorrect() {
        const allCorrect = answers.every(answer => {
            const { correct, startX, startY, direction } = answer;
            for (let i = 0; i < correct.length; i++) {
                const targetX = direction === 'horizontal' ? startX : startX + i;
                const targetY = direction === 'horizontal' ? startY + i : startY;
                if (crossword[targetX][targetY] !== correct[i]) {
                    return false;
                }
            }
            return true;
        });

        if (allCorrect) {
            setTimeout(() => alert('Parabéns! Você completou o jogo!'), 100);
        }
    }

    drawCrossword();
    addQuestionClickEvents();
});
