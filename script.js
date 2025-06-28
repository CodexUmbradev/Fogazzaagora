const searchInput = document.getElementById('searchInput');
const todosProdutosList = document.getElementById('product-list');
const maisVendidosList = document.getElementById('mais-vendidos-list');
const salgadosList = document.getElementById('salgados-list');
const refrigerantesList = document.getElementById('refrigerantes-list');

function filtrarProdutos() {
  const filter = searchInput.value.toLowerCase();
  const productCards = document.querySelectorAll('.produto-item');

  productCards.forEach(card => {
    const title = card.querySelector('h3').innerText.toLowerCase();
    const brand = card.getAttribute('data-brand')?.toLowerCase() || "";
    card.style.display = title.includes(filter) || brand.includes(filter) ? "" : "none";
  });
}

searchInput.addEventListener('keyup', filtrarProdutos);
document.getElementById('searchBtn').addEventListener('click', filtrarProdutos);

document.querySelectorAll('.brand-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    searchInput.value = tag.getAttribute('data-brand');
    filtrarProdutos();
    window.scrollTo({ top: document.querySelector('.todos-produtos').offsetTop - 130, behavior: 'smooth' });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const btnPedirAgora = document.querySelector(".btn-primary");
  const barraPesquisa = document.getElementById("searchInput");

  if (btnPedirAgora && barraPesquisa) {
    btnPedirAgora.addEventListener("click", function (e) {
      e.preventDefault();
      barraPesquisa.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
});

fetch('products.json')
  .then(res => res.json())
  .then(products => {
    todosProdutosList.innerHTML = "";
    maisVendidosList.innerHTML = "";
    salgadosList.innerHTML = "";
    refrigerantesList.innerHTML = "";

    products.forEach(product => {
      const isEsgotado = product.soldout === true;
      const safeProduct = JSON.stringify(product).replace(/'/g, "&apos;");
      const categoria = (product.category || '').toLowerCase();

      const verDetalhesBtn = (() => {
        if (isEsgotado) return 'disabled';

        if (categoria === 'refrigerante' || categoria === 'refrigerantes') {
          return `onclick='addItemToCart("${product.name}", ${product.price}, "Tradicional", [], 1)'`;
        }

        return `onclick='abrirModal(${safeProduct})'`;
      })();

      const productHTML = `
        <div class="produto-item ${isEsgotado ? 'esgotado' : ''}" data-brand="${product.brand}">
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>R$ ${product.price.toFixed(2)}</p>
        <button ${verDetalhesBtn}>
  ${isEsgotado ? 'Esgotado' : (categoria === 'refrigerante' || categoria === 'refrigerantes' ? 'Adicionar' : 'Ver Detalhes')}
</button>
      `;

      if (product.bestseller) maisVendidosList.innerHTML += productHTML;

      if (categoria === 'salgado' || categoria === 'salgados') {
        salgadosList.innerHTML += productHTML;
      } else if (categoria === 'refrigerante' || categoria === 'refrigerantes') {
        refrigerantesList.innerHTML += productHTML;
      } else {
        todosProdutosList.innerHTML += productHTML;
      }
    });
  })
  .catch(error => console.error('Erro ao carregar os produtos:', error));

// Carrinho
let cart = [];

function addItemToCart(name, basePrice, flavor, extras, quantity = 1) {
  const extraPrice = extras.length * 2.00;
  const finalPrice = basePrice + extraPrice;
  const identifier = `${name}-${flavor}-${extras.join(',')}`;

  const existingItem = cart.find(item => item.id === identifier);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ id: identifier, name, price: finalPrice, flavor, extras, quantity });
  }

  updateCartUI();
  document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

  mostrarToast(`Produto adicionado ao carrinho!  ➨`);
}

function updateCartUI() {
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const frete = 4.99;

  cartItemsEl.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement('div');
    div.classList.add('cart-item');
    const extrasText = item.extras.length ? ` + ${item.extras.join(', ')}` : '';
    div.innerHTML = `<span>${item.name} - ${item.flavor}${extrasText}</span><span>${item.quantity}x R$ ${item.price.toFixed(2)}</span>`;
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.innerText = (total + frete).toFixed(2);
}

document.getElementById('continuar-comprando').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.add('hidden');
});

document.getElementById('limpar-carrinho').addEventListener('click', () => {
  if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
    cart = [];
    updateCartUI();
    document.getElementById('cart-count').innerText = 0;
  }
});

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

document.getElementById('cart-icon').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.remove('hidden');
});
document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.add('hidden');
});

const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModal = document.getElementById('close-checkout-modal');

document.getElementById('forma-pagamento').addEventListener('change', function () {
  const trocoContainer = document.getElementById('troco-container');
  trocoContainer.classList.toggle('hidden', this.value !== 'dinheiro');
});

document.getElementById('finalizar-compra').addEventListener('click', () => {
  checkoutModal.classList.remove('hidden');
});

closeCheckoutModal.addEventListener('click', () => {
  checkoutModal.classList.add('hidden');
});

