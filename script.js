document.addEventListener('DOMContentLoaded', () => {
    // ============== CONFIGURAÇÕES INICIAIS ==============
    const terminalOutput = document.getElementById('terminal-output');
    const commandInput = document.getElementById('command-input');
    
    // Configurações de estado
    const state = {
    commandHistory: [],
    historyIndex: -1,
    currentTheme: 'dark',
    awaitingPassword: false,
    protectedCommand: "",
    isAdminMode: false,
    isSecretMode: false, // ADICIONE ESTA LINHA
    passwords: {
        admin: "admin789",
        secret: "senha123"
    }
};

    // ============== FUNÇÕES UTILITÁRIAS ==============
    const utils = {
        addOutput: (text, isCommand = false) => {
            const outputDiv = document.createElement('div');
            
            if (isCommand) {
                outputDiv.className = 'command-line';
                outputDiv.innerHTML = `
                    <span class="prompt">${state.isAdminMode ? 'admin' : 'user'}@terminal:~$</span>
                    <span class="command">${text}</span>
                `;
            } else {
                outputDiv.className = 'output';
                /<[^>]*>/g.test(text) 
                    ? outputDiv.innerHTML = text
                    : utils.typeWriter(outputDiv, text);
            }
            
            terminalOutput.appendChild(outputDiv);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        },

        typeWriter: (element, text, speed = 10) => {
            let i = 0;
            const typing = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typing, speed);
                }
            };
            typing();
navigateHistory: (direction) => {
    if (state.commandHistory.length === 0) return;
    
    if (direction === 'up' && state.historyIndex < state.commandHistory.length - 1) {
        state.historyIndex++;
    } else if (direction === 'down' && state.historyIndex > 0) {
        state.historyIndex--;
    } else if (direction === 'down' && state.historyIndex === 0) {
        state.historyIndex = -1;
        commandInput.value = '';
        return;
    }
    
    commandInput.value = state.commandHistory[state.commandHistory.length - 1 - state.historyIndex];
    }

        },


        
        switchTheme: (themeName) => {
            const validThemes = ['dark', 'light', 'matrix'];
            if (validThemes.includes(themeName)) {
                document.documentElement.setAttribute('data-theme', themeName);
                state.currentTheme = themeName;
                return `Tema alterado para: ${themeName}`;
            }
            return `Tema inválido. Opções: ${validThemes.join(', ')}`;
        },
        showWelcomeBanner: () => {
            const welcomeMessage = `
Bem-vindo ao Terminal Interativo Avançado!
Versão 2.0 | Digite "help" para começar
            `;
            utils.addOutput(welcomeMessage);
        }
    };
    commandInput.addEventListener('keydown', (e) => {
    try {
        if (e.key === 'Enter') {
            processCommand(commandInput.value);
            commandInput.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            utils.navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            utils.navigateHistory('down');
        }
    } catch (error) {
        console.error(error);
    }
});

    // ============== SISTEMA DE COMANDOS ==============
    const commands = {
        // ----- COMANDOS BÁSICOS -----
        help: {
    description: "Mostra todos os comandos disponíveis",
    execute: () => {
        const visibleCommands = Object.entries(commands)
            .filter(([_, cmd]) => 
                (!cmd.adminOnly || state.isAdminMode) && 
                !cmd.hidden // Não mostra comandos ocultos
            );
        // Template sem quebras de linha ou espaços extras
        let helpText = '<div class="help-output"><div class="help-header">Comandos disponíveis' + 
                      (state.isAdminMode ? ' (Modo Admin)' : '') + ':</div><div class="help-commands-list">';

        visibleCommands.forEach(([name, cmd]) => {
            helpText += '<div class="help-item' + (cmd.adminOnly ? ' admin-cmd' : '') + '">' +
                        '<span class="cmd-name">' + name + '</span>' +
                        '<span class="cmd-desc">' + cmd.description + '</span>' +
                        (cmd.protected ? '<span class="cmd-lock">🔒</span>' : '') +
                        (cmd.adminOnly ? '<span class="cmd-admin">⭐</span>' : '') +
                        '</div>';
        });

        helpText += '</div></div>';
        return helpText;
    }
},
        Gabinete: {
            description: "acessa o gabinete",
            secret: true,
            execute: () => {
                return "";
            }
        },
        about: {
            description: "Mostra informações sobre mim",
            execute: () => `
                Sobre Mim:
                ---------
                Olá! Sou um desenvolvedor apaixonado por criar experiências interativas.
                Este terminal web foi criado como parte do meu portfólio.

                Tecnologias usadas:
                - HTML5/CSS3
                - JavaScript ES6+
                - Git/GitHub

                Versão do terminal: 2.0.0
            `
        },

        // ----- COMANDOS PROTEGIDOS -----
        secret: {
            description: "Comando secreto básico",
            protected: true,
            execute: () => "🚀 Você acessou o comando secreto básico!"
        }, 
        mkultra: {
            description: "Comando ultra secreto (não aparece no help)",
            hidden: true,  
            execute: () => {
            // Mostra a tela de login secreta
            showSecretLogin();
                    return "";
        }
    },
        admin: {
            description: "Acessa o painel administrativo",
            protected: true,
            execute: () => {
                state.isAdminMode = true;
                utils.switchTheme('matrix');
                return `🔓 Modo admin ativado!\n\nBem-vindo ao painel administrativo.`;
            }
        },

        // ----- COMANDOS ADMIN -----
        system: {
            description: "Opções do sistema (apenas admin)",
            adminOnly: true,
            execute: () => `
                🖥️ Status do sistema:
                - Memória: 78%
                - CPU: 23%
                - Discos: 45%
            `
        },

        users: {
            description: "Gerencia usuários (apenas admin)",
            adminOnly: true,
            execute: () => `
                👥 Usuários conectados:
                1. admin (você)
                2. guest (desde 10:32)
            `
        },

        logout: {
            description: "Sai do modo admin",
            adminOnly: true, // Adicionamos esta flag
            hidden: true, // Novo atributo para esconder completamente do help quando não admin
            execute: () => {
                if (!state.isAdminMode) {
                    return null; // Retorna null para simular "comando não encontrado"
                }
                state.isAdminMode = false;
                utils.switchTheme('dark');
                return "🔒 Modo admin desativado.";
            }
        },

        themes: {
  description: "Muda o tema do terminal",
  adminOnly: true,
  execute: async () => {
    const themeOptions = ['dark', 'light', 'matrix'];
    const selectedTheme = await prompt(`Temas disponíveis:\n${themeOptions.join('\n')}\nEscolha um tema (1-3): `);

    if (selectedTheme >= 1 && selectedTheme <= 3) {
      const chosenTheme = themeOptions[selectedTheme - 1];
      document.body.setAttribute('data-theme', chosenTheme);
    } else {
      console.log('Opção inválida. Tente novamente!');
    }
  }
},

// Comandos do modo secreto
arquivos: {
    description: "Acessa arquivos confidenciais",
    secret: true,
    execute: () => "Nível de acesso insuficiente para visualizar arquivos"
},


        // ----- COMANDOS DO SISTEMA -----
        clear: {
    description: "Limpa o terminal",
    execute: () => {
        terminalOutput.innerHTML = ''; // Limpa o terminal
        
        // Recria o banner de boas-vindas
        const welcomeMessage = `
Bem-vindo ao Terminal Interativo Avançado!
Versão 2.0 | Digite "help" para começar
        `;
        
        utils.addOutput(welcomeMessage);
        return '';
    }
},

        
        date: {
            description: "Mostra a data atual",
            execute: () => new Date().toLocaleDateString()
        },

        time: {
            description: "Mostra a hora atual",
            execute: () => new Date().toLocaleTimeString()
        },
    };

    // ============== PROCESSADOR DE COMANDOS ==============

