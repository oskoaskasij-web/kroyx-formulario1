(function () {
  'use strict';

  const form      = document.getElementById('form-ressarcimento');
  const alertBox  = document.getElementById('form-alert');
  const alertText = document.getElementById('form-alert-text');
  const sucesso   = document.getElementById('sucesso');
  const protocolo = document.getElementById('protocolo');
  const btnEnviar = document.getElementById('btn-enviar');
  const btnNova   = document.getElementById('btn-nova');

  const cpf        = document.getElementById('cpf');
  const telefone   = document.getElementById('telefone');
  const valor      = document.getElementById('valor');
  const dataCompra = document.getElementById('data-compra');
  const tipoPix    = document.getElementById('tipo-pix');
  const chavePix   = document.getElementById('chave-pix');
  const pixHint    = document.getElementById('pix-hint');
  const comprovante= document.getElementById('comprovante');
  const fileName   = document.getElementById('file-name');

  const onlyDigits = (s) => String(s).replace(/\D+/g, '');

  cpf.addEventListener('input', (e) => {
    let v = onlyDigits(e.target.value).slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
  });

  telefone.addEventListener('input', (e) => {
    let v = onlyDigits(e.target.value).slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    }
    e.target.value = v.replace(/-$/, '');
  });

  valor.addEventListener('input', (e) => {
    const d = onlyDigits(e.target.value).slice(0, 9);
    if (!d) {
      e.target.value = '';
      return;
    }
    e.target.value = (parseInt(d, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  });

  const hoje = new Date().toISOString().split('T')[0];
  dataCompra.setAttribute('max', hoje);

  const pixConfig = {
    cpf:       { ph: '000.000.000-00', hint: 'Informe o CPF do titular da conta.' },
    cnpj:      { ph: '00.000.000/0000-00', hint: 'Informe o CNPJ do titular da conta.' },
    email:     { ph: 'voce@email.com', hint: 'Use o e-mail cadastrado como chave PIX.' },
    telefone:  { ph: '(00) 00000-0000', hint: 'Telefone cadastrado como chave PIX.' },
    aleatoria: { ph: 'Cole a chave aleatória (EVP)', hint: 'Chave aleatória no formato UUID.' }
  };

  tipoPix.addEventListener('change', () => {
    const cfg = pixConfig[tipoPix.value] || { ph: '', hint: '' };
    chavePix.value = '';
    chavePix.placeholder = cfg.ph;
    pixHint.textContent = cfg.hint || 'A chave deve estar no nome do titular do pedido.';
    chavePix.focus();
  });

  chavePix.addEventListener('input', () => {
    if (tipoPix.value === 'cpf') {
      let v = onlyDigits(chavePix.value).slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d)/, '$1.$2')
           .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      chavePix.value = v;
    } else if (tipoPix.value === 'telefone') {
      let v = onlyDigits(chavePix.value).slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      }
      chavePix.value = v.replace(/-$/, '');
    } else if (tipoPix.value === 'cnpj') {
      let v = onlyDigits(chavePix.value).slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2')
           .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
           .replace(/\.(\d{3})(\d)/, '.$1/$2')
           .replace(/(\d{4})(\d)/, '$1-$2');
      chavePix.value = v;
    }
  });

  comprovante.addEventListener('change', () => {
    const f = comprovante.files[0];
    if (!f) {
      fileName.textContent = 'Anexar comprovante';
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      fileName.textContent = 'Arquivo maior que 10 MB';
      comprovante.value = '';
      return;
    }
    fileName.textContent = f.name;
  });

  function limparErros() {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    alertBox.hidden = true;
  }

  function marcarErro(el) {
    el.classList.add('is-invalid');
  }

  function validar() {
    const erros = [];
    let primeiro = null;

    const marcar = (el, msg) => {
      marcarErro(el);
      erros.push(msg);
      if (!primeiro) primeiro = el;
    };

    const vazio = (el) => !el.value.trim();

    if (vazio(document.getElementById('nome'))) {
      marcar(document.getElementById('nome'), 'Informe seu nome completo.');
    }

    if (vazio(cpf)) {
      marcar(cpf, 'Informe seu CPF.');
    } else if (onlyDigits(cpf.value).length !== 11) {
      marcar(cpf, 'CPF incompleto — deve ter 11 dígitos.');
    }

    if (vazio(telefone)) {
      marcar(telefone, 'Informe seu telefone/WhatsApp.');
    } else if (onlyDigits(telefone.value).length < 10) {
      marcar(telefone, 'Telefone inválido.');
    }

    const email = document.getElementById('email');
    if (vazio(email)) {
      marcar(email, 'Informe seu e-mail.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      marcar(email, 'E-mail inválido.');
    }

    if (vazio(document.getElementById('pedido'))) {
      marcar(document.getElementById('pedido'), 'Informe o número do pedido.');
    }

    if (vazio(dataCompra)) {
      marcar(dataCompra, 'Informe a data da compra.');
    } else if (dataCompra.value > hoje) {
      marcar(dataCompra, 'A data da compra não pode ser no futuro.');
    }

    if (vazio(valor)) {
      marcar(valor, 'Informe o valor pago.');
    } else if (parseFloat(onlyDigits(valor.value)) < 1) {
      marcar(valor, 'Valor inválido.');
    }

    if (vazio(document.getElementById('pagamento'))) {
      marcar(document.getElementById('pagamento'), 'Selecione a forma de pagamento.');
    }

    if (vazio(tipoPix)) {
      marcar(tipoPix, 'Selecione o tipo de chave PIX.');
    }

    if (vazio(chavePix)) {
      marcar(chavePix, 'Informe sua chave PIX.');
    } else {
      const c = chavePix.value.trim();
      const d = onlyDigits(c);
      switch (tipoPix.value) {
        case 'cpf':
          if (d.length !== 11) marcar(chavePix, 'A chave PIX (CPF) deve ter 11 dígitos.');
          break;
        case 'cnpj':
          if (d.length !== 14) marcar(chavePix, 'A chave PIX (CNPJ) deve ter 14 dígitos.');
          break;
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) marcar(chavePix, 'Chave PIX (e-mail) inválida.');
          break;
        case 'telefone':
          if (d.length < 10) marcar(chavePix, 'Chave PIX (telefone) inválida.');
          break;
        case 'aleatoria':
          if (c.length < 20) marcar(chavePix, 'Chave aleatória inválida.');
          break;
      }
    }

    if (vazio(document.getElementById('titular-pix'))) {
      marcar(document.getElementById('titular-pix'), 'Informe o nome do titular da chave PIX.');
    }

    const aceite = document.getElementById('aceite');
    if (!aceite.checked) {
      aceite.classList.add('is-invalid');
      erros.push('É necessário aceitar os termos para continuar.');
      if (!primeiro) primeiro = aceite;
    }

    if (erros.length) {
      alertText.textContent = erros.length === 1
        ? erros[0]
        : 'Corrija ' + erros.length + ' campos: ' + erros.slice(0, 3).join(' ') + (erros.length > 3 ? ' …' : '');
      alertBox.hidden = false;
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (primeiro) primeiro.focus({ preventScroll: true });
      return false;
    }
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    limparErros();

    if (!validar()) return;

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = 'Enviando…';

    // Simulação de envio
    setTimeout(() => {
      const codigo = 'KRYX-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      protocolo.textContent = codigo;

      form.hidden = true;
      sucesso.hidden = false;
      sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });

      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Enviar solicitação de ressarcimento';
    }, 900);
  });

  btnNova.addEventListener('click', () => {
    form.reset();
    limparErros();
    fileName.textContent = 'Anexar comprovante';
    pixHint.textContent = 'A chave deve estar no nome do titular do pedido.';
    chavePix.placeholder = 'Selecione o tipo de chave primeiro';
    sucesso.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('ano').textContent = new Date().getFullYear();
})();