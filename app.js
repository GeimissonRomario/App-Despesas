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
        `;
        
        if (!expense.paid) {
          totalUnpaid += expense.value;
        } else {
          totalPaid += expense.value;
        }
        
        li.querySelector('input').addEventListener('change', togglePaid);
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
  
    filterPeriod.addEventListener('change', () => {
      updateUI();  // Refiltrar ao alterar o período
    });
  
    function updateCharts() {
      // Gráfico de Pizza - Categorias de Despesas
      const categoryData = expenses.reduce((acc, expense) => {
        acc[expense.desc] = (acc[expense.desc] || 0) + expense.value;
        return acc;
      }, {});
  
      const ctxCategory = document.getElementById('categoryChart').getContext('2d');
      new Chart(ctxCategory, {
        type: 'pie',
        data: {
          labels: Object.keys(categoryData),
          datasets: [{
            label: 'Despesas por Categoria',
            data: Object.values(categoryData),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          }]
        }
      });
  
      // Gráfico de Barras - Despesas ao longo do tempo
      const timeData = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toDateString();
        acc[date] = (acc[date] || 0) + expense.value;
        return acc;
      }, {});
  
      const ctxTime = document.getElementById('timeChart').getContext('2d');
      new Chart(ctxTime, {
        type: 'bar',
        data: {
          labels: Object.keys(timeData),
          datasets: [{
            label: 'Despesas ao Longo do Tempo',
            data: Object.values(timeData),
            backgroundColor: '#36A2EB'
          }]
        }
      });
    }
  
    // Exportar CSV
    document.getElementById('export-csv').addEventListener('click', () => {
      const csvContent = Papa.unparse(expenses);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'despesas.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  
    // Exportar PDF
    document.getElementById('export-pdf').addEventListener('click', () => {
      const doc = new jsPDF();
      doc.text('Histórico de Despesas', 10, 10);
      
      let y = 20;
      expenses.forEach(expense => {
        doc.text(`${expense.desc} - R$ ${expense.value.toFixed(2)} - ${expense.paid ? 'Pago' : 'Não Pago'}`, 10, y);
        y += 10;
      });
      
      doc.save('despesas.pdf');
    });
  });
  