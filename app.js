document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const totalUnpaidSpan = document.getElementById('total-unpaid');
  const totalPaidSpan = document.getElementById('total-paid');
  const filterPeriod = document.getElementById('filter-period');
  const toggleExpenseListBtn = document.getElementById('toggle-expense-list');
  const expenseListContainer = document.getElementById('expense-list-container');
  
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  let colors = JSON.parse(localStorage.getItem('colors')) || [];

  // Inicializa a UI e os gráficos
  updateUI();

  // Alterna a exibição da lista de despesas
  toggleExpenseListBtn.addEventListener('click', () => {
    if (expenseListContainer.style.display === 'none') {
      expenseListContainer.style.display = 'block';
      toggleExpenseListBtn.textContent = 'Ocultar Despesas';
    } else {
      expenseListContainer.style.display = 'none';
      toggleExpenseListBtn.textContent = 'Despesas';
    }
  });

  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const desc = document.getElementById('expense-desc').value;
    const value = parseFloat(document.getElementById('expense-value').value);
    const recurring = document.getElementById('expense-recurring').checked;
    
    // Gera uma cor apenas para novas despesas
    const color = getRandomColor();
    colors.push(color);

    const expense = { desc, value, paid: false, recurring, date: new Date().toISOString(), color };
    expenses.push(expense);
    
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('colors', JSON.stringify(colors));
    updateUI();
    
    expenseForm.reset();
  });
  
  function updateUI() {
    expenseList.innerHTML = '';
    let totalUnpaid = 0;
    let totalPaid = 0;
    
    expenses.forEach((expense, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${expense.desc} - R$ ${expense.value.toFixed(2)}</span>
        <input type="checkbox" ${expense.paid ? 'checked' : ''} data-index="${index}">
        <span class="icon icon-edit" data-index="${index}">&#9998;</span>
        <span class="icon icon-delete" data-index="${index}">&#128465;</span>
      `;
      
      if (!expense.paid) {
        totalUnpaid += expense.value;
      } else {
        totalPaid += expense.value;
      }
      
      li.querySelector('input').addEventListener('change', togglePaid);
      li.querySelector('.icon-edit').addEventListener('click', editExpense);
      li.querySelector('.icon-delete').addEventListener('click', deleteExpense);
      expenseList.appendChild(li);
    });
    
    totalUnpaidSpan.textContent = totalUnpaid.toFixed(2);
    totalPaidSpan.textContent = totalPaid.toFixed(2);
    
    // Atualiza gráficos
    updateCharts();
  }

  // Funções de toggle, edição, exclusão e exportação (sem alterações)
  // ...

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Funções de gráficos, exportação e inicialização do Service Worker (sem alterações)
  // ...
  
  // Inicializa UI
  updateUI();
});