const showSecretLogin = () => {
    // Esconde o terminal e limpa o histórico
    document.querySelector('.terminal').style.display = 'none';
    state.commandHistory = [];
    state.historyIndex = -1;
    
    // Cria a tela de login secreta
    const secretLogin = document.createElement('div');
    secretLogin.id = 'secret-login';
    secretLogin.innerHTML = `
        <div class="secret-login-container">
            <div class="secret-login-header">FREAKBAIT MAINFRAME v4.20:69</div>
            <div class="secret-login-field">
                <label>username</label>
                <input type="text" id="secret-username" class="secret-input">
            </div>
            <div class="secret-login-field">
                <label>password</label>
                <input type="password" id="secret-password" class="secret-input">
            </div>
            <div class="secret-login-buttons">
                <button id="secret-login-btn">Envlar</button>
                <button id="secret-exit-btn">Exit</button>
            </div>
            <div class="secret-login-message">
                <p>IF YOU HAVE TO ASK FOR THE USERNAME AND PASSWORD</p>
                <p>YOU ALREADY LOST BEFORE YOU STARTED</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(secretLogin);
    
    // Evento do botão de login
    document.getElementById('secret-login-btn').addEventListener('click', () => {
        const username = document.getElementById('secret-username').value;
        const password = document.getElementById('secret-password').value;
        
        if (username === "MKULTRA" && password === "CLASSIFIED") {
            // Limpa tudo
            commands.clear.execute();
            
            // Ativa modo secreto
            state.isSecretMode = true;
            state.commandHistory = []; // Limpa histórico
            
            // Mostra mensagem de acesso
            utils.addOutput("🔓 ACESSO CONCEDIDO - MODO SECRETO ATIVADO");
            utils.addOutput("Comandos disponíveis: arquivos, gabinete");
            
            // Restaura terminal e remove login
            document.querySelector('.terminal').style.display = 'flex';
            document.body.removeChild(secretLogin);
            
            // Foca no input
            document.getElementById('command-input').focus();
        } else {
            alert("ACCESS DENIED");
        }
    });
    
    // Evento do botão Exit
    document.getElementById('secret-exit-btn').addEventListener('click', () => {
        // Restaura o terminal com clear
        document.querySelector('.terminal').style.display = 'flex';
        commands.clear.execute();
        document.body.removeChild(secretLogin);
        document.getElementById('command-input').focus();
    });
};
    
    const processCommand = (input) => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        
        utils.addOutput(trimmedInput, true);
        state.commandHistory.push(trimmedInput);
        state.historyIndex = -1;
        
        // Modo de autenticação
        if (state.awaitingPassword) {
            const commandObj = commands[state.protectedCommand];
            if (trimmedInput === state.passwords[state.protectedCommand] || 
                trimmedInput === commandObj.password) {
                utils.addOutput("✅ Senha correta! Acessando comando...", false);
                state.awaitingPassword = false;
                const output = commandObj.execute();
                utils.addOutput(output);
            } else {
                utils.addOutput(`❌ Senha incorreta! Digite "${state.protectedCommand}" novamente para tentar.`, false);
                state.awaitingPassword = false;
            }
            return;
        }
        
        const [command] = trimmedInput.split(/\s+/);
        const cmd = command.toLowerCase();
        
        if (commands[cmd]) {
        // Comandos ocultos devem parecer não existir quando não admin
        if (commands[cmd].hidden && !state.isAdminMode) {
            return utils.addOutput(`Comando não encontrado: ${cmd}\nDigite "help" para ver os comandos disponíveis.`);
        }}
        



        if (commands[cmd]) {
            // Verifica comandos restritos
            if (commands[cmd].adminOnly && !state.isAdminMode) {
                utils.addOutput("❌ Comando restrito. Acesso permitido apenas no modo admin.");
                return;
            }
                    // Verifica se é comando secreto e se está no modo secreto
        if (commands[cmd].secret && !state.isSecretMode) {
            return utils.addOutput(`Comando não encontrado: ${cmd}\nDigite "help" para ver os comandos disponíveis.`);
        }
            // Verifica comandos protegidos
            if (commands[cmd].protected) {
                utils.addOutput(`🔒 Este comando requer autenticação. Digite a senha para "${cmd}":`, false);
                state.awaitingPassword = true;
                state.protectedCommand = cmd;
            } else {
                const output = commands[cmd].execute();
                if (output) utils.addOutput(output);
            }
        } else {
            utils.addOutput(`Comando não encontrado: ${cmd}\nDigite "help" para ver os comandos disponíveis.`);
        }
    };

    // ============== INICIALIZAÇÃO ==============
    const initTerminal = () => {
        commandInput.focus();
        utils.showWelcomeBanner();
        utils.switchTheme(state.currentTheme);
    };


    initTerminal();
});
