
(() => {
  // estado
  let eventos = [];

  // carregar
  try {
    const evSalvos = localStorage.getItem('eventos');
    eventos = evSalvos ? JSON.parse(evSalvos) : [];
  } catch (err) {
    console.error('Erro ao parsear eventos do localStorage', err);
    eventos = [];
  }

  // helpers
  function salvarEventos() {
    try {
      localStorage.setItem('eventos', JSON.stringify(eventos));
    } catch (err) {
      console.error('Erro ao salvar eventos', err);
    }
  }

  function formatMoney(n) {
    return Number(n).toFixed(2).replace('.', ',');
  }

  // abrir modal
  window.abrirModalEvento = function() {
    const modal = document.getElementById('modal-evento');
    if (!modal) return console.warn('modal-evento não encontrado no DOM');
    modal.setAttribute('aria-hidden','false');
    // definir data mínima
    const dataInput = document.getElementById('data-evento');
    if (dataInput) dataInput.min = new Date().toISOString().split('T')[0];
  };

  // fechar modal
  window.fecharModalEvento = function() {
    const modal = document.getElementById('modal-evento');
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');

    const form = document.getElementById('formulario-evento');
    if (form) form.reset();
  };

  // enviar whatsapp
  function enviarEventoWhatsApp(evento) {
    let texto = "🎉 *Agendamento de Evento*%0A%0A";
    texto += `Tipo: *${evento.tipo}*%0A`;
    texto += `Data: *${evento.data}* - Hora: *${evento.hora}*%0A`;
    texto += `Pessoas: *${evento.pessoas}*%0A`;
    texto += `Orçamento: *R$ ${formatMoney(evento.orcamento)}*%0A%0A`;
    texto += `Organizador: *${evento.nome}*%0A`;
    texto += `Telefone: ${evento.telefone}%0A`;
    if (evento.email) texto += `Email: ${evento.email}%0A`;
    if (evento.descricao) texto += `%0AObservações: ${evento.descricao}%0A`;

    if (evento.servicos && evento.servicos.length) {
      texto += `%0AServiços:%0A`;
      evento.servicos.forEach(s => texto += `• ${s}%0A`);
    }

    const numero = document.body.dataset.whatsapp || '558899999999';
    const url = `https://wa.me/${numero}?text=${texto}`;
    window.open(url, '_blank');
  }

  // instalar listener quando DOM pronto
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formulario-evento');
    if (!form) {
      console.warn('formulario-evento não encontrado — verifique HTML');
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // coletar
      const tipo = document.getElementById('tipo-evento').value;
      const data = document.getElementById('data-evento').value;
      const hora = document.getElementById('hora-evento').value;
      const pessoas = document.getElementById('pessoas-evento').value;
      const orc = document.getElementById('orcamento-evento').value;
      const nome = document.getElementById('nome-organizador').value;
      const tel = document.getElementById('telefone-organizador').value;
      const email = document.getElementById('email-organizador').value;
      const desc = document.getElementById('descricao-evento').value;

      // serviços
      const servicos = Array.from(document.querySelectorAll('input[name="servicos"]:checked')).map(i => i.value);

      // validação básica
      if (!tipo || !data || !hora || !pessoas || !orc || !nome || !tel) {
        alert('Preencha todos os campos obrigatórios!');
        return;
      }

      const dataSel = new Date(data);
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      if (dataSel < hoje) {
        alert('Selecione uma data futura!');
        return;
      }

      const evento = {
        id: Date.now(),
        tipo,
        data,
        hora,
        pessoas,
        orcamento: parseFloat(orc) || 0,
        nome,
        telefone: tel,
        email: email || '',
        descricao: desc || '',
        servicos,
        criadoEm: new Date().toLocaleString('pt-BR')
      };

      eventos.push(evento);
      salvarEventos();

      alert('✅ Evento agendado com sucesso!');
      enviarEventoWhatsApp(evento);
      window.fecharModalEvento();
    });

    // clique fora fecha (delegado)
    document.addEventListener('click', (ev) => {
      const modal = document.getElementById('modal-evento');
      if (!modal) return;
      if (modal.getAttribute('aria-hidden') === 'false' && ev.target === modal) {
        window.fecharModalEvento();
      }
    });

    // ESC fecha modal
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        const modal = document.getElementById('modal-evento');
        if (modal && modal.getAttribute('aria-hidden') === 'false') window.fecharModalEvento();
      }
    });
  });
})();


