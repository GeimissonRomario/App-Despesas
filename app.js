document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalUnpaidSpan = document.getElementById('total-unpaid');
    const totalPaidSpan = document.getElementById('total-paid');
    const filterPeriod = document.getElementById('filter-period');
    
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    updateUI();
    
    expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const desc = document.getElementById('expense-desc').value;
      const value = parseFloat(document.getElementById('expense-value').value);
      const recurring = document.getElementById('expense-recurring').checked;
      
      const expense = { desc, value, paid: false, recurring, date: new Date().toISOString() };
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
  
    function togglePaid(e) {
      const index = e.target.dataset.index;
      expenses[index].paid = e.target.checked;
      
      localStorage.setItem('expenses', JSON.stringify(expenses));
      updateUI();
    }
  
    function editExpense(e) {
      const index = e.target.dataset.index;
      const expense = expenses[index];
      
      const newDesc = prompt('Editar descrição', expense.desc);
      const newValue = parseFloat(prompt('Editar valor', expense.value));
  
      if (newDesc !== null && newValue !== null && !isNaN(newValue)) {
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
  
    filterPeriod.addEventListener('change', () => {
        updateUI();
      });
      

          function updateCharts() {
            const unpaidExpenses = expenses.filter(expense => !expense.paid).map(expense => expense.value);
            const paidExpenses = expenses.filter(expense => expense.paid).map(expense => expense.value);
        
            const pieCtx = document.getElementById('pie-chart').getContext('2d');
            const barCtx = document.getElementById('bar-chart').getContext('2d');
        
            if (window.pieChart) window.pieChart.destroy();
            if (window.barChart) window.barChart.destroy();
        
            window.pieChart = new Chart(pieCtx, {
              type: 'pie',
              data: {
                labels: ['Não Pago', 'Pago'],
                datasets: [{
                  data: [unpaidExpenses.reduce((a, b) => a + b, 0), paidExpenses.reduce((a, b) => a + b, 0)],
                  backgroundColor: ['#FF6384', '#36A2EB']
                }]
              }
            });
        
            window.barChart = new Chart(barCtx, {
              type: 'bar',
              data: {
                labels: expenses.map(expense => expense.desc),
                datasets: [{
                  label: 'Valor da Despesa',
                  data: expenses.map(expense => expense.value),
                  backgroundColor: expenses.map(expense => expense.paid ? '#36A2EB' : '#FF6384')
                }]
              }
            });
          }
        
          // Export CSV
          document.getElementById('export-csv').addEventListener('click', () => {
            const csvRows = [
              ['Descrição', 'Valor', 'Pago?', 'Data'],
              ...expenses.map(expense => [
                expense.desc, 
                expense.value.toFixed(2), 
                expense.paid ? 'Sim' : 'Não', 
                new Date(expense.date).toLocaleDateString()
              ])
            ];
        
            const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'despesas.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        
          // Export PDF
          document.getElementById('export-pdf').addEventListener('click', () => {
            const doc = new jsPDF();
            doc.text("Histórico de Despesas", 20, 20);
        
            let y = 30;
            expenses.forEach(expense => {
              doc.text(`${expense.desc} - R$${expense.value.toFixed(2)} - Pago: ${expense.paid ? 'Sim' : 'Não'} - Data: ${new Date(expense.date).toLocaleDateString()}`, 20, y);
              y += 10;
            });
        
            doc.save('despesas.pdf');
          });
        
          // Inicializa UI
          updateUI();
        });
        