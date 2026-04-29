// ============================================
// VitaIA - versão da tia
// tem bug mas funciona (quase sempre)
// ============================================

// variaveis globais (sei que é feio mas funciona)
let usuarioAtual = null;
let dadosUsuario = null;
let historicoChat = [];
let ultimoHumor = 3;
let aguaHoje = 0;
let proteinaHoje = 0;
let carboHoje = 0;
let gorduraHoje = 0;
let comidaLog = [];
let exerciciosHoje = [];
let consultasAgendadas = [];

// API key - peguei da internet, se parar de funcionar troca
const CHAVE_API = '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';

// ========== helpers bagunçados ==========
function mostrarToast(msg, cor) {
    let toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `position:fixed; bottom:80px; left:20px; right:20px; background:${cor || '#333'}; color:white; padding:12px; border-radius:30px; text-align:center; z-index:9999;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// salvando usuarios no localStorage
function pegarUsuarios() {
    let tmp = localStorage.getItem('vitaia_users');
    return tmp ? JSON.parse(tmp) : [];
}

function salvarUsuarios(lista) {
    localStorage.setItem('vitaia_users', JSON.stringify(lista));
}

function salvarDadosUsuario() {
    if (!usuarioAtual) return;
    let todos = pegarUsuarios();
    let idx = todos.findIndex(u => u.email === usuarioAtual.email);
    if (idx !== -1) {
        todos[idx].dados = dadosUsuario;
        salvarUsuarios(todos);
    }
}

// ========== login / cadastro ==========
function mostrarTab(tab) {
    if (tab === 'login') {
        document.getElementById('formLogin').style.display = 'block';
        document.getElementById('formCadastro').style.display = 'none';
        document.getElementById('btnTabLogin').classList.add('ativo');
        document.getElementById('btnTabCad').classList.remove('ativo');
        renderizarUsuariosSalvos();
    } else {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formCadastro').style.display = 'block';
        document.getElementById('btnTabCad').classList.add('ativo');
        document.getElementById('btnTabLogin').classList.remove('ativo');
    }
}

function renderizarUsuariosSalvos() {
    let users = pegarUsuarios();
    let div = document.getElementById('usuariosSalvos');
    if (!users.length) {
        div.innerHTML = '';
        return;
    }
    div.innerHTML = '<div style="margin-bottom:6px; font-size:11px; color:#aaa;">⚡ rápido:</div>' + 
        users.map(u => `<span style="display:inline-block; background:#f0f0f0; padding:4px 12px; border-radius:20px; margin:2px; font-size:11px; cursor:pointer;" onclick="preencherLogin('${u.email}')">${u.nome || u.email.split('@')[0]}</span>`).join('');
}

function preencherLogin(email) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginSenha').focus();
}

function fazerLogin() {
    let email = document.getElementById('loginEmail').value.trim();
    let senha = document.getElementById('loginSenha').value;
    let users = pegarUsuarios();
    let user = users.find(u => u.email === email);
    
    if (!user) {
        document.getElementById('erroLoginEmail').innerText = 'E-mail não encontrado';
        document.getElementById('erroLoginEmail').classList.add('visivel');
        return;
    }
    if (user.senha !== senha) {
        document.getElementById('erroLoginSenha').innerText = 'Senha errada';
        document.getElementById('erroLoginSenha').classList.add('visivel');
        return;
    }
    
    usuarioAtual = { email: user.email, nome: user.nome };
    dadosUsuario = user.dados || {
        metaAgua: 2,
        createdAt: new Date().toISOString(),
        ultimoReset: new Date().toDateString()
    };
    
    // reseta o dia se mudou
    let hoje = new Date().toDateString();
    if (dadosUsuario.ultimoReset !== hoje) {
        aguaHoje = 0;
        proteinaHoje = 0;
        carboHoje = 0;
        gorduraHoje = 0;
        comidaLog = [];
        exerciciosHoje = [];
        dadosUsuario.ultimoReset = hoje;
        salvarDadosUsuario();
    } else {
        aguaHoje = dadosUsuario.agua || 0;
        proteinaHoje = dadosUsuario.proteina || 0;
        carboHoje = dadosUsuario.carbo || 0;
        gorduraHoje = dadosUsuario.gordura || 0;
        comidaLog = dadosUsuario.comidas || [];
        exerciciosHoje = dadosUsuario.exercicios || [];
    }
    
    document.getElementById('nomeUser').innerText = user.nome;
    let hora = new Date().getHours();
    document.getElementById('saudacaoMsg').innerText = hora < 12 ? 'Bom dia,' : (hora < 18 ? 'Boa tarde,' : 'Boa noite,');
    
    document.getElementById('telaLogin').style.display = 'none';
    document.getElementById('telaApp').style.display = 'flex';
    mudarPagina('home');
    mostrarToast(`Bem vindo de volta, ${user.nome}! 🌿`);
}

function fazerCadastro() {
    let nome = document.getElementById('cadNome').value.trim();
    let email = document.getElementById('cadEmail').value.trim();
    let senha = document.getElementById('cadSenha').value;
    let senha2 = document.getElementById('cadSenha2').value;
    let ok = true;
    
    if (!nome) { document.getElementById('erroCadNome').innerText = 'Coloca seu nome aí'; document.getElementById('erroCadNome').classList.add('visivel'); ok = false; }
    if (!email.includes('@')) { document.getElementById('erroCadEmail').innerText = 'Email inválido'; document.getElementById('erroCadEmail').classList.add('visivel'); ok = false; }
    if (senha.length < 4) { document.getElementById('erroCadSenha').innerText = 'Senha muito curta'; document.getElementById('erroCadSenha').classList.add('visivel'); ok = false; }
    if (senha !== senha2) { document.getElementById('erroCadSenha2').innerText = 'Senhas diferentes'; document.getElementById('erroCadSenha2').classList.add('visivel'); ok = false; }
    
    if (!ok) return;
    
    let users = pegarUsuarios();
    if (users.find(u => u.email === email)) {
        document.getElementById('erroCadEmail').innerText = 'Email já cadastrado';
        document.getElementById('erroCadEmail').classList.add('visivel');
        return;
    }
    
    users.push({
        nome, email, senha,
        dados: {
            metaAgua: 2,
            createdAt: new Date().toISOString(),
            ultimoReset: new Date().toDateString()
        }
    });
    salvarUsuarios(users);
    mostrarToast('Conta criada! Faça o login', '#00b87a');
    mostrarTab('login');
    preencherLogin(email);
}

function sair() {
    if (confirm('Sair da conta?')) {
        usuarioAtual = null;
        dadosUsuario = null;
        document.getElementById('telaApp').style.display = 'none';
        document.getElementById('telaLogin').style.display = 'flex';
        mostrarTab('login');
    }
}

// ========== páginas ==========
async function mudarPagina(pagina, el) {
    let conteudo = document.getElementById('conteudo');
    document.querySelectorAll('.menuItem').forEach(item => item.classList.remove('ativo'));
    if (el) el.classList.add('ativo');
    
    if (pagina === 'home') {
        conteudo.innerHTML = gerarHome();
        // eventos depois de renderizar
        document.querySelectorAll('.moodBtn').forEach(btn => {
            btn.onclick = () => registrarHumor(parseInt(btn.dataset.mood));
        });
        document.querySelectorAll('.aguaBtn').forEach(btn => {
            btn.onclick = () => adicionarAgua(parseFloat(btn.dataset.litros));
        });
        await carregarInsight();
    } else if (pagina === 'progresso') {
        conteudo.innerHTML = gerarProgresso();
    } else if (pagina === 'plano') {
        conteudo.innerHTML = gerarPlano();
        document.getElementById('btnGerarPlano').onclick = () => gerarPlanoIA();
    } else if (pagina === 'labs') {
        conteudo.innerHTML = gerarLabs();
    } else if (pagina === 'tele') {
        conteudo.innerHTML = gerarTele();
    }
}

function gerarHome() {
    let pctAgua = Math.min((aguaHoje / (dadosUsuario?.metaAgua || 2)) * 100, 100);
    let pctProteina = Math.min((proteinaHoje / 120) * 100, 100);
    
    return `
        <div class="cardGrande" style="background:linear-gradient(135deg,#667eea,#764ba2); color:white">
            <div style="font-size:13px; opacity:0.8">Como você está hoje?</div>
            <div style="display:flex; justify-content:space-between; margin-top:12px">
                <button class="moodBtn" data-mood="1" style="background:none; border:none; color:white; text-align:center; cursor:pointer">😢<br><small>Mal</small></button>
                <button class="moodBtn" data-mood="2" style="background:none; border:none; color:white; text-align:center; cursor:pointer">😟<br><small>Instável</small></button>
                <button class="moodBtn" data-mood="3" style="background:none; border:none; color:white; text-align:center; cursor:pointer">😐<br><small>Neutro</small></button>
                <button class="moodBtn" data-mood="4" style="background:none; border:none; color:white; text-align:center; cursor:pointer">🙂<br><small>Bem</small></button>
                <button class="moodBtn" data-mood="5" style="background:none; border:none; color:white; text-align:center; cursor:pointer">😄<br><small>Ótimo</small></button>
            </div>
        </div>
        
        <div class="cardGrande">
            <div style="display:flex; justify-content:space-between">
                <span>💧 Água hoje</span>
                <span>${aguaHoje}L / ${dadosUsuario?.metaAgua || 2}L</span>
            </div>
            <div style="height:8px; background:#eee; border-radius:4px; margin:10px 0"><div style="height:100%; width:${pctAgua}%; background:#00b87a; border-radius:4px"></div></div>
            <div style="display:flex; gap:10px; margin-top:10px">
                <button class="aguaBtn" data-litros="0.2" style="flex:1; padding:10px; background:#e0f2fe; border:none; border-radius:8px; cursor:pointer">+200ml</button>
                <button class="aguaBtn" data-litros="0.5" style="flex:1; padding:10px; background:#e0f2fe; border:none; border-radius:8px; cursor:pointer">+500ml</button>
                <button class="aguaBtn" data-litros="1" style="flex:1; padding:10px; background:#e0f2fe; border:none; border-radius:8px; cursor:pointer">+1L</button>
            </div>
        </div>
        
        <div class="cardGrande">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px">
                <span>🥩 Proteína</span>
                <span>${Math.round(proteinaHoje)}g / 120g</span>
            </div>
            <div style="height:6px; background:#eee; border-radius:4px; margin-bottom:12px"><div style="height:100%; width:${pctProteina}%; background:#ff5e7a; border-radius:4px"></div></div>
            <div id="insightArea" style="background:#f5f5ff; padding:14px; border-radius:12px; margin-top:8px">
                <div style="font-weight:600">🤖 Insight</div>
                <div id="insightTexto" style="font-size:13px; margin-top:6px">Carregando...</div>
            </div>
        </div>
        
        <button class="btn" onclick="document.getElementById('modalChat').classList.add('visivel'); iniciarChat()" style="margin-top:8px">🆘 Preciso de ajuda agora</button>
    `;
}

function gerarProgresso() {
    let mediaHumor = 'Ainda sem registros';
    return `
        <div class="cardGrande">
            <div class="cardGrande" style="margin-bottom:12px">
                <div style="font-size:12px; color:#888">Média de humor</div>
                <div style="font-size:28px; font-weight:700">${mediaHumor}</div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px">
                <div><div style="font-size:11px; color:#888">Água hoje</div><div style="font-size:20px; font-weight:700">${aguaHoje}L</div></div>
                <div><div style="font-size:11px; color:#888">Proteína</div><div style="font-size:20px; font-weight:700">${Math.round(proteinaHoje)}g</div></div>
                <div><div style="font-size:11px; color:#888">Carboidratos</div><div style="font-size:20px; font-weight:700">${Math.round(carboHoje)}g</div></div>
                <div><div style="font-size:11px; color:#888">Gordura</div><div style="font-size:20px; font-weight:700">${Math.round(gorduraHoje)}g</div></div>
            </div>
        </div>
        <div class="cardGrande">
            <div style="font-weight:600; margin-bottom:10px">💪 Exercícios hoje</div>
            <div style="display:flex; flex-wrap:wrap; gap:8px">
                ${['Caminhada','Corrida','Musculação','Yoga','Natação','Ciclismo'].map(ex => `
                    <button class="exBtn" data-ex="${ex}" style="padding:8px 14px; background:${exerciciosHoje.includes(ex) ? '#667eea' : '#f0f0f0'}; color:${exerciciosHoje.includes(ex) ? 'white' : '#333'}; border:none; border-radius:20px; cursor:pointer">${ex}</button>
                `).join('')}
            </div>
            <div id="exLog" style="margin-top:12px; font-size:12px; color:#888">${exerciciosHoje.length ? '✓ '+exerciciosHoje.join(' · ') : 'Nenhum exercício registrado'}</div>
        </div>
    `;
}

function gerarPlano() {
    return `
        <div class="cardGrande" style="text-align:center">
            <div style="font-size:40px; margin-bottom:12px">🧠</div>
            <h3 style="margin-bottom:8px">Seu plano personalizado</h3>
            <p style="color:#666; font-size:13px; margin-bottom:20px">Baseado no seu humor e hábitos</p>
            <button class="btn" id="btnGerarPlano">Gerar Plano IA →</button>
        </div>
        <div id="resultadoPlano" style="display:none"></div>
    `;
}

function gerarLabs() {
    return `
        <div class="cardGrande" onclick="labVisaoPro()" style="cursor:pointer; display:flex; align-items:center; gap:12px">
            <span style="font-size:28px">👁️</span>
            <div><strong>Visão Pro</strong><br><small style="color:#888">Analisar foto de comida</small></div>
        </div>
        <div class="cardGrande" onclick="labExplorador()" style="cursor:pointer; display:flex; align-items:center; gap:12px">
            <span style="font-size:28px">📍</span>
            <div><strong>Explorador</strong><br><small style="color:#888">Dicas de lugares saudáveis</small></div>
        </div>
        <div class="cardGrande" onclick="labDeepThink()" style="cursor:pointer; display:flex; align-items:center; gap:12px">
            <span style="font-size:28px">💡</span>
            <div><strong>Deep Think</strong><br><small style="color:#888">Consultas profundas</small></div>
        </div>
    `;
}

function gerarTele() {
    return `
        <div class="cardGrande" style="background:linear-gradient(135deg,#0ea5e9,#6366f1); color:white; text-align:center">
            <div style="font-size:32px; margin-bottom:8px">🩺</div>
            <div style="font-weight:700">TeleSaúde</div>
            <div style="font-size:12px; opacity:0.9">Consultas online com profissionais</div>
        </div>
        <div class="cardGrande">
            <div style="font-weight:600; margin-bottom:12px">Profissionais</div>
            <div onclick="agendarConsulta('Dra. Ana - Nutri')" style="padding:14px; background:#f9f9ff; border-radius:12px; margin-bottom:8px; cursor:pointer">🥗 Dra. Ana Ribeiro - Nutricionista</div>
            <div onclick="agendarConsulta('Carlos - Personal')" style="padding:14px; background:#f9f9ff; border-radius:12px; margin-bottom:8px; cursor:pointer">💪 Carlos Mendes - Personal Trainer</div>
            <div onclick="agendarConsulta('Dra. Mariana - Médica')" style="padding:14px; background:#f9f9ff; border-radius:12px; cursor:pointer">🩺 Dra. Mariana Costa - Clínica Geral</div>
        </div>
        <div id="consultasLista" class="cardGrande">
            <div style="font-weight:600; margin-bottom:8px">Próximas consultas</div>
            ${consultasAgendadas.length ? consultasAgendadas.map(c => `<div style="padding:8px; border-bottom:1px solid #eee">📅 ${c.data} - ${c.prof}</div>`).join('') : '<div style="color:#888">Nenhuma consulta agendada</div>'}
        </div>
    `;
}

// ========== ações ==========
function registrarHumor(valor) {
    ultimoHumor = valor;
    mostrarToast(`Humor registrado: ${['','Mal','Instável','Neutro','Bem','Ótimo'][valor]} 💙`);
    carregarInsight();
}

function adicionarAgua(litros) {
    aguaHoje += litros;
    dadosUsuario.agua = aguaHoje;
    salvarDadosUsuario();
    mostrarToast(`+${litros}L de água! Total: ${aguaHoje}L 💧`);
    mudarPagina('home');
}

async function carregarInsight() {
    let el = document.getElementById('insightTexto');
    if (!el) return;
    el.innerHTML = 'Gerando insight...';
    try {
        let resposta = await chamarGroq(`Você é um coach de saúde. Usuário está com humor ${ultimoHumor}/5, bebeu ${aguaHoje}L de água hoje. Dê 1 frase motivacional curta.`);
        el.innerHTML = resposta;
    } catch(e) {
        el.innerHTML = 'Continue assim! Seu bem-estar é importante.';
    }
}

async function gerarPlanoIA() {
    let resultado = document.getElementById('resultadoPlano');
    let btn = document.getElementById('btnGerarPlano');
    btn.disabled = true;
    btn.innerText = 'Gerando...';
    resultado.style.display = 'block';
    resultado.innerHTML = '<div style="text-align:center; padding:20px">⏳ Pensando no seu plano...</div>';
    
    try {
        let prompt = `Crie um pequeno plano de qualidade de vida para alguém que se sente ${['','mal','instável','neutro','bem','ótimo'][ultimoHumor]}, bebeu ${aguaHoje}L de água e consumiu ${Math.round(proteinaHoje)}g de proteína, ${Math.round(carboHoje)}g de carboidrato. Responda em 2-3 frases curtas.`;
        let resposta = await chamarGroq(prompt);
        resultado.innerHTML = `<div class="cardGrande" style="background:#e8f5e9">✨ ${resposta}</div>`;
    } catch(e) {
        resultado.innerHTML = `<div class="cardGrande" style="color:#e74c3c">⚠️ Não consegui gerar o plano agora. Tente de novo!</div>`;
    }
    btn.disabled = false;
    btn.innerText = 'Gerar Plano IA →';
}

// ========== chat ==========
function iniciarChat() {
    historicoChat = [];
    let area = document.getElementById('chatArea');
    area.innerHTML = '<div class="bolha ai">Olá! Como posso te ajudar hoje?</div>';
    document.getElementById('chatInput').value = '';
}

async function enviarChat() {
    let input = document.getElementById('chatInput');
    let msg = input.value.trim();
    if (!msg) return;
    
    let area = document.getElementById('chatArea');
    area.innerHTML += `<div class="bolha user">${msg}</div>`;
    input.value = '';
    area.scrollTop = area.scrollHeight;
    
    let typing = document.createElement('div');
    typing.className = 'bolha ai';
    typing.innerText = '...';
    area.appendChild(typing);
    
    historicoChat.push({ role: 'user', content: msg });
    
    try {
        let resposta = await chamarGroqChat(`Você é VitaIA, assistente de saúde empático. Responda de forma acolhedora e curta.`, historicoChat);
        typing.remove();
        area.innerHTML += `<div class="bolha ai">${resposta}</div>`;
        historicoChat.push({ role: 'assistant', content: resposta });
    } catch(e) {
        typing.innerText = 'Tente novamente em alguns segundos.';
    }
    area.scrollTop = area.scrollHeight;
}

// ========== API Groq ==========
async function chamarGroq(prompt) {
    let res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CHAVE_API}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300
        })
    });
    let data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

async function chamarGroqChat(sys, history) {
    let res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CHAVE_API}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: sys }, ...history],
            max_tokens: 400
        })
    });
    let data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
}

// ========== labs ==========
function labVisaoPro() { alert('📸 Função de foto chegará em breve! Por enquanto, diga o que comeu no chat de ajuda.'); }
function labExplorador() { alert('📍 Explorador: tente usar o chat de ajuda para dicas de locais saudáveis!'); }
function labDeepThink() { alert('💡 DeepThink: perguntas complexas podem ser feitas no chat de ajuda.'); }
function agendarConsulta(prof) { alert(`✅ Consulta agendada com ${prof}! Você receberá um lembrete.`); }

function fechaModal(id) {
    document.getElementById(id).classList.remove('visivel');
}

// eventos dos exercícios (precisa ser chamado depois de renderizar)
document.addEventListener('click', function(e) {
    if (e.target.classList && e.target.classList.contains('exBtn')) {
        let ex = e.target.dataset.ex;
        if (exerciciosHoje.includes(ex)) {
            exerciciosHoje = exerciciosHoje.filter(e => e !== ex);
            e.target.style.background = '#f0f0f0';
            e.target.style.color = '#333';
        } else {
            exerciciosHoje.push(ex);
            e.target.style.background = '#667eea';
            e.target.style.color = 'white';
        }
        dadosUsuario.exercicios = exerciciosHoje;
        salvarDadosUsuario();
        document.getElementById('exLog').innerHTML = exerciciosHoje.length ? '✓ '+exerciciosHoje.join(' · ') : 'Nenhum exercício registrado';
        mostrarToast(exerciciosHoje.includes(ex) ? `✓ ${ex} adicionado!` : `✗ ${ex} removido`);
    }
});

// iniciar
renderizarUsuariosSalvos();