// =======================
// MODELO DE DADOS (Refatoração Sênior)
// =======================
const produtos = {
    'marmitex-m': {
        nome: "Marmitex M – 650g",
        preco: 20.00,
        ingredientes: [
            "Arroz branco ou refogado",
            "Feijão verde, preto ou carioca",
            "Macarrão ou macaxeira",
            "Farofa ou cuscuz",
            "Proteína: coxa de frango, calabresa acebolada, galinha matriz, fígado acebolado ou linguiça toscana",
            "Salada verde, vinagrete ou legumes"
        ],
        opcoes: {
            "": [
                "Coxa de Frango",
                "Calabresa Acebolada",
                "Galinha Matriz",
                "Fígado Acebolado",
                "Linguiça Toscana"
            ]
        }
    }
    // Adicionar outros produtos aqui
};

let carrinho = [];
let produtoAtual = null; // Variável global para armazenar o produto atualmente no modal
let total = 0;

function abrirCarrinho() {
    document.getElementById("carrinho").classList.add("aberto");
}

function fecharCarrinho() {
    document.getElementById("carrinho").classList.remove("aberto");
}

function atualizarCarrinho() {
    const areaItens = document.getElementById("carrinho-itens");
    const spanTotal = document.getElementById("carrinho-total");

    areaItens.innerHTML = "";
    total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;

        const div = document.createElement("div");
        div.className = "carrinho-item";

        div.innerHTML = `
            <strong>${item.nome}</strong> - R$ ${item.preco.toFixed(2).replace(".", ",")}
            <br>
            <button onclick="removerItem(${index})" class="btn-remover">Remover</button>
        `;

        areaItens.appendChild(div);
    });

    spanTotal.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function removerItem(indice) {
    carrinho.splice(indice, 1);
    atualizarCarrinho();
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const mensagem = carrinho
        .map(item => `• ${item.nome} - R$ ${item.preco.toFixed(2).replace(".", ",")}`)
        .join("\n");

    const texto = encodeURIComponent(
        `Olá! Quero fazer um pedido:\n\n${mensagem}\n\nTotal: R$ ${total.toFixed(2).replace(".", ",")}`
    );

    window.open(`https://wa.me/5588981154043?text=${texto}`, "_blank");
}

// =======================
// MODAL DE PEDIDO
// =======================



