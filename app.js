document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const totalUnpaidSpan = document.getElementById('total-unpaid');
  const totalPaidSpan = document.getElementById('total-paid');
  const filterPeriod = document.getElementById('filter-period');
  
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  let colors = JSON.parse(localStorage.getItem('colors')) || [];

  // Atualiza a UI e os gráficos
  updateUI();

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
    colors.splice(index, 1); // Remove a cor correspondente
    
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('colors', JSON.stringify(colors));
    updateUI();
  }

  filterPeriod.addEventListener('change', () => {
    updateUI();
  });

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function updateCharts() {
    const labels = expenses.map(expense => expense.desc);
    const data = expenses.map(expense => expense.value);
    const chartColors = expenses.map(expense => expense.color);

    const pieCtx = document.getElementById('pie-chart').getContext('2d');
    const barCtx = document.getElementById('bar-chart').getContext('2d');

    if (window.pieChart) window.pieChart.destroy();
    if (window.barChart) window.barChart.destroy();

    window.pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: chartColors
        }]
      }
    });

    window.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Valor da Despesa',
          data: data,
          backgroundColor: chartColors
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
