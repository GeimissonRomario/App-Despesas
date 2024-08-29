document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalUnpaidSpan = document.getElementById('total-unpaid');
    const totalPaidSpan = document.getElementById('total-paid');
    
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    updateUI();
    
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const desc = document.getElementById('expense-desc').value;
      const value = parseFloat(document.getElementById('expense-value').value);
      
      const expense = { desc, value, paid: false };
      expenses.push(expense);
      
      localStorage.setItem('expenses', JSON.stringify(expenses));
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
          <button class="edit-btn" data-index="${index}">Editar</button>
          <button class="delete-btn" data-index="${index}">Excluir</button>
        `;
        
        if (!expense.paid) {
          totalUnpaid += expense.value;
        } else {
          totalPaid += expense.value;
        }
        
        li.querySelector('input').addEventListener('change', togglePaid);
        li.querySelector('.edit-btn').addEventListener('click', editExpense);
        li.querySelector('.delete-btn').addEventListener('click', deleteExpense);
        expenseList.appendChild(li);
      });
      
      totalUnpaidSpan.textContent = totalUnpaid.toFixed(2);
      totalPaidSpan.textContent = totalPaid.toFixed(2);
    }
    
    function togglePaid(e) {
      const index = e.target.dataset.index;
      expenses[index].paid = e.target.checked;
      
      localStorage.setItem('expenses', JSON.stringify(expenses));
      updateUI();
    }
    
    function editExpense(e) {
      const index = e.target.dataset.index;
      const newDesc = prompt('Editar descrição:', expenses[index].desc);
      const newValue = parseFloat(prompt('Editar valor:', expenses[index].value));
      
      if (newDesc !== null && !isNaN(newValue)) {
        expenses[index].desc = newDesc;
        expenses[index].value = newValue;
        
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
      }
    }
  
    function deleteExpense(e) {
      const index = e.target.dataset.index;
      expenses.splice(index, 1);
      
      localStorage.setItem('expenses', JSON.stringify(expenses));
      updateUI();
    }
  });
  