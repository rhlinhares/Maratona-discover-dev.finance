const Modal = {
  open() {
    // Abrir modal
    // Adicionar a class active ao modal
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    // Fechar modal
    // Remover class active
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

// const transactions = [
//   {
//     // id: 1,
//     // ! id foi removido para trabalhar utilizando apenas index
//     description: "Luz",
//     amount: -50000, //representar dinheiro sem vírgula, pontos ou cifrão
//     date: "23/01/2021", // ? por que utilizar string ?
//   },
//   {
//     // id: 2,
//     description: "Website",
//     amount: 500000, //representar dinheiro sem vírgula, pontos ou cifrão
//     date: "23/01/2021", // ? por que utilizar string ?
//   },
//   {
//     // id: 3,
//     description: "Internet",
//     amount: -20000, //representar dinheiro sem vírgula, pontos ou cifrão
//     date: "23/01/2021", // ? por que utilizar string ?
//   },
// ];

const Storage = {
  get(){
    // valores estarão guardados como String. É necessário transformá-los de volta em Array
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    // se não existir valor, retorna vazio
  },
  
  set(transactions){
    localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions))
    // armazenamento no LocalStoragem é com chave e valores de String
  }
}

// const transactions = [{transaction1}, {transaction2}...]
// transaction.id = transactions.indexOf+1
// transaction.description = document.getElementById('description')
// transaction.amount = document.getElementById('amount')
// transaction.date = document.getElementById('date')

const Transaction = {
  all: Storage.get(),
  // * REFATORAÇÃO
  //atalho dentro do objeto para todas as transações, prevendo as mudanças futuras no código -> transações ficarão fora do código

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
    // REFATORAÇÃO - prevendo atualização fs página após acréscimo de transações
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    // somar as entradas
    // para cada transação, se o amount for maior que zero, somar a uma variável
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses() {
    // somar as saídas
    // para cada transação, se o amount for menor que zero, somar a uma variável
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    // entradas - saídas
    return Transaction.incomes() + Transaction.expenses();
  },
};

// Criação da tabela de Transações por JavaScript
const DOM = {
  // Define um container para as informações da tabela no tbody
  transactionsContainer: document.querySelector("#data-table tbody"),

  // Adiciona uma transação (linha) na tabela
  addTransactionRow(transaction, index) {
    const tr = document.createElement("tr");
    // cria o tr (linha da tabela) das transações
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    // inclui no tr os valores conforme método innerHTMLTransaction
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
    // acrescenta o conteúdo (tr) no container
  },

  // Define a estrutura da tabela -> copiando a estrutura feita em HTML
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";
    // Verifica se é despesa ou entrada para aplicar a formatação adequada

    const amount = Utils.formatCurrency(transaction.amount);
    // Aplica o formato de moeda

    const html = `
      <td class="description">${transaction.description}</td>
      <td class=${CSSclass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
      </td>
      `;
    return html;
  },
  // * Transforma a estrutura da tabela que estava em HTML em JavaScript
  // <tr>
  // <td class="description">Luz</td>
  // <td class="expense">-R$ 500,00</td>
  // <td class="date">23/01/2021</td>
  // <td>
  //   <img src="./assets/minus.svg" alt="Remover transação" />
  // </td>
  // </tr>
  // <tr>

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );

    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );

    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatCurrency(value) {
    /* 
    * Verificar <Intl.NumberFormat>
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
    */

    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");
    // Remove o sinal
    // Expressão regular: /'conteúdo'/
    // \D -> tudo que não for número
    value = Number(value) / 100;

    value = value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });
    // toLocaleString -> Ferramenta pronta que transforma uma string em moeda
    return signal + value;
  },

  formatAmount(value) {
    // //value = Number(value.replace(/\,\./g, "")) * 100;
    // console.log(value)
    // return value;
    // ! 257,85 não está funcionando
    // ! 2345.78 não está funcionando 
    // * Faltou ? na expressão regular. Além disso, toda a idéia está errada porque o input já retorna um número
    // value = Number(value.replace(/\,?\.?/g, "")) * 100;
    value = value*100
    return Math.round(value)
    
  },

  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  // pega os elementos inteiros

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  // verificar se todas as informações foram preenchidas
  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, prencha todos os campos");
    }
  },

  // formatar os dados
  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },
  // salvar - Transaction.add() já faz isso

  // apagar os dados do formulário
  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  // fechar o modal - Modal.close() já faz isso

  submit(event) {
    event.preventDefault();
    // impede que seja executado o comportamento padrão, com mudança do endereço

    try {
      Form.validateFields();

      const transaction = Form.formatValues();

      Transaction.add(transaction);

      Form.clearFields();

      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  // REFATORAÇÃO
  init() {
    Transaction.all.forEach(function (transaction, index) {
      DOM.addTransactionRow(transaction, index);
    });

    // Transaction.all.forEach(DOM.addTransactionRow) -> atalho para a função

    DOM.updateBalance();

    Storage.set(Transaction.all)
    // guarda as informações
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

// * App.init deve ser o último recurso
App.init();