function abrirModal(produtoId) {
    const produto = produtos[produtoId];

    if (!produto) {
        console.error(`Produto com ID ${produtoId} não encontrado.`);
        return;
    }

    const { nome: nomeProduto, preco, ingredientes, opcoes } = produto;
    const modal = document.getElementById('modal-pedido');
    const titulo = document.getElementById('modal-titulo');
    const descricao = document.getElementById('modal-descricao');
    const precoEl = document.getElementById('modal-preco');
    const modalOpcoes = document.getElementById('modal-opcoes');

    if (!modal || !titulo || !descricao || !precoEl || !modalOpcoes) {
        console.error('Elementos do modal não encontrados');
        return;
    }

    // 1. Armazenar o produto atual
    produtoAtual = {
        id: produtoId, // Adicionando o ID para referência futura
        nome: nomeProduto,
        preco: preco,
        ingredientes: ingredientes,
        opcoes: opcoes,
        selecoes: {} // Para armazenar as seleções do usuário
    };

    // 2. Preencher o modal
    // Usar textContent para evitar XSS
    titulo.textContent = nomeProduto;
    // Melhorando a exibição dos ingredientes no modal
    descricao.innerHTML = ingredientes.map(i => `• ${i}`).join('<br>');
    precoEl.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
    
    // Limpar opções anteriores
    modalOpcoes.innerHTML = '';
    
    // Gerar opções dinamicamente
    if (opcoes && Object.keys(opcoes).length > 0) {
        for (let [chave, valores] of Object.entries(opcoes)) {
            // Se a chave for vazia, usamos um nome padrão para o grupo de rádio
            const nomeGrupo = chave || 'proteina_principal'; 

            const h4 = document.createElement('h4');
            h4.textContent = chave || 'Escolha a Proteína Principal'; // Título mais descritivo
            modalOpcoes.appendChild(h4);
            
            valores.forEach((valor, index) => {
                const idInput = `opt-${produtoId}-${nomeGrupo}-${index}`; // ID único
                const label = document.createElement('label');
                label.setAttribute('for', idInput);
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = nomeGrupo;
                input.value = valor;
                input.id = idInput;
                
                // Selecionar o primeiro item por padrão para garantir uma escolha
                if (index === 0) {
                    input.checked = true;
                }
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(valor));
                modalOpcoes.appendChild(label);
            });
        }
    }
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Adicionar ao Carrinho (função que estava faltando)
function adicionarAoCarrinho() {
    if (!produtoAtual) {
        alert('Erro: Nenhum produto selecionado.');
        return;
    }

    // 1. Coletar a opção selecionada (assumindo que só há um grupo de rádio por enquanto)
    // O nome do grupo é 'proteina_principal' se a chave for vazia no objeto de opções
    const grupoOpcao = 'proteina_principal'; 
    const radioSelecionado = document.querySelector(`input[name="${grupoOpcao}"]:checked`);
    
    let nomeItem = produtoAtual.nome;
    if (radioSelecionado) {
        // Adiciona a opção selecionada ao nome do item
        nomeItem += ` (${radioSelecionado.value})`;
    } else {
        // Se não houver rádio selecionado, alerta o usuário
        alert('Por favor, selecione uma opção de proteína.');
        return;
    }

    // 2. Criar o item final
    const itemFinal = {
        nome: nomeItem,
        preco: produtoAtual.preco,
        // Em um upgrade futuro, poderíamos adicionar mais detalhes aqui
    };

    // 3. Adicionar ao carrinho e atualizar
    carrinho.push(itemFinal);
    atualizarCarrinho();
    
    // 4. Fechar o modal
    fecharModal();
    
    // 5. Feedback visual (opcional, mas bom)
    alert(`"${nomeItem}" adicionado ao carrinho!`);
}

// ... (rest of the file)

// Fechar modal
function fecharModal() {
    const modal = document.getElementById('modal-pedido');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modal-pedido');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Funções para abrir e fechar o modal de evento (que estavam duplicadas)
// Removidas as funções duplicadas, mantendo apenas as que estão no IIFE no topo do arquivo.

// =======================
// BOTÕES EXTRAS
// =======================

function abrirMaps() {
    window.open(
        "https://www.google.com/maps/place/Dona+Alba+Refei%C3%A7%C3%B5es/@-7.4831335,-38.9786997,18z/data=!4m16!1m9!3m8!1s0x7a13f018e93e7db:0xf2250fd5080faf93!2zRG9uYSBBbGJhIFJlZmVpw6fDtWVz!8m2!3d-7.4832134!4d-38.9779953!9m1!1b1!16s%2Fg%2F11qn61zk57!3m5!1s0x7a13f018e93e7db:0xf2250fd5080faf93!8m2!3d-7.4832134!4d-38.9779953!16s%2Fg%2F11qn61zk57?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
        "_blank"
    );
}

function abrirZap() {
    window.open("https://wa.me/5588981154043", "_blank");
}

function abrirInsta() {
    window.open("https://www.instagram.com/donaalbacomida/", "_blank");
}

function abrirModalEvento() {
    alert("Em breve: Sistema de reservas para eventos!");
}