document.getElementById('confirmar-pedido').addEventListener('click', async () => {
  const nome = document.getElementById('cliente-nome').value.trim();
  const cep = document.getElementById('cliente-cep').value.trim();
  const endereco = document.getElementById('cliente-endereco').value.trim();
  const numero = document.getElementById('cliente-numero').value.trim();
  const troco = document.getElementById('troco-valor').value.trim();
  const observacoes = document.getElementById('observacoes-pedido').value.trim();
  const formaPagamento = document.getElementById('forma-pagamento').value;

  if (!nome || !cep || !endereco || !numero) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const frete = 4.99;

  let pagamentoLink = '';

  if (formaPagamento !== 'dinheiro') {
    const itemsMP = cart.map(item => ({
      title: `${item.name} - ${item.flavor}`,
      quantity: item.quantity,
      currency_id: "BRL",
      unit_price: Number(item.price)
    }));

    itemsMP.push({
      title: "Frete",
      quantity: 1,
      currency_id: "BRL",
      unit_price: frete
    });

    try {
      const preference = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer APP_USR-6235754698520471-040402-538edc7a8d82a99c05b4f64655bf3bd2-2306327706"
        },
        body: JSON.stringify({
          items: itemsMP,
          back_urls: {
            success: "https://www.mercadopago.com.br",
            failure: "https://www.mercadopago.com.br"
          },
          auto_return: "approved",
          payment_methods: {
            excluded_payment_types: [
              { id: "credit_card" },
              { id: "ticket" },
              { id: "debit_card" }
            ]
          }
        })
      });

      const dados = await preference.json();

      if (!dados.init_point) {
        console.error("Erro ao gerar link de pagamento:", dados);
        alert("Erro ao gerar link de pagamento. Veja o console.");
        return;
      }

      pagamentoLink = dados.init_point;

      navigator.clipboard.writeText(pagamentoLink)
        .then(() => mostrarToast('Link do pagamento copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar link:', err));
    } catch (error) {
      console.error("Erro ao criar preferência de pagamento:", error);
      alert("Não foi possível gerar o link de pagamento. Tente novamente.");
      return;
    }
  }

  let mensagem = `*Pedido - Manias de Fogazza*\n\n`;
  mensagem += `*Cliente:* ${nome}\n`;
  mensagem += `*Endereço:* ${endereco}, nº ${numero}\n`;
  mensagem += `*CEP:* ${cep}\n\n`;
  mensagem += `*Itens do Pedido:*\n`;

  cart.forEach(item => {
    const extrasText = item.extras.length ? ` + ${item.extras.join(', ')}` : '';
    const flavorText = item.flavor.toLowerCase() !== 'tradicional'
      ? `(${item.flavor}${extrasText})`
      : (extrasText ? `(${extrasText})` : '');

    mensagem += `• ${item.name}${flavorText}\n Quantidade: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
  });

  const subtotal = calculateTotal().toFixed(2);
  const total = (parseFloat(subtotal) + frete).toFixed(2);

  mensagem += `Subtotal: R$ ${subtotal}\n`;
  mensagem += `Entrega: R$ ${frete.toFixed(2)}\n`;
  mensagem += `*Total a pagar:* R$ ${total}\n\n`;

  if (formaPagamento !== 'dinheiro') {
    mensagem += `*Pagamento via Mercado Pago:*\n${pagamentoLink}\n\n`;
  } else {
    mensagem += `*Forma de pagamento:* Dinheiro\n`;
  }

  if (troco) {
    mensagem += `*Troco para:* R$ ${troco}\n`;
  }

  if (observacoes) {
    mensagem += `*Observações:* ${observacoes}\n\n`;
  }

  if (formaPagamento !== 'dinheiro') {
    mensagem += `Após o pagamento, envie o comprovante.`;
  }

  const mensagemCodificada = encodeURIComponent(mensagem);
  const numeroWhatsApp = '5511961201454';
  const link = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;

  window.open(link, '_blank');

  cart = [];
  updateCartUI();
  document.getElementById('cart-modal').classList.add('hidden');
  document.getElementById('checkout-modal').classList.add('hidden');
  document.getElementById('cart-count').innerText = 0;
});

const produtoModal = document.getElementById('produto-modal');
const modalNome = document.getElementById('modal-produto-nome');
const modalImg = document.getElementById('modal-produto-img');
const modalPreco = document.getElementById('modal-produto-preco');
const modalDescricao = document.getElementById('modal-produto-descricao');
const closeProdutoModal = document.getElementById('close-produto-modal');
const addCarrinhoBtn = document.getElementById('adicionar-carrinho-modal');
const qtdInput = document.getElementById('quantidade-produto');

let produtoSelecionado = null;

window.abrirModal = function (product) {
  produtoSelecionado = product;
  modalNome.innerText = product.name;
  modalImg.src = product.image;
  modalPreco.innerText = `R$ ${product.price.toFixed(2)}`;
  modalDescricao.innerText = product.description || "Fogazza artesanal feita com ingredientes frescos.";

  document.querySelectorAll('.extra-ingrediente').forEach(checkbox => checkbox.checked = false);
  qtdInput.value = 1;

  const isSalgado = (product.category || '').toLowerCase().includes('salgado');
  document.getElementById('extras-container').classList.toggle('hidden', isSalgado === true);
  document.getElementById('quantidade-container').classList.toggle('hidden', isSalgado !== true);

  produtoModal.classList.remove("hidden");
};

closeProdutoModal.addEventListener('click', () => {
  produtoModal.classList.add("hidden");
});

addCarrinhoBtn.addEventListener('click', () => {
  const quantidade = parseInt(qtdInput.value) || 1;
  const sabor = "Tradicional";
  const extras = Array.from(document.querySelectorAll('.extra-ingrediente:checked')).map(cb => cb.value);

  addItemToCart(produtoSelecionado.name, produtoSelecionado.price, sabor, extras, quantidade);
  produtoModal.classList.add("hidden");
});

function ajustarNavComHeader() {
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  if (header && nav) {
    nav.style.marginTop = `${header.offsetHeight}px`;
  }
}

window.addEventListener('DOMContentLoaded', ajustarNavComHeader);
window.addEventListener('resize', ajustarNavComHeader);

function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.innerText = mensagem;
  toast.classList.add('show');
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 2000);
